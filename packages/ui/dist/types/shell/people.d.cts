/**
 * "人"的最小模型（03 §3 E 组：批注作者、协同头像、修订作者共用）。
 *
 * 三处界面都要显示同一个人，但**不共用同一个"用户对象"**：批注里历史作者是快照（改名后旧批注仍显示旧名），
 * 协同头像显示的是当前状态。所以这里只定义形状，不定义"从哪儿来"。
 *
 * 头像上的字是**由姓名派生的**，不允许传进来：一旦允许调色板/首字母从外部传，
 * 同一个用户在批注区与头像区就会显示成两种颜色——而这类不一致没人会当成 bug 报，只会觉得"乱"。
 */
export interface OjPerson {
    readonly id: string;
    readonly name: string;
    /** 显式色板序号（0–7）。不给就按 `id` 派生，保证同一人处处同色。 */
    readonly tone?: number;
}
/**
 * 头像色板档数：4 档（品牌 / 成功 / 警告 / 危险四组"浅底 + 同色字"）。
 *
 * 不按色阶（`--oj-brand-3..9`）取 8 档：色阶在暗色主题里是**反向**的
 * （浅色下 brand-3 是浅蓝、暗色下 brand-3 是深蓝），"浅底 + 深字"的配对会整体翻转，
 * 于是同一套规则在暗色下变成"深底 + 深字"。用语义色（`--oj-bg-*-subtle` / `--oj-text-*`）
 * 让主题自己保证对比度，代价是只有 4 档——4 档足够区分同桌的几个人。
 */
export declare const AVATAR_TONES = 4;
export declare function initialsOf(name: string): string;
/**
 * 色板序号：稳定哈希，同一 `id` 永远同一档。
 *
 * 不用 `charCodeAt(0)` 取模：`user-1`/`user-2`… 这类 id 的首字符全一样，会全部撞到同一档；
 * djb2 变体对"前缀相同、尾号不同"的 id 分布足够散。
 */
export declare function avatarTone(person: OjPerson): number;
/** 堆叠后的结果：能直接画的那几个 + 折叠掉的人数。 */
export interface StackedPeople {
    readonly visible: readonly OjPerson[];
    readonly overflow: number;
}
/**
 * 头像堆叠：超过 `max` 个就折叠，**折叠数不含"更多"按钮自身**（按钮显示 `overflow` 个人）。
 *
 * `max` 为 0 时返回空 + 全折叠：调用方据此在窄侧栏里把整组隐藏掉，而不是渲染一个 `+5` 再也没地方展开。
 * `max` 非整数或负数按 0 处理——`max` 常常来自"容器宽度算出来的档数"，算错时应该什么都不画，而不是画非整数个。
 */
export declare function stackPeople(people: readonly OjPerson[], max: number): StackedPeople;
