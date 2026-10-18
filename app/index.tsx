import { BackHandler, StyleSheet, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SystemBars } from "react-native-edge-to-edge";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  withSpring,
  runOnJS,
  useDerivedValue,
} from "react-native-reanimated";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { GestureDetector } from "react-native-gesture-handler";
import { useSwipeGesture } from "@/utils.ts/use-swipe-gesture";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Colors
const backgroundColor = "#FFFFFF";
const primaryColor = "#292929";
const secondaryColor = "#E7E7E7";

// Sizes
const playbackControlSize = 120;

const timelineToolbarHeight = 200;
const sessionCreatorHeight = 90;
const collapsedTimelineHeight = 50;
const collapsedTimelineEntryWidth = 5;
const expandedTimelineEntryWidth = 35;
const timelineEntryLabelHeight = 40;
const timelineIndicatorSize = collapsedTimelineEntryWidth;

// Animation config
const damping = 100;

const sessions = Array.from(new Array(11), (v, index) => ({
  ID: index,
  ratio: index % 2 === 0 ? 1 : index % 5 === 0 ? 0.5 : 0.2,
  completed: index <= 5,
}));

export default function Index() {
  const [screenContainerHeight, setScreenContainerHeight] = useState<number>(0);
  const { push } = useRouter();

  const [isExpanded, setIsExpanded] = useState(false);
  const swipe = useSharedValue(0);

  const screenContainerRef = useRef<View>(null);

  useLayoutEffect(() => {
    screenContainerRef.current?.measure((x, y, width, height) => setScreenContainerHeight(height));
  });

  const animationProgress = useDerivedValue(() => interpolate(swipe.value, [0, -400], [0, 1]));

  const expandGesture = useSwipeGesture({
    enabled: !isExpanded,
    target: -400,
    onChange: ({ translation }) => {
      "worklet";
      swipe.value = interpolate(translation, [0, -400], [0, -400]);
    },
    onFinalize: ({ shouldComplete, velocity }) => {
      "worklet";
      if (shouldComplete) runOnJS(setIsExpanded)(true);
      swipe.value = withSpring(shouldComplete ? -400 : 0, { velocity, damping });
    },
  });

  const collapseGesture = useSwipeGesture({
    enabled: isExpanded,
    target: 400,
    onChange: ({ translation }) => {
      "worklet";
      swipe.value = interpolate(translation, [0, 400], [-400, 0]);
    },
    onFinalize: ({ shouldComplete, velocity }) => {
      "worklet";
      if (shouldComplete) runOnJS(setIsExpanded)(false);
      swipe.value = withSpring(shouldComplete ? 0 : -400, { velocity, damping });
    },
  });

  const handleBackNavigation = useCallback(() => {
    if (!isExpanded) return false;

    setIsExpanded(false);
    swipe.value = withSpring(0, { damping });

    return true;
  }, [isExpanded]);

  const animatedPlaybackControlsStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animationProgress.value, [0, 0.75], [1, 0]),
  }));

  const animatedTimelineContainerStyle = useAnimatedStyle(() => ({
    height: Math.max(0, interpolate(animationProgress.value, [0, 1], [collapsedTimelineHeight, screenContainerHeight])),
  }));

  const animatedTimelineToolbarStyle = useAnimatedStyle(() => ({
    height: Math.max(0, interpolate(animationProgress.value, [0, 1], [0, timelineToolbarHeight])),
  }));

  const animatedSessionCreatorStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animationProgress.value, [0.25, 1], [0, 1]),
    transform: [
      {
        translateY: interpolate(animationProgress.value, [0.25, 1], [-sessionCreatorHeight, 0]),
      },
    ],
  }));

  const animatedTimelineStyle = useAnimatedStyle(() => ({
    gap: interpolate(animationProgress.value, [0, 1], [5, 20]),
  }));

  const animatedTimelineEntryStyle = useAnimatedStyle(() => ({
    width: Math.max(
      0,
      interpolate(animationProgress.value, [0, 1], [collapsedTimelineEntryWidth, expandedTimelineEntryWidth])
    ),
  }));

  const animatedTimelineEntryLabelContainerStyle = useAnimatedStyle(() => ({
    height: interpolate(animationProgress.value, [0, 1], [0, timelineEntryLabelHeight]),
    opacity: interpolate(animationProgress.value, [0.5, 1], [0, 1]),
  }));

  const animatedTimelineIndicatorContainerStyle = useAnimatedStyle(() => ({
    height: Math.max(0, interpolate(animationProgress.value, [0, 1], [timelineIndicatorSize + 8, 0])),
  }));

  const animatedTimelineIndicatorStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animationProgress.value, [0, 0.5], [1, 0]),
    transform: [{ translateY: interpolate(animationProgress.value, [0, 0.5], [0, -timelineIndicatorSize * 4]) }],
  }));

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", handleBackNavigation);
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", handleBackNavigation);
    };
  }, [handleBackNavigation]);

  return (
    <>
      <SystemBars style="dark" />
      <SafeAreaView style={styles.screen}>
        <View ref={screenContainerRef} style={styles.safeArea}>
          <View style={styles.mainContainer}>
            <Animated.View
              style={[styles.playbackControls, animatedPlaybackControlsStyle]}
              onTouchStart={() => push("/test")}
            >
              <MaterialIcons name="play-arrow" size={46} style={{ color: "white" }} />
            </Animated.View>
          </View>

          <Animated.View style={[styles.timelineContainer, animatedTimelineContainerStyle]}>
            <GestureDetector gesture={collapseGesture}>
              <Animated.View style={[styles.timelineToolbar, animatedTimelineToolbarStyle]}>
                <Animated.View style={[styles.sessionCreator, animatedSessionCreatorStyle]}>
                  <MaterialIcons name="add" size={20} style={{ opacity: 0.6 }} />
                </Animated.View>
              </Animated.View>
            </GestureDetector>

            <Animated.View style={[styles.timeline, animatedTimelineStyle]}>
              {sessions.map((session, index) => (
                <Animated.View key={index} style={[styles.timelineEntry, animatedTimelineEntryStyle]}>
                  <View
                    style={[
                      styles.timelineEntryBar,
                      {
                        flex: session.ratio,
                        backgroundColor: session.completed ? primaryColor : secondaryColor,
                      },
                    ]}
                  />
                  <Animated.View style={[styles.timelineEntryLabelContainer, animatedTimelineEntryLabelContainerStyle]}>
                    <Text style={[styles.timelineEntryLabel]}>{Math.round(session.ratio * 60)}</Text>
                  </Animated.View>
                </Animated.View>
              ))}
            </Animated.View>

            <Animated.View style={[styles.timelineIndicatorContainer, animatedTimelineIndicatorContainerStyle]}>
              <Animated.View style={[styles.timelineIndicator, animatedTimelineIndicatorStyle]} />
            </Animated.View>
          </Animated.View>
        </View>
        <GestureDetector gesture={expandGesture}>
          <View style={[styles.timelineExpansionGestureTarget, { height: screenContainerHeight / 2 }]} />
        </GestureDetector>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: backgroundColor,
  },

  safeArea: {
    flex: 1,
    justifyContent: "flex-end",
  },

  mainContainer: {
    flex: 1,
    minHeight: 0,
    justifyContent: "center",
    alignItems: "center",
  },

  playbackControls: {
    width: playbackControlSize,
    height: playbackControlSize,
    borderRadius: playbackControlSize / 2,
    backgroundColor: primaryColor,
    alignItems: "center",
    justifyContent: "center",
  },

  timelineContainer: {
    position: "relative",
    minHeight: 0,
  },

  timelineToolbar: {
    justifyContent: "flex-end",
    alignItems: "center",
  },

  sessionCreator: {
    height: sessionCreatorHeight,
    width: sessionCreatorHeight / 1.5,
    borderRadius: sessionCreatorHeight / 1.5 / 2,
    backgroundColor: secondaryColor,
    marginBottom: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  timeline: {
    flex: 1,
    marginHorizontal: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    gap: 5,
  },

  timelineEntry: {
    justifyContent: "flex-end",
    alignItems: "center",
  },

  timelineEntryBar: {
    width: "100%",
    borderRadius: 100,
  },

  timelineEntryLabelContainer: {
    justifyContent: "flex-start",
  },

  timelineEntryLabel: {
    height: timelineEntryLabelHeight,
    width: expandedTimelineEntryWidth,
    textAlign: "center",
    textAlignVertical: "center",
  },

  timelineIndicatorContainer: {
    alignItems: "center",
    justifyContent: "flex-end",
  },

  timelineIndicator: {
    height: timelineIndicatorSize,
    width: timelineIndicatorSize,
    borderRadius: 5,
    backgroundColor: "red",
  },

  timelineExpansionGestureTarget: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});
