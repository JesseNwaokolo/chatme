import { StyledText } from "@/src/shared/components/StyledText";
import { ChevronLeftIcon } from "@/src/shared/icons";
import { Image } from "expo-image";
import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface ViewerImage {
  key: string;
  url: string;
  title: string;
  subtitle: string;
}

interface ImageViewerModalProps {
  images: ViewerImage[];
  startIndex: number | null;
  onClose: () => void;
}

const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;

interface ZoomableImageProps {
  url: string;
  width: number;
  height: number;
  active: boolean;
  onZoomChange: (zoomed: boolean) => void;
  onTap: () => void;
}

const ZoomableImage = ({ url, width, height, active, onZoomChange, onTap }: ZoomableImageProps) => {
  const [zoomed, setZoomed] = useState(false);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  const updateZoomed = useCallback(
    (value: boolean) => {
      setZoomed(value);
      onZoomChange(value);
    },
    [onZoomChange],
  );

  const reset = useCallback(() => {
    "worklet";
    scale.value = withTiming(1);
    savedScale.value = 1;
    x.value = withTiming(0);
    y.value = withTiming(0);
    savedX.value = 0;
    savedY.value = 0;
  }, [scale, savedScale, x, y, savedX, savedY]);

  useEffect(() => {
    if (active) return;
    scale.value = 1;
    savedScale.value = 1;
    x.value = 0;
    y.value = 0;
    savedX.value = 0;
    savedY.value = 0;
    setZoomed(false);
  }, [active, scale, savedScale, x, y, savedX, savedY]);

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.min(Math.max(savedScale.value * e.scale, 1), MAX_SCALE);
    })
    .onEnd(() => {
      if (scale.value < 1.05) {
        reset();
        runOnJS(updateZoomed)(false);
      } else {
        savedScale.value = scale.value;
        runOnJS(updateZoomed)(true);
      }
    });

  const pan = Gesture.Pan()
    .enabled(zoomed)
    .onUpdate((e) => {
      const maxX = (width * (scale.value - 1)) / 2;
      const maxY = (height * (scale.value - 1)) / 2;
      x.value = Math.min(Math.max(savedX.value + e.translationX, -maxX), maxX);
      y.value = Math.min(Math.max(savedY.value + e.translationY, -maxY), maxY);
    })
    .onEnd(() => {
      savedX.value = x.value;
      savedY.value = y.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        reset();
        runOnJS(updateZoomed)(false);
      } else {
        scale.value = withTiming(DOUBLE_TAP_SCALE);
        savedScale.value = DOUBLE_TAP_SCALE;
        runOnJS(updateZoomed)(true);
      }
    });

  const singleTap = Gesture.Tap()
    .requireExternalGestureToFail(doubleTap)
    .onEnd(() => runOnJS(onTap)());

  const composed = Gesture.Simultaneous(pinch, pan, Gesture.Exclusive(doubleTap, singleTap));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }, { scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[{ width, height }, animatedStyle]}>
        <Image source={{ uri: url }} style={{ width, height }} contentFit="contain" />
      </Animated.View>
    </GestureDetector>
  );
};

export const ImageViewerModal = ({ images, startIndex, onClose }: ImageViewerModalProps) => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<ViewerImage>>(null);
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(true);

  const visible = startIndex !== null && images.length > 0;

  useEffect(() => {
    if (startIndex === null) return;
    setIndex(startIndex);
    setZoomed(false);
    setChromeVisible(true);
  }, [startIndex]);

  const current = images[Math.min(index, images.length - 1)];

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.root}>
        {visible && (
          <FlatList
            ref={listRef}
            data={images}
            horizontal
            pagingEnabled
            scrollEnabled={!zoomed}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.key}
            initialScrollIndex={startIndex ?? 0}
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            onMomentumScrollEnd={(e) =>
              setIndex(Math.round(e.nativeEvent.contentOffset.x / width))
            }
            renderItem={({ item, index: i }) => (
              <View style={{ width, height, alignItems: "center", justifyContent: "center" }}>
                <ZoomableImage
                  url={item.url}
                  width={width}
                  height={height}
                  active={i === index}
                  onZoomChange={setZoomed}
                  onTap={() => setChromeVisible((v) => !v)}
                />
              </View>
            )}
          />
        )}

        {chromeVisible && current && (
          <View style={[styles.header, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
            <Pressable onPress={onClose} hitSlop={16}>
              <ChevronLeftIcon size={26} color="#FFFFFF" />
            </Pressable>
            <View style={styles.headerText}>
              <StyledText weight="bold" numberOfLines={1} style={styles.white}>
                {current.title}
              </StyledText>
              <StyledText size={12} numberOfLines={1} style={styles.white}>
                {current.subtitle}
              </StyledText>
            </View>
            {images.length > 1 && (
              <StyledText size={13} style={styles.white}>
                {index + 1} / {images.length}
              </StyledText>
            )}
          </View>
        )}
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000000F2",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#00000080",
  },
  headerText: {
    flex: 1,
  },
  white: {
    color: "#FFFFFF",
  },
});
