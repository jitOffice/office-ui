import type { PropType } from 'vue';
import type { DockState } from '../shell/dock.cjs';
/**
 * `OjDockPanel`（03 §3 D 组）：可停靠 / 浮动 / 收起的侧栏面板（属性面板、AI 任务面板）。
 *
 * 状态全在 `state` 里（受控）：组件只发 `update:state`，自己不记"停在哪、浮在哪"。
 * 理由很实际——面板位置要随会话保存、要跟着预设切换（合同审阅用右栏、写作用左栏），
 * 组件内部再存一份就一定会与宿主的真值分叉。
 *
 * 三条容易做错的：
 *   - **收起后标题栏必须还在**。整个面板隐藏掉，用户就再也找不到展开入口；
 *   - **浮动时按标题栏拖动，按钮不算拖动区**。不排除按钮，点"收起"会顺带把面板拖走几像素；
 *   - **位置夹取在拖动时就做**（`clampFloatRect`），不是松手后。松手才修正等于允许用户把面板
 *     拖出屏幕，然后眼睁睁看它跳回来。
 *
 * 停靠尺寸不归这里管：那是 `OjPaneGroup` 的栏位尺寸，由分隔条调。
 */
export declare const OjDockPanel: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    state: {
        type: PropType<DockState>;
        required: true;
    };
    /** 面板标题，同时作为 region 的可访问名。 */
    title: {
        type: StringConstructor;
        required: true;
    };
    collapseLabel: {
        type: StringConstructor;
        required: true;
    };
    expandLabel: {
        type: StringConstructor;
        required: true;
    };
    /** 浮出按钮的可访问名（"浮动"）。 */
    floatLabel: {
        type: StringConstructor;
        required: true;
    };
    /** 停靠按钮的可访问名（"停靠"）。 */
    dockLabel: {
        type: StringConstructor;
        required: true;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "update:state"[], "update:state", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    state: {
        type: PropType<DockState>;
        required: true;
    };
    /** 面板标题，同时作为 region 的可访问名。 */
    title: {
        type: StringConstructor;
        required: true;
    };
    collapseLabel: {
        type: StringConstructor;
        required: true;
    };
    expandLabel: {
        type: StringConstructor;
        required: true;
    };
    /** 浮出按钮的可访问名（"浮动"）。 */
    floatLabel: {
        type: StringConstructor;
        required: true;
    };
    /** 停靠按钮的可访问名（"停靠"）。 */
    dockLabel: {
        type: StringConstructor;
        required: true;
    };
}>> & Readonly<{
    "onUpdate:state"?: (...args: any[]) => any;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
