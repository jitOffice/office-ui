import assert from 'node:assert/strict'
import test from 'node:test'

import {
  applyNodeInput,
  blockPlain,
  createDocument,
  matchNodeInput,
  nodeExtension,
  setHardBreak,
  starterNodes,
  toggleBlockquote,
  toggleBulletList,
  toggleCodeBlock,
  toggleHeading,
  toggleOrderedList,
} from '../src/index.ts'

test('StarterKit 节点用同一套扩展形状', () => {
  const names = starterNodes.map((node) => node.name)
  assert.deepEqual(names, [
    'doc',
    'paragraph',
    'text',
    'heading',
    'blockquote',
    'bulletList',
    'orderedList',
    'listItem',
    'codeBlock',
    'hardBreak',
    'horizontalRule',
    'image',
  ])
  const heading = nodeExtension('heading')
  assert.equal(heading?.group, 'block')
  assert.equal(heading?.content, 'inline*')
  assert.equal(heading?.commands.includes('toggleHeading'), true)
  assert.equal(heading?.shortcuts['Mod-Alt-1'], 'toggleHeading')
  assert.equal(nodeExtension('bulletList')?.shortcuts['Mod-Shift-8'], 'toggleBulletList')
  assert.equal(nodeExtension('hardBreak')?.atom, true)
  assert.equal(nodeExtension('hardBreak')?.parseHTML[0]?.tag, 'br')
})

test('输入规则识别标题、列表、引用、代码块和分隔线', () => {
  assert.equal(matchNodeInput('# ')?.level, 1)
  assert.equal(matchNodeInput('### ')?.level, 3)
  assert.equal(matchNodeInput('- ')?.node, 'bulletList')
  assert.equal(matchNodeInput('1. ')?.node, 'orderedList')
  assert.equal(matchNodeInput('> ')?.node, 'blockquote')
  assert.equal(matchNodeInput('```js\n')?.node, 'codeBlock')
  assert.equal(matchNodeInput('---')?.node, 'horizontalRule')
  assert.equal(matchNodeInput('hello'), null)
})

test('标题、引用、列表和代码块可以来回切换', () => {
  const heading = toggleHeading(createDocument('标题'), 1)
  assert.equal(heading.doc.content?.[0]?.type, 'heading')
  assert.equal(heading.doc.content?.[0]?.attrs?.level, 1)
  assert.equal(toggleHeading(heading, 1).doc.content?.[0]?.type, 'paragraph')

  const quote = toggleBlockquote(createDocument('引用'))
  assert.equal(quote.doc.content?.[0]?.type, 'blockquote')
  assert.equal(quote.doc.content?.[0]?.content?.[0]?.type, 'paragraph')
  assert.equal(toggleBlockquote(quote).doc.content?.[0]?.type, 'paragraph')

  const list = toggleBulletList(createDocument('一项'))
  assert.equal(list.doc.content?.[0]?.type, 'bulletList')
  assert.equal(list.selection.path.join('.'), '0.0.0')
  const ordered = toggleOrderedList(list)
  assert.equal(ordered.doc.content?.[0]?.type, 'orderedList')
  assert.equal(toggleOrderedList(ordered).doc.content?.[0]?.type, 'paragraph')

  const code = toggleCodeBlock(createDocument('const a = 1'))
  assert.equal(code.doc.content?.[0]?.type, 'codeBlock')
  assert.equal(blockPlain(code.doc.content?.[0] ?? { type: 'codeBlock' }), 'const a = 1')
})

test('硬换行插在光标处，输入规则会吃掉标记', () => {
  const broken = setHardBreak(createDocument('hello'))
  const content = broken.doc.content?.[0]?.content ?? []
  assert.deepEqual(
    content.map((node) => node.type),
    ['text', 'hardBreak'],
  )

  const heading = applyNodeInput({ ...createDocument('# '), selection: { kind: 'text', path: [0], offset: 2 } })
  assert.equal(heading?.doc.content?.[0]?.type, 'heading')
  assert.equal(heading?.doc.content?.[0]?.attrs?.level, 1)
  assert.equal(blockPlain(heading?.doc.content?.[0] ?? { type: 'heading' }), '')

  const bullets = applyNodeInput({ ...createDocument('- '), selection: { kind: 'text', path: [0], offset: 2 } })
  assert.equal(bullets?.doc.content?.[0]?.type, 'bulletList')
  assert.equal(applyNodeInput(createDocument('hello')), null)
})
