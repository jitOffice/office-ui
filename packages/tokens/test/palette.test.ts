/**
 * 色板生成的确定性断言。档位表写在 prd/01-design-tokens.md §2，
 * 文档里的数值必须由本算法产出，不允许文档单方面规定。
 */

import assert from 'node:assert/strict'
import test from 'node:test'

import { contrastRatio } from '../src/color.ts'
import { anchorStep, buildDarkPalette, buildLightPalette, mirrorRamp } from '../src/palette.ts'
import { LIGHTNESS_STOPS } from '../src/seed.ts'

const p = buildLightPalette()

test('第 6 档为品牌档，且实测值钉住了 #165DFF', () => {
  assert.equal(p.families.brand[6], '#165DFF')
  assert.equal(p.anchors.brand, 6)
})

test('档位 1 钉住实测品牌浅底 #F0F5FF', () => {
  assert.equal(p.families.brand[1], '#F0F5FF')
})

test('每个色族 10 档，且亮度单调递增', () => {
  for (const [name, ramp] of Object.entries(p.families)) {
    assert.equal(ramp.length, 11, `${name} 应为 1..10 加一个占位 0`)
    for (let i = 1; i < 10; i++) {
      assert.ok(
        contrastRatio('#000000', ramp[i] as string) > contrastRatio('#000000', ramp[i + 1] as string) ||
          ramp[i] === ramp[i + 1],
        `${name}-${i} 比 ${name}-${i + 1} 更暗，违反亮度递增`,
      )
    }
  }
})

test('实测主题色钉在该色族自己的明度档位上', () => {
  assert.equal(p.families.warning[p.anchors.warning], '#F97316')
  assert.equal(p.families.success[p.anchors.success], '#10B981')
  assert.equal(p.families.danger[p.anchors.danger], '#FF6B6B')
  assert.deepEqual(
    { brand: p.anchors.brand, warning: p.anchors.warning, danger: p.anchors.danger, success: p.anchors.success },
    { brand: 6, warning: 6, danger: 4, success: 8 },
    '锚点档位变了 —— 这是公开契约，改动需要 ADR',
  )
})

test('anchorStep 取最近亮度档', () => {
  assert.equal(anchorStep(54, LIGHTNESS_STOPS), 6)
  assert.equal(anchorStep(70.9, LIGHTNESS_STOPS), 4)
  assert.equal(anchorStep(39.4, LIGHTNESS_STOPS), 8)
})

test('灰色第 10 档 = 实测最深色 #151515', () => {
  assert.equal(p.gray[10], '#151515')
})

test('暗色靠索引镜像 n → 11 − n', () => {
  const d = buildDarkPalette(p)
  assert.equal(d.families.brand[3], p.families.brand[8])
  assert.equal(d.gray[1], p.gray[10])
})

test('暗色品牌主档额外提亮，镜像后的亮度不足以撑起正文对比度', () => {
  const d = buildDarkPalette(p)
  assert.equal(d.families.brand[6], '#4080FF')
})

test('mirrorRamp 是自反的', () => {
  assert.deepEqual(mirrorRamp(mirrorRamp(p.families.brand)), p.families.brand)
})

test('图表 8 色与两站实测强调色同系', () => {
  assert.deepEqual(p.chart, ['#165DFF', '#10B981', '#F97316', '#7C3AED', '#0891B2', '#DB2777', '#FACC15', '#4F46E5'])
})
