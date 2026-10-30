import type { PropType } from 'vue';
import type { GridCell } from '../table-grid.cjs';
export declare const OjTableGridPicker: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    rows: {
        type: NumberConstructor;
        default: number;
    };
    cols: {
        type: NumberConstructor;
        default: number;
    };
    format: {
        type: PropType<(cell: GridCell) => string>;
        default: undefined;
    };
    detailLabel: {
        type: StringConstructor;
        default: string;
    };
    exceedLabel: {
        type: StringConstructor;
        default: string;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("detail" | "select")[], "detail" | "select", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    rows: {
        type: NumberConstructor;
        default: number;
    };
    cols: {
        type: NumberConstructor;
        default: number;
    };
    format: {
        type: PropType<(cell: GridCell) => string>;
        default: undefined;
    };
    detailLabel: {
        type: StringConstructor;
        default: string;
    };
    exceedLabel: {
        type: StringConstructor;
        default: string;
    };
}>> & Readonly<{
    onDetail?: (...args: any[]) => any;
    onSelect?: (...args: any[]) => any;
}>, {
    rows: number;
    cols: number;
    format: (cell: GridCell) => string;
    detailLabel: string;
    exceedLabel: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
