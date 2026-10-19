package com.mindpros.cardrectangledetector

import android.net.Uri
import expo.modules.kotlin.Promise
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.types.OptimizedRecord
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.opencv.android.OpenCVLoader
import java.io.File

@OptimizedRecord
class DetectCardOptions : Record {
  @Field var minimumConfidence: Double = 0.8
  @Field var minimumSize: Double = 0.2
  @Field var quality: Double = 0.9
}

class CardRectangleDetectorModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("CardRectangleDetector")

    AsyncFunction("detectCardAsync") Coroutine { uri: String, options: DetectCardOptions ->
      withContext(Dispatchers.IO) { detectFile(uri, options) }
    }

    View(CardScannerView::class) {
      Events("onCardStateChange", "onBarcodeScanned", "onCameraError")

      Prop("active") { view: CardScannerView, active: Boolean? ->
        view.setActive(active ?: true)
      }

      Prop("barcodeScanningEnabled") { view: CardScannerView, enabled: Boolean? ->
        view.setBarcodeScanningEnabled(enabled ?: false)
      }

      AsyncFunction("captureAsync") { view: CardScannerView, promise: Promise ->
        view.capture(promise)
      }

      OnViewDestroys { view: CardScannerView -> view.destroy() }
    }
  }

  private fun detectFile(uri: String, options: DetectCardOptions): Map<String, Any?>? {
    if (!OpenCVLoader.initDebug()) throw IllegalStateException("The card detector could not start")
    val path = Uri.parse(uri).path ?: uri
    val sourceFile = File(path)
    val bitmap = CardDetector.bitmapFromFile(sourceFile) ?: throw IllegalArgumentException("The image could not be read")
    val source = CardDetector.fromBitmap(bitmap)
    bitmap.recycle()
    try {
      val minimumArea = (options.minimumSize * options.minimumSize).coerceIn(0.03, 0.75)
      val detection = CardDetector.detect(source, minimumArea) ?: return null
      val straightened = CardDetector.straighten(source, detection.quad)
      try {
        val output = File(requireNotNull(appContext.reactContext).cacheDir, "vcpros-detected-${System.currentTimeMillis()}.jpg")
        val (width, height) = CardDetector.saveJpeg(straightened, output, (options.quality.coerceIn(0.1, 1.0) * 100).toInt())
        return mapOf(
          "uri" to output.toURI().toString(),
          "width" to width,
          "height" to height,
          "edgeDetected" to true,
          "corners" to detection.quad.asMap()
        )
      } finally {
        straightened.release()
      }
    } finally {
      source.release()
    }
  }
}
