package com.mindpros.cardrectangledetector

import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.types.OptimizedRecord

@OptimizedRecord
class CardStateEvent(@Field val state: String) : Record

@OptimizedRecord
class BarcodeEvent(@Field val data: String) : Record

@OptimizedRecord
class CameraErrorEvent(@Field val message: String) : Record
