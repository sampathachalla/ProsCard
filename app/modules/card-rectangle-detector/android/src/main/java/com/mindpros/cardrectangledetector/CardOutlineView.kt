package com.mindpros.cardrectangledetector

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.view.View
import kotlin.math.max

/** Draws the detected quadrilateral over an aspect-fill CameraX preview. */
class CardOutlineView(context: Context) : View(context) {
  private val stroke = Paint(Paint.ANTI_ALIAS_FLAG).apply {
    style = Paint.Style.STROKE
    strokeWidth = resources.displayMetrics.density * 3f
    strokeJoin = Paint.Join.ROUND
  }
  private val fill = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.FILL }
  private var quad: DetectedQuad? = null
  private var imageWidth = 0
  private var imageHeight = 0
  private var steady = false

  fun update(value: DetectedQuad?, frameWidth: Int, frameHeight: Int, isSteady: Boolean) {
    quad = value
    imageWidth = frameWidth
    imageHeight = frameHeight
    steady = isSteady
    invalidate()
  }

  override fun onDraw(canvas: Canvas) {
    super.onDraw(canvas)
    val current = quad ?: return
    if (imageWidth <= 0 || imageHeight <= 0) return
    val scale = max(width.toFloat() / imageWidth, height.toFloat() / imageHeight)
    val renderedWidth = imageWidth * scale
    val renderedHeight = imageHeight * scale
    val offsetX = (width - renderedWidth) / 2f
    val offsetY = (height - renderedHeight) / 2f
    fun x(value: NormalizedPoint) = offsetX + value.x.toFloat() * renderedWidth
    fun y(value: NormalizedPoint) = offsetY + value.y.toFloat() * renderedHeight
    val path = Path().apply {
      moveTo(x(current.topLeft), y(current.topLeft))
      lineTo(x(current.topRight), y(current.topRight))
      lineTo(x(current.bottomRight), y(current.bottomRight))
      lineTo(x(current.bottomLeft), y(current.bottomLeft))
      close()
    }
    val color = if (steady) Color.rgb(74, 222, 128) else Color.rgb(34, 211, 238)
    fill.color = Color.argb(38, Color.red(color), Color.green(color), Color.blue(color))
    stroke.color = color
    canvas.drawPath(path, fill)
    canvas.drawPath(path, stroke)
  }
}
