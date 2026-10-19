import assert from 'node:assert/strict'
import test from 'node:test'

import {
  HORIZONTAL_RULE_GROUP,
  HORIZONTAL_RULE_MARKDOWN,
  HORIZONTAL_RULE_NAME,
  applyHorizontalRuleInput,
  blockPlain,
  createDocument,
  isHorizontalRuleInput,
  parseHorizontalRuleHTML,
  parseHorizontalRuleMarkdown,
  renderHorizontalRule,
  renderHorizontalRuleMarkdown,
  setHorizontalRule,
} from '../src/index.ts'
import type { OjDocument, OjNode } from '../src/index.ts'

function textDoc(text: string, offset = text.length): OjDocument {
  return createDocument(text).selection
    ? { ...createDocument(text), selection: { kind: 'text', path: [0], offset } }
    : createDocument(text)
}

function labels(doc: OjDocument): string[] {
  return (doc.doc.content ?? []).map((block) => (block.type === 'horizontalRule' ? 'hr' : blockPlain(block)))
}

test('分隔线节点的名字、分组和输入规则与 Tiptap 一致', () => {
  assert.equal(HORIZONTAL_RULE_NAME, 'horizontalRule')
  assert.equal(HORIZONTAL_RULE_GROUP, 'block')
  assert.equal(isHorizontalRuleInput('---'), true)
  assert.equal(isHorizontalRuleInput('\u2014-'), true)
  assert.equal(isHorizontalRuleInput('___ '), true)
  assert.equal(isHorizontalRuleInput('*** '), true)
  assert.equal(isHorizontalRuleInput('***'), false)
  assert.equal(isHorizontalRuleInput('--- '), false)
  assert.equal(isHorizontalRuleInput('--'), false)
})

test('setHorizontalRule 拆开文本，光标进到规则后的文本块', () => {
  const next = setHorizontalRule(textDoc('hello', 3))
  assert.deepEqual(labels(next), ['hel', 'hr', 'lo'])
  assert.deepEqual(next.selection, { kind: 'text', path: [2], offset: 0 })
})

test('文末插入时补 nextNodeType，默认是空段落', () => {
  const next = setHorizontalRule(textDoc('hello'))
  assert.equal(next.doc.content?.[1]?.type, 'horizontalRule')
  assert.equal(next.doc.content?.[2]?.type, 'paragraph')
  assert.equal(blockPlain(next.doc.content?.[2] ?? { type: 'paragraph' }), '')
  assert.deepEqual(next.selection, { kind: 'text', path: [2], offset: 0 })

  const heading = setHorizontalRule(textDoc('hello'), { nextNodeType: 'heading' })
  assert.equal(heading.doc.content?.[2]?.type, 'heading')
  assert.equal(heading.doc.content?.[2]?.attrs?.level, 1)
})

test('段首插入把规则放在段落前面，后面已有块时改为节点选区', () => {
  const before = setHorizontalRule(textDoc('hello', 0))
  assert.equal(before.doc.content?.[0]?.type, 'horizontalRule')
  assert.deepEqual(before.selection, { kind: 'text', path: [1], offset: 0 })

  const table: OjNode = { type: 'table' }
  const doc: OjDocument = {
    doc: {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'a' }] }, table],
    },
    selection: { kind: 'text', path: [0], offset: 1 },
  }
  const after = setHorizontalRule(doc)
  assert.equal(after.doc.content?.[1]?.type, 'horizontalRule')
  assert.equal(after.doc.content?.[2]?.type, 'table')
  assert.deepEqual(after.selection, { kind: 'node', path: [2], offset: 0 })
})

test('节点选区把规则插在选中块之后', () => {
  const doc: OjDocument = {
    doc: {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'a' }] }, { type: 'table' }],
    },
    selection: { kind: 'node', path: [1], offset: 0 },
  }
  const next = setHorizontalRule(doc)
  assert.equal(next.doc.content?.[2]?.type, 'horizontalRule')
  assert.equal(next.doc.content?.[3]?.type, 'paragraph')
  assert.deepEqual(next.selection, { kind: 'text', path: [3], offset: 0 })
})

test('输入规则只在光标位于匹配整段的末尾时替换', () => {
  const replaced = applyHorizontalRuleInput(textDoc('---'))
  assert.equal(replaced?.doc.content?.[0]?.type, 'horizontalRule')
  assert.equal(replaced?.doc.content?.[1]?.type, 'paragraph')
  assert.equal(applyHorizontalRuleInput(textDoc('---x')), null)
  assert.equal(applyHorizontalRuleInput(textDoc('---', 2)), null)
  assert.equal(applyHorizontalRuleInput(textDoc('*** '))?.doc.content?.[0]?.type, 'horizontalRule')
})

test('hr 解析与渲染合并 HTMLAttributes，节点属性覆盖选项', () => {
  const node = parseHorizontalRuleHTML('<hr class="from-tag" />')
  assert.equal(node?.type, 'horizontalRule')
  assert.equal(node?.htmlAttributes.class, 'from-tag')
  assert.equal(parseHorizontalRuleHTML('<div></div>'), null)
  assert.equal(parseHorizontalRuleHTML('<hr onclick="alert(1)">')?.htmlAttributes.onclick, undefined)
  assert.equal(
    renderHorizontalRule(
      { type: 'horizontalRule', htmlAttributes: { class: 'from-node' } },
      { HTMLAttributes: { class: 'from-opt', id: 'rule' } },
    ),
    '<hr class="from-node" id="rule">',
  )
  assert.equal(renderHorizontalRule({ type: 'horizontalRule', htmlAttributes: {} }), '<hr>')
  assert.equal(renderHorizontalRuleMarkdown(), HORIZONTAL_RULE_MARKDOWN)
  assert.equal(parseHorizontalRuleMarkdown('hr'), true)
  assert.equal(parseHorizontalRuleMarkdown('---'), false)
})
