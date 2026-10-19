/** 标尺刻度。1cm 按 96dpi 换算，再乘当前缩放。 */

const PX_PER_CM = 96 / 2.54

export interface RulerTick {
  offset: number
  label: string
}

export function rulerTicks(lengthPx: number, zoomPercent: number): RulerTick[] {
  if (lengthPx <= 0 || zoomPercent <= 0) return []
  const step = PX_PER_CM * (zoomPercent / 100)
  const ticks: RulerTick[] = []
  const count = Math.floor(lengthPx / step)
  for (let index = 0; index <= count; index += 1) {
    ticks.push({ offset: Math.round(index * step), label: String(index) })
  }
  return ticks
}

/** A4 短边在 96dpi 下的像素宽度，供纸张容器使用。 */
export const A4_WIDTH_PX = 794

export function pageWidth(zoomPercent: number): number {
  return Math.round(A4_WIDTH_PX * (zoomPercent / 100))
}
