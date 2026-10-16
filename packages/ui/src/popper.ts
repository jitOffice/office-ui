/** 浮层相对锚点矩形的定位。只做「下方优先、放不下翻到上方、水平方向夹进视口」。 */

export interface Box {
  x: number
  y: number
  width: number
  height: number
}

export type PopperPlacement = 'bottom-start' | 'top-start'

export interface PopperPosition {
  x: number
  y: number
  placement: PopperPlacement
}

export interface PlacePopperOptions {
  anchor: Box
  popup: Pick<Box, 'width' | 'height'>
  viewport: Pick<Box, 'width' | 'height'>
  placement?: PopperPlacement
  gap?: number
  padding?: number
}

export function placePopper(options: PlacePopperOptions): PopperPosition {
  const gap = options.gap ?? 4
  const padding = options.padding ?? 8
  const { anchor, popup, viewport } = options
  const preferred = options.placement ?? 'bottom-start'

  let placement: PopperPlacement = preferred
  let y = preferred === 'bottom-start' ? anchor.y + anchor.height + gap : anchor.y - gap - popup.height
  const bottom = anchor.y + anchor.height + gap
  const top = anchor.y - gap - popup.height
  const bottomOverflows = bottom + popup.height > viewport.height - padding
  const topOverflows = top < padding

  if (preferred === 'bottom-start' && bottomOverflows && !topOverflows) {
    placement = 'top-start'
    y = top
  } else if (preferred === 'top-start' && topOverflows && !bottomOverflows) {
    placement = 'bottom-start'
    y = bottom
  }

  const maxX = Math.max(padding, viewport.width - padding - popup.width)
  const maxY = Math.max(padding, viewport.height - padding - popup.height)
  const x = Math.min(Math.max(anchor.x, padding), maxX)
  y = Math.min(Math.max(y, padding), maxY)

  return { x, y, placement }
}
