package com.mindpros.cardrectangledetector

import android.annotation.SuppressLint
import android.content.Context
import android.os.SystemClock
import android.view.Surface
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageCaptureException
import androidx.camera.core.ImageProxy
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.Promise
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView
import org.opencv.android.OpenCVLoader
import org.opencv.core.Mat
import java.io.File
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

@SuppressLint("ViewConstructor")
class CardScannerView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private val onCardStateChange by EventDispatcher<CardStateEvent>()
  private val onBarcodeScanned by EventDispatcher<BarcodeEvent>()
  private val onCameraError by EventDispatcher<CameraErrorEvent>()

  private val preview = CardCameraFrameView(context)
  private val outline = CardOutlineView(context)
  private val analysisExecutor: ExecutorService = Executors.newSingleThreadExecutor()
  private val captureExecutor = ContextCompat.getMainExecutor(context)
  private var cameraProvider: ProcessCameraProvider? = null
  private var imageCapture: ImageCapture? = null
  private var active = true
  private var barcodeScanningEnabled = false
  private var capturePromise: Promise? = null

  @Volatile private var trackedQuad: DetectedQuad? = null
  private var steadyFrames = 0
  private var missedFrames = 0
  private var reportedState = "none"
  private var lastBarcode: Pair<String, Long>? = null

  companion object {
    private const val steadyFrameCount = 7
    private const val steadyTolerance = 0.018
    private const val missedFrameLimit = 4
  }

  init {
    addView(preview, FrameLayout.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
    addView(outline, FrameLayout.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
  }

  /** ExpoView is a React-managed ViewGroup, so native children must be measured and laid out explicitly. */
  override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
    val measuredWidth = MeasureSpec.getSize(widthMeasureSpec)
    val measuredHeight = MeasureSpec.getSize(heightMeasureSpec)
    val childWidth = MeasureSpec.makeMeasureSpec(measuredWidth, MeasureSpec.EXACTLY)
    val childHeight = MeasureSpec.makeMeasureSpec(measuredHeight, MeasureSpec.EXACTLY)
    preview.measure(childWidth, childHeight)
    outline.measure(childWidth, childHeight)
    setMeasuredDimension(
      ViewGroup.resolveSize(measuredWidth, widthMeasureSpec),
      ViewGroup.resolveSize(measuredHeight, heightMeasureSpec)
    )
  }

  override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
    val childWidth = right - left
    val childHeight = bottom - top
    preview.layout(0, 0, childWidth, childHeight)
    outline.layout(0, 0, childWidth, childHeight)
  }

  fun setActive(value: Boolean) {
    if (active == value) return
    active = value
    if (value && isAttachedToWindow) startCamera() else stopCamera()
  }

  fun setBarcodeScanningEnabled(value: Boolean) {
    barcodeScanningEnabled = value
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    if (active) startCamera()
  }

  override fun onDetachedFromWindow() {
    stopCamera()
    super.onDetachedFromWindow()
  }

  fun destroy() {
    stopCamera()
    analysisExecutor.shutdown()
  }

  private fun startCamera() {
    if (!OpenCVLoader.initDebug()) {
      onCameraError(CameraErrorEvent("The card detector could not start."))
      return
    }
    val future = ProcessCameraProvider.getInstance(context)
    future.addListener({
      try {
        val provider = future.get()
        cameraProvider = provider
        bindCamera(provider)
      } catch (error: Throwable) {
        onCameraError(CameraErrorEvent(error.message ?: "The camera is not available."))
      }
    }, captureExecutor)
  }

  private fun bindCamera(provider: ProcessCameraProvider) {
    val activity = appContext.currentActivity as? LifecycleOwner
    if (activity == null) {
      onCameraError(CameraErrorEvent("The camera screen is not ready."))
      return
    }
    val rotation = display?.rotation ?: Surface.ROTATION_0
    imageCapture = ImageCapture.Builder()
      .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
      .setTargetRotation(rotation)
      .build()
    val analysis = ImageAnalysis.Builder()
      .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
      .setOutputImageFormat(ImageAnalysis.OUTPUT_IMAGE_FORMAT_RGBA_8888)
      .setTargetRotation(rotation)
      .build()
    analysis.setAnalyzer(analysisExecutor, ::analyse)
    try {
      provider.unbindAll()
      provider.bindToLifecycle(activity, CameraSelector.DEFAULT_BACK_CAMERA, imageCapture, analysis)
    } catch (error: Throwable) {
      onCameraError(CameraErrorEvent(error.message ?: "The camera could not start."))
    }
  }

  private fun stopCamera() {
    cameraProvider?.unbindAll()
    resetTracking()
    preview.clear()
    post { outline.update(null, 0, 0, false) }
  }

  private fun analyse(image: ImageProxy) {
    var source: Mat? = null
    try {
      val plane = image.planes.firstOrNull() ?: return
      val buffer = plane.buffer
      buffer.rewind()
      val bytes = ByteArray(buffer.remaining())
      buffer.get(bytes)
      source = CardDetector.matFromRgba(bytes, image.width, image.height, plane.rowStride, image.imageInfo.rotationDegrees)
      preview.update(source)
      val detection = CardDetector.detect(source)
      val quad = track(detection?.quad)
      val state = if (quad == null) "none" else if (steadyFrames >= steadyFrameCount) "steady" else "detected"
      val changed = state != reportedState
      reportedState = state
      val frameWidth = source.cols()
      val frameHeight = source.rows()

      var barcode: String? = null
      if (barcodeScanningEnabled) {
        barcode = CardDetector.qrCode(source)
        if (barcode != null) {
          val now = SystemClock.elapsedRealtime()
          val previous = lastBarcode
          if (previous != null && previous.first == barcode && now - previous.second < 2000) barcode = null
          else lastBarcode = barcode to now
        }
      }
      post {
        outline.update(quad, frameWidth, frameHeight, state == "steady")
        if (changed) onCardStateChange(CardStateEvent(state))
        barcode?.let { onBarcodeScanned(BarcodeEvent(it)) }
      }
    } catch (_: Throwable) {
      // A single malformed or incomplete camera frame must not interrupt the preview.
    } finally {
      source?.release()
      image.close()
    }
  }

  private fun track(candidate: DetectedQuad?): DetectedQuad? {
    if (candidate == null) {
      missedFrames++
      if (missedFrames >= missedFrameLimit) resetTracking()
      return trackedQuad
    }
    missedFrames = 0
    val previous = trackedQuad
    steadyFrames = if (previous != null && previous.distance(candidate) < steadyTolerance) steadyFrames + 1 else 0
    trackedQuad = candidate
    return candidate
  }

  private fun resetTracking() {
    trackedQuad = null
    steadyFrames = 0
    missedFrames = 0
    if (reportedState != "none") {
      reportedState = "none"
      post { onCardStateChange(CardStateEvent("none")) }
    }
  }

  fun capture(promise: Promise) {
    if (capturePromise != null) {
      promise.reject("ERR_CAPTURE_IN_PROGRESS", "A photo is already being taken", null)
      return
    }
    val capture = imageCapture
    if (capture == null || cameraProvider == null) {
      promise.reject("ERR_CAMERA_NOT_READY", "The camera is not ready yet", null)
      return
    }
    capturePromise = promise
    val file = File(context.cacheDir, "vcpros-card-${System.currentTimeMillis()}.jpg")
    capture.takePicture(
      ImageCapture.OutputFileOptions.Builder(file).build(),
      captureExecutor,
      object : ImageCapture.OnImageSavedCallback {
        override fun onImageSaved(result: ImageCapture.OutputFileResults) {
          val pending = capturePromise ?: return
          capturePromise = null
          analysisExecutor.execute { processCapture(file, pending) }
        }

        override fun onError(error: ImageCaptureException) {
          val pending = capturePromise ?: return
          capturePromise = null
          pending.reject("ERR_CAPTURE_FAILED", error.message ?: "Could not take the photo", error)
        }
      }
    )
  }

  private fun processCapture(file: File, promise: Promise) {
    var source: Mat? = null
    var output: Mat? = null
    try {
      val bitmap = CardDetector.bitmapFromFile(file) ?: throw IllegalStateException("The captured photo is unreadable")
      source = CardDetector.fromBitmap(bitmap)
      bitmap.recycle()
      val detected = CardDetector.detect(source, 0.08)?.quad ?: trackedQuad
      output = detected?.let { CardDetector.straighten(source, it) } ?: source.clone()
      val corrected = File(context.cacheDir, "vcpros-card-corrected-${System.currentTimeMillis()}.jpg")
      val (width, height) = CardDetector.saveJpeg(output, corrected)
      if (corrected.absolutePath != file.absolutePath) file.delete()
      promise.resolve(
        mapOf(
          "uri" to corrected.toURI().toString(),
          "width" to width,
          "height" to height,
          "edgeDetected" to (detected != null),
          "corners" to detected?.asMap()
        )
      )
    } catch (error: Throwable) {
      promise.reject("ERR_CAPTURE_FAILED", error.message ?: "Could not process the photo", error)
    } finally {
      source?.release()
      output?.release()
    }
  }
}
