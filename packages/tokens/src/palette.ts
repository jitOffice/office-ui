/**
 * 色板生成。确定性算法：同一份 seed 永远产出同一组十六进制值。
 *
 * 关键约定（prd/01-design-tokens.md §2）：
 * - 档位 1–10 的亮度是**绝对亮度刻度**，不是相对品牌的偏移量。因此每个色族的
 *   "主题色"落在哪一档取决于它自身的明度：brand → 6、warning → 6、danger → 4、
 *   success → 8。消费方不要猜档位，用别名 `--oj-color-success`。
 * - 算法负责生成完整梯度，实测值负责钉住被真实 UI 使用的档，冲突时实测值赢。
 */

import { hslToHex, hexToHsl } from './color.ts'
import { LIGHTNESS_STOPS, PINS, RAMP_STEPS, seed, CHART_COLORS } from './seed.ts'

export type FamilyName = 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'link'

/** step 1..10 → hex。索引 0 保留，便于按档位直接取值。 */
export type Ramp = string[]

function buildRamp(h: number, s: number, stops: readonly number[]): Ramp {
  const out: Ramp = ['']
  for (const l of stops) out.push(hslToHex({ h, s, l }))
  return out
}

function applyPins(ramp: Ramp, pins: Record<number, string> | undefined): Ramp {
  if (!pins) return ramp
  const next = ramp.slice()
  for (const [step, hex] of Object.entries(pins)) next[Number(step)] = hex
  return next
}

/** 距给定明度最近的档位，即该色族实测主题色所在的档。 */
export function anchorStep(lightness: number, stops: readonly number[]): number {
  let best = 1
  let bestGap = Infinity
  stops.forEach((l, i) => {
    const gap = Math.abs(l - lightness)
    if (gap < bestGap) {
      bestGap = gap
      best = i + 1
    }
  })
  return best
}

/** 暗色模式：亮色 n 档对应暗色 11 − n 档（Arco 的索引镜像机制）。 */
export function mirrorRamp(ramp: Ramp): Ramp {
  const out: Ramp = ['']
  for (let step = 1; step <= 10; step++) out.push(ramp[11 - step] as string)
  return out
}

function familyFromHex(hex: string, pins?: Record<number, string>): { ramp: Ramp; anchor: number } {
  const { h, s } = hexToHsl(hex)
  const anchor = anchorStep(hexToHsl(hex).l, LIGHTNESS_STOPS)
  const all: Record<number, string> = { [anchor]: hex, ...(pins ?? {}) }
  return { ramp: applyPins(buildRamp(h, s, LIGHTNESS_STOPS), all), anchor }
}

export const GRAY_STOPS: readonly number[] = [96, 90, 85, 78, 68, 55, 42, 30, 19, 8.24]

/** 语义色族的锚点 hex。info/link 复用品牌色，与两站实测一致。 */
const FAMILY_SEED: Record<FamilyName, string> = {
  brand: '#165DFF',
  success: seed.success,
  warning: seed.warning,
  danger: seed.danger,
  info: '#165DFF',
  link: '#165DFF',
}

export interface Palette {
  families: Record<FamilyName, Ramp>
  /** 每个色族实测主题色所在档位 */
  anchors: Record<FamilyName, number>
  gray: Ramp
  chart: readonly string[]
}

export function buildLightPalette(): Palette {
  const families = {} as Record<FamilyName, Ramp>
  const anchors = {} as Record<FamilyName, number>

  for (const name of Object.keys(FAMILY_SEED) as FamilyName[]) {
    const built = familyFromHex(FAMILY_SEED[name], PINS[name])
    families[name] = built.ramp
    anchors[name] = built.anchor
  }

  return {
    families,
    anchors,
    gray: applyPins(buildRamp(0, 0, GRAY_STOPS), { 10: seed.ink }),
    chart: CHART_COLORS,
  }
}

export function buildDarkPalette(light: Palette): Palette {
  const families = {} as Record<FamilyName, Ramp>
  for (const name of Object.keys(light.families) as FamilyName[]) {
    families[name] = mirrorRamp(light.families[name])
  }
  // 品牌主档在暗底上需要额外提亮，镜像后的 6 档（= 亮色 5 档）对比度不足。
  families.brand = families.brand.slice()
  families.brand[6] = '#4080FF'
  return { families, anchors: light.anchors, gray: mirrorRamp(light.gray), chart: light.chart }
}

export const RAMP_STEP_LIST = RAMP_STEPS
