/**
 * @jitoffice/tokens — 由 packages/tokens/scripts/generate.ts 生成，请勿手改。
源：packages/tokens/src/tokens.ts（唯一手写来源）。
 */

export type OjTheme = 'light' | 'dark'
export type OjDensity = 'comfortable' | 'compact'
export type OjLang = 'zh' | 'zh-TW' | 'ja'

export interface OjTokenOptions {
  theme?: OjTheme
  density?: OjDensity
  lang?: OjLang
}

/** 用 type 别名而非 interface：别名才有隐式索引签名，Object.entries(tokens) 与扁平化工具才不用重新断言。 */
export type OjTokens = {
  brand: {
    /** --oj-brand-1 */
    1: string
    /** --oj-brand-2 */
    2: string
    /** --oj-brand-3 */
    3: string
    /** --oj-brand-4 */
    4: string
    /** --oj-brand-5 */
    5: string
    /** --oj-brand-6 */
    6: string
    /** --oj-brand-7 */
    7: string
    /** --oj-brand-8 */
    8: string
    /** --oj-brand-9 */
    9: string
    /** --oj-brand-10 */
    10: string
  }
  success: {
    /** --oj-success-1 */
    1: string
    /** --oj-success-2 */
    2: string
    /** --oj-success-3 */
    3: string
    /** --oj-success-4 */
    4: string
    /** --oj-success-5 */
    5: string
    /** --oj-success-6 */
    6: string
    /** --oj-success-7 */
    7: string
    /** --oj-success-8 */
    8: string
    /** --oj-success-9 */
    9: string
    /** --oj-success-10 */
    10: string
  }
  warning: {
    /** --oj-warning-1 */
    1: string
    /** --oj-warning-2 */
    2: string
    /** --oj-warning-3 */
    3: string
    /** --oj-warning-4 */
    4: string
    /** --oj-warning-5 */
    5: string
    /** --oj-warning-6 */
    6: string
    /** --oj-warning-7 */
    7: string
    /** --oj-warning-8 */
    8: string
    /** --oj-warning-9 */
    9: string
    /** --oj-warning-10 */
    10: string
  }
  danger: {
    /** --oj-danger-1 */
    1: string
    /** --oj-danger-2 */
    2: string
    /** --oj-danger-3 */
    3: string
    /** --oj-danger-4 */
    4: string
    /** --oj-danger-5 */
    5: string
    /** --oj-danger-6 */
    6: string
    /** --oj-danger-7 */
    7: string
    /** --oj-danger-8 */
    8: string
    /** --oj-danger-9 */
    9: string
    /** --oj-danger-10 */
    10: string
  }
  gray: {
    /** --oj-gray-1 */
    1: string
    /** --oj-gray-2 */
    2: string
    /** --oj-gray-3 */
    3: string
    /** --oj-gray-4 */
    4: string
    /** --oj-gray-5 */
    5: string
    /** --oj-gray-6 */
    6: string
    /** --oj-gray-7 */
    7: string
    /** --oj-gray-8 */
    8: string
    /** --oj-gray-9 */
    9: string
    /** --oj-gray-10 */
    10: string
  }
  chart: {
    /** --oj-chart-1 */
    1: string
    /** --oj-chart-2 */
    2: string
    /** --oj-chart-3 */
    3: string
    /** --oj-chart-4 */
    4: string
    /** --oj-chart-5 */
    5: string
    /** --oj-chart-6 */
    6: string
    /** --oj-chart-7 */
    7: string
    /** --oj-chart-8 */
    8: string
  }
  color: {
    /** --oj-color-brand */
    brand: string
    /** --oj-color-success */
    success: string
    /** --oj-color-warning */
    warning: string
    /** --oj-color-danger */
    danger: string
    /** --oj-color-info */
    info: string
  }
  text: {
    /** --oj-text-1 · 标题/正文 */
    1: string
    /** --oj-text-2 */
    2: string
    /** --oj-text-3 · 实测次文本 */
    3: string
    /** --oj-text-4 · 占位符。实测 #9A9CA6 对白底仅 2.73:1，连 3:1 底线都不过，已加深 */
    4: string
    /** --oj-text-5 · 禁用态：WCAG 1.4.3 豁免 inactive controls，不设数值门槛，但受灰阶次序断言约束 */
    5: string
    /** --oj-text-inverse */
    inverse: string
    /** --oj-text-brand */
    brand: string
    /** --oj-text-link */
    link: string
    /** --oj-text-success · success-9 对白底仅 4.20:1，正文级必须用第 10 档 */
    success: string
    /** --oj-text-warning */
    warning: string
    /** --oj-text-danger · 实测 #FF6B6B 对白底 2.78:1，正文级危险文字必须用深色档；暗色镜像只适用于 var() 引用，字面色须两主题各给一个 */
    danger: string
  }
  bg: {
    /** --oj-bg-page · 应用底，毛玻璃需要底下有内容可透 */
    page: string
    /** --oj-bg-container */
    container: string
    /** --oj-bg-elevated */
    elevated: string
    /** --oj-bg-glass */
    glass: string
    /** --oj-bg-glass-soft */
    glassSoft: string
    /** --oj-bg-mask */
    mask: string
    /** --oj-bg-hover */
    hover: string
    /** --oj-bg-active · 实测描边色复用为选中底 */
    active: string
    /** --oj-bg-brand */
    brand: string
    /** --oj-bg-brand-subtle */
    brandSubtle: string
    /** --oj-bg-success-subtle */
    successSubtle: string
    /** --oj-bg-warning-subtle */
    warningSubtle: string
    /** --oj-bg-danger-subtle */
    dangerSubtle: string
  }
  border: {
    /** --oj-border-1 · 主边框，带蓝调（实测） */
    1: string
    /** --oj-border-2 */
    2: string
    /** --oj-border-3 · 强边框/输入框 */
    3: string
    /** --oj-border-grid · canvas 网格线 */
    grid: string
    /** --oj-border-brand */
    brand: string
  }
  focus: {
    /** --oj-focus-ring */
    ring: string
  }
  shadow: {
    /** --oj-shadow-1 */
    1: string
    /** --oj-shadow-2 */
    2: string
    /** --oj-shadow-3 */
    3: string
  }
  glass: {
    /** --oj-glass-blur */
    blur: string
    /** --oj-glass-blur-soft */
    blurSoft: string
    /** --oj-glass-highlight */
    highlight: string
  }
  radius: {
    /** --oj-radius-xs · 标签 */
    xs: string
    /** --oj-radius-sm · 按钮 */
    sm: string
    /** --oj-radius-md */
    md: string
    /** --oj-radius-lg · 内层卡片 */
    lg: string
    /** --oj-radius-xl · 外层卡片（实测） */
    xl: string
    /** --oj-radius-full */
    full: string
  }
  space: {
    /** --oj-space-1 */
    1: string
    /** --oj-space-2 */
    2: string
    /** --oj-space-3 */
    3: string
    /** --oj-space-4 */
    4: string
    /** --oj-space-5 */
    5: string
    /** --oj-space-6 */
    6: string
    /** --oj-space-8 */
    8: string
    /** --oj-space-10 */
    10: string
  }
  font: {
    /** --oj-font-sans */
    sans: string
    /** --oj-font-mono */
    mono: string
    /** --oj-font-mono-cjk */
    monoCjk: string
    /** --oj-font-doc · 文档正文排版，Office 场景必须有衬线选项 */
    doc: string
  }
  fs: {
    /** --oj-fs-12 */
    12: string
    /** --oj-fs-13 · Ribbon 实际工作字号，不可省略 */
    13: string
    /** --oj-fs-14 */
    14: string
    /** --oj-fs-16 */
    16: string
    /** --oj-fs-18 */
    18: string
    /** --oj-fs-20 */
    20: string
    /** --oj-fs-24 */
    24: string
    /** --oj-fs-32 */
    32: string
  }
  lh: {
    /** --oj-lh-tight */
    tight: string
    /** --oj-lh-normal · 日文用 JIS 惯例值 */
    normal: string
    /** --oj-lh-loose */
    loose: string
  }
  letter: {
    /** --oj-letter-spacing */
    spacing: string
  }
  motion: {
    duration: {
      /** --oj-motion-duration-fast */
      fast: string
      /** --oj-motion-duration-base */
      base: string
      /** --oj-motion-duration-slow */
      slow: string
    }
    ease: {
      /** --oj-motion-ease-out */
      out: string
      /** --oj-motion-ease-std */
      std: string
    }
  }
  control: {
    height: {
      /** --oj-control-height-xs */
      xs: string
      /** --oj-control-height-sm */
      sm: string
      /** --oj-control-height-md */
      md: string
      /** --oj-control-height-lg */
      lg: string
    }
  }
  ribbon: {
    /** --oj-ribbon-height */
    height: string
  }
  z: {
    /** --oj-z-canvas */
    canvas: string
    /** --oj-z-sticky · 表格冻结行列、行号列 */
    sticky: string
    /** --oj-z-ribbon */
    ribbon: string
    /** --oj-z-drawer */
    drawer: string
    /** --oj-z-dropdown */
    dropdown: string
    /** --oj-z-modal */
    modal: string
    /** --oj-z-popover */
    popover: string
    /** --oj-z-toast */
    toast: string
    /** --oj-z-max · 全屏演示/放映模式 */
    max: string
  }
  button: {
    /** --oj-button-height */
    height: string
    padding: {
      /** --oj-button-padding-x */
      x: string
    }
    /** --oj-button-radius */
    radius: string
    /** --oj-button-bg */
    bg: string
    /** --oj-button-color */
    color: string
    /** --oj-button-border */
    border: string
    /** --oj-button-gap */
    gap: string
    icon: {
      /** --oj-button-icon-size · 图标按钮，与 Ribbon 字号同级 */
      size: string
    }
  }
  grid: {
    picker: {
      /** --oj-grid-picker-cell · 表格选择器单格边长 */
      cell: string
      /** --oj-grid-picker-gap */
      gap: string
      /** --oj-grid-picker-cell-bg */
      cellBg: string
      /** --oj-grid-picker-cell-active-bg */
      cellActiveBg: string
      /** --oj-grid-picker-label-color */
      labelColor: string
      /** --oj-grid-picker-max-cols · 单位无关，canvas 与 CSS 共用 */
      maxCols: string
      /** --oj-grid-picker-max-rows */
      maxRows: string
    }
  }
}

export declare function createTokens(options?: OjTokenOptions): OjTokens
export declare const tokens: OjTokens
export declare const tokenNames: string[]
