import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'

import {
  iconMarkup,
  iconMarkupProblem,
  registerIcon,
  registerIcons,
  registeredIconNames,
  resetRegisteredIcons,
  unregisterIcon,
} from '../src/index.ts'

/**
 * 运行时图标注册表（05 C1 余项）。
 *
 * 这里断言的重点不是"能注册"，而是**拒绝什么**：组件用 `innerHTML` 渲染图标，
 * 业务图标的字符串常常来自图标包或后端接口。放行一条 `onload=` 就等于把注入面开给调用方，
 * 而放行一个没有 viewBox 的 `<svg>` 会得到"注册成功但图标是 0×0"——
 * 那种问题会被误判成打包配置，排查成本极高。
 */

afterEach(() => {
  resetRegisteredIcons()
})

const OK = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h12v12H2z"/></svg>'

test('注册后 OjIcon 的查表能拿到，注销后拿不到', () => {
  assert.equal(iconMarkup('acme-logo'), undefined)

  registerIcon('acme-logo', OK)
  assert.equal(iconMarkup('acme-logo'), OK)
  assert.deepEqual(registeredIconNames(), ['acme-logo'])

  assert.equal(unregisterIcon('acme-logo'), true)
  assert.equal(iconMarkup('acme-logo'), undefined)
  // 重复注销不是错误，返回 false 而已
  assert.equal(unregisterIcon('acme-logo'), false)
})

test('内置图标不受影响，也不会被业务覆盖', () => {
  assert.ok(iconMarkup('oj-close'))
  registerIcon('acme-logo', OK)
  assert.ok(iconMarkup('oj-close'))
  assert.throws(() => registerIcon('oj-close', OK), /内置命名空间/)
})

test('名字必须是 kebab-case，且不能占 oj- 前缀', () => {
  for (const bad of ['AcmeLogo', 'acme_logo', '1acme', 'acme logo', '']) {
    assert.throws(() => registerIcon(bad, OK), /kebab-case/)
  }
  assert.throws(() => registerIcon('oj-mine', OK), /内置命名空间/)
  assert.equal(iconMarkupProblem('acme-logo', OK), undefined)
})

test('markup 必须是单个带 viewBox 的 <svg>', () => {
  assert.throws(() => registerIcon('acme-a', '<path d="M0 0"/>'), /不是以 <svg 开头/)
  assert.throws(() => registerIcon('acme-a', '<svg viewBox="0 0 16 16">'), /不是以 <\/svg> 结尾/)
  assert.throws(
    () => registerIcon('acme-a', '<svg viewBox="0 0 16 16"><path d="M0 0"/></svg><svg viewBox="0 0 8 8"/>'),
    /不是以 <\/svg> 结尾|2 个 <svg>/,
  )
  assert.throws(() => registerIcon('acme-a', '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>'), /缺 viewBox/)
})

test('拒绝内联事件、script、javascript:、foreignObject、外链', () => {
  const cases: [string, RegExp][] = [
    ['<svg viewBox="0 0 16 16" onload="alert(1)"></svg>', /内联事件/],
    ['<svg viewBox="0 0 16 16"><script>alert(1)</script></svg>', /<script>/],
    ['<svg viewBox="0 0 16 16"><a href="javascript:alert(1)"></a></svg>', /javascript:/],
    ['<svg viewBox="0 0 16 16"><foreignObject></foreignObject></svg>', /foreignObject/],
    ['<svg viewBox="0 0 16 16"><image href="https://x.test/a.png"/></svg>', /<image>|外链 href/],
    ['<svg viewBox="0 0 16 16"><use xlink:href="//cdn.test/a.svg#i"/></svg>', /外链 href/],
  ]
  for (const [markup, expected] of cases) {
    assert.throws(() => registerIcon('acme-bad', markup), expected, markup)
  }
})

test('批量注册是原子的：一条不合格，一条都不写入', () => {
  assert.throws(
    () => registerIcons({ 'acme-ok': OK, 'oj-bad': OK }),
    /内置命名空间/,
  )
  assert.deepEqual(registeredIconNames(), [])
})

test('同名覆盖：主题切换与微前端替换靠它', () => {
  const first = '<svg viewBox="0 0 16 16"><path d="M0 0h1v1H0z"/></svg>'
  const second = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/></svg>'

  registerIcon('acme-logo', first)
  registerIcon('acme-logo', second)
  assert.equal(iconMarkup('acme-logo'), second)
  assert.deepEqual(registeredIconNames(), ['acme-logo'])
})
