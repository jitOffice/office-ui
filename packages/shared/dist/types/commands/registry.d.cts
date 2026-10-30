/**
 * 命令注册表：全库唯一的事实源（03 §1）。
 *
 * UI 组件不持有行为，只渲染命令。因此这里必须同时做到三件事：
 *  1. 不依赖任何框架 —— Vue 组件、jQuery 页面、Node 服务端读同一张表；
 *  2. 求值昂贵时不可击穿 —— 合帧 + 记忆化 + 脏检查，否则拖选长文档会掉帧；
 *  3. 只反映真相 —— 注册表自己不持有 `active`，`run()` 抛错也不得留下半程状态。
 */
import type { OjCommandRegistry, OjCommandRegistryOptions } from './types.cjs';
export declare function createCommandRegistry<C = unknown>(options?: OjCommandRegistryOptions<C>): OjCommandRegistry<C>;
