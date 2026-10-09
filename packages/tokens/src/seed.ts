/**
 * Seed 层：唯一允许手写的原始值。
 *
 * 规则（prd/01-design-tokens.md §1）：Seed 只被 Alias 引用，组件 CSS 不得直接使用；
 * Seed 不参与暗色重映射，暗色只重写 Alias + 色板。
 */

export const seed = {
  /** 品牌主色 #165DFF = hsl(222, 100%, 54.5%)，实测自 jitword.com 与 know.jitword.com */
  brandHue: 222,
  brandSat: 100,
  brandLight: 54,

  /** 中性最深处。刻意纯灰，蓝调交给 brand-tint 类 token */
  ink: '#151515',

  /** 状态色：沿用两站实测的 Tailwind 系状态色 */
  success: '#10B981',
  warning: '#F97316',
  danger: '#FF6B6B',

  radiusBase: 4,
  spaceBase: 4,
  fontSizeBase: 12,

  durationBase: 100,
  easeOut: 'cubic-bezier(0.34, 0.69, 0.10, 1.00)',
  easeStd: 'cubic-bezier(0.40, 0.00, 0.20, 1.00)',
} as const

/**
 * 色板亮度档位。第 6 档 = 品牌档，与 Arco 的 1–10（6 为品牌）刻度一致，
 * 便于用户从 Arco 迁移。暗色模式用索引镜像 n → 11 − n。
 */
export const LIGHTNESS_STOPS: readonly number[] = [
  95, 90, 82, 72, 63, 54, 45, 37, 30, 22,
]

export const RAMP_STEPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const

/**
 * 实测值钉住的档位。算法负责生成完整梯度，实测值负责钉住被真实 UI 使用的档，
 * 冲突时实测值赢（prd/01-design-tokens.md §2）。
 */
export const PINS: Record<string, Record<number, string>> = {
  brand: { 6: '#165DFF', 1: '#F0F5FF' },
}

/** 图表 8 色，全部取自两站实测出现的强调色，保证与产品同色系。 */
export const CHART_COLORS: readonly string[] = [
  '#165DFF',
  '#10B981',
  '#F97316',
  '#7C3AED',
  '#0891B2',
  '#DB2777',
  '#FACC15',
  '#4F46E5',
]
