package com.mindpros.cardrectangledetector

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import androidx.exifinterface.media.ExifInterface
import org.opencv.android.Utils
import org.opencv.core.Core
import org.opencv.core.CvType
import org.opencv.core.Mat
import org.opencv.core.MatOfPoint
import org.opencv.core.MatOfPoint2f
import org.opencv.core.Point
import org.opencv.core.Scalar
import org.opencv.core.Size
import org.opencv.imgproc.Imgproc
import org.opencv.objdetect.QRCodeDetector
import java.io.File
import java.io.FileOutputStream
import kotlin.math.abs
import kotlin.math.hypot
import kotlin.math.max
import kotlin.math.min

data class NormalizedPoint(val x: Double, val y: Double)

data class DetectedQuad(
  val topLeft: NormalizedPoint,
  val topRight: NormalizedPoint,
  val bottomRight: NormalizedPoint,
  val bottomLeft: NormalizedPoint
) {
  val points get() = listOf(topLeft, topRight, bottomRight, bottomLeft)

  fun distance(other: DetectedQuad): Double = points.zip(other.points).maxOf { (a, b) ->
    hypot(a.x - b.x, a.y - b.y)
  }

  fun asMap() = mapOf(
    "topLeft" to mapOf("x" to topLeft.x, "y" to topLeft.y),
    "topRight" to mapOf("x" to topRight.x, "y" to topRight.y),
    "bottomRight" to mapOf("x" to bottomRight.x, "y" to bottomRight.y),
    "bottomLeft" to mapOf("x" to bottomLeft.x, "y" to bottomLeft.y)
  )
}

data class Detection(val quad: DetectedQuad, val areaRatio: Double)

/** OpenCV business-card contour detection and perspective correction shared by live and still capture. */
object CardDetector {
  private const val analysisMaxEdge = 720.0
  private val qrDetector = QRCodeDetector()

  fun bitmapFromFile(file: File): Bitmap? {
    val bitmap = BitmapFactory.decodeFile(file.absolutePath) ?: return null
    val orientation = ExifInterface(file.absolutePath).getAttributeInt(
      ExifInterface.TAG_ORIENTATION,
      ExifInterface.ORIENTATION_NORMAL
    )
    val rotation = when (orientation) {
      ExifInterface.ORIENTATION_ROTATE_90 -> 90f
      ExifInterface.ORIENTATION_ROTATE_180 -> 180f
      ExifInterface.ORIENTATION_ROTATE_270 -> 270f
      else -> 0f
    }
    if (rotation == 0f) return bitmap
    return Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, Matrix().apply { postRotate(rotation) }, true)
      .also { if (it !== bitmap) bitmap.recycle() }
  }

  fun matFromRgba(bytes: ByteArray, width: Int, height: Int, rowStride: Int, rotation: Int): Mat {
    val packed = if (rowStride == width * 4) {
      bytes
    } else {
      ByteArray(width * height * 4).also { result ->
        repeat(height) { row ->
          System.arraycopy(bytes, row * rowStride, result, row * width * 4, width * 4)
        }
      }
    }
    val source = Mat(height, width, CvType.CV_8UC4)
    source.put(0, 0, packed)
    if (rotation == 0) return source
    val upright = Mat()
    Core.rotate(
      source,
      upright,
      when (rotation) {
        90 -> Core.ROTATE_90_CLOCKWISE
        180 -> Core.ROTATE_180
        270 -> Core.ROTATE_90_COUNTERCLOCKWISE
        else -> Core.ROTATE_90_CLOCKWISE
      }
    )
    source.release()
    return upright
  }

  fun fromBitmap(bitmap: Bitmap): Mat = Mat().also { Utils.bitmapToMat(bitmap, it) }

  fun detect(source: Mat, minimumAreaRatio: Double = 0.12): Detection? {
    if (source.empty()) return null
    val scale = min(1.0, analysisMaxEdge / max(source.cols(), source.rows()).toDouble())
    val working = Mat()
    if (scale < 1.0) Imgproc.resize(source, working, Size(), scale, scale, Imgproc.INTER_AREA) else source.copyTo(working)
    val gray = Mat()
    val blurred = Mat()
    val edges = Mat()
    Imgproc.cvtColor(working, gray, if (working.channels() == 4) Imgproc.COLOR_RGBA2GRAY else Imgproc.COLOR_BGR2GRAY)
    Imgproc.GaussianBlur(gray, blurred, Size(5.0, 5.0), 0.0)
    Imgproc.Canny(blurred, edges, 55.0, 165.0)
    val closeKernel = Imgproc.getStructuringElement(Imgproc.MORPH_RECT, Size(5.0, 5.0))
    Imgproc.morphologyEx(
      edges,
      edges,
      Imgproc.MORPH_CLOSE,
      closeKernel
    )

    val contours = mutableListOf<MatOfPoint>()
    val hierarchy = Mat()
    Imgproc.findContours(edges, contours, hierarchy, Imgproc.RETR_LIST, Imgproc.CHAIN_APPROX_SIMPLE)
    val frameArea = working.cols().toDouble() * working.rows().toDouble()
    var best: Detection? = null
    for (contour in contours.sortedByDescending { Imgproc.contourArea(it) }.take(24)) {
      val area = Imgproc.contourArea(contour)
      if (area / frameArea < minimumAreaRatio) continue
      val curve = MatOfPoint2f(*contour.toArray())
      val approx = MatOfPoint2f()
      Imgproc.approxPolyDP(curve, approx, Imgproc.arcLength(curve, true) * 0.025, true)
      val points = approx.toArray()
      curve.release()
      approx.release()
      if (points.size != 4) continue
      val integerPoints = MatOfPoint(*points)
      val convex = Imgproc.isContourConvex(integerPoints)
      integerPoints.release()
      if (!convex) continue
      val ordered = order(points)
      val width = max(distance(ordered[0], ordered[1]), distance(ordered[3], ordered[2]))
      val height = max(distance(ordered[0], ordered[3]), distance(ordered[1], ordered[2]))
      val ratio = max(width, height) / max(1.0, min(width, height))
      if (ratio !in 1.20..2.15) continue
      val quad = DetectedQuad(
        NormalizedPoint(ordered[0].x / working.cols(), ordered[0].y / working.rows()),
        NormalizedPoint(ordered[1].x / working.cols(), ordered[1].y / working.rows()),
        NormalizedPoint(ordered[2].x / working.cols(), ordered[2].y / working.rows()),
        NormalizedPoint(ordered[3].x / working.cols(), ordered[3].y / working.rows())
      )
      val candidate = Detection(quad, area / frameArea)
      if (best == null || candidate.areaRatio > best.areaRatio) best = candidate
    }
    contours.forEach(MatOfPoint::release)
    working.release()
    gray.release()
    blurred.release()
    edges.release()
    closeKernel.release()
    hierarchy.release()
    return best
  }

  fun qrCode(source: Mat): String? = try {
    qrDetector.detectAndDecode(source).takeIf(String::isNotBlank)
  } catch (_: Throwable) {
    null
  }

  fun straighten(source: Mat, quad: DetectedQuad): Mat {
    fun point(value: NormalizedPoint) = Point(value.x * source.cols(), value.y * source.rows())
    val tl = point(quad.topLeft)
    val tr = point(quad.topRight)
    val br = point(quad.bottomRight)
    val bl = point(quad.bottomLeft)
    val width = max(distance(tl, tr), distance(bl, br)).toInt().coerceAtLeast(1)
    val height = max(distance(tl, bl), distance(tr, br)).toInt().coerceAtLeast(1)
    val destination = MatOfPoint2f(
      Point(0.0, 0.0), Point(width - 1.0, 0.0),
      Point(width - 1.0, height - 1.0), Point(0.0, height - 1.0)
    )
    val sourcePoints = MatOfPoint2f(tl, tr, br, bl)
    val transform = Imgproc.getPerspectiveTransform(sourcePoints, destination)
    val result = Mat()
    Imgproc.warpPerspective(source, result, transform, Size(width.toDouble(), height.toDouble()), Imgproc.INTER_CUBIC, Core.BORDER_REPLICATE, Scalar(0.0))
    sourcePoints.release()
    destination.release()
    transform.release()
    return result
  }

  fun saveJpeg(source: Mat, file: File, quality: Int = 88): Pair<Int, Int> {
    val bitmap = Bitmap.createBitmap(source.cols(), source.rows(), Bitmap.Config.ARGB_8888)
    Utils.matToBitmap(source, bitmap)
    FileOutputStream(file).use { bitmap.compress(Bitmap.CompressFormat.JPEG, quality, it) }
    val size = bitmap.width to bitmap.height
    bitmap.recycle()
    return size
  }

  private fun order(points: Array<Point>): Array<Point> {
    val topLeft = points.minBy { it.x + it.y }
    val bottomRight = points.maxBy { it.x + it.y }
    val topRight = points.maxBy { it.x - it.y }
    val bottomLeft = points.minBy { it.x - it.y }
    return arrayOf(topLeft, topRight, bottomRight, bottomLeft)
  }

  private fun distance(a: Point, b: Point) = hypot(a.x - b.x, a.y - b.y)
}
