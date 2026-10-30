/**
 * 快捷键层（prd/03 §3 B 组 `OjHotkey`）。
 *
 * 注册表里的 `keys` 只写 `'mod+b'` 这种**平台无关**的写法（见 `@jitoffice/shared` 的
 * `OjKeyBinding`），`mod` 到底是 Ctrl 还是 Cmd，由这一层决定。所以这里必须框架无关、
 * 不碰 DOM：平台推断、解析、匹配、显示、冲突检测，五件事都能在 `node --test` 里钉死。
 *
 * 三个容易写错的地方：
 *   1. **匹配要严格等于**。`Ctrl+B` 不能顺带响应 `Ctrl+Shift+B`——宽松匹配会让
 *      "加粗"和"清除格式"互抢，且用户无从判断为什么按这个键会触发那个命令。
 *   2. **`mod` 按平台展开，而不是按事件猜**。看事件里有没有 metaKey 来决定匹配哪个，
 *      会把 Windows 键盘上的 Win 键也算成 mod。
 *   3. **显示顺序是 Apple HIG 的顺序**：⌃⌥⇧⌘ + 主键；Windows 侧是 Ctrl+Alt+Shift。
 */
export type OjPlatform = 'mac' | 'win' | 'linux';
export interface OjHotkeySpec {
    /** 规范化后的主键：小写，`' '` → `space`、`esc` → `escape`、`up` → `arrowup` */
    key: string;
    ctrl: boolean;
    alt: boolean;
    shift: boolean;
    meta: boolean;
}
/** 与 `KeyboardEvent` 结构对齐，但只取匹配需要的那几个字段，Node 里传个对象就能测。 */
export interface OjKeyEventLike {
    key: string;
    ctrlKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
    metaKey: boolean;
}
export interface OjHotkeyBinding {
    id: string;
    keys?: string | readonly string[];
}
export interface OjHotkeyConflict {
    /** 冲突的规范化写法，例如 `Ctrl+B` */
    label: string;
    ids: string[];
}
export declare function normalizeKey(raw: string): string;
/** 平台推断只看字符串，方便测试。空串按 linux 处理（最保守的一档）。 */
export declare function platformFrom(source: string): OjPlatform;
/** 运行时平台。拿不到 `navigator` 时按 linux——宁可显示 Ctrl，也不要显示一个假 ⌘。 */
export declare function detectPlatform(): OjPlatform;
/**
 * 解析 `'mod+shift+z'`。坏绑定一律返回 `undefined`，不抛异常：
 * 命令表是数据，一条写错不应该把整个应用带崩。
 */
export declare function parseHotkey(binding: string, platform: OjPlatform): OjHotkeySpec | undefined;
/** 严格匹配：修饰键多一个、少一个都不算命中。 */
export declare function matchHotkey(spec: OjHotkeySpec, event: OjKeyEventLike): boolean;
/** 显示用文案：mac 用符号且不加 `+`，Windows/Linux 用 `Ctrl+Shift+Z` 这种写法。 */
export declare function formatHotkey(binding: string, platform: OjPlatform): string;
/**
 * 冲突检测。同一个命令把同一条快捷键写两遍不算冲突——冲突是**两个命令抢一个键**，
 * 报出来的第一条就是"后注册的把先注册的盖掉了"。
 */
export declare function hotkeyConflicts(bindings: readonly OjHotkeyBinding[], platform: OjPlatform): OjHotkeyConflict[];
