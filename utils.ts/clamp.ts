import { Range } from "./soft-clamp";

export const clamp = (value: number, [min, max]: Range) => {
  "worklet";
  return Math.max(min, Math.min(value, max));
};
