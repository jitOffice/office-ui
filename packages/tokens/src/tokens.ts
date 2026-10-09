/**
 * 唯一 token 注册表。CSS 产物与 JS 产物都由这张表发射，因此天然同源。
 *
 * `light` 等字段里的 `var(--oj-*)` 在 CSS 中原样保留（浏览器惰性解析），
 * 在 JS 侧由 resolver 在**合并后的主题表**上展开成字面值 —— 这一步不能省，
 * 否则 `--oj-text-brand: var(--oj-brand-6)` 在暗色下会解析成亮色的品牌色。
 */

import { buildDarkPalette, buildLightPalette, type Ramp } from './palette.ts'

export type Tier = 'seed' | 'alias' | 'component'
export type ThemeName = 'light' | 'dark'
export type DensityName = 'comfortable' | 'compact'
/** `zh` 是基底；`en` 与基底同值，故不单列覆写。 */
export type LangName = 'zh' | 'zh-TW' | 'ja'

export interface Entry {
  /** 点分路径：`brand.6` → CSS `--oj-brand-6` / JS `tokens.brand['6']` */
  path: string
  tier: Tier
  group: string
  light: string
  dark?: string
  compact?: string
  zhTw?: string
  ja?: string
  note?: string
}

export const CSS_PREFIX = '--oj-'

const p = buildLightPalette()
const d = buildDarkPalette(p)

function rampEntries(name: string, light: Ramp, darkRamp: Ramp, group: string): Entry[] {
  const out: Entry[] = []
  for (let step = 1; step <= 10; step++) {
    out.push({
      path: `${name}.${step}`,
      tier: 'seed',
      group,
      light: light[step] as string,
      dark: darkRamp[step] as string,
    })
  }
  return out
}

function chartEntries(): Entry[] {
  return p.chart.map((hex, i) => ({
    path: `chart.${i + 1}`,
    tier: 'seed' as const,
    group: 'color',
    light: hex,
    dark: hex,
  }))
}

export const entries: Entry[] = [
  ...rampEntries('brand', p.families.brand, d.families.brand, 'color'),
  ...rampEntries('success', p.families.success, d.families.success, 'color'),
  ...rampEntries('warning', p.families.warning, d.families.warning, 'color'),
  ...rampEntries('danger', p.families.danger, d.families.danger, 'color'),
  ...rampEntries('gray', p.gray, d.gray, 'color'),
  ...chartEntries(),

  // 色族主题色别名。档位随色族自身明度浮动，消费方只应引用这组别名。
  { path: 'color.brand', tier: 'alias', group: 'color', light: 'var(--oj-brand-6)' },
  { path: 'color.success', tier: 'alias', group: 'color', light: 'var(--oj-success-8)' },
  { path: 'color.warning', tier: 'alias', group: 'color', light: 'var(--oj-warning-6)' },
  { path: 'color.danger', tier: 'alias', group: 'color', light: 'var(--oj-danger-4)' },
  { path: 'color.info', tier: 'alias', group: 'color', light: 'var(--oj-brand-6)' },

  // ---------------------------------------------------------------- 文本
  { path: 'text.1', tier: 'alias', group: 'text', light: '#151515', dark: '#F2F3F5', note: '标题/正文' },
  { path: 'text.2', tier: 'alias', group: 'text', light: '#3D3D45', dark: '#D4D6DE' },
  { path: 'text.3', tier: 'alias', group: 'text', light: '#6C6F7D', dark: '#A0A3B0', note: '实测次文本' },
  { path: 'text.4', tier: 'alias', group: 'text', light: '#8A8C96', dark: '#7A7D8B', note: '占位符。实测 #9A9CA6 对白底仅 2.73:1，连 3:1 底线都不过，已加深' },
  { path: 'text.5', tier: 'alias', group: 'text', light: '#C9CAD1', dark: '#55585F', note: '禁用态：WCAG 1.4.3 豁免 inactive controls，不设数值门槛，但受灰阶次序断言约束' },
  { path: 'text.inverse', tier: 'alias', group: 'text', light: '#FFFFFF', dark: '#151515' },
  { path: 'text.brand', tier: 'alias', group: 'text', light: 'var(--oj-brand-6)', dark: 'var(--oj-brand-6)' },
  { path: 'text.link', tier: 'alias', group: 'text', light: 'var(--oj-brand-6)', dark: 'var(--oj-brand-6)' },
  { path: 'text.success', tier: 'alias', group: 'text', light: 'var(--oj-success-10)', note: 'success-9 对白底仅 4.20:1，正文级必须用第 10 档' },
  { path: 'text.warning', tier: 'alias', group: 'text', light: 'var(--oj-warning-8)' },
  {
    path: 'text.danger',
    tier: 'alias',
    group: 'text',
    light: '#D93A3A',
    // 亮色用的就是字面色，不能靠档位镜像自动得到：danger 族的种子 #FF6B6B 是 100% 饱和，
    // 算法推到高档位只会得到 #E60000 这种刺眼的纯红。暗色同理必须手调，
    // 直接沿用亮色值在暗底上只有 3.90:1，正文级不过 AA。
    dark: '#EA9090',
    note: '实测 #FF6B6B 对白底 2.78:1，正文级危险文字必须用深色档；暗色镜像只适用于 var() 引用，字面色须两主题各给一个',
  },

  // ---------------------------------------------------------------- 背景
  { path: 'bg.page', tier: 'alias', group: 'bg', light: '#F7F8FC', dark: '#101114', note: '应用底，毛玻璃需要底下有内容可透' },
  { path: 'bg.container', tier: 'alias', group: 'bg', light: '#FFFFFF', dark: '#17181C' },
  { path: 'bg.elevated', tier: 'alias', group: 'bg', light: '#FFFFFF', dark: '#1F2027' },
  { path: 'bg.glass', tier: 'alias', group: 'bg', light: 'rgba(255, 255, 255, 0.92)', dark: 'rgba(23, 24, 28, 0.88)' },
  { path: 'bg.glassSoft', tier: 'alias', group: 'bg', light: 'rgba(255, 255, 255, 0.72)', dark: 'rgba(23, 24, 28, 0.6)' },
  { path: 'bg.mask', tier: 'alias', group: 'bg', light: 'rgba(21, 21, 21, 0.45)', dark: 'rgba(0, 0, 0, 0.6)' },
  { path: 'bg.hover', tier: 'alias', group: 'bg', light: '#F2F3F7', dark: '#262832' },
  { path: 'bg.active', tier: 'alias', group: 'bg', light: '#E8ECFF', dark: '#1D2A45', note: '实测描边色复用为选中底' },
  { path: 'bg.brand', tier: 'alias', group: 'bg', light: 'var(--oj-brand-6)' },
  { path: 'bg.brandSubtle', tier: 'alias', group: 'bg', light: '#F0F5FF', dark: '#1B2440' },
  { path: 'bg.successSubtle', tier: 'alias', group: 'bg', light: 'var(--oj-success-1)' },
  { path: 'bg.warningSubtle', tier: 'alias', group: 'bg', light: 'var(--oj-warning-1)' },
  { path: 'bg.dangerSubtle', tier: 'alias', group: 'bg', light: 'var(--oj-danger-1)' },

  // ------------------------------------------------------------ 边框/焦点
  { path: 'border.1', tier: 'alias', group: 'border', light: '#E8ECFF', dark: '#26304D', note: '主边框，带蓝调（实测）' },
  { path: 'border.2', tier: 'alias', group: 'border', light: '#E5E6EB', dark: '#2A2C34' },
  { path: 'border.3', tier: 'alias', group: 'border', light: '#D0D2DB', dark: '#3A3D47', note: '强边框/输入框' },
  { path: 'border.grid', tier: 'alias', group: 'border', light: '#EDEEF2', dark: '#23252C', note: 'canvas 网格线' },
  { path: 'border.brand', tier: 'alias', group: 'border', light: 'var(--oj-brand-6)' },
  { path: 'focus.ring', tier: 'alias', group: 'border', light: '0 0 0 2px var(--oj-brand-3)' },

  { path: 'shadow.1', tier: 'alias', group: 'shadow', light: '0 1px 2px rgba(21, 21, 21, 0.04), 0 2px 8px rgba(22, 93, 255, 0.06)', dark: '0 1px 2px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.3)' },
  { path: 'shadow.2', tier: 'alias', group: 'shadow', light: '0 4px 16px rgba(21, 21, 21, 0.08), 0 1px 3px rgba(22, 93, 255, 0.08)', dark: '0 4px 16px rgba(0, 0, 0, 0.44), 0 1px 3px rgba(0, 0, 0, 0.4)' },
  { path: 'shadow.3', tier: 'alias', group: 'shadow', light: '0 12px 40px rgba(21, 21, 21, 0.14)', dark: '0 12px 40px rgba(0, 0, 0, 0.6)' },

  // ---------------------------------------------------------------- 玻璃
  { path: 'glass.blur', tier: 'alias', group: 'glass', light: '40px' },
  { path: 'glass.blurSoft', tier: 'alias', group: 'glass', light: '8px' },
  { path: 'glass.highlight', tier: 'alias', group: 'glass', light: 'inset 0 1px 2px rgba(255, 255, 255, 0.9)', dark: 'inset 0 1px 2px rgba(255, 255, 255, 0.08)' },

  // ---------------------------------------------------------------- 圆角
  { path: 'radius.xs', tier: 'alias', group: 'radius', light: '4px', note: '标签' },
  { path: 'radius.sm', tier: 'alias', group: 'radius', light: '6px', note: '按钮' },
  { path: 'radius.md', tier: 'alias', group: 'radius', light: '8px' },
  { path: 'radius.lg', tier: 'alias', group: 'radius', light: '12px', note: '内层卡片' },
  { path: 'radius.xl', tier: 'alias', group: 'radius', light: '20px', note: '外层卡片（实测）' },
  { path: 'radius.full', tier: 'alias', group: 'radius', light: '9999px' },

  // ---------------------------------------------------------------- 间距
  { path: 'space.1', tier: 'alias', group: 'space', light: '4px' },
  { path: 'space.2', tier: 'alias', group: 'space', light: '8px' },
  { path: 'space.3', tier: 'alias', group: 'space', light: '12px' },
  { path: 'space.4', tier: 'alias', group: 'space', light: '16px' },
  { path: 'space.5', tier: 'alias', group: 'space', light: '20px' },
  { path: 'space.6', tier: 'alias', group: 'space', light: '24px' },
  { path: 'space.8', tier: 'alias', group: 'space', light: '32px' },
  { path: 'space.10', tier: 'alias', group: 'space', light: '40px' },

  // ---------------------------------------------------------------- 字体
  {
    path: 'font.sans',
    tier: 'alias',
    group: 'font',
    light:
      '"Inter Variable", ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", "Hiragino Kaku Gothic ProN", "Yu Gothic UI", "Noto Sans JP", "Noto Sans SC", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"',
    // 繁体环境也装了 PingFang SC / 雅黑，不覆写就会命中简体字形
    zhTw:
      '"Inter Variable", ui-sans-serif, system-ui, "PingFang TC", "Microsoft JhengHei", "Noto Sans TC", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"',
    ja: '"Yu Gothic UI", "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Noto Sans JP", Meiryo, sans-serif',
  },
  {
    path: 'font.mono',
    tier: 'alias',
    group: 'font',
    light: '"JetBrains Mono", ui-monospace, SFMono-Regular, Consolas, monospace',
  },
  // Sarasa / Source Han Mono 的 CJK 字宽严格等于 2 个拉丁字宽，表格列对齐刚需
  {
    path: 'font.monoCjk',
    tier: 'alias',
    group: 'font',
    light: '"Sarasa Mono SC", "Source Han Mono SC", var(--oj-font-mono)',
  },
  {
    path: 'font.doc',
    tier: 'alias',
    group: 'font',
    light: '"Source Han Serif SC", "Noto Serif SC", "Songti SC", SimSun, serif',
    note: '文档正文排版，Office 场景必须有衬线选项',
  },

  { path: 'fs.12', tier: 'alias', group: 'font', light: '12px' },
  { path: 'fs.13', tier: 'alias', group: 'font', light: '13px', note: 'Ribbon 实际工作字号，不可省略' },
  { path: 'fs.14', tier: 'alias', group: 'font', light: '14px', compact: '13px', ja: '13px' },
  { path: 'fs.16', tier: 'alias', group: 'font', light: '16px', compact: '14px', ja: '15px' },
  { path: 'fs.18', tier: 'alias', group: 'font', light: '18px', compact: '16px' },
  { path: 'fs.20', tier: 'alias', group: 'font', light: '20px', compact: '18px' },
  { path: 'fs.24', tier: 'alias', group: 'font', light: '24px', compact: '22px' },
  { path: 'fs.32', tier: 'alias', group: 'font', light: '32px', compact: '28px' },

  { path: 'lh.tight', tier: 'alias', group: 'font', light: '1.25' },
  { path: 'lh.normal', tier: 'alias', group: 'font', light: '1.5', ja: '1.5715', note: '日文用 JIS 惯例值' },
  { path: 'lh.loose', tier: 'alias', group: 'font', light: '1.75' },
  { path: 'letter.spacing', tier: 'alias', group: 'font', light: '0em', ja: '0.02em' },

  // ---------------------------------------------------------------- 动效
  { path: 'motion.duration.fast', tier: 'alias', group: 'motion', light: '100ms' },
  { path: 'motion.duration.base', tier: 'alias', group: 'motion', light: '200ms' },
  { path: 'motion.duration.slow', tier: 'alias', group: 'motion', light: '300ms' },
  { path: 'motion.ease.out', tier: 'alias', group: 'motion', light: 'cubic-bezier(0.34, 0.69, 0.10, 1.00)' },
  { path: 'motion.ease.std', tier: 'alias', group: 'motion', light: 'cubic-bezier(0.40, 0.00, 0.20, 1.00)' },

  // ---------------------------------------------------------------- 控件高度
  { path: 'control.height.xs', tier: 'alias', group: 'control', light: '24px', compact: '22px' },
  { path: 'control.height.sm', tier: 'alias', group: 'control', light: '28px', compact: '24px' },
  { path: 'control.height.md', tier: 'alias', group: 'control', light: '32px', compact: '28px' },
  { path: 'control.height.lg', tier: 'alias', group: 'control', light: '40px', compact: '34px' },
  { path: 'ribbon.height', tier: 'alias', group: 'control', light: '96px', compact: '76px' },

  // z-index 层阶：Office 场景里"冻结行 + 下拉浮层 + 批注抽屉"叠在一起是常态，必须显式分层
  { path: 'z.canvas', tier: 'alias', group: 'z', light: '0' },
  { path: 'z.sticky', tier: 'alias', group: 'z', light: '10', note: '表格冻结行列、行号列' },
  { path: 'z.ribbon', tier: 'alias', group: 'z', light: '100' },
  { path: 'z.drawer', tier: 'alias', group: 'z', light: '500' },
  { path: 'z.dropdown', tier: 'alias', group: 'z', light: '1000' },
  { path: 'z.modal', tier: 'alias', group: 'z', light: '2000' },
  { path: 'z.popover', tier: 'alias', group: 'z', light: '3000' },
  { path: 'z.toast', tier: 'alias', group: 'z', light: '4000' },
  { path: 'z.max', tier: 'alias', group: 'z', light: '9000', note: '全屏演示/放映模式' },

  // -------------------------------------------------------- Component 层
  { path: 'button.height', tier: 'component', group: 'button', light: 'var(--oj-control-height-md)' },
  { path: 'button.padding.x', tier: 'component', group: 'button', light: 'var(--oj-space-4)', compact: 'var(--oj-space-3)' },
  { path: 'button.radius', tier: 'component', group: 'button', light: 'var(--oj-radius-sm)' },
  { path: 'button.bg', tier: 'component', group: 'button', light: 'transparent' },
  { path: 'button.color', tier: 'component', group: 'button', light: 'var(--oj-text-1)' },
  { path: 'button.border', tier: 'component', group: 'button', light: 'var(--oj-border-3)' },
  { path: 'button.gap', tier: 'component', group: 'button', light: 'var(--oj-space-2)' },
  { path: 'button.icon.size', tier: 'component', group: 'button', light: '16px', note: '图标按钮，与 Ribbon 字号同级' },

  { path: 'grid.picker.cell', tier: 'component', group: 'grid-picker', light: '16px', note: '表格选择器单格边长' },
  { path: 'grid.picker.gap', tier: 'component', group: 'grid-picker', light: '2px' },
  { path: 'grid.picker.cellBg', tier: 'component', group: 'grid-picker', light: 'var(--oj-border-2)' },
  { path: 'grid.picker.cellActiveBg', tier: 'component', group: 'grid-picker', light: 'var(--oj-brand-6)' },
  { path: 'grid.picker.labelColor', tier: 'component', group: 'grid-picker', light: 'var(--oj-text-3)' },
  { path: 'grid.picker.maxCols', tier: 'component', group: 'grid-picker', light: '10', note: '单位无关，canvas 与 CSS 共用' },
  { path: 'grid.picker.maxRows', tier: 'component', group: 'grid-picker', light: '10' },
]

export { p as lightPalette, d as darkPalette }
