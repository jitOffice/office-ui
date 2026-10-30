/**
 * 构建逻辑包的全部产物链（02 §2 产物矩阵、ADR-0002 双轨）。
 *
 * 用法：
 *   node internal/build/src/build.ts              # 构建 specs 里全部包
 *   node internal/build/src/build.ts i18n         # 只构建某个包
 *   node internal/build/src/build.ts --check      # 重建到临时目录并与入库 dist 逐字节比对
 *
 * `--check` 为什么不并进 `pnpm lint`：lint 必须零依赖可跑（内网装不上依赖也要能验收），
 * 而重建需要 vite。于是零依赖那条只查"exports 指向的文件在不在"，这条查"产物与源码同源"。
 * 两条都要能被故意破坏，见 05 偏差 14。
 */

import { spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

import { compareTrees } from './compare.ts'
import { jobsFor } from './jobs.ts'
import { specs } from './specs.ts'
import type { PackageSpec } from './specs.ts'
import type { Job } from './jobs.ts'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '..', '..', '..')
const tscBin = join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc')

/**
 * 样式产物（ADR-0003：一份文件，不按组件拆；02 §4.4：两种封装）。
 *
 * `office-ui.css` 不带 `@layer`——`@layer` 是 Chromium 99+ 才有的，而兼容线 floor 是 86，
 * 老内核会把整段 `@layer { … }` 当未知 at-rule 丢掉，所以它不能是唯一形态。
 * `office-ui.layered.css` 把同一批规则放进 `@layer oj-ui`，现代浏览器用它压过宿主应用
 * 选择器的特异性。两份都从同一个 `src/style.css` 生成，不新增第二份维护源。
 */
function writeStyles(spec: PackageSpec, pkgDir: string, outRoot: string): boolean {
  const source = join(pkgDir, 'src', 'style.css')
  if (!existsSync(source)) return false
  const css = readFileSync(source, 'utf8').replace(/\r\n/g, '\n')
  const base = `office-${spec.name.split('/').pop() ?? spec.dir}`
  const dir = join(outRoot, 'styles')
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, `${base}.css`), css)
  writeFileSync(join(dir, `${base}.layered.css`), `@layer oj-ui {\n${css}}\n`)
  return true
}

/**
 * dual package 的 CJS 类型镜像（attw 的 `false-esm`，2026-10-30 实测发现）。
 *
 * 只发一份 `.d.ts` 时，`package.json` 的 `"type": "module"` 会把它判定为 **ESM 声明**，
 * 而 `exports` 的 `require` 分支指向 `.cjs`。于是 `moduleResolution: node16` + `module: commonjs`
 * 的消费者 `require('@jitoffice/ui')` 会被 TS 拒绝：
 * "the referenced file is an ECMAScript module"。attw 把这叫 Masquerading as ESM。
 *
 * 镜像**不是简单复制**：`.d.cts` 里的相对说明符必须改成 `.cjs`（对应 `.d.cts`）。
 * 原样抄过去的话 CJS 声明树会跨回 ESM 那一侧，TS 照样报同一个错——问题只是从入口挪到了内部。
 */
function cjsMirrorContent(source: string): string {
  // 说明符要同时认 `.ts` 与 `.js`：tsc 7.0.2 **不**把 d.ts 里的 `./x.ts` 改写成 `./x.js`
  // （契约 11 的注释记过这件事，现在靠 TS 的声明文件后缀回退才没断）。
  // 只认 `.js` 的话镜像里会原样保留 `./icon.ts`，CJS 类型树照样跨界。
  const rewritten = source.replace(
    /(['"])(\.{1,2}\/[^'"]+)\.(?:js|ts)\1/g,
    (_match, quote: string, spec: string) => `${quote}${spec}.cjs${quote}`,
  )
  // CJS 产物是 `module.exports = X`，对应的声明是 `export = X`。
  // 照抄 `export default X` 会让 CJS 消费者以为拿到的是 `{ default: X }` ——
  // attw 报的 `Incorrect default export` 就是这个（真发生过，i18n 的四个语言包）。
  // 只在"唯一导出就是 default"时转换：`export =` 不能与具名导出共存。
  const hasNamedExport = /^\s*export (?!default\b)/m.test(rewritten)
  if (!hasNamedExport) {
    return rewritten.replace(/^\s*export default\s+(\w+)\s*;?/m, 'export = $1;')
  }
  return rewritten
}

function writeCjsDeclarations(outDir: string): number {
  let count = 0
  const visit = (dir: string): void => {
    if (!existsSync(dir)) return
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) {
        visit(path)
        continue
      }
      if (!entry.name.endsWith('.d.ts')) continue
      writeFileSync(path.replace(/\.d\.ts$/, '.d.cts'), cjsMirrorContent(readFileSync(path, 'utf8')))
      count += 1
    }
  }
  visit(outDir)
  return count
}

function runJob(job: Job): Promise<void> {
  if (job.kind === 'tsc') {
    const options = job.tsc!
    const result = spawnSync(process.execPath, [tscBin, '-p', options.project, '--outDir', options.outDir], {
      stdio: 'inherit',
      cwd: repoRoot,
    })
    if (result.status !== 0) {
      return Promise.reject(new Error(`tsc 产出类型失败（exit ${String(result.status)}）：${options.project}`))
    }
    writeCjsDeclarations(options.outDir)
    return Promise.resolve()
  }
  // vite 的 build() 返回 Promise，串行 await：并行会两趟抢同一个 outDir。
  return build(job.config!) as unknown as Promise<void>
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const check = args.includes('--check')
  const only = args.find((a) => !a.startsWith('--'))
  const targets = only ? specs.filter((s) => s.dir === only) : specs
  if (targets.length === 0) {
    console.error(`[build] 没有名为 "${only}" 的包，可选：${specs.map((s) => s.dir).join(', ')}`)
    process.exit(1)
  }

  // --check 时全部写到临时目录，工作区里入库的产物一个字节都不碰。
  const scratch = check ? mkdtempSync(join(tmpdir(), 'oj-build-')) : undefined

  try {
    for (const spec of targets) {
      const pkgDir = join(repoRoot, 'packages', spec.dir)
      const outRoot = check ? join(scratch!, spec.dir) : join(pkgDir, 'dist')
      for (const job of jobsFor({ spec, pkgDir, outRoot })) {
        await runJob(job)
      }
      // ADR-0003：组件样式是一份文件，不进 JS 包。vite 的 lib 趟不会看见没人 import 的 CSS，
      // 所以在趟次结束后由源码生成。`--check` 的 outRoot 是临时目录，比对能盖到它。
      writeStyles(spec, pkgDir, outRoot)

      // 生成器产出的静态资产（icons 的 sprite.svg / manifest.json）。
      // 走这里而不是让生成器直接写 dist：否则重建时没人产出这两份文件，
      // `--check` 会报「已入库但构建不再产出」——门禁自己制造的假警报。
      for (const asset of spec.assets ?? []) {
        const target = join(outRoot, asset.to)
        mkdirSync(dirname(target), { recursive: true })
        copyFileSync(join(pkgDir, asset.from), target)
      }
      if (check) {
        const problems = compareTrees(join(pkgDir, 'dist'), outRoot)
        if (problems.length > 0) {
          console.error(`[build] packages/${spec.dir}/dist 与源码不同源：`)
          for (const line of problems) console.error(`  - ${line}`)
          process.exit(1)
        }
        console.log(`[build] packages/${spec.dir}/dist 与源码同源`)
      } else {
        console.log(`[build] packages/${spec.dir}/dist 已产出`)
      }
    }
  } finally {
    if (scratch) rmSync(scratch, { recursive: true, force: true })
  }
}

await main()
