/**
 * 颜色数学。零依赖，可完全复算。
 *
 * 之所以自研而不引 chroma-js / culori：本包只需要 HSL 阶梯生成、
 * 相对亮度与对比度三件事，加起来不到 100 行，而 `@jitoffice/tokens`
 * 的 `dependencies` 必须为空（ADR-0004）。
 */

export interface Hsl {
  h: number
  s: number
  l: number
}

const clamp = (n: number, min: number, max: number): number =>
  n < min ? min : n > max ? max : n

const round255 = (n: number): number => Math.round(clamp(n, 0, 1) * 255)

export function hslToHex({ h, s, l }: Hsl): string {
  const sat = clamp(s, 0, 100) / 100
  const lig = clamp(l, 0, 100) / 100
  const c = (1 - Math.abs(2 * lig - 1)) * sat
  const hp = (((h % 360) + 360) % 360) / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))
  const m = lig - c / 2

  let r = 0
  let g = 0
  let b = 0
  if (hp >= 0 && hp < 1) [r, g, b] = [c, x, 0]
  else if (hp < 2) [r, g, b] = [x, c, 0]
  else if (hp < 3) [r, g, b] = [0, c, x]
  else if (hp < 4) [r, g, b] = [0, x, c]
  else if (hp < 5) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]

  return toHex([round255(r + m), round255(g + m), round255(b + m)])
}

export function toHex(rgb: readonly [number, number, number]): string {
  return (
    '#' +
    rgb.map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase()
  )
}

export function parseHex(hex: string): [number, number, number] {
  const raw = hex.replace('#', '')
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    throw new Error(`Invalid hex color: ${hex}`)
  }
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ]
}

export function hexToHsl(hex: string): Hsl {
  const [r8, g8, b8] = parseHex(hex)
  const r = r8 / 255
  const g = g8 / 255
  const b = b8 / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min

  if (d === 0) return { h: 0, s: 0, l: l * 100 }

  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h: number
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60
  else if (max === g) h = ((b - r) / d + 2) * 60
  else h = ((r - g) / d + 4) * 60

  return { h, s: s * 100, l: l * 100 }
}

/** WCAG 2.1 相对亮度。 */
export function relativeLuminance(hex: string): number {
  const channel = (v8: number): number => {
    const v = v8 / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  const [r, g, b] = parseHex(hex).map(channel) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG 对比度，1:1 到 21:1。 */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

export function formatRatio(ratio: number): string {
  return `${ratio.toFixed(2)}:1`
}

/**
 * 与白色（或指定色）混合以降低饱和度，用于生成中性灰阶。
 * 本库中性色刻意保持纯灰（不加蓝调），蓝调交给 brand-tint 类 token，
 * 见 prd/01-design-tokens.md §3。
 */
export function mix(hexA: string, hexB: string, weight: number): string {
  const a = parseHex(hexA)
  const b = parseHex(hexB)
  const w = clamp(weight, 0, 1)
  return toHex([
    round255((a[0] * (1 - w) + b[0] * w) / 255),
    round255((a[1] * (1 - w) + b[1] * w) / 255),
    round255((a[2] * (1 - w) + b[2] * w) / 255),
  ])
}
