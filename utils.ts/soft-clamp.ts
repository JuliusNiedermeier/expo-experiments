export type Range = [number, number];

export const normalizeRange = (range: Range): Range => {
  "worklet";
  return [Math.min(...range), Math.max(...range)];
};

export const getOverflow = (value: number, [min, max]: Range) => {
  "worklet";
  if (value >= min && value <= max) return 0;
  else return value < min ? value - min : value - max;
};

export const getSoftClampFactor = (overflow: number, overflowLimit: number) => {
  "worklet";
  const normalizedOverflow = Math.abs(overflow);
  return Math.exp(-normalizedOverflow / overflowLimit);
};

export const softClamp = (value: number, [min, max]: Range, overflowLimit: number) => {
  "worklet";
  const overflow = getOverflow(value, [min, max]);
  if (overflow === 0) return value;
  const softClampFactor = getSoftClampFactor(overflow, overflowLimit);
  const clampedOverflowLimit = overflowLimit * (1 - softClampFactor);
  return value > max ? max + clampedOverflowLimit : min - clampedOverflowLimit;
};
