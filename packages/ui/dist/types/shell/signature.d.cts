/** 签名笔迹。组件只负责把指针坐标追加进来，路径在这里生成。 */
export interface SignaturePoint {
    x: number;
    y: number;
}
export interface SignatureStroke {
    points: SignaturePoint[];
}
export declare function startStroke(strokes: readonly SignatureStroke[], point: SignaturePoint): SignatureStroke[];
export declare function extendStroke(strokes: readonly SignatureStroke[], point: SignaturePoint): SignatureStroke[];
export declare function strokePath(stroke: SignatureStroke): string;
