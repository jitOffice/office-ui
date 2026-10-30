import type { PropType } from 'vue';
import type { OjIconName } from './generated/icons.ts';
/**
 * `markup` 由生成器以字面量传入，**不要**改成在运行时查常量表：
 * 那会让每枚图标都拖上整张表（实测从 ~0.4 kB 涨到 2.15 kB，直接顶穿 1 KB 阈值）。
 */
export declare function createIconComponent(name: OjIconName, componentName: string, markup: string): import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    size: {
        type: (NumberConstructor | StringConstructor)[];
        default: undefined;
    };
    label: {
        type: PropType<string | undefined>;
        default: undefined;
    };
    decorative: {
        type: BooleanConstructor;
        default: boolean;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    size: {
        type: (NumberConstructor | StringConstructor)[];
        default: undefined;
    };
    label: {
        type: PropType<string | undefined>;
        default: undefined;
    };
    decorative: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & Readonly<{}>, {
    size: string | number;
    label: string | undefined;
    decorative: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
