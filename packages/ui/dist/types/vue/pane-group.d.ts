import type { PropType } from 'vue';
import type { PaneSpec } from '../shell/splitter.ts';
/**
 * `OjPaneGroup`（03 §3 D 组）：按声明排布多栏，并在栏之间插分隔条。
 *
 * 只做三件组件里最容易写错的事，其余交给宿主：
 *   - **哪根条子调哪一栏**由 `paneSplitter()` 决定——永远调固定宽的那一栏。
 *     可伸缩栏的尺寸是"剩下的空间"，让它当被调对象就会出现"拖完跳回原处"。
 *   - **栏位用命名插槽**（`#<id>`），不用默认插槽：默认插槽会把同一段内容画进每一栏，
 *     而多栏布局里每栏内容必然不同，复制出来的 DOM 只会让宿主以为组件坏了。
 *   - **不自己存尺寸**。`update:size` 带栏位 id 上抛，宿主回写 `panes`；否则拖拽与
 *     外部改布局（切换预设、恢复会话）会各存一份，谁赢取决于时序。
 *
 * 布局只用 flex：固定栏 `flex: 0 0 auto` + 宽/高，可伸缩栏 `flex: 1 1 0`。
 * 全部用 `width: calc(...)` 之类的表达式反而会在收起时算不清最小宽度。
 */
export declare const OjPaneGroup: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    panes: {
        type: PropType<readonly PaneSpec[]>;
        required: true;
    };
    orientation: {
        type: PropType<'vertical' | 'horizontal'>;
        default: string;
    };
    /** 分隔条的兜底可访问名；栏位自己给了 `label` 时优先用栏位的。 */
    label: {
        type: StringConstructor;
        required: true;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "update:size"[], "update:size", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    panes: {
        type: PropType<readonly PaneSpec[]>;
        required: true;
    };
    orientation: {
        type: PropType<'vertical' | 'horizontal'>;
        default: string;
    };
    /** 分隔条的兜底可访问名；栏位自己给了 `label` 时优先用栏位的。 */
    label: {
        type: StringConstructor;
        required: true;
    };
}>> & Readonly<{
    "onUpdate:size"?: (...args: any[]) => any;
}>, {
    orientation: "horizontal" | "vertical";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
