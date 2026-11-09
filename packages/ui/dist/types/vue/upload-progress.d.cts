import type { PropType } from 'vue';
import type { UploadItem, UploadState } from '../shell/upload.cjs';
/**
 * `OjUploadProgress`（03 §3 F 组）：分片上传的进度列表，带暂停 / 续传 / 失败重试。
 *
 * 三种动作按状态各只出一个按钮，**不做"能用不能用"的灰按钮**：上传中给"暂停"、
 * 已暂停给"续传"、失败给"重试"。灰着的按钮点击无反应，用户只会反复点。
 *
 * 进度条用 `role="progressbar"` + `aria-valuenow`，失败项额外把原因写在下面：
 * 只画一根红条不说明原因，用户唯一能做的就是再点一次重试。
 *
 * 状态文案由宿主给（`statusLabels`）：组件不拼"正在上传 3/5"这类句子。
 */
export declare const OjUploadProgress: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    items: {
        type: PropType<readonly UploadItem[]>;
        required: true;
    };
    /** 整个列表的可访问名（"上传进度"）。 */
    label: {
        type: StringConstructor;
        required: true;
    };
    pauseLabel: {
        type: StringConstructor;
        required: true;
    };
    resumeLabel: {
        type: StringConstructor;
        required: true;
    };
    retryLabel: {
        type: StringConstructor;
        required: true;
    };
    /** 各状态的中文/译文由宿主给；缺的状态就不显示状态文字。 */
    statusLabels: {
        type: PropType<Readonly<Partial<Record<UploadState, string>>>>;
        default: () => {};
    };
    emptyLabel: {
        type: StringConstructor;
        default: string;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}> | null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("pause" | "resume" | "retry")[], "pause" | "resume" | "retry", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    items: {
        type: PropType<readonly UploadItem[]>;
        required: true;
    };
    /** 整个列表的可访问名（"上传进度"）。 */
    label: {
        type: StringConstructor;
        required: true;
    };
    pauseLabel: {
        type: StringConstructor;
        required: true;
    };
    resumeLabel: {
        type: StringConstructor;
        required: true;
    };
    retryLabel: {
        type: StringConstructor;
        required: true;
    };
    /** 各状态的中文/译文由宿主给；缺的状态就不显示状态文字。 */
    statusLabels: {
        type: PropType<Readonly<Partial<Record<UploadState, string>>>>;
        default: () => {};
    };
    emptyLabel: {
        type: StringConstructor;
        default: string;
    };
}>> & Readonly<{
    onPause?: (...args: any[]) => any;
    onResume?: (...args: any[]) => any;
    onRetry?: (...args: any[]) => any;
}>, {
    statusLabels: Readonly<Partial<Record<UploadState, string>>>;
    emptyLabel: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
