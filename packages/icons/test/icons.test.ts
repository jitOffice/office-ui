import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import { buildArtifacts, componentName, emitSprite, parseIcon, readSources } from '../scripts/generate.ts'
import { iconLabelProblem, iconMarkup, icons, isDevEnv } from '../src/index.ts'
// 跨包读 ui 的图标表：两边都在发同名字符串（ui 的根入口必须零依赖，暂时不能 import 本包），
// 所以这里守的是"两份数据不许漂移"。M1 把 ui 切到生成物上之后，这条用例与本包一起删。
import { icons as uiIcons } from '../../ui/src/icons.ts'

const here = dirname(fileURLToPath(import.meta.url))
const pkgRoot = join(here, '..')

const sources = readSources()

test('源文件本身合规：有 viewBox、不带尺寸、无位图/脚本、继承 currentColor', () => {
  assert.equal(sources.length > 0, true)
  for (const icon of sources) {
    assert.equal(typeof icon.viewBox, 'string')
    // 必须断言**解析后的根属性**，不能拿 `markup.includes('width=')` 判断：
    // `stroke-width="1.4"` 里就含这个子串，第一版探针正是这么撞的。
    assert.equal('width' in icon.attrs, false, `${icon.name} 的根元素不许写 width`)
    assert.equal('height' in icon.attrs, false, `${icon.name} 的根元素不许写 height`)
    assert.equal(icon.markup.includes('currentColor'), true, `${icon.name} 必须继承文字颜色`)
  }
})

test('生成物与源同源：改 SVG 忘记重跑 icons:gen 必须被抓到', () => {
  for (const [rel, content] of Object.entries(buildArtifacts())) {
    const onDisk = readFileSync(join(pkgRoot, rel), 'utf8')
    assert.equal(onDisk, content, `${rel} 已过期，运行 pnpm icons:gen`)
  }
})

test('sprite 与常量表一一对应，且 symbol 带上了根元素的绘制属性', () => {
  const sprite = emitSprite(sources)
  const ids = [...sprite.matchAll(/<symbol id="([^"]+)"/g)].map((m) => m[1] as string)
  assert.deepEqual(ids, Object.keys(icons))
  // 只抄 body、不抄根属性的话，stroke 系的图标复用出来会变成一个实心块
  for (const icon of sources) {
    const attrs = Object.entries(icon.attrs)
      .map(([k, v]) => ` ${k}="${v}"`)
      .join('')
    if (attrs === '') continue
    assert.equal(sprite.includes(`id="${icon.name}" viewBox="${icon.viewBox}"${attrs}`), true, icon.name)
  }
  assert.equal(sprite.includes('<script'), false)
  assert.equal(/href="http/.test(sprite), false, 'sprite 不许外链（离线部署）')
})

test('manifest 是可机读的清单，不重复存 markup', () => {
  const manifest = JSON.parse(readFileSync(join(pkgRoot, 'generated/manifest.json'), 'utf8')) as {
    icons: { name: string; viewBox: string; body: string; attrs: Record<string, string> }[]
  }
  assert.deepEqual(
    manifest.icons.map((i) => i.name),
    Object.keys(icons),
  )
  for (const item of manifest.icons) {
    // canvas 消费方要的是 body + attrs；把整串 markup 也塞进 manifest 等于同一份数据存两遍
    assert.equal('markup' in item, false)
    assert.equal(item.body.length > 0, true)
    assert.equal(item.viewBox, icons[item.name as keyof typeof icons].viewBox)
  }
})

test('组件名映射稳定且唯一', () => {
  assert.equal(componentName('oj-format-bold'), 'OjIconFormatBold')
  assert.equal(componentName('oj-ai'), 'OjIconAi')
  const names = sources.map((icon) => componentName(icon.name))
  assert.equal(new Set(names).size, names.length, '组件名撞车会让后一个静默覆盖前一个')
  for (const name of names) assert.equal(name.startsWith('OjIcon'), true)
})

test('与 @jitoffice/ui 的图标表不漂移', () => {
  assert.deepEqual(Object.keys(icons).sort(), Object.keys(uiIcons).sort())
  for (const [name, source] of Object.entries(icons)) {
    assert.equal(
      (uiIcons as Record<string, string>)[name],
      source.markup,
      `${name} 在两个包里内容不同：改图标要同时改源与 ui 的内联表`,
    )
  }
})

test('可访问名判定：缺 label 又不标 decorative 才算问题', () => {
  assert.equal(typeof iconLabelProblem('oj-ai'), 'string')
  assert.equal(iconLabelProblem('oj-ai', { label: 'AI' }), undefined)
  assert.equal(iconLabelProblem('oj-ai', { decorative: true }), undefined)
  assert.equal(typeof iconLabelProblem('oj-ai', { label: '' }), 'string')
  assert.equal(isDevEnv(undefined), false)
  assert.equal(isDevEnv({ DEV: true }), true)
})

test('查表：命中返回标记，未命中返回 undefined（不是空串）', () => {
  assert.equal(iconMarkup('oj-format-bold'), icons['oj-format-bold'].markup)
  // 返回空串会让 <span> 静默变空白，而空白比报错难查得多
  assert.equal(iconMarkup('oj-not-exist'), undefined)
})

test('源文件的四条硬规矩各自会拦住东西', () => {
  const ok = '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h2"/></svg>'
  assert.equal(parseIcon('ok', ok).viewBox, '0 0 16 16')

  assert.throws(() => parseIcon('no-box', '<svg fill="currentColor"><path d="M2 2"/></svg>'), /viewBox/)
  assert.throws(
    () => parseIcon('sized', '<svg viewBox="0 0 16 16" width="16" fill="currentColor"><path d="M2 2"/></svg>'),
    /width/,
  )
  assert.throws(() => parseIcon('grey', '<svg viewBox="0 0 16 16" fill="#000"><path d="M2 2"/></svg>'), /currentColor/)
  assert.throws(
    () =>
      parseIcon(
        'raster',
        '<svg viewBox="0 0 16 16" fill="currentColor"><image href="a.png"/></svg>',
      ),
    /<image/,
  )
})
