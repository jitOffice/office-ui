/**
 * 分片上传的进度模型（03 §3 F 组 `OjUploadProgress`）。
 *
 * 上传的每一条状态变更都必须能被**说清楚**：谁在传、传到哪、为什么停、重试了几次。
 * 把这些塞进组件的 `ref` 里，宿主就拿不到"暂停后从哪个字节续传"，只能整包重传。
 *
 * 三条约定：
 *   - **进度只增不减**：`advanceUpload` 收到比当前小的值直接忽略（网络乱序、多分片并发回报）。
 *   - **失败保留已传字节**：`retryUpload` 从 `loaded` 继续，不清零——清零点一下重试就得从头传。
 *   - **分片按字节对齐**：`nextChunk` 从当前分片的起点重发，不拼半个分片。
 *     分片 PUT 是幂等替换，重发比"拼起来"安全得多。
 */
export type UploadState = 'queued' | 'uploading' | 'paused' | 'failed' | 'done';
export interface UploadItem {
    readonly id: string;
    readonly name: string;
    /** 字节数；不可信来源（0、负数、NaN）一律按 0 处理。 */
    readonly size: number;
    /** 已确认的字节数，永远落在 `[0, size]`。 */
    readonly loaded: number;
    readonly state: UploadState;
    /** 失败次数：用来提示"已重试 N 次"，也是自动放弃的依据。 */
    readonly attempts: number;
    readonly error?: string;
}
export interface UploadInput {
    readonly id: string;
    readonly name: string;
    readonly size?: number;
}
export interface UploadChunk {
    readonly index: number;
    readonly start: number;
    /** 开区间：要发送的字节是 `[start, end)`。 */
    readonly end: number;
}
export interface UploadSummary {
    readonly count: number;
    readonly done: number;
    readonly failed: number;
    /** 还没结束的（排队中 + 上传中 + 已暂停）。 */
    readonly active: number;
    readonly loaded: number;
    readonly size: number;
    /** 0..1；总大小为 0 时按"全部结束"给 1，否则给 0。 */
    readonly percent: number;
}
export declare function createUpload(input: UploadInput): UploadItem;
/** 开始上传。已经结束或正在传的项返回原对象，避免宿主重复触发。 */
export declare function startUpload(item: UploadItem): UploadItem;
/**
 * 推进进度。只有 `uploading` 接受推进：暂停期间到达的分片回报必须丢掉，
 * 否则界面会在"已暂停"上继续涨进度，用户以为暂停没生效。
 */
export declare function advanceUpload(item: UploadItem, loaded: number): UploadItem;
export declare function pauseUpload(item: UploadItem): UploadItem;
/** 继续：暂停 → 上传中。失败项要走 `retryUpload`，两者语义不同（一个续传、一个重试）。 */
export declare function resumeUpload(item: UploadItem): UploadItem;
/** 记一次失败。已传字节保留，重试时从断点继续。 */
export declare function failUpload(item: UploadItem, error?: string): UploadItem;
export declare function retryUpload(item: UploadItem): UploadItem;
/** 0..1。大小为 0 的项没有"进度"，只有"完成没完成"。 */
export declare function uploadPercent(item: UploadItem): number;
/**
 * 下一个要发的分片。
 *
 * `start` 取当前分片的起点而不是 `loaded`：半个分片拼不起来，重发整片是幂等的。
 * 非上传态或已传完返回 `undefined`——调用方据此停下发送循环，而不是靠 `0 字节` 判断。
 */
export declare function nextChunk(item: UploadItem, chunkSize: number): UploadChunk | undefined;
export declare function uploadSummary(items: readonly UploadItem[]): UploadSummary;
