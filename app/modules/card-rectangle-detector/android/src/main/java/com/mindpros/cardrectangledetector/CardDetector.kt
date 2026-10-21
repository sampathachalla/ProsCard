package com.mindpros.cardrectangledetector

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import androidx.exifinterface.media.ExifInterface
import org.opencv.android.Utils
import org.opencv.core.Core
import org.opencv.core.CvType
import org.opencv.core.Mat
import org.opencv.core.MatOfInt
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

  /**
   * Finds the largest business-card-shaped quadrilateral.
   *
   * Edge thresholds adapt to each frame (a fixed Canny(55, 165) misses a light card on a light desk),
   * edges are thickened so small gaps from glare join, and every outline is judged by its convex hull,
   * so an outline that is not perfectly closed still counts. Each candidate must then look like a real
   * card: near-right corners, inside brightness different from just outside, and edges along all sides.
   */
  fun detect(source: Mat, minimumAreaRatio: Double = 0.12): Detection? {
    if (source.empty()) return null
    val scale = min(1.0, analysisMaxEdge / max(source.cols(), source.rows()).toDouble())
    val working = Mat()
    if (scale < 1.0) Imgproc.resize(source, working, Size(), scale, scale, Imgproc.INTER_AREA) else source.copyTo(working)
    val gray = Mat()
    val blurred = Mat()
    val binary = Mat()
    val edges = Mat()
    val hierarchy = Mat()
    val kernel = Imgproc.getStructuringElement(Imgproc.MORPH_RECT, Size(3.0, 3.0))
    try {
      Imgproc.cvtColor(working, gray, if (working.channels() == 4) Imgproc.COLOR_RGBA2GRAY else Imgproc.COLOR_BGR2GRAY)
      Imgproc.GaussianBlur(gray, blurred, Size(5.0, 5.0), 0.0)
      val otsu = Imgproc.threshold(blurred, binary, 0.0, 255.0, Imgproc.THRESH_BINARY or Imgproc.THRESH_OTSU)
      val median = median(blurred)
      // Most sensitive first; the fixed pass is the original detector, kept as a last resort.
      val passes = listOf(
        max(10.0, 0.33 * median) to max(30.0, 0.665 * median),
        0.25 * otsu to 0.5 * otsu,
        55.0 to 165.0
      )
      val frameArea = working.cols().toDouble() * working.rows().toDouble()
      for ((low, high) in passes) {
        Imgproc.Canny(blurred, edges, low, high)
        Imgproc.dilate(edges, edges, kernel, Point(-1.0, -1.0), 2)
        val contours = mutableListOf<MatOfPoint>()
        Imgproc.findContours(edges, contours, hierarchy, Imgproc.RETR_LIST, Imgproc.CHAIN_APPROX_SIMPLE)
        var best: Detection? = null
        val hulls = contours.map { hull(it) }
        contours.forEach(MatOfPoint::release)
        for (points in hulls.sortedByDescending { hullArea(it) }.take(24)) {
          val candidate = quadFrom(points, frameArea, minimumAreaRatio, working.cols(), working.rows()) ?: continue
          if (!insideDiffersFromOutside(blurred, candidate.quad)) continue
          if (!sidesFollowEdges(edges, candidate.quad)) continue
          if (best == null || candidate.areaRatio > best.areaRatio) best = candidate
        }
        if (best != null) return best
      }
      return null
    } finally {
      working.release()
      gray.release()
      blurred.release()
      binary.release()
      edges.release()
      hierarchy.release()
      kernel.release()
    }
  }

  private fun hull(contour: MatOfPoint): Array<Point> {
    val indices = MatOfInt()
    Imgproc.convexHull(contour, indices)
    val all = contour.toArray()
    val points = indices.toArray().map { all[it] }.toTypedArray()
    indices.release()
    return points
  }

  private fun hullArea(points: Array<Point>): Double {
    if (points.size < 3) return 0.0
    val mat = MatOfPoint(*points)
    return Imgproc.contourArea(mat).also { mat.release() }
  }

  private fun quadFrom(hull: Array<Point>, frameArea: Double, minimumAreaRatio: Double, cols: Int, rows: Int): Detection? {
    if (hull.size < 4) return null
    val curve = MatOfPoint2f(*hull)
    val approx = MatOfPoint2f()
    val perimeter = Imgproc.arcLength(curve, true)
    Imgproc.approxPolyDP(curve, approx, perimeter * 0.02, true)
    val points = approx.toArray()
    val quadPerimeter = Imgproc.arcLength(approx, true)
    curve.release()
    approx.release()
    if (perimeter < 1.0 || points.size != 4) return null
    val integerPoints = MatOfPoint(*points)
    val convex = Imgproc.isContourConvex(integerPoints)
    val area = Imgproc.contourArea(integerPoints)
    integerPoints.release()
    if (!convex) return null
    val areaRatio = area / frameArea
    if (areaRatio < minimumAreaRatio || areaRatio > 0.95) return null
    // Most of the outline must lie on the four sides, which rejects round or ragged blobs.
    if (quadPerimeter < 0.85 * perimeter) return null
    val ordered = order(points)
    val width = max(distance(ordered[0], ordered[1]), distance(ordered[3], ordered[2]))
    val height = max(distance(ordered[0], ordered[3]), distance(ordered[1], ordered[2]))
    val ratio = max(width, height) / max(1.0, min(width, height))
    if (ratio !in 1.20..2.15) return null
    // Corners between roughly 65 and 115 degrees, allowing for perspective.
    for (i in 0 until 4) {
      val a = ordered[(i + 3) % 4]
      val b = ordered[i]
      val c = ordered[(i + 1) % 4]
      val v1x = a.x - b.x
      val v1y = a.y - b.y
      val v2x = c.x - b.x
      val v2y = c.y - b.y
      val cosine = abs(v1x * v2x + v1y * v2y) / max(1e-6, hypot(v1x, v1y) * hypot(v2x, v2y))
      if (cosine > 0.42) return null
    }
    val quad = DetectedQuad(
      NormalizedPoint(ordered[0].x / cols, ordered[0].y / rows),
      NormalizedPoint(ordered[1].x / cols, ordered[1].y / rows),
      NormalizedPoint(ordered[2].x / cols, ordered[2].y / rows),
      NormalizedPoint(ordered[3].x / cols, ordered[3].y / rows)
    )
    return Detection(quad, areaRatio)
  }

  /** A card is brighter or darker than the surface around it; crossing lines on one surface are not. */
  private fun insideDiffersFromOutside(gray: Mat, quad: DetectedQuad, minimum: Double = 12.0): Boolean {
    val points = quad.points.map { Point(it.x * gray.cols(), it.y * gray.rows()) }
    val cx = points.sumOf { it.x } / 4
    val cy = points.sumOf { it.y } / 4
    fun scaled(factor: Double) = MatOfPoint(*points.map { Point(cx + (it.x - cx) * factor, cy + (it.y - cy) * factor) }.toTypedArray())
    val inner = Mat.zeros(gray.size(), CvType.CV_8UC1)
    val outer = Mat.zeros(gray.size(), CvType.CV_8UC1)
    val innerShape = scaled(0.85)
    val outerShape = scaled(1.15)
    val gapShape = scaled(1.03)
    try {
      Imgproc.fillConvexPoly(inner, innerShape, Scalar(255.0))
      Imgproc.fillConvexPoly(outer, outerShape, Scalar(255.0))
      Imgproc.fillConvexPoly(outer, gapShape, Scalar(0.0))
      if (Core.countNonZero(inner) == 0 || Core.countNonZero(outer) == 0) return false
      return abs(Core.mean(gray, inner).`val`[0] - Core.mean(gray, outer).`val`[0]) >= minimum
    } finally {
      inner.release()
      outer.release()
      innerShape.release()
      outerShape.release()
      gapShape.release()
    }
  }

  /** Every side of a real card follows an edge; a box closed across empty surface does not. */
  private fun sidesFollowEdges(edges: Mat, quad: DetectedQuad, perSide: Double = 0.45, overall: Double = 0.7): Boolean {
    val samples = 40
    val points = quad.points.map { Point(it.x * edges.cols(), it.y * edges.rows()) }
    val pixel = ByteArray(1)
    var hits = 0
    for (i in 0 until 4) {
      val a = points[i]
      val b = points[(i + 1) % 4]
      var sideHits = 0
      for (k in 0 until samples) {
        val t = (k + 0.5) / samples
        val x = Math.round(a.x + (b.x - a.x) * t).toInt()
        val y = Math.round(a.y + (b.y - a.y) * t).toInt()
        if (x in 0 until edges.cols() && y in 0 until edges.rows()) {
          edges.get(y, x, pixel)
          if (pixel[0].toInt() != 0) sideHits++
        }
      }
      if (sideHits.toDouble() / samples < perSide) return false
      hits += sideHits
    }
    return hits.toDouble() / (4 * samples) >= overall
  }

  /** Median brightness from a 256-bin histogram, used to scale the edge thresholds to the scene. */
  private fun median(gray: Mat): Double {
    val bytes = ByteArray((gray.total() * gray.channels()).toInt())
    gray.get(0, 0, bytes)
    val histogram = IntArray(256)
    for (value in bytes) histogram[value.toInt() and 0xFF]++
    var seen = 0
    val half = bytes.size / 2
    for (level in 0 until 256) {
      seen += histogram[level]
      if (seen > half) return level.toDouble()
    }
    return 127.0
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
