import type { PropType } from 'vue';
import type { OjMenuItem } from '../menu.ts';
/**
 * `OjContextMenu`（03 §3 B 组）。
 *
 * 关键差异在**没有 DOM 锚点**：文档里选中文字、表格里点了右键、canvas 上按了 `contextmenu`，
 * 锚点只是一个坐标。所以定位走 `OjPopper` 的 `anchorBox`（零尺寸矩形），
 * 不依赖任何元素，也就不需要"先找一个元素再量"的那套。
 *
 * 键盘模型（03 §5）：菜单一开就把焦点放到第一个可选项，上下键**环绕**、Home/End 跳首尾、
 * Enter/空格执行、Esc/Tab 关闭。焦点是真的落在 `<button role="menuitem">` 上（roving tabindex），
 * 不是靠 `aria-activedescendant`——后者在 Office 这种"菜单里还嵌选择器"的场景里更容易漏更新。
 *
 * 关闭时把焦点**还给打开前的位置**：canvas 场景下它可能只是 body（那就别抢），
 * 但在输入框上右键的菜单，关掉之后用户还得接着打字。
 */
export declare const OjContextMenu: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    open: {
        type: BooleanConstructor;
        required: true;
    };
    items: {
        type: PropType<readonly OjMenuItem[]>;
        required: true;
    };
    /** 视口坐标（`clientX` / `clientY` 直接给，不要减滚动量） */
    x: {
        type: NumberConstructor;
        default: number;
    };
    y: {
        type: NumberConstructor;
        default: number;
    };
    /** `'body' | '#selector' | false`（03 §2「弹层归属」） */
    teleport: {
        type: (BooleanConstructor | StringConstructor)[];
        default: string;
    };
    label: {
        type: PropType<string | undefined>;
        default: undefined;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}> | null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("close" | "select" | "update:open")[], "close" | "select" | "update:open", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    open: {
        type: BooleanConstructor;
        required: true;
    };
    items: {
        type: PropType<readonly OjMenuItem[]>;
        required: true;
    };
    /** 视口坐标（`clientX` / `clientY` 直接给，不要减滚动量） */
    x: {
        type: NumberConstructor;
        default: number;
    };
    y: {
        type: NumberConstructor;
        default: number;
    };
    /** `'body' | '#selector' | false`（03 §2「弹层归属」） */
    teleport: {
        type: (BooleanConstructor | StringConstructor)[];
        default: string;
    };
    label: {
        type: PropType<string | undefined>;
        default: undefined;
    };
}>> & Readonly<{
    onClose?: (...args: any[]) => any;
    onSelect?: (...args: any[]) => any;
    "onUpdate:open"?: (...args: any[]) => any;
}>, {
    x: number;
    y: number;
    teleport: string | boolean;
    label: string | undefined;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
