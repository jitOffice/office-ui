/**
 * 拖放导入的受理规则（03 §3 F 组 `OjDropZone`）。
 *
 * 规则必须在这里判一次，而不是留给宿主：`drop` 事件给的是"用户松手那一刻的所有文件"，
 * 宿主拿到时已经没有"哪一个被拒了、为什么被拒"的信息。一次拒绝要能说出原因，
 * 否则界面只能沉默——用户会以为拖拽坏了，而不是"这个格式不收"。
 *
 * 匹配顺序：扩展名（`.docx`）→ MIME 通配（`image/*`）→ MIME 精确（`application/pdf`）。
 * 三者都不写表示"什么都收"，这是最常见的默认值（拖一张图进来）。
 */

export interface DropAccept {
  /** 允许的类型：`.docx` / `image/*` / `application/pdf`。不传表示全部接受。 */
  readonly types?: readonly string[]
  /** 是否允许多选，默认 `true`。 */
  readonly multiple?: boolean
}

export type DropRejection = 'type' | 'count'

export interface DroppedFile {
  readonly name: string
  readonly type?: string
}

export interface DropSelection<F extends DroppedFile = DroppedFile> {
  readonly accepted: readonly F[]
  /** 有一条被拒就带上原因；同时命中时以 `type` 优先（"格式不对"比"只能传一个"更根本）。 */
  readonly rejected: DropRejection | undefined
}

/**
 * 一次 `DataTransfer` 携带的是什么（03 §8.9 要求按类型分支）。
 *
 * 三种载荷的处理完全不同：`files` 走上传受理，`html` 走富文本导入，`text` 走纯文本插入。
 * 不分支的后果很具体——从网页拖一段文字进来会被判成"格式不支持的文件"，
 * 而用户看到的提示是"只收 .docx"，方向全错。
 */
export type DropPayloadKind = 'files' | 'html' | 'text' | 'none'

/**
 * 按 `DataTransfer.types` 判断载荷种类。`types` 是**小写**的 MIME 列表，不是文件名。
 *
 * 顺序即优先级：文件优先于富文本，富文本优先于纯文本（前者信息更全）。
 * 同时带 `text/html` 与 `text/plain` 是浏览器对富文本的常规做法，取 html 才不会丢掉格式。
 */
export function classifyTransfer(types: readonly string[]): DropPayloadKind {
  let html = false
  let text = false
  for (const entry of types) {
    const value = entry.trim().toLowerCase()
    if (value === 'files' || value === 'application/x-moz-file') return 'files'
    if (value === 'text/html') html = true
    else if (value === 'text/plain') text = true
  }
  return html ? 'html' : text ? 'text' : 'none'
}

/** 扩展名（小写、带点）。没有扩展名或点在开头（`.gitignore`）时返回空串。 */
export function extensionOf(name: string): string {
  const index = name.lastIndexOf('.')
  if (index <= 0 || index === name.length - 1) return ''
  return name.slice(index).toLowerCase()
}

/** 单个文件是否被受理。`accept.types` 为空/未给时一律受理。 */
export function acceptsFile(file: DroppedFile, accept: DropAccept): boolean {
  const types = accept.types ?? []
  if (types.length === 0) return true
  const extension = extensionOf(file.name)
  const mime = (file.type ?? '').toLowerCase()
  for (const entry of types) {
    const rule = entry.trim().toLowerCase()
    if (rule.length === 0) continue
    if (rule.startsWith('.')) {
      if (extension === rule) return true
      continue
    }
    if (rule.endsWith('/*')) {
      // `image/*` 只比 MIME 前缀。比扩展名会把 "photo.PNG" 这类大小写/别名全漏掉
      if (mime.startsWith(rule.slice(0, -1))) return true
      continue
    }
    if (mime === rule) return true
  }
  return false
}

/**
 * 一次拖放的整体判定。`multiple: false` 时**只收第一个**，其余算数量超限。
 *
 * 不把"多选"当格式错误：这两种拒绝在界面上要给的提示完全不同
 * （"这个格式不支持" vs "一次只能传一个"），混成一条会让用户改错方向。
 */
export function selectDropped<F extends DroppedFile>(
  files: readonly F[],
  accept: DropAccept,
): DropSelection<F> {
  const multiple = accept.multiple !== false
  const accepted: F[] = []
  let rejected: DropRejection | undefined

  for (const file of files) {
    if (!acceptsFile(file, accept)) {
      rejected = 'type'
      continue
    }
    if (!multiple && accepted.length >= 1) {
      if (rejected === undefined) rejected = 'count'
      continue
    }
    accepted.push(file)
  }

  return { accepted, rejected }
}
