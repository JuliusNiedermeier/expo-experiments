import { Gesture } from "react-native-gesture-handler";
import { getOverflow, getSoftClampFactor, normalizeRange, softClamp } from "./soft-clamp";

type OnChangeEventData = { translation: number };
type OnFinalizeEventData = { shouldComplete: boolean; velocity: number };

export interface UseSwipeGestureConfig {
  target: number;
  onChange: (event: OnChangeEventData) => void;
  onFinalize: (event: OnFinalizeEventData) => void;
  enabled?: boolean;
  threshold?: number;
  sensitivity?: number;
  overflowLimit?: number;
  maxVelocity?: number;
}

export const useSwipeGesture = (config: UseSwipeGestureConfig) => {
  const {
    target,
    onChange,
    onFinalize,
    enabled = true,
    threshold = target / 3,
    sensitivity = 0.07,
    overflowLimit = 40,
    maxVelocity = 4000,
  } = config;

  return Gesture.Pan()
    .enabled(enabled)
    .onChange(({ translationY }) => {
      onChange({ translation: softClamp(translationY, normalizeRange([0, target]), overflowLimit) });
    })
    .onFinalize(({ translationY, velocityY }) => {
      const translationYOverflow = getOverflow(translationY, normalizeRange([0, target]));
      const softClampFactor = getSoftClampFactor(translationYOverflow, overflowLimit);
      const clampedVelocity = Math.max(-maxVelocity, Math.min(velocityY * softClampFactor, maxVelocity));

      const velocityAdjustedTranslationY = translationY + sensitivity * clampedVelocity;

      const shouldComplete =
        threshold < 0 ? velocityAdjustedTranslationY < threshold : velocityAdjustedTranslationY > threshold;

      onFinalize({ shouldComplete, velocity: clampedVelocity });
    });
};
