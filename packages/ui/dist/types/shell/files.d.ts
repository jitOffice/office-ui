/** 嵌套文件树。空查询返回原树；文件夹名命中时保留其全部子节点。 */
export interface FileNode {
    id: string;
    name: string;
    kind: 'folder' | 'file';
    children?: readonly FileNode[];
}
export declare function filterTree(nodes: readonly FileNode[], query: string): FileNode[];
export declare function toggleId(open: readonly string[], id: string): string[];
