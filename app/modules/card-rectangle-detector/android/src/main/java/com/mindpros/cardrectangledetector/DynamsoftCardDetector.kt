package com.mindpros.cardrectangledetector

import android.content.Context
import android.graphics.Bitmap
import android.util.Log
import com.dynamsoft.cvr.CaptureVisionRouter
import com.dynamsoft.cvr.EnumPresetTemplate
import com.dynamsoft.license.LicenseManager
import org.opencv.android.Utils
import org.opencv.core.Mat
import org.opencv.core.Size
import org.opencv.imgproc.Imgproc
import kotlin.math.hypot
import kotlin.math.max
import kotlin.math.min

/** Uses the existing CameraX frames and returns corners in the same space as the preview and crop. */
internal object DynamsoftCardDetector {
  private const val maxAnalysisEdge = 720.0
  private var licenseRequested = false
  @Volatile private var licenseReady = false
  private var router: CaptureVisionRouter? = null

  @Synchronized
  fun detect(context: Context, source: Mat, minimumAreaRatio: Double): DetectedQuad? {
    if (BuildConfig.DYNAMSOFT_LICENSE.isBlank() || source.empty()) return null
    return try {
      if (!licenseRequested) {
        licenseRequested = true
        LicenseManager.initLicense(BuildConfig.DYNAMSOFT_LICENSE, context.applicationContext) { success, _ ->
          licenseReady = success
          if (!success) Log.w("CardScanner", "Dynamsoft license activation failed; using OpenCV.")
        }
      }
      if (!licenseReady) return null
      val activeRouter = router ?: CaptureVisionRouter(context.applicationContext).also { router = it }
      detectCorners(activeRouter, source, minimumAreaRatio)
    } catch (_: Exception) {
      null
    } catch (_: LinkageError) {
      licenseReady = false
      null
    }
  }

  private fun detectCorners(router: CaptureVisionRouter, source: Mat, minimumAreaRatio: Double): DetectedQuad? {
    val scale = min(1.0, maxAnalysisEdge / max(source.cols(), source.rows()))
    val resized = if (scale < 1.0) Mat() else null
    var bitmap: Bitmap? = null
    try {
      if (resized != null) Imgproc.resize(source, resized, Size(), scale, scale, Imgproc.INTER_AREA)
      val input = resized ?: source
      val width = input.cols().toDouble()
      val height = input.rows().toDouble()
      val frame = Bitmap.createBitmap(input.cols(), input.rows(), Bitmap.Config.ARGB_8888)
      bitmap = frame
      Utils.matToBitmap(input, frame)
      val result = router.capture(frame, EnumPresetTemplate.PT_DETECT_DOCUMENT_BOUNDARIES)
      val candidates = result.processedDocumentResult?.detectedQuadResultItems ?: return null
      return candidates.sortedByDescending { it.confidenceAsDocumentBoundary }.firstNotNullOfOrNull { candidate ->
        val quad = candidate.location
        val areaRatio = quad.area / (width * height)
        val corners = quad.points
        if (areaRatio !in minimumAreaRatio..0.95 || corners.size != 4 ||
          corners.any { it.x < 0 || it.y < 0 || it.x >= width || it.y >= height }
        ) return@firstNotNullOfOrNull null

        val first = corners.indices.minBy { corners[it].x + corners[it].y }
        val ordered = List(4) { corners[(first + it) % 4] }
        val sides = ordered.indices.map { i ->
          val a = ordered[i]
          val b = ordered[(i + 1) % 4]
          hypot((a.x - b.x).toDouble(), (a.y - b.y).toDouble())
        }
        val horizontal = max(sides[0], sides[2])
        val vertical = max(sides[1], sides[3])
        if (max(horizontal, vertical) / max(1.0, min(horizontal, vertical)) !in 1.05..2.50) {
          return@firstNotNullOfOrNull null
        }
        val points = ordered.map { NormalizedPoint(it.x / width, it.y / height) }
        DetectedQuad(points[0], points[1], points[2], points[3])
      }
    } finally {
      bitmap?.recycle()
      resized?.release()
    }
  }
}
