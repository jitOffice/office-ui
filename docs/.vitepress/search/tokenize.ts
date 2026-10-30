/**
 * 文档站搜索的分词器（04 §4）。
 *
 * 为什么要自己写：MiniSearch 的默认分词按空格切，中文文档里"表格选择器"是**一个不帶空格的词**，
 * 搜"表格"命中不了它——这是中文组件文档搜索最常见的失效方式。bigram 切分（"表格 格选 选择 择器"）
 * 不需要词典、不需要 wasm 分词器，索引体积约增 40%，换来的"搜得到"是这笔交易里最划算的部分。
 *
 * 三个必须一起做的归一化，否则用户输入和索引对不上：
 *   1. **驼峰拆词**：`OjCommandButton` 也要能被 `button` 搜到（PRD 要求"按钮 / button / OjButton"三写法命中）。
 *   2. **NFKC**：全角数字与半角假名统一（`１０` → `10`、`ﾌｧｲﾙ` → `ファイル`）。
 *   3. **长音折叠**：`サーバー` 与 `サーバ` 是同一个词，用户两种都会打；只索引原样会让一半查询落空。
 *
 * 零依赖、不碰 DOM：因此它能在 `node --test` 里被直接钉死，而不是靠"搜搜看"。
 */

const CJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/

export function isCJKChar(char: string): boolean {
  return CJK.test(char)
}

/** 驼峰/下划线/全角统一成"分词友好"的形态，但不改变长度语义（只插空格、不做删除）。 */
function normalize(input: string): string {
  return input
    // `OjCommandButton` → `Oj Command Button`；`oj-icon` 靠后面的拉丁词正则整段保留
    .replace(/(\p{Ll})(\p{Lu})/gu, '$1 $2')
    .normalize('NFKC')
    .toLowerCase()
}

/** 有意义的 bigram：单字 + 相邻两字。单字也进索引，否则搜"表"命中不了"表格"。 */
function pushRun(run: readonly string[], push: (token: string) => void): void {
  for (const char of run) push(char)
  for (let index = 0; index + 1 < run.length; index += 1) push(`${run[index]}${run[index + 1]}`)
}

/**
 * 分词。返回去重后的 token 序列（顺序稳定，便于快照）。
 *
 * 注意 `text` 里可能出现混合语言（"OjRibbon 功能区"）：拉丁段与 CJK 段各走各的规则，
 * 不互相截断。
 */
export function tokenizeCJK(input: string): string[] {
  const text = normalize(input)
  const tokens: string[] = []
  const seen = new Set<string>()
  const push = (token: string): void => {
    if (token.length === 0 || seen.has(token)) return
    seen.add(token)
    tokens.push(token)
  }

  // 拉丁/数字词：`oj-command-button` 既整体进索引，也拆成 oj / command / button
  for (const match of text.matchAll(/[a-z0-9]+(?:[._-][a-z0-9]+)*/g)) {
    const word = match[0]
    push(word)
    if (/[._-]/.test(word)) for (const part of word.split(/[._-]+/)) push(part)
  }

  const chars = [...text]
  for (let index = 0; index < chars.length; index += 1) {
    if (!isCJKChar(chars[index] as string)) continue
    let end = index
    while (end < chars.length && isCJKChar(chars[end] as string)) end += 1
    const run = chars.slice(index, end)
    pushRun(run, push)

    // 长音折叠：只去掉**尾部**的 `ー`（`サーバー` → `サーバ`）。
    // 去掉所有 `ー` 会把 `コーヒー` 变成 `コヒ`，那是另一个词。
    const folded = [...run]
    while (folded.length > 0 && folded[folded.length - 1] === 'ー') folded.pop()
    if (folded.length !== run.length) pushRun(folded, push)

    index = end - 1
  }

  return tokens
}
