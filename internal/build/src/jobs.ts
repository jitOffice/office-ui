/**
 * 每个包的构建趟次。一趟 = 一套产物目录，`outRoot` 由调用方决定：
 * 正常构建写进 `packages/<dir>/dist`，`--check` 写进临时目录后逐字节比对。
 *
 * `preserveModules` 是 ESM/CJS 两趟的硬要求（02 §2 表）：模块结构一旦被合并，
 * 下游打包器就摇不掉未使用的组件与命令，"按需引入"变成全量引入。
 * CJS 用 `.cjs` 扩展名：两个包都是 `"type": "module"`，`.js` 会被 Node 当 ESM 解析。
 *
 * 打包器选项写 `rolldownOptions`：vite 8 由 rolldown 驱动，`rollupOptions` 只是它保留的
 * 过渡别名，类型上已标 deprecated。实测两种写法产出逐字节相同，所以改名不动产物，
 * 只是不再把管线押在一个随时可能被移除的别名上。
 */

import { join } from 'node:path'
import type { InlineConfig } from 'vite'

import { LEGACY_TARGET, MODERN_TARGET } from './specs.ts'
import type { PackageSpec } from './specs.ts'

export interface Job {
  /** 相对 `dist` 的产物目录，比对与日志都用它定位 */
  rel: string
  kind: 'vite' | 'tsc'
  config?: InlineConfig
  tsc?: { project: string; outDir: string }
}

export interface JobContext {
  spec: PackageSpec
  /** 包的绝对目录，作为 vite 的 root */
  pkgDir: string
  /** 产物根：`packages/<dir>/dist` 或临时目录 */
  outRoot: string
}

function entryPaths(ctx: JobContext, entries: string[]): string[] {
  return entries.map((e) => join(ctx.pkgDir, e))
}

export function jobsFor(ctx: JobContext): Job[] {
  const { spec, pkgDir, outRoot } = ctx
  const external = [spec.name, '@jitoffice/tokens', '@jitoffice/shared', '@jitoffice/i18n', 'vue']

  // `cwd` 必须钉在包目录：rolldown 会在每个模块前写一行 `//#region <相对 cwd 的路径>`，
  // 而它的默认值是 process.cwd()。实测同一份源码在仓库根 / internal/build / 包目录里跑，
  // 产物分别是 `packages/shared/src/…` 与 `src/…`，也就是字节不同。产物要入库、要比对，
  // 这条不锁死就是"换个目录跑一次构建就报产物过期"的假警报制造机。
  const rolldownCommon = {
    cwd: pkgDir,
    external: (id: string) => external.some((name) => id === name || id.startsWith(`${name}/`)),
  }

  const es: Job = {
    rel: 'es',
    kind: 'vite',
    config: {
      root: pkgDir,
      configFile: false,
      logLevel: 'warn',
      build: {
        outDir: join(outRoot, 'es'),
        emptyOutDir: true,
        minify: false,
        target: MODERN_TARGET,
        lib: { entry: entryPaths(ctx, spec.entries), formats: ['es'] },
        rolldownOptions: {
          ...rolldownCommon,
          output: { preserveModules: true, preserveModulesRoot: 'src', entryFileNames: '[name].js' },
        },
      },
    },
  }

  const cjs: Job = {
    rel: 'cjs',
    kind: 'vite',
    config: {
      root: pkgDir,
      configFile: false,
      logLevel: 'warn',
      build: {
        outDir: join(outRoot, 'cjs'),
        emptyOutDir: true,
        minify: false,
        target: MODERN_TARGET,
        lib: { entry: entryPaths(ctx, spec.entries), formats: ['cjs'] },
        rolldownOptions: {
          ...rolldownCommon,
          output: {
            preserveModules: true,
            preserveModulesRoot: 'src',
            entryFileNames: '[name].cjs',
            exports: 'auto',
          },
        },
      },
    },
  }

  const types: Job = {
    rel: 'types',
    kind: 'tsc',
    tsc: { project: join(pkgDir, 'tsconfig.build.json'), outDir: join(outRoot, 'types') },
  }

  // 同一个 outDir 会被多个语言包目标共用：每趟都清空，后一趟就把前一趟刚写的文件删掉
  // （实测症状是 dist/locale 只剩最后一个语言包 en-US）；都不清空，上一轮的过期产物会留在
  // 树里被一起发布。所以按 outDir 分组，只有组内第一趟负责清空。
  const firstOfDir = new Set<string>()
  const umd: Job[] = (spec.umd ?? []).map((target) => {
    const rel = target.outDir.replace(/^dist\//, '')
    const clears = !firstOfDir.has(rel)
    firstOfDir.add(rel)
    return {
      rel,
      kind: 'vite' as const,
      config: {
        root: pkgDir,
        configFile: false,
        logLevel: 'warn',
        build: {
          outDir: join(outRoot, rel),
          emptyOutDir: clears,
          minify: false,
          // 兼容线：这一趟的语法目标，降级由这里发生
          target: LEGACY_TARGET,
          lib: {
            // 用 record 形式给 chunk 命名：`lib.fileName` 会被下面的
            // `output.entryFileNames: '[name].js'` 覆盖，写成字符串参数是无效的。
            entry: { [target.file]: join(pkgDir, target.entry) },
            formats: ['umd'],
            name: target.global,
          },
          rolldownOptions: {
            ...rolldownCommon,
            output: {
              // 必须显式钉扩展名：vite 8 会给 umd 追加 `.umd` 并按 `"type": "module"` 选 `.cjs`，
              // 产出 `office-ui-i18n.umd.cjs`。而 02 §4.1 的无构建器契约是
              // `<script src="…/dist/locale/ja-JP.js">`，兼容线门禁的 glob 也只收 `**/*.js`。
              entryFileNames: '[name].js',
              exports: 'auto',
              // 外部依赖在这条线上只能靠全局变量拿：`<script src="vue.global.prod.js">` 之后
              // 产物里的 `require('vue')` 会读 `globalThis.Vue`。不写这条，rolldown 会给
              // 每个外部模块编一个名字，而 Vue 的全局名不是它猜的那个。
              globals: { vue: 'Vue' },
            },
          },
        },
      } satisfies InlineConfig,
    }
  })

  return [es, cjs, types, ...umd]
}
