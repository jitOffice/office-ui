/**
 * 产物面加载测试（A2 验收的零依赖版本）。
 *
 * 这里刻意**不**读 `src`：`exports` 从 `./src/*.ts` 改指 `dist/*` 之后，
 * 只有这些用例会真去加载发出去的那份文件。源码测试全绿而产物是坏的，
 * 是发布事故最省事的成因。
 *
 * ESM 用 `await import()`（产物只有具名导出，默认导入会直接报错），
 * CJS 用 `createRequire`；`node:vm` 那一路在 i18n 的用例里（UMD 才有全局形态）。
 *
 * 运行时值一律用 `dist/types` 的产物声明来标注类型：`dist/es` 与 `dist/cjs` 旁边没有
 * `.d.ts`，静态 import 它们在 TS 里就是 implicit any。这样这个文件同时守住两件事——
 * 产物能真加载，以及发出去的类型树本身能被消费者解析。
 */

import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { test } from 'node:test'

import type * as CommandsTypes from '../dist/types/commands/index.js'
import type * as SharedTypes from '../dist/types/index.js'

const requireFromHere = createRequire(import.meta.url)

/**
 * 说明符写成变量而不是字面量：`dist/es` 旁边没有 `.d.ts`，TS 一旦静态解析它就报 implicit any，
 * 而类型本来就由 `dist/types` 提供。运行时解析仍然按调用文件的 URL 走，路径写错照样炸。
 */
async function loadEsm<T>(specifier: string): Promise<T> {
  return (await import(specifier)) as T
}

const esm = await loadEsm<typeof SharedTypes>('../dist/es/index.js')
const esmCommands = await loadEsm<typeof CommandsTypes>('../dist/es/commands/index.js')
const cjs = requireFromHere('../dist/cjs/index.cjs') as typeof SharedTypes

test('ESM 产物暴露 createCommandRegistry 且注册表可用', async () => {
  assert.equal(typeof esm.createCommandRegistry, 'function')
  const registry = esm.createCommandRegistry()
  let ran = 0
  registry.register({ id: 'file.save', label: '保存', run: () => { ran += 1 } })
  await registry.run('file.save')
  assert.equal(ran, 1)
})

test('CJS 产物与 ESM 产物暴露同一组具名导出', async () => {
  assert.deepEqual(Object.keys(cjs).sort(), Object.keys(esm).sort())
  const registry = cjs.createCommandRegistry()
  let ran = 0
  registry.register({ id: 'file.save', label: '保存', run: () => { ran += 1 } })
  await registry.run('file.save')
  assert.equal(ran, 1)
})

test('./commands 子路径两条链都可达', () => {
  assert.equal(typeof esmCommands.createCommandRegistry, 'function')
  const subCjs = requireFromHere('../dist/cjs/commands/index.cjs')
  assert.equal(typeof subCjs.createCommandRegistry, 'function')
})

test('CJS 保留模块结构，没有把整包打成一个文件', () => {
  // preserveModules 退化成一个 bundle 时，`require('@jitoffice/shared/commands')` 照样能用，
  // 但深路径的摇树收益会整体消失——所以这里直接查文件形状，而不是只查导出。
  const registry = requireFromHere('../dist/cjs/commands/registry.cjs')
  assert.equal(typeof registry.createCommandRegistry, 'function')
})
