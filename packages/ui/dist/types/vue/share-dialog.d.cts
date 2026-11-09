import type { PropType } from 'vue';
import type { ShareRole, ShareScope, ShareState } from '../shell/share.cjs';
export interface ShareExpiryOption {
    readonly days: number;
    readonly label: string;
}
/**
 * `OjShareDialog`（03 §3 E 组）：共享范围 + 角色 + 链接有效期。
 *
 * 只负责把选择变成 `update:state`，确认时上抛 **归一化后的** `resolveShare(state)`——
 * 也就是真正该发给后端的权限。界面显示"可评论"而请求里发"可编辑"这类事故，
 * 根因就是两处各算一遍；这里只算一次。
 *
 * 范围切换时角色会降级（链接范围不给"可编辑"，见 `shell/share.ts`）：
 * 降级发生在 `update:state` 里，不是渲染时偷偷改，宿主存下来的状态与界面永远一致。
 */
export declare const OjShareDialog: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    open: {
        type: BooleanConstructor;
        required: true;
    };
    title: {
        type: StringConstructor;
        required: true;
    };
    state: {
        type: PropType<ShareState>;
        required: true;
    };
    /** "谁可以访问"分组名。 */
    scopeLabel: {
        type: StringConstructor;
        required: true;
    };
    /** "权限"分组名。 */
    roleLabel: {
        type: StringConstructor;
        required: true;
    };
    scopeLabels: {
        type: PropType<Record<ShareScope, string>>;
        required: true;
    };
    roleLabels: {
        type: PropType<Record<ShareRole, string>>;
        required: true;
    };
    expiryLabel: {
        type: StringConstructor;
        default: string;
    };
    expiryOptions: {
        type: PropType<readonly ShareExpiryOption[]>;
        default: () => never[];
    };
    peopleLabel: {
        type: StringConstructor;
        default: string;
    };
    confirmLabel: {
        type: StringConstructor;
        default: string;
    };
    cancelLabel: {
        type: StringConstructor;
        default: string;
    };
    teleport: {
        type: (BooleanConstructor | StringConstructor)[];
        default: string;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("cancel" | "confirm" | "update:open" | "update:state")[], "cancel" | "confirm" | "update:open" | "update:state", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    open: {
        type: BooleanConstructor;
        required: true;
    };
    title: {
        type: StringConstructor;
        required: true;
    };
    state: {
        type: PropType<ShareState>;
        required: true;
    };
    /** "谁可以访问"分组名。 */
    scopeLabel: {
        type: StringConstructor;
        required: true;
    };
    /** "权限"分组名。 */
    roleLabel: {
        type: StringConstructor;
        required: true;
    };
    scopeLabels: {
        type: PropType<Record<ShareScope, string>>;
        required: true;
    };
    roleLabels: {
        type: PropType<Record<ShareRole, string>>;
        required: true;
    };
    expiryLabel: {
        type: StringConstructor;
        default: string;
    };
    expiryOptions: {
        type: PropType<readonly ShareExpiryOption[]>;
        default: () => never[];
    };
    peopleLabel: {
        type: StringConstructor;
        default: string;
    };
    confirmLabel: {
        type: StringConstructor;
        default: string;
    };
    cancelLabel: {
        type: StringConstructor;
        default: string;
    };
    teleport: {
        type: (BooleanConstructor | StringConstructor)[];
        default: string;
    };
}>> & Readonly<{
    onCancel?: (...args: any[]) => any;
    onConfirm?: (...args: any[]) => any;
    "onUpdate:open"?: (...args: any[]) => any;
    "onUpdate:state"?: (...args: any[]) => any;
}>, {
    expiryLabel: string;
    expiryOptions: readonly ShareExpiryOption[];
    peopleLabel: string;
    confirmLabel: string;
    cancelLabel: string;
    teleport: string | boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
