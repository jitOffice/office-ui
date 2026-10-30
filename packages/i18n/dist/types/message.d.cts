/**
 * 消息语法解析与渲染（04 §6.2 规则 5）。
 *
 * 支持三种形态：`{name}` 插值、`{n, plural, one {…} other {…}}`、`{x, select, a {…} other {…}}`，
 * 分支体可再嵌指令，所以是递归下降而不是正则。复数走 `Intl.PluralRules`，不引格式化库。
 *
 * 语法错误在**构造期**抛出而不是渲染期：消息源都是我们自己的语言包，测试会把四份包
 * 全量 parse 一遍，因此线上不可能遇到坏语法；把错误留到渲染期只会变成"界面空白"。
 */
import type { OjMessageValues } from './types.cjs';
export type PluralForm = 'plural' | 'select';
export interface Choice {
    key: string;
    body: MessageNode[];
}
export type MessageNode = {
    kind: 'text';
    value: string;
} | {
    kind: 'count';
} | {
    kind: 'arg';
    name: string;
} | {
    kind: 'select';
    form: PluralForm;
    name: string;
    choices: Choice[];
};
export interface MessageSlot {
    name: string;
    /** `plural` 槽位必须是数字，其余接受字符串或数字。 */
    kind: 'arg' | PluralForm;
}
export declare function parseMessage(source: string): MessageNode[];
/** 供生成器提取每个 key 需要的占位符；嵌套分支里的槽位同样收集。 */
export declare function slotsOf(nodes: MessageNode[], into?: MessageSlot[]): MessageSlot[];
export interface RenderContext {
    values: OjMessageValues | undefined;
    /** 喂给 `Intl.PluralRules` 与 `#` 的 BCP-47 标签。 */
    intl: string;
    /** 只用于告警定位。 */
    key: string;
    dev?: boolean;
}
export declare function render(nodes: MessageNode[], ctx: RenderContext): string;
