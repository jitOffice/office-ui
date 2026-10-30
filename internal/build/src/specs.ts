/**
 * 共享构建配置（02 §1 `internal/build`、02 §2 产物矩阵、ADR-0002 双轨）。
 *
 * 一趟构建产出一套产物，两趟的意义只在**语法目标**：
 * `modern` = ES2022（`dist/es/`、`dist/cjs/`，给有构建器的项目）；
 * `legacy` = ES2018（`dist/umd/`、`dist/locale/`，给无构建器与信创老内核）。
 * 老内核吃不下 `?.` `??` 与逻辑赋值，所以兼容线的产物必须由构建器降级，
 * 并且由 `check-legacy-syntax.ts` 用 AST 复核，不能只信构建参数。
 */

/** 两条线的语法目标。改动等于改公开契约，必须先过 ADR-0002。 */
export const MODERN_TARGET = 'es2022'
export const LEGACY_TARGET = 'es2018'

/** 一个包的构建说明。 */
export interface PackageSpec {
  /** `packages/` 下的目录名 */
  dir: string
  /** 发布名，写进产物的 banner 与外部依赖判定 */
  name: string
  /**
   * ESM / CJS 两趟的入口（相对包目录）。每个入口都会成为一个公开子路径，
   * `preserveModules` 保证模块结构不被合并——合并会让下游 tree-shaking 失效。
   */
  entries: string[]
  /**
   * 兼容线 UMD 目标。`exports: 'default'` + AMD + CommonJS + 全局四形态，
   * 无构建器用户只会 `<script src>`，不会 import。
   */
  umd?: UmdTarget[]
  /**
   * 由生成器产出的静态资产（相对包目录 → 相对 `dist`）。
   *
   * 存在的理由：`build:check` 会逐字节比对入库 `dist` 与重建结果，
   * 生成器直接往 `dist` 里写的文件在重建时"没人产出"，门禁会报「已入库但构建不再产出」。
   * 所以生成物先落在包内的 `generated/`，由这里声明复制，两条路径都走同一份内容。
   */
  assets?: AssetTarget[]
}

export interface AssetTarget {
  /** 相对包目录的源文件 */
  from: string
  /** `dist` 内的目标路径 */
  to: string
}

export interface UmdTarget {
  /** 入口源文件（相对包目录） */
  entry: string
  /** dist 下的输出目录 */
  outDir: string
  /** 输出文件名（不含扩展名） */
  file: string
  /** 挂到全局对象上的名字（ADR-0001：完整词 `OfficeUI` 前缀，不用 `OJ`） */
  global: string
}

const LOCALES = ['zh-CN', 'zh-TW', 'ja-JP', 'en-US'] as const

/** 全局名后缀：`zh-CN` → `ZhCN`。 */
function globalSuffix(code: string): string {
  return code.split('-').map((part) => part[0]?.toUpperCase() + part.slice(1)).join('')
}

/**
 * 只登记已存在的包。`ui` 的 Vue 层是 `h()` 写的 `.ts`，走与 shared 相同的 ESM / CJS / 类型三套，
 * 另加两条兼容线 UMD；样式由 `dist/styles/` 下的两份 CSS 交付（ADR-0003），不按组件拆。
 *
 * 两条 UMD 是两种消费者，不能合成一条：
 * `office-ui.js` 从 `./vue` 入口出，`vue` 是外部依赖（全局 `Vue`），无构建器页面要的就是它；
 * `office-ui-core.js` 从根入口出，不含 Vue，给只想要命令表 / 框选模型的 `<script>` 用户。
 */
export const specs: PackageSpec[] = [
  {
    dir: 'shared',
    name: '@jitoffice/shared',
    entries: ['src/index.ts', 'src/commands/index.ts'],
  },
  {
    dir: 'i18n',
    name: '@jitoffice/i18n',
    entries: ['src/index.ts', ...LOCALES.map((code) => `src/locales/${code}.ts`)],
    umd: [
      { entry: 'src/index.ts', outDir: 'dist/umd', file: 'office-ui-i18n', global: 'OfficeUII18n' },
      ...LOCALES.map((code) => ({
        entry: `src/locales/${code}.ts`,
        outDir: 'dist/locale',
        file: code,
        global: `OfficeUILocale${globalSuffix(code)}`,
      })),
    ],
  },
  {
    dir: 'icons',
    name: '@jitoffice/icons',
    entries: ['src/index.ts', 'src/vue/index.ts'],
    // sprite 与 manifest 是生成物不是构建物，见 PackageSpec.assets 的注释。
    assets: [
      { from: 'generated/sprite.svg', to: 'sprite.svg' },
      { from: 'generated/manifest.json', to: 'manifest.json' },
    ],
  },
  {
    dir: 'ui',
    name: '@jitoffice/ui',
    entries: ['src/index.ts', 'src/vue/index.ts'],
    umd: [
      { entry: 'src/vue/index.ts', outDir: 'dist/umd', file: 'office-ui', global: 'OfficeUI' },
      { entry: 'src/index.ts', outDir: 'dist/umd', file: 'office-ui-core', global: 'OfficeUICore' },
    ],
  },
]

export function specByDir(dir: string): PackageSpec | undefined {
  return specs.find((s) => s.dir === dir)
}
