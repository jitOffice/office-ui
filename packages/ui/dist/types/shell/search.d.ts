/** 查找替换。命中按原文下标返回，替换不改命中以外的字符。 */
export interface SearchQuery {
    find: string;
    replace: string;
    matchCase: boolean;
}
export interface SearchHit {
    start: number;
    end: number;
}
export declare function searchHits(text: string, query: SearchQuery): SearchHit[];
export declare function replaceOne(text: string, hit: SearchHit, replacement: string): string;
export declare function replaceAll(text: string, query: SearchQuery): {
    text: string;
    count: number;
};
/** 没有命中时返回 -1。 */
export declare function neighbor(index: number, count: number, direction: 1 | -1): number;
