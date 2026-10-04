import AVFoundation
import CoreImage
import ExpoModulesCore
import UIKit
import Vision

final class CameraNotReadyException: Exception {
  override var reason: String {
    "The camera is not ready yet"
  }
}

final class CaptureInProgressException: Exception {
  override var reason: String {
    "A photo is already being taken"
  }
}

final class CaptureFailedException: GenericException<String> {
  override var reason: String {
    "Could not take the photo: \(param)"
  }
}

/// Live back-camera preview that finds a business card in every frame with VNDetectRectanglesRequest,
/// outlines it, reports when it is held steady, and captures a straightened photo of it.
/// QR codes are read from the same frames with VNDetectBarcodesRequest.
final class CardScannerView: ExpoView, AVCaptureVideoDataOutputSampleBufferDelegate, AVCapturePhotoCaptureDelegate {
  let onCardStateChange = EventDispatcher()
  let onBarcodeScanned = EventDispatcher()
  let onCameraError = EventDispatcher()

  var isActive = true {
    didSet { updateRunning() }
  }

  /// Seconds between analysed frames; about 12 per second keeps the outline smooth without heating the phone.
  private static let analysisInterval: CFTimeInterval = 0.08
  /// Consecutive near-identical frames (about 0.7 s) before the card counts as steady.
  private static let steadyFrameCount = 9
  /// Corner movement, as a fraction of the frame, still treated as holding steady.
  private static let steadyTolerance: CGFloat = 0.015
  /// Frames without a card before the outline is hidden, so a single missed frame does not flicker.
  private static let missedFrameLimit = 4
  private static let outlineColor = UIColor(red: 0.13, green: 0.83, blue: 0.93, alpha: 1)
  private static let steadyColor = UIColor(red: 0.29, green: 0.87, blue: 0.5, alpha: 1)

  private let session = AVCaptureSession()
  private let sessionQueue = DispatchQueue(label: "com.mindpros.proscard.cardscanner.session")
  private let analysisQueue = DispatchQueue(label: "com.mindpros.proscard.cardscanner.analysis")
  private let videoOutput = AVCaptureVideoDataOutput()
  private let photoOutput = AVCapturePhotoOutput()
  private let outlineLayer = CAShapeLayer()

  // The view's own layer is the camera preview, so it always matches the view's size.
  override class var layerClass: AnyClass {
    AVCaptureVideoPreviewLayer.self
  }

  private var previewLayer: AVCaptureVideoPreviewLayer {
    // swiftlint:disable:next force_cast
    layer as! AVCaptureVideoPreviewLayer
  }

  // Session state, touched only on sessionQueue.
  private var configured = false

  // Frame analysis state, touched only on analysisQueue.
  private var lastAnalysisTime: CFTimeInterval = 0
  private var trackedQuad: CardQuad?
  private var steadyFrames = 0
  private var missedFrames = 0
  private var reportedState = "none"
  private var scansBarcodes = false
  private var lastBarcode: (value: String, time: CFTimeInterval)?

  // Capture state, touched only on the main thread.
  private var pendingCapture: Promise?

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    clipsToBounds = true
    backgroundColor = .black
    previewLayer.session = session
    previewLayer.videoGravity = .resizeAspectFill
    previewLayer.needsDisplayOnBoundsChange = true
    outlineLayer.fillColor = Self.outlineColor.withAlphaComponent(0.16).cgColor
    outlineLayer.strokeColor = Self.outlineColor.cgColor
    outlineLayer.lineWidth = 3
    outlineLayer.lineJoin = .round
    layer.addSublayer(outlineLayer)

    let notifications = NotificationCenter.default
    notifications.addObserver(self, selector: #selector(sessionRuntimeError), name: AVCaptureSession.runtimeErrorNotification, object: session)
    notifications.addObserver(self, selector: #selector(sessionInterrupted), name: AVCaptureSession.wasInterruptedNotification, object: session)
    notifications.addObserver(self, selector: #selector(sessionInterruptionEnded), name: AVCaptureSession.interruptionEndedNotification, object: session)
  }

  deinit {
    NotificationCenter.default.removeObserver(self)
    let session = session
    sessionQueue.async {
      if session.isRunning {
        session.stopRunning()
      }
    }
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    CATransaction.begin()
    CATransaction.setDisableActions(true)
    outlineLayer.frame = bounds
    CATransaction.commit()
  }

  override func didMoveToWindow() {
    super.didMoveToWindow()
    updateRunning()
  }

  func setBarcodeScanningEnabled(_ enabled: Bool) {
    analysisQueue.async {
      self.scansBarcodes = enabled
    }
  }

  // MARK: - Session

  private func updateRunning() {
    guard isActive, window != nil else {
      sessionQueue.async {
        if self.session.isRunning {
          self.session.stopRunning()
        }
      }
      analysisQueue.async { self.resetTracking() }
      return
    }
    switch AVCaptureDevice.authorizationStatus(for: .video) {
    case .authorized:
      sessionQueue.async {
        self.configureIfNeeded()
        if self.configured && !self.session.isRunning {
          self.session.startRunning()
        }
      }
    case .notDetermined:
      AVCaptureDevice.requestAccess(for: .video) { _ in
        DispatchQueue.main.async { self.updateRunning() }
      }
    default:
      onCameraError(["message": "Camera access is turned off for ProsCard."])
    }
  }

  @objc private func sessionRuntimeError(_ notification: Notification) {
    let error = notification.userInfo?[AVCaptureSessionErrorKey] as? AVError
    DispatchQueue.main.async {
      self.onCameraError(["message": error?.localizedDescription ?? "The camera stopped unexpectedly."])
    }
    // Media services can be reset by the system; starting again recovers the preview.
    if error?.code == .mediaServicesWereReset {
      sessionQueue.async {
        if self.configured && !self.session.isRunning {
          self.session.startRunning()
        }
      }
    }
  }

  @objc private func sessionInterrupted(_ notification: Notification) {
    DispatchQueue.main.async {
      self.outlineLayer.path = nil
    }
    analysisQueue.async { self.resetTracking() }
  }

  @objc private func sessionInterruptionEnded(_ notification: Notification) {
    DispatchQueue.main.async { self.updateRunning() }
  }

  private func configureIfNeeded() {
    guard !configured else { return }
    session.beginConfiguration()
    defer { session.commitConfiguration() }
    // AVFoundation raises an uncatchable exception for unsupported settings, so each one is checked first.
    if session.canSetSessionPreset(.photo) {
      session.sessionPreset = .photo
    }

    guard
      let device = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .back),
      let input = try? AVCaptureDeviceInput(device: device),
      session.canAddInput(input),
      session.canAddOutput(photoOutput),
      session.canAddOutput(videoOutput)
    else {
      DispatchQueue.main.async {
        self.onCameraError(["message": "The camera is not available on this device."])
      }
      return
    }
    session.addInput(input)
    session.addOutput(photoOutput)

    videoOutput.alwaysDiscardsLateVideoFrames = true
    let pixelFormat = kCVPixelFormatType_420YpCbCr8BiPlanarFullRange
    if videoOutput.availableVideoPixelFormatTypes.contains(pixelFormat) {
      videoOutput.videoSettings = [kCVPixelBufferPixelFormatTypeKey as String: pixelFormat]
    }
    videoOutput.setSampleBufferDelegate(self, queue: analysisQueue)
    session.addOutput(videoOutput)

    if let connection = photoOutput.connection(with: .video) {
      Self.makePortrait(connection)
    }
    if (try? device.lockForConfiguration()) != nil {
      if device.isFocusModeSupported(.continuousAutoFocus) {
        device.focusMode = .continuousAutoFocus
      }
      if device.isAutoFocusRangeRestrictionSupported {
        // Cards are held close to the camera.
        device.autoFocusRangeRestriction = .near
      }
      device.unlockForConfiguration()
    }
    configured = true
  }

  private static func makePortrait(_ connection: AVCaptureConnection) {
    if #available(iOS 17.0, *) {
      if connection.isVideoRotationAngleSupported(90) {
        connection.videoRotationAngle = 90
      }
    } else if connection.isVideoOrientationSupported {
      connection.videoOrientation = .portrait
    }
  }

  // MARK: - Live detection

  func captureOutput(_ output: AVCaptureOutput, didOutput sampleBuffer: CMSampleBuffer, from connection: AVCaptureConnection) {
    let now = CACurrentMediaTime()
    guard now - lastAnalysisTime >= Self.analysisInterval, let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else {
      return
    }
    lastAnalysisTime = now

    let rectangles = CardImageProcessor.rectangleRequest(minimumSize: 0.25, minimumConfidence: 0.8)
    var requests: [VNRequest] = [rectangles]
    let barcodes = VNDetectBarcodesRequest()
    if scansBarcodes {
      barcodes.symbologies = [.qr]
      requests.append(barcodes)
    }
    // The sensor delivers landscape frames; .right makes Vision work in the upright portrait image.
    do {
      try VNImageRequestHandler(cvPixelBuffer: pixelBuffer, orientation: .right, options: [:]).perform(requests)
    } catch {
      return
    }

    let quad = track(rectangles.results?.first.map(CardQuad.init))
    let state = quad == nil ? "none" : steadyFrames >= Self.steadyFrameCount ? "steady" : "detected"
    let stateChanged = state != reportedState
    reportedState = state
    let uprightSize = CGSize(width: CVPixelBufferGetHeight(pixelBuffer), height: CVPixelBufferGetWidth(pixelBuffer))
    let barcode = scansBarcodes ? newBarcode(in: barcodes, at: now) : nil

    DispatchQueue.main.async {
      self.drawOutline(quad, steady: state == "steady", imageSize: uprightSize)
      if stateChanged {
        self.onCardStateChange(["state": state])
      }
      if let barcode {
        self.onBarcodeScanned(["data": barcode])
      }
    }
  }

  /// Smooths detection across frames: keeps the last card through brief misses and counts steady frames.
  private func track(_ quad: CardQuad?) -> CardQuad? {
    guard let quad else {
      missedFrames += 1
      if missedFrames >= Self.missedFrameLimit {
        resetTracking()
      }
      return trackedQuad
    }
    missedFrames = 0
    if let previous = trackedQuad, previous.distance(to: quad) < Self.steadyTolerance {
      steadyFrames += 1
    } else {
      steadyFrames = 0
    }
    trackedQuad = quad
    return quad
  }

  private func resetTracking() {
    trackedQuad = nil
    steadyFrames = 0
    missedFrames = 0
  }

  /// The QR payload in this frame, unless the same code was already reported in the last two seconds.
  private func newBarcode(in request: VNDetectBarcodesRequest, at time: CFTimeInterval) -> String? {
    guard let value = request.results?.compactMap(\.payloadStringValue).first else { return nil }
    if let last = lastBarcode, last.value == value, time - last.time < 2 {
      return nil
    }
    lastBarcode = (value, time)
    return value
  }

  private func drawOutline(_ quad: CardQuad?, steady: Bool, imageSize: CGSize) {
    guard let quad, imageSize.width > 0, imageSize.height > 0 else {
      outlineLayer.path = nil
      return
    }
    // The preview fills the view (aspect fill), so map the frame's normalized points the same way.
    let scale = max(bounds.width / imageSize.width, bounds.height / imageSize.height)
    let width = imageSize.width * scale
    let height = imageSize.height * scale
    let originX = (bounds.width - width) / 2
    let originY = (bounds.height - height) / 2
    let points = quad.points.map { CGPoint(x: originX + $0.x * width, y: originY + (1 - $0.y) * height) }

    let path = UIBezierPath()
    path.move(to: points[0])
    points.dropFirst().forEach { path.addLine(to: $0) }
    path.close()

    let color = steady ? Self.steadyColor : Self.outlineColor
    CATransaction.begin()
    CATransaction.setAnimationDuration(Self.analysisInterval)
    outlineLayer.path = path.cgPath
    outlineLayer.strokeColor = color.cgColor
    outlineLayer.fillColor = color.withAlphaComponent(0.16).cgColor
    CATransaction.commit()
  }

  // MARK: - Capture

  func capture(promise: Promise) {
    guard pendingCapture == nil else {
      promise.reject(CaptureInProgressException())
      return
    }
    pendingCapture = promise
    sessionQueue.async {
      guard self.configured, self.session.isRunning else {
        DispatchQueue.main.async {
          self.pendingCapture = nil
          promise.reject(CameraNotReadyException())
        }
        return
      }
      // capturePhoto raises an uncatchable exception without an active video connection.
      guard let connection = self.photoOutput.connection(with: .video), connection.isActive, connection.isEnabled else {
        DispatchQueue.main.async {
          self.pendingCapture = nil
          promise.reject(CameraNotReadyException())
        }
        return
      }
      let settings = self.photoOutput.availablePhotoCodecTypes.contains(.jpeg)
        ? AVCapturePhotoSettings(format: [AVVideoCodecKey: AVVideoCodecType.jpeg])
        : AVCapturePhotoSettings()
      self.photoOutput.capturePhoto(with: settings, delegate: self)
    }
  }

  func photoOutput(_ output: AVCapturePhotoOutput, didFinishProcessingPhoto photo: AVCapturePhoto, error: Error?) {
    let data = error == nil ? photo.fileDataRepresentation() : nil
    // The card seen in the preview, used when the full-resolution photo alone is not conclusive.
    let previewQuad = analysisQueue.sync { trackedQuad }

    DispatchQueue.main.async {
      guard let promise = self.pendingCapture else { return }
      self.pendingCapture = nil
      guard let data else {
        promise.reject(CaptureFailedException(error?.localizedDescription ?? "no image data"))
        return
      }
      DispatchQueue.global(qos: .userInitiated).async {
        do {
          promise.resolve(try Self.process(photoData: data, previewQuad: previewQuad))
        } catch {
          promise.reject(error)
        }
      }
    }
  }

  /// Straightens the card in the captured photo. Detection runs again on the sharp full-size photo;
  /// the preview's outline is the fallback (both frames are upright 4:3, so its corners carry over).
  private static func process(photoData: Data, previewQuad: CardQuad?) throws -> [String: Any] {
    guard let image = CIImage(data: photoData, options: [.applyOrientationProperty: true]) else {
      throw CaptureFailedException("unreadable image")
    }
    let quad = (try? CardImageProcessor.detectCard(in: image, minimumSize: 0.15, minimumConfidence: 0.6)) ?? previewQuad
    // A degenerate outline cannot be straightened; the full photo is used instead.
    if let quad, let straightened = CardImageProcessor.straighten(image, to: quad) {
      return try CardImageProcessor.save(straightened, quality: 0.85, quad: quad)
    }
    return try CardImageProcessor.save(image, quality: 0.85, quad: nil)
  }
}
