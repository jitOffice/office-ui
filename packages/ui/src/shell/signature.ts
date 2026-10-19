/** 签名笔迹。组件只负责把指针坐标追加进来，路径在这里生成。 */

export interface SignaturePoint {
  x: number
  y: number
}

export interface SignatureStroke {
  points: SignaturePoint[]
}

export function startStroke(strokes: readonly SignatureStroke[], point: SignaturePoint): SignatureStroke[] {
  return [...strokes, { points: [point] }]
}

export function extendStroke(strokes: readonly SignatureStroke[], point: SignaturePoint): SignatureStroke[] {
  const last = strokes[strokes.length - 1]
  if (!last) return startStroke(strokes, point)
  return [...strokes.slice(0, -1), { points: [...last.points, point] }]
}

export function strokePath(stroke: SignatureStroke): string {
  const first = stroke.points[0]
  if (!first) return ''
  const rest = stroke.points.slice(1).map((point) => `L ${point.x} ${point.y}`)
  return [`M ${first.x} ${first.y}`, ...rest].join(' ')
}
