/** 画布缩放。步进 10，夹在 50% 与 200% 之间。 */

export const ZOOM_MIN = 50
export const ZOOM_MAX = 200
export const ZOOM_STEP = 10

export function clampZoom(value: number): number {
  if (!Number.isFinite(value)) return 100
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(value)))
}

export function stepZoom(value: number, direction: 1 | -1): number {
  return clampZoom(clampZoom(value) + direction * ZOOM_STEP)
}
