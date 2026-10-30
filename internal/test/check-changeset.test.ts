/**
 * changeset 门禁的判定规则（02 §A3）。
 *
 * 这个脚本的失败方式有两种，都很难在 code review 里看出来：
 *   1. 太严 —— 改一行测试就要求写 changeset，人开始习惯性 `--empty`，门禁等于没有；
 *   2. 太松 —— 真改了 `packages/ui/src` 却放过，等发布时才发现版本没动。
 * 所以规则本身要能被这些用例钉住，而不是靠"当初大概是这么想的"。
 */

import assert from 'node:assert/strict'
import test from 'node:test'

import { evaluate, isChangesetFile, isReleaseSurface } from '../scripts/check-changeset.ts'

test('发布包源码与包清单算发布面', () => {
  assert.equal(isReleaseSurface('packages/ui/src/ribbon/ribbon.vue'), true)
  assert.equal(isReleaseSurface('packages/tokens/package.json'), true)
  assert.equal(isReleaseSurface('packages/icons/src/svg/add.svg'), true)
})

test('测试、生成物、私有包、文档站都不算发布面', () => {
  assert.equal(isReleaseSurface('packages/ui/test/unit/command-sync.spec.ts'), false)
  assert.equal(isReleaseSurface('packages/tokens/dist/index.css'), false)
  assert.equal(isReleaseSurface('docs/.vitepress/config.ts'), false)
  assert.equal(isReleaseSurface('internal/scripts/check-contracts.ts'), false)
  assert.equal(isReleaseSurface('packages/ui/README.md'), false)
})

test('changeset 是 .changeset 下的 md，但要排除自动生成的 README', () => {
  assert.equal(isChangesetFile('.changeset/tidy-otters-jump.md'), true)
  assert.equal(isChangesetFile('.changeset/README.md'), false)
  assert.equal(isChangesetFile('.changeset/config.json'), false)
})

test('改了发布包源码却没写 changeset → 判定缺失', () => {
  const verdict = evaluate(['packages/ui/src/button/button.vue', 'README.md'])
  assert.equal(verdict.needs, true)
  assert.equal(verdict.has, false)
  assert.deepEqual(verdict.sources, ['packages/ui/src/button/button.vue'])
})

test('改了发布包源码且写了 changeset → 通过', () => {
  const verdict = evaluate(['packages/ui/src/button/button.vue', '.changeset/quiet-moles-smile.md'])
  assert.equal(verdict.needs, true)
  assert.equal(verdict.has, true)
})

test('只动文档与 CI 时不要求 changeset', () => {
  const verdict = evaluate(['README.md', '.github/workflows/pull-request.yml', 'docs/guide/install.md'])
  assert.equal(verdict.needs, false)
})

test('只加了 .changeset/README.md 不算写了 changeset', () => {
  const verdict = evaluate(['packages/ui/src/a.ts', '.changeset/README.md'])
  assert.equal(verdict.has, false)
})
