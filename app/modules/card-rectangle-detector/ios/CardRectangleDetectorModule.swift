import CoreImage
import ExpoModulesCore

internal struct DetectCardOptions: Record {
  /// Vision confidence (0–1) below which a rectangle is ignored.
  @Field
  var minimumConfidence: Float = 0.8

  /// Smallest card accepted, as a fraction of the photo's shorter side.
  @Field
  var minimumSize: Float = 0.2

  /// JPEG quality (0–1) of the straightened card image.
  @Field
  var quality: Double = 0.9
}

/// Apple Vision rectangle detection (VNDetectRectanglesRequest) for business cards: on a saved photo,
/// and live in the camera through CardScannerView.
public class CardRectangleDetectorModule: Module {
  public func definition() -> ModuleDefinition {
    Name("CardRectangleDetector")

    AsyncFunction("detectCardAsync") { (uri: String, options: DetectCardOptions) throws -> [String: Any]? in
      let fileUrl = Self.fileUrl(from: uri)
      // Applying the EXIF orientation first keeps the result upright and the corners in display space.
      guard let image = CIImage(contentsOf: fileUrl, options: [.applyOrientationProperty: true]) else {
        throw ImageNotReadableException(uri)
      }
      guard let quad = try CardImageProcessor.detectCard(
        in: image,
        minimumSize: options.minimumSize,
        minimumConfidence: options.minimumConfidence
      ) else {
        return nil
      }
      guard let straightened = CardImageProcessor.straighten(image, to: quad) else {
        return nil
      }
      return try CardImageProcessor.save(straightened, quality: options.quality, quad: quad)
    }

    View(CardScannerView.self) {
      Events("onCardStateChange", "onBarcodeScanned", "onCameraError")

      Prop("active") { (view: CardScannerView, active: Bool?) in
        view.isActive = active ?? true
      }

      Prop("barcodeScanningEnabled") { (view: CardScannerView, enabled: Bool?) in
        view.setBarcodeScanningEnabled(enabled ?? false)
      }

      AsyncFunction("captureAsync") { (view: CardScannerView, promise: Promise) in
        view.capture(promise: promise)
      }
      .runOnQueue(.main)
    }
  }

  private static func fileUrl(from uri: String) -> URL {
    if let url = URL(string: uri), url.scheme != nil {
      return url
    }
    return URL(fileURLWithPath: uri)
  }
}
