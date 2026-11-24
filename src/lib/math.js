export const clamp01 = (x) => Math.min(1, Math.max(0, x));
export const lerp = (a, b, u) => a + (b - a) * u;
export const smoothstep01 = (u) => u * u * (3 - 2 * u);
