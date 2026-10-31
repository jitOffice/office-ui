import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import {
  clampNumber,
  FONT_SIZE_PRESETS,
  formatLineSpacing,
  nearestPreset,
  parseNumberDraft,
  roundTo,
  stepNumber,
  stepPreset,
  LINE_SPACING_PRESETS,
} from '../src/index.ts'

/**
 * 数值与档位的模型（M2）。
 *
 * 这里最有价值的一条是**档位与 token 对账**：`FONT_SIZE_PRESETS` 若与 `--oj-fs-*` 漂开，
 * 用户选中的字号在 `ja` / `compact` 档位下就找不到对应 token，"降一档"会静默失效。
 * 这种漂移在界面上看不出来，只会表现为"日文界面字号不跟着变"。
 */

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const tokenCss = readFileSync(join(repoRoot, 'packages', 'tokens', 'dist', 'index.css'), 'utf8')

test('字号档位与 tokens 的 fs.* 一一对应', () => {
  for (const preset of FONT_SIZE_PRESETS) {
    assert.ok(
      new RegExp(`--oj-fs-${preset}:`).test(tokenCss),
      `档位 ${preset} 在 token 产物里没有 --oj-fs-${preset}`,
    )
  }
})

test('clampNumber 夹取并按精度取整', () => {
  assert.equal(clampNumber(150, { min: 1, max: 999 }), 150)
  assert.equal(clampNumber(0, { min: 1, max: 999 }), 1)
  assert.equal(clampNumber(1e6, { max: 999 }), 999)
  // 精度 1：保留一位小数，且不留浮点尾数
  assert.equal(clampNumber(1.26, { precision: 1 }), 1.3)
  // min > max（配置写反）时以下限为准：宁可显示下限，也不要写回 NaN 或越界值
  assert.equal(clampNumber(5, { min: 10, max: 1 }), 10)
  assert.equal(Number.isNaN(clampNumber(5, { min: 10, max: 1 })), false)
})

test('stepNumber 在边界上不再越界', () => {
  assert.equal(stepNumber(13, 1, { step: 1 }), 14)
  assert.equal(stepNumber(1, -1, { min: 1 }), 1)
  assert.equal(stepNumber(999, 1, { max: 999 }), 999)
  // 值已经在界外（使用方传了脏数据）：点一下减号立刻回到区间内
  assert.equal(stepNumber(5000, -1, { max: 999, step: 2 }), 997)
  assert.equal(stepNumber(0.1, 1, { step: 0.2, precision: 1 }), 0.3)
})

test('parseNumberDraft 只接受明确的数字写法', () => {
  assert.equal(parseNumberDraft('12'), 12)
  assert.equal(parseNumberDraft(' 12 '), 12)
  assert.equal(parseNumberDraft('12px'), 12)
  assert.equal(parseNumberDraft('1.5pt'), 1.5)
  // 欧洲键盘的逗号小数
  assert.equal(parseNumberDraft('1,5'), 1.5)
  assert.equal(parseNumberDraft('-3'), -3)
  assert.equal(parseNumberDraft('+3'), 3)
  for (const bad of ['', '   ', '-', '12abc', '1e3', 'px', '1 2']) {
    assert.equal(parseNumberDraft(bad), undefined, `"${bad}" 不该被接受`)
  }
})

test('roundTo 不留浮点尾数', () => {
  assert.equal(roundTo(0.1 + 0.2, 1), 0.3)
  assert.equal(roundTo(1.005, 2), 1.0)
  assert.equal(roundTo(2.5, 0), 3)
})

test('nearestPreset / stepPreset：手输值先落到最近档位再走一步', () => {
  assert.equal(nearestPreset(FONT_SIZE_PRESETS, 17), 16)
  assert.equal(nearestPreset(FONT_SIZE_PRESETS, 30), 32)
  assert.equal(nearestPreset([], 17), 17)

  assert.equal(stepPreset(FONT_SIZE_PRESETS, 14, 1), 16)
  assert.equal(stepPreset(FONT_SIZE_PRESETS, 14, -1), 13)
  // 顶端不环绕：字号跳到 12 会让用户以为"按到底"了
  assert.equal(stepPreset(FONT_SIZE_PRESETS, 32, 1), 32)
  assert.equal(stepPreset(FONT_SIZE_PRESETS, 12, -1), 12)
  // 不在表里：17 往上走应该是 18（最近 16 之上的下一档），不是 20
  assert.equal(stepPreset(FONT_SIZE_PRESETS, 17, 1), 18)
  assert.equal(stepPreset(FONT_SIZE_PRESETS, 17, -1), 16)
})

test('行距档位与格式化', () => {
  assert.deepEqual([...LINE_SPACING_PRESETS], [1, 1.15, 1.5, 2])
  assert.equal(formatLineSpacing(1), '1')
  assert.equal(formatLineSpacing(1.5), '1.5')
  assert.equal(formatLineSpacing(1.1500000000000001), '1.15')
})
