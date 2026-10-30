import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { File, Paths } from 'expo-file-system';
import NativeSlider from '@expo/ui/community/slider';
import {
  Canvas,
  ColorMatrix,
  Image as SkiaImage,
  ImageFormat,
  Skia,
  useImage,
} from '@shopify/react-native-skia';
import { RotateCcw, RotateCw, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { PickedImage } from './usePickImage';
import { registerPendingMedia } from '@/pages/profile/Services/pendingMedia';
import { Text } from './Text';

type Transform = { x: number; y: number; zoom: number };

type Props = {
  asset: PickedImage | null;
  aspect: [number, number];
  title: string;
  onCancel: () => void;
  onSave: (uri: string) => void | Promise<void>;
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
/** Longest edge of the working copy: above the 1600px saved output, small enough for Skia to decode. */
const MAX_WORKING_EDGE = 2048;
const IDENTITY_TRANSFORM: Transform = { x: 0, y: 0, zoom: 1 };

/** The picked photo as an upright JPEG the preview and crop both use. */
type WorkingPhoto = { sourceUri: string; uri: string; width: number; height: number };

/**
 * Skia's preview cannot decode every picked photo (HEIC from the iPhone camera, very large images) and
 * shows nothing when it fails. Re-encoding to a bounded JPEG first, with the orientation applied, makes
 * the preview reliable and keeps the crop maths on the same pixels that get saved.
 */
async function prepareWorkingPhoto(asset: PickedImage): Promise<WorkingPhoto> {
  const context = ImageManipulator.manipulate(asset.uri);
  const longest = Math.max(asset.width || 0, asset.height || 0);
  if (longest > MAX_WORKING_EDGE) {
    context.resize(asset.width >= asset.height ? { width: MAX_WORKING_EDGE } : { height: MAX_WORKING_EDGE });
  }
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.95 });
  return { sourceUri: asset.uri, uri: saved.uri, width: saved.width, height: saved.height };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function adjustmentMatrix(brightness: number, contrast: number) {
  const contrastFactor = 1 + contrast / 200;
  // Skia color-matrix offsets use normalized color values (0...1), not 0...255.
  const offset = 0.5 * (1 - contrastFactor) + brightness / 200;
  return [
    contrastFactor, 0, 0, 0, offset,
    0, contrastFactor, 0, 0, offset,
    0, 0, contrastFactor, 0, offset,
    0, 0, 0, 1, 0,
  ];
}

async function bakeColorAdjustments(uri: string, brightness: number, contrast: number) {
  if (brightness === 0 && contrast === 0) return uri;
  const data = await Skia.Data.fromURI(uri);
  const image = Skia.Image.MakeImageFromEncoded(data);
  if (!image) throw new Error('Could not decode the adjusted photo.');
  const surface = Skia.Surface.MakeOffscreen(image.width(), image.height());
  if (!surface) throw new Error('Could not create the photo adjustment surface.');
  const paint = Skia.Paint();
  paint.setColorFilter(Skia.ColorFilter.MakeMatrix(adjustmentMatrix(brightness, contrast)));
  surface.getCanvas().drawImage(image, 0, 0, paint);
  surface.flush();
  const bytes = surface.makeImageSnapshot().encodeToBytes(ImageFormat.JPEG, 90);
  const file = new File(Paths.cache, `adjusted-${Date.now()}.jpg`);
  await file.write(bytes);
  return file.uri;
}

export function PhotoAdjustmentModal({ asset, aspect, title, onCancel, onSave }: Props) {
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const frameWidth = Math.min(window.width - 32, 560);
  const frameHeight = Math.min(frameWidth / (aspect[0] / aspect[1]), window.height * 0.58);
  const [rotation, setRotation] = useState(0);
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, zoom: 1 });
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saving, setSaving] = useState(false);
  const transformRef = useRef(transform);
  const gestureStart = useRef(transform);
  const [working, setWorking] = useState<WorkingPhoto | null>(null);
  /** Source URIs that could not be prepared or previewed, so the screen can say so instead of staying blank. */
  const [prepareFailedFor, setPrepareFailedFor] = useState<string | null>(null);
  const [previewFailedFor, setPreviewFailedFor] = useState<string | null>(null);

  // Each newly picked photo gets its own working copy and starts unrotated, unzoomed and uncorrected.
  useEffect(() => {
    if (!asset) return;
    let cancelled = false;
    prepareWorkingPhoto(asset)
      .then((photo) => {
        if (cancelled) return;
        setWorking(photo);
        setRotation(0);
        transformRef.current = IDENTITY_TRANSFORM;
        setTransform(IDENTITY_TRANSFORM);
        setBrightness(0);
        setContrast(0);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.warn('Could not prepare the photo for adjustment:', error);
        setPrepareFailedFor(asset.uri);
      });
    return () => { cancelled = true; };
  }, [asset]);

  const ready = working && working.sourceUri === asset?.uri ? working : null;
  // If re-encoding failed, still try the original: many photos decode fine as they are.
  const previewUri = ready?.uri ?? (asset && prepareFailedFor === asset.uri ? asset.uri : null);
  const previewFailed = Boolean(previewUri && previewFailedFor === previewUri);

  const sourceWidth = Math.max(1, ready?.width ?? asset?.width ?? frameWidth);
  const sourceHeight = Math.max(1, ready?.height ?? asset?.height ?? frameHeight);
  const rotatedWidth = rotation % 180 === 0 ? sourceWidth : sourceHeight;
  const rotatedHeight = rotation % 180 === 0 ? sourceHeight : sourceWidth;
  const baseScale = Math.max(frameWidth / rotatedWidth, frameHeight / rotatedHeight);
  const displayWidth = sourceWidth * baseScale;
  const displayHeight = sourceHeight * baseScale;
  const previewImage = useImage(previewUri, () => {
    if (previewUri) setPreviewFailedFor(previewUri);
  });
  const canSave = Boolean(asset && previewImage && !previewFailed);
  const colorMatrix = useMemo(() => adjustmentMatrix(brightness, contrast), [brightness, contrast]);

  const constrain = useCallback((next: Transform): Transform => {
    const scale = baseScale * next.zoom;
    const maxX = Math.max(0, (rotatedWidth * scale - frameWidth) / 2);
    const maxY = Math.max(0, (rotatedHeight * scale - frameHeight) / 2);
    return { x: clamp(next.x, -maxX, maxX), y: clamp(next.y, -maxY, maxY), zoom: clamp(next.zoom, MIN_ZOOM, MAX_ZOOM) };
  }, [baseScale, frameHeight, frameWidth, rotatedHeight, rotatedWidth]);

  const updateTransform = useCallback((next: Transform) => {
    const constrained = constrain(next);
    transformRef.current = constrained;
    setTransform(constrained);
  }, [constrain]);

  // Gesture callbacks execute after render; refs keep their start values stable while React rerenders.
  /* eslint-disable react-hooks/refs */
  const cropGesture = useMemo(() => {
    const pan = Gesture.Pan()
      .maxPointers(1)
      .runOnJS(true)
      .onBegin(() => {
        gestureStart.current = transformRef.current;
      })
      .onUpdate(({ translationX, translationY }) => {
        updateTransform({
          x: gestureStart.current.x + translationX,
          y: gestureStart.current.y + translationY,
          zoom: gestureStart.current.zoom,
        });
      });

    const pinch = Gesture.Pinch()
      .runOnJS(true)
      .onBegin(() => {
        gestureStart.current = transformRef.current;
      })
      .onUpdate(({ scale }) => {
        updateTransform({
          x: gestureStart.current.x,
          y: gestureStart.current.y,
          zoom: gestureStart.current.zoom * scale,
        });
      });

    return Gesture.Simultaneous(pan, pinch);
  }, [updateTransform]);
  /* eslint-enable react-hooks/refs */

  const reset = () => {
    setRotation(0);
    updateTransform({ x: 0, y: 0, zoom: 1 });
    setBrightness(0);
    setContrast(0);
  };

  const rotate = (direction: -1 | 1) => {
    setRotation((current) => (current + direction * 90 + 360) % 360);
    updateTransform({ x: 0, y: 0, zoom: 1 });
  };

  const save = async () => {
    if (!asset || !canSave || saving) return;
    setSaving(true);
    try {
      const scale = baseScale * transform.zoom;
      const cropWidth = Math.min(rotatedWidth, frameWidth / scale);
      const cropHeight = Math.min(rotatedHeight, frameHeight / scale);
      const centerX = rotatedWidth / 2 - transform.x / scale;
      const centerY = rotatedHeight / 2 - transform.y / scale;
      const originX = clamp(centerX - cropWidth / 2, 0, rotatedWidth - cropWidth);
      const originY = clamp(centerY - cropHeight / 2, 0, rotatedHeight - cropHeight);
      const context = ImageManipulator.manipulate(previewUri ?? asset.uri);
      if (rotation) context.rotate(rotation);
      context.crop({ originX, originY, width: cropWidth, height: cropHeight });
      const maxEdge = aspect[0] / aspect[1] > 1.2 ? 1600 : 1000;
      if (cropWidth > maxEdge || cropHeight > maxEdge) {
        context.resize(cropWidth >= cropHeight ? { width: maxEdge } : { height: maxEdge });
      }
      const rendered = await context.renderAsync();
      const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.9 });
      const filteredUri = await bakeColorAdjustments(saved.uri, brightness, contrast);
      registerPendingMedia({
        ...asset,
        uri: filteredUri,
        width: Math.round(cropWidth),
        height: Math.round(cropHeight),
        mimeType: 'image/jpeg',
        fileName: `adjusted-${Date.now()}.jpg`,
      });
      await onSave(filteredUri);
      reset();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={Boolean(asset)} animationType="slide" presentationStyle="fullScreen" onRequestClose={onCancel}>
      <View className="flex-1 bg-black" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <View className="h-16 flex-row items-center justify-between px-4">
          <Pressable accessibilityLabel="Cancel photo adjustment" onPress={onCancel} className="size-11 items-center justify-center rounded-full bg-white/15">
            <X color="#fff" size={22} />
          </Pressable>
          <View className="items-center">
            <Text className="text-base font-bold text-white">{title}</Text>
            <Text className="text-xs text-white/65">Drag to position · pinch to zoom</Text>
          </View>
          <Pressable accessibilityLabel="Save adjusted photo" accessibilityState={{ disabled: !canSave || saving }} disabled={!canSave || saving} onPress={() => { void save(); }} className={`min-h-11 min-w-16 items-center justify-center rounded-full bg-sky-600 px-4 ${canSave ? '' : 'opacity-50'}`}>
            {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text className="font-bold text-white">Save</Text>}
          </Pressable>
        </View>

        <View className="flex-1 items-center justify-center px-4">
          <GestureDetector gesture={cropGesture}>
          <View className="overflow-hidden bg-slate-950" style={{ width: frameWidth, height: frameHeight }}>
            {previewFailed ? (
              <View className="absolute inset-0 items-center justify-center px-8">
                <Text className="text-center text-sm font-semibold text-white">Couldn’t open this photo</Text>
                <Text className="mt-1 text-center text-xs text-white/65">Close and choose another photo, or take a screenshot of it and use that.</Text>
              </View>
            ) : !previewImage ? (
              <View className="absolute inset-0 items-center justify-center">
                <ActivityIndicator color="#fff" />
              </View>
            ) : null}
            {previewImage && !previewFailed ? (
              <Canvas
                style={{
                  position: 'absolute',
                  left: (frameWidth - displayWidth) / 2,
                  top: (frameHeight - displayHeight) / 2,
                  width: displayWidth,
                  height: displayHeight,
                  transform: [
                    { translateX: transform.x },
                    { translateY: transform.y },
                    { rotate: `${rotation}deg` },
                    { scale: transform.zoom },
                  ],
                }}
              >
                <SkiaImage image={previewImage} x={0} y={0} width={displayWidth} height={displayHeight} fit="fill">
                  <ColorMatrix matrix={colorMatrix} />
                </SkiaImage>
              </Canvas>
            ) : null}
            <View pointerEvents="none" className="absolute inset-0 border-2 border-white/90" />
            <View pointerEvents="none" className="absolute left-1/3 top-0 h-full w-px bg-white/25" />
            <View pointerEvents="none" className="absolute left-2/3 top-0 h-full w-px bg-white/25" />
            <View pointerEvents="none" className="absolute left-0 top-1/3 h-px w-full bg-white/25" />
            <View pointerEvents="none" className="absolute left-0 top-2/3 h-px w-full bg-white/25" />
            <View pointerEvents="none" className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1.5">
              <Text className="text-xs font-bold text-white">{Math.round(transform.zoom * 100)}%</Text>
            </View>
          </View>
          </GestureDetector>
        </View>

        <View className="gap-3 px-6 pb-2">
          <AdjustmentSlider label="Brightness" value={brightness} onChange={setBrightness} />
          <AdjustmentSlider label="Contrast" value={contrast} onChange={setContrast} />
        </View>

        <View className="flex-row items-center justify-center gap-3 px-5 py-4">
          <ToolButton label="Rotate left" onPress={() => rotate(-1)} icon={<RotateCcw color="#fff" size={20} />} />
          <ToolButton label="Reset" onPress={reset} text="Reset" />
          <ToolButton label="Rotate right" onPress={() => rotate(1)} icon={<RotateCw color="#fff" size={20} />} />
        </View>
      </View>
    </Modal>
  );
}

function AdjustmentSlider({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <View>
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-xs font-semibold text-white">{label}</Text>
        <Text className="min-w-10 text-right text-xs tabular-nums text-white/70">{value > 0 ? `+${value}` : value}</Text>
      </View>
      <NativeSlider
        accessibilityLabel={label}
        minimumValue={-100}
        maximumValue={100}
        step={1}
        value={value}
        onValueChange={(next) => onChange(Math.round(next))}
        minimumTrackTintColor="#0ea5e9"
        maximumTrackTintColor="rgba(255,255,255,0.24)"
        style={{ width: '100%', height: 32 }}
      />
    </View>
  );
}

function ToolButton({ label, onPress, icon, text }: { label: string; onPress: () => void; icon?: React.ReactNode; text?: string }) {
  return (
    <Pressable accessibilityLabel={label} onPress={onPress} className="min-h-11 min-w-11 items-center justify-center rounded-full bg-white/15 px-3 active:bg-white/25">
      {icon ?? <Text className="text-xs font-bold text-white">{text}</Text>}
    </Pressable>
  );
}
