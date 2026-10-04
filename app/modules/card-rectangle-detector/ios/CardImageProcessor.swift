import CoreImage
import ExpoModulesCore
import Vision

/// A card's corners as fractions (0–1) of an upright image, origin at the bottom left (Vision's space).
struct CardQuad {
  let topLeft: CGPoint
  let topRight: CGPoint
  let bottomRight: CGPoint
  let bottomLeft: CGPoint

  init(_ observation: VNRectangleObservation) {
    topLeft = observation.topLeft
    topRight = observation.topRight
    bottomRight = observation.bottomRight
    bottomLeft = observation.bottomLeft
  }

  var points: [CGPoint] { [topLeft, topRight, bottomRight, bottomLeft] }

  /// Largest distance any corner moved, used to tell when the card is being held still.
  func distance(to other: CardQuad) -> CGFloat {
    zip(points, other.points).map { hypot($0.x - $1.x, $0.y - $1.y) }.max() ?? .greatestFiniteMagnitude
  }

  /// Corners with a top-left origin, matching React Native's coordinate space.
  var dictionary: [String: [String: Double]] {
    func corner(_ point: CGPoint) -> [String: Double] {
      ["x": Double(point.x), "y": Double(1 - point.y)]
    }
    return [
      "topLeft": corner(topLeft),
      "topRight": corner(topRight),
      "bottomRight": corner(bottomRight),
      "bottomLeft": corner(bottomLeft),
    ]
  }
}

final class ImageNotReadableException: GenericException<String> {
  override var reason: String {
    "Could not read the image at '\(param)'"
  }
}

final class ImageNotWritableException: Exception {
  override var reason: String {
    "Could not save the card image"
  }
}

/// Vision rectangle detection and perspective correction shared by the module function and the live scanner.
enum CardImageProcessor {
  private static let context = CIContext()

  /// A VNDetectRectanglesRequest tuned for business cards (about 1:1.75, also square cards and steep angles).
  static func rectangleRequest(minimumSize: Float, minimumConfidence: Float) -> VNDetectRectanglesRequest {
    let request = VNDetectRectanglesRequest()
    request.minimumAspectRatio = 0.3
    request.maximumAspectRatio = 1.0
    request.minimumSize = minimumSize
    request.minimumConfidence = minimumConfidence
    request.quadratureTolerance = 25
    request.maximumObservations = 1
    return request
  }

  /// Finds the most likely card in an upright image.
  static func detectCard(in image: CIImage, minimumSize: Float, minimumConfidence: Float) throws -> CardQuad? {
    let request = rectangleRequest(minimumSize: minimumSize, minimumConfidence: minimumConfidence)
    try VNImageRequestHandler(ciImage: image, options: [:]).perform([request])
    return request.results?.first.map(CardQuad.init)
  }

  /// Crops the image to the quad and flattens it into a rectangle. Nil when the quad is degenerate
  /// (corners collapsed or out of range), which would otherwise produce an empty or unbounded image.
  static func straighten(_ image: CIImage, to quad: CardQuad) -> CIImage? {
    guard quad.points.allSatisfy({ $0.x.isFinite && $0.y.isFinite && (-0.05...1.05).contains($0.x) && (-0.05...1.05).contains($0.y) }) else {
      return nil
    }
    let extent = image.extent
    // Vision and Core Image both put the origin at the bottom left, so the corners map directly.
    func point(_ normalized: CGPoint) -> CIVector {
      CIVector(x: extent.origin.x + normalized.x * extent.width, y: extent.origin.y + normalized.y * extent.height)
    }
    let straightened = image.applyingFilter("CIPerspectiveCorrection", parameters: [
      "inputTopLeft": point(quad.topLeft),
      "inputTopRight": point(quad.topRight),
      "inputBottomLeft": point(quad.bottomLeft),
      "inputBottomRight": point(quad.bottomRight),
    ])
    let size = straightened.extent.size
    guard !straightened.extent.isInfinite, size.width >= 32, size.height >= 32,
          size.width <= extent.width * 2, size.height <= extent.height * 2 else {
      return nil
    }
    return straightened
  }

  /// Saves the image as a JPEG in the temporary directory and describes it for JavaScript.
  static func save(_ image: CIImage, quality: Double, quad: CardQuad?) throws -> [String: Any] {
    // Rendered as 8-bit sRGB so later passes in expo-image-manipulator can read it.
    let colorSpace = CGColorSpace(name: CGColorSpace.sRGB) ?? CGColorSpaceCreateDeviceRGB()
    let compression = CIImageRepresentationOption(rawValue: kCGImageDestinationLossyCompressionQuality as String)
    guard let data = context.jpegRepresentation(of: image, colorSpace: colorSpace, options: [compression: min(max(quality, 0.1), 1)]) else {
      throw ImageNotWritableException()
    }
    let url = FileManager.default.temporaryDirectory
      .appendingPathComponent("card-\(UUID().uuidString)")
      .appendingPathExtension("jpg")
    do {
      try data.write(to: url)
    } catch {
      throw ImageNotWritableException()
    }
    var result: [String: Any] = [
      "uri": url.absoluteString,
      "width": Int(image.extent.width.rounded()),
      "height": Int(image.extent.height.rounded()),
      "edgeDetected": quad != nil,
    ]
    if let quad {
      result["corners"] = quad.dictionary
    }
    return result
  }
}
