import type { PropType } from 'vue';
import type { OjPerson } from '../shell/people.ts';
/**
 * `OjPresenceAvatars`（03 §3 E 组）：协同在场头像堆叠。
 *
 * 三个决定：
 *   1. **颜色与首字母由 `id` 与姓名派生**，不接受外部传色板：同一人在批注区和标题栏必须是同一个颜色，
 *      允许外部指定就一定有两处不一致的那天。
 *   2. **"还有 N 人"是按钮而不是一段文字**：它是唯一能展开完整名单的入口，
 *      做成 `<span>` 就等于这批人永远看不到（03 §5 的可达性底线）。
 *   3. **堆叠数由 `max` 决定，不做 CSS 自动折行**：折行会让参与人数改变标题栏高度，
 *      标题栏一抖，下面的文档就跟着跳。
 */
export declare const OjPresenceAvatars: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    people: {
        type: PropType<readonly OjPerson[]>;
        required: true;
    };
    /** 最多显示几格（含"更多"按钮）。给 0 表示这个位置放不下，整组不画。 */
    max: {
        type: NumberConstructor;
        default: number;
    };
    /** 整组的可访问名（"当前在线的协作者"）。 */
    label: {
        type: StringConstructor;
        required: true;
    };
    /** 已格式化的"还有 N 人"文案；不给时按钮上只显示 `+N`。 */
    overflowLabel: {
        type: StringConstructor;
        default: string;
    };
    /** 溢出按钮的提示（"查看全部协作者"）。 */
    overflowTitle: {
        type: StringConstructor;
        default: string;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}> | null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("overflow" | "select")[], "overflow" | "select", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    people: {
        type: PropType<readonly OjPerson[]>;
        required: true;
    };
    /** 最多显示几格（含"更多"按钮）。给 0 表示这个位置放不下，整组不画。 */
    max: {
        type: NumberConstructor;
        default: number;
    };
    /** 整组的可访问名（"当前在线的协作者"）。 */
    label: {
        type: StringConstructor;
        required: true;
    };
    /** 已格式化的"还有 N 人"文案；不给时按钮上只显示 `+N`。 */
    overflowLabel: {
        type: StringConstructor;
        default: string;
    };
    /** 溢出按钮的提示（"查看全部协作者"）。 */
    overflowTitle: {
        type: StringConstructor;
        default: string;
    };
}>> & Readonly<{
    onOverflow?: (...args: any[]) => any;
    onSelect?: (...args: any[]) => any;
}>, {
    max: number;
    overflowLabel: string;
    overflowTitle: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
