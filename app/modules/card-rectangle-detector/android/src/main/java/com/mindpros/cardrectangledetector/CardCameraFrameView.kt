package com.mindpros.cardrectangledetector

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Rect
import android.graphics.RectF
import android.view.View
import org.opencv.android.Utils
import org.opencv.core.Mat
import org.opencv.core.Size
import org.opencv.imgproc.Imgproc
import kotlin.math.max
import kotlin.math.min

/**
 * Camera preview backed by ImageAnalysis frames.
 *
 * This deliberately avoids TextureView and SurfaceView. Those surfaces can fail to compose when a
 * native Expo view is hosted by React Native Fabric on some Android vendors. A regular View/Canvas
 * works consistently because it participates in the same hierarchy as the rest of the scanner UI.
 */
class CardCameraFrameView(context: Context) : View(context) {
  private val paint = Paint(Paint.ANTI_ALIAS_FLAG or Paint.FILTER_BITMAP_FLAG)
  private var frame: Bitmap? = null
  private var generation = 0L

  init {
    setBackgroundColor(Color.BLACK)
  }

  fun update(source: Mat) {
    if (source.empty()) return
    val token = ++generation
    val maximumEdge = 1280.0
    val scale = min(1.0, maximumEdge / max(source.cols(), source.rows()).toDouble())
    val rendered = Mat()
    if (scale < 1.0) {
      Imgproc.resize(source, rendered, Size(), scale, scale, Imgproc.INTER_AREA)
    } else {
      source.copyTo(rendered)
    }
    val bitmap = Bitmap.createBitmap(rendered.cols(), rendered.rows(), Bitmap.Config.ARGB_8888)
    Utils.matToBitmap(rendered, bitmap)
    rendered.release()
    post {
      if (token != generation || !isAttachedToWindow) {
        bitmap.recycle()
        return@post
      }
      val previous = frame
      frame = bitmap
      previous?.recycle()
      invalidate()
    }
  }

  fun clear() {
    generation++
    post {
      frame?.recycle()
      frame = null
      invalidate()
    }
  }

  override fun onDraw(canvas: Canvas) {
    super.onDraw(canvas)
    val bitmap = frame ?: return
    if (bitmap.isRecycled || width == 0 || height == 0) return
    val scale = max(width.toFloat() / bitmap.width, height.toFloat() / bitmap.height)
    val renderedWidth = bitmap.width * scale
    val renderedHeight = bitmap.height * scale
    val destination = RectF(
      (width - renderedWidth) / 2f,
      (height - renderedHeight) / 2f,
      (width + renderedWidth) / 2f,
      (height + renderedHeight) / 2f
    )
    canvas.drawBitmap(bitmap, Rect(0, 0, bitmap.width, bitmap.height), destination, paint)
  }
}
