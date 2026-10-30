/**
 * 命令面板的匹配与排序（prd/03 §3 B 组 `OjCommandPalette`）。
 *
 * 搜索是**排序问题**，不是过滤问题：同一个词往往能命中十几条命令，
 * 决定用户能不能一条回车搞定的是"哪条排第一"。所以这里给的是分数，不是布尔值。
 *
 * 排序优先级（从高到低）：
 *   1. 与查询完全相同；
 *   2. 标签以查询开头；
 *   3. 标签包含查询；
 *   4. 命令 id 包含查询（`format.bold` 搜 `bold` 也能找到）；
 *   5. 说明里包含查询；
 *   6. 标签是查询的**子序列**（`fb` → `Format Bold`，给英文用户的省敲法）。
 * 同分保持注册顺序——命令表的顺序本身是有设计的，不能被一次搜索打乱。
 */
export interface OjPaletteItem {
    id: string;
    label: string;
    description?: string;
    group?: string;
    keys?: string | readonly string[];
    disabled?: boolean;
}
/** 命中返回分数（越大越靠前），不命中返回 `undefined`。空查询一律命中且同分。 */
export declare function paletteScore(item: OjPaletteItem, query: string): number | undefined;
export declare function filterPaletteItems(items: readonly OjPaletteItem[], query: string): OjPaletteItem[];
/** 面板里上下移动高亮。**循环**：在最后一条按 ↓ 应该回到第一条，而不是卡住。 */
export declare function paletteStep(count: number, current: number, delta: number): number;
