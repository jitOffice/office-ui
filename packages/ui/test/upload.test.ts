/**
 * 上传进度模型（M3：`OjUploadProgress`）。
 *
 * 上传最容易出的事故都在状态迁移上：暂停后进度还在涨、重试从头传、失败原因被清掉、
 * 分片边界对不上导致拼出坏文件。全是纯函数，一行断言一例。
 */

import assert from 'node:assert/strict'
import test from 'node:test'

import {
  advanceUpload,
  createUpload,
  failUpload,
  nextChunk,
  pauseUpload,
  resumeUpload,
  retryUpload,
  startUpload,
  uploadPercent,
  uploadSummary,
} from '../src/index.ts'

const file = (size = 300): ReturnType<typeof createUpload> =>
  createUpload({ id: 'f1', name: '合同.docx', size })

test('建单：非法大小按 0 处理，初始排队且未重试', () => {
  const item = createUpload({ id: 'a', name: 'x', size: Number.NaN })
  assert.equal(item.size, 0)
  assert.equal(item.loaded, 0)
  assert.equal(item.state, 'queued')
  assert.equal(item.attempts, 0)
  // 负数与小数都要归一
  assert.equal(file(100.9).size, 100)
  assert.equal(createUpload({ id: 'b', name: 'y', size: -5 }).size, 0)
})

test('开始：排队/暂停都能开传；已在传、已完成、已失败的重复调用原样返回', () => {
  const queued = file()
  const started = startUpload(queued)
  assert.equal(started.state, 'uploading')
  assert.equal(startUpload(started), started)

  const done = advanceUpload(started, 300)
  assert.equal(done.state, 'done')
  assert.equal(startUpload(done), done)
})

test('推进：只增不减，暂停中到达的分片回报必须丢掉', () => {
  const uploading = startUpload(file())
  assert.equal(advanceUpload(uploading, 120).loaded, 120)
  // 乱序/并发回报的小值不能把进度拉回去
  assert.equal(advanceUpload(advanceUpload(uploading, 120), 80).loaded, 120)
  // 超出总大小按总大小收口，并直接完成
  const finished = advanceUpload(uploading, 9999)
  assert.equal(finished.loaded, 300)
  assert.equal(finished.state, 'done')

  // 暂停期间不再涨：否则界面在"已暂停"上继续走，用户以为暂停没生效
  const paused = pauseUpload(uploading)
  assert.equal(advanceUpload(paused, 200), paused)
  // 同一字节数不产生新对象
  assert.equal(advanceUpload(uploading, 0), uploading)
})

test('暂停 / 续传 / 失败 / 重试：失败保留断点，重试从断点继续', () => {
  const uploading = advanceUpload(startUpload(file()), 200)
  const paused = pauseUpload(uploading)
  assert.equal(paused.state, 'paused')
  // 状态不对时调用无效
  assert.equal(pauseUpload(paused), paused)
  assert.equal(resumeUpload(uploading), uploading)
  assert.equal(resumeUpload(paused).state, 'uploading')

  const failed = failUpload(uploading, '网络中断')
  assert.equal(failed.state, 'failed')
  assert.equal(failed.attempts, 1)
  // 断点必须留着：清掉的话点一次重试就得从头传
  assert.equal(failed.loaded, 200)
  assert.equal(failed.error, '网络中断')

  const retried = retryUpload(failed)
  assert.equal(retried.state, 'uploading')
  assert.equal(retried.loaded, 200)
  assert.equal(retried.error, undefined)
  // 非失败态不能"重试"
  assert.equal(retryUpload(uploading), uploading)
  // 再失败一次，次数继续累加（自动放弃要用）
  assert.equal(failUpload(retried, '还是断').attempts, 2)
})

test('百分比：大小为 0 的项只有"完成没完成"，没有中间态', () => {
  const zero = file(0)
  assert.equal(uploadPercent(zero), 0)
  assert.equal(uploadPercent(advanceUpload(startUpload(zero), 0)), 1)
  assert.equal(uploadPercent(advanceUpload(startUpload(file()), 75)), 0.25)
  // 越界数据也要收口到 [0, 1]
  assert.equal(uploadPercent({ ...file(), loaded: 999 }), 1)
})

test('分片：从当前分片起点重发，不拼半个分片', () => {
  const uploading = advanceUpload(startUpload(file(300)), 120)
  // 120 落在第 1 片中间：整片重发（分片 PUT 幂等）
  assert.deepEqual(nextChunk(uploading, 100), { index: 1, start: 100, end: 200 })
  // 最后一片截到文件尾
  assert.deepEqual(nextChunk({ ...uploading, loaded: 250 }, 100), { index: 2, start: 200, end: 300 })
  // 暂停态仍允许算出"下次从哪发"，方便宿主恢复
  assert.deepEqual(nextChunk(pauseUpload(uploading), 100), { index: 1, start: 100, end: 200 })

  assert.equal(nextChunk(uploading, 0), undefined)
  assert.equal(nextChunk(uploading, Number.NaN), undefined)
  // 分片比文件还大：一片就发完
  assert.deepEqual(nextChunk(uploading, 1000), { index: 0, start: 0, end: 300 })
  // 还没开传的项没有分片可发
  assert.equal(nextChunk(createUpload({ id: 'q', name: 'q', size: 10 }), 4), undefined)
  assert.equal(nextChunk(advanceUpload(startUpload(file(10)), 10), 4), undefined)
})

test('汇总：按状态计数，总大小为 0 时"全完成"才给 100%', () => {
  const items = [
    advanceUpload(startUpload(file(100)), 100),
    failUpload(startUpload(file(100)), '断'),
    pauseUpload(advanceUpload(startUpload(file(100)), 50)),
  ]
  const summary = uploadSummary(items)
  assert.equal(summary.count, 3)
  assert.equal(summary.done, 1)
  assert.equal(summary.failed, 1)
  assert.equal(summary.active, 1)
  assert.equal(summary.loaded, 150)
  assert.equal(summary.size, 300)
  assert.equal(summary.percent, 0.5)

  assert.equal(uploadSummary([]).percent, 0)
  // 空文件全传完 = 100%，否则两个 0 字节文件永远显示 0%
  assert.equal(uploadSummary([advanceUpload(startUpload(file(0)), 0)]).percent, 1)
})
