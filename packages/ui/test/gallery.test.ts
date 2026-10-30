import assert from 'node:assert/strict'
import test from 'node:test'

import { galleryNeighbor } from '../src/index.ts'

/**
 * 网格陈列的方向键（03 §3 B 组 `OjRibbonGallery`）。
 *
 * 重点是最后一行不满的情况：按下键不能跳到不存在的格子，也不能被"按行号算"算出负下标。
 */

test('单行内左右移动，到头就停住', () => {
  assert.equal(galleryNeighbor(4, 6, 0, 'ArrowRight'), 1)
  assert.equal(galleryNeighbor(4, 6, 0, 'ArrowLeft'), 0)
  assert.equal(galleryNeighbor(4, 6, 5, 'ArrowRight'), 5)
})

test('上下按整行跳，最后一行不满也不越界', () => {
  // 6 格、4 列：第二行只有 4、5 两格
  assert.equal(galleryNeighbor(4, 6, 0, 'ArrowDown'), 4)
  assert.equal(galleryNeighbor(4, 6, 4, 'ArrowDown'), 5)
  assert.equal(galleryNeighbor(4, 6, 5, 'ArrowDown'), 5)
  assert.equal(galleryNeighbor(4, 6, 4, 'ArrowUp'), 0)
  assert.equal(galleryNeighbor(4, 6, 1, 'ArrowUp'), 0)
})

test('Home / End 跳到两端；其他键原地不动', () => {
  assert.equal(galleryNeighbor(4, 6, 3, 'Home'), 0)
  assert.equal(galleryNeighbor(4, 6, 1, 'End'), 5)
  assert.equal(galleryNeighbor(4, 6, 2, 'Enter'), 2)
  assert.equal(galleryNeighbor(4, 6, 2, 'a'), 2)
})

test('列数与下标都夹取：坏输入不产生不存在的下标', () => {
  assert.equal(galleryNeighbor(0, 6, 2, 'ArrowDown'), 3)
  assert.equal(galleryNeighbor(-3, 6, 2, 'ArrowDown'), 3)
  assert.equal(galleryNeighbor(Number.NaN, 6, 2, 'ArrowDown'), 3)
  assert.equal(galleryNeighbor(4, 6, 99, 'ArrowLeft'), 4)
  assert.equal(galleryNeighbor(4, 6, -5, 'ArrowRight'), 1)
  assert.equal(galleryNeighbor(4, 0, 0, 'ArrowRight'), 0)
})
