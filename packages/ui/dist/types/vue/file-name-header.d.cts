import type { PropType } from 'vue';
import type { FileNameProblem, SaveState } from '../shell/file-name.cjs';
/**
 * `OjFileNameHeader`（03 §3 F 组）：标题栏文件名 + 收藏 + 保存态。
 *
 * 编辑态的三个细节，缺一个都会在实际使用里被吐槽：
 *   - **回车提交、Esc 取消、失焦取消**。失焦即提交是很常见的实现，但它让"点别处"变成一次改名；
 *   - **非法名不退出编辑态**，只在下方给一行原因。退出等于把用户打的名字吞了；
 *   - **未改动视为成功**（`renameFile` 的约定），否则"回车确认一个没改的名字"会报错。
 *
 * 保存态只画三档圆点/文案，文案由使用方给（`stateLabel`）："已保存到云端"这种句子没法由组件拼。
 */
export declare const OjFileNameHeader: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    name: {
        type: StringConstructor;
        required: true;
    };
    state: {
        type: PropType<SaveState>;
        default: string;
    };
    /** 已格式化的保存态文案。 */
    stateLabel: {
        type: StringConstructor;
        default: string;
    };
    /** 重命名入口的可访问名（"重命名文件"）。 */
    renameLabel: {
        type: StringConstructor;
        required: true;
    };
    /** 收藏按钮的可访问名（"收藏"）。 */
    favoriteLabel: {
        type: StringConstructor;
        required: true;
    };
    favored: {
        type: BooleanConstructor;
        default: boolean;
    };
    editable: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** 非法名的原因文案，按种类给（组件不拼句子）。 */
    problemLabels: {
        type: PropType<Readonly<Partial<Record<FileNameProblem, string>>>>;
        default: () => {};
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("rename" | "update:favored")[], "rename" | "update:favored", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    name: {
        type: StringConstructor;
        required: true;
    };
    state: {
        type: PropType<SaveState>;
        default: string;
    };
    /** 已格式化的保存态文案。 */
    stateLabel: {
        type: StringConstructor;
        default: string;
    };
    /** 重命名入口的可访问名（"重命名文件"）。 */
    renameLabel: {
        type: StringConstructor;
        required: true;
    };
    /** 收藏按钮的可访问名（"收藏"）。 */
    favoriteLabel: {
        type: StringConstructor;
        required: true;
    };
    favored: {
        type: BooleanConstructor;
        default: boolean;
    };
    editable: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** 非法名的原因文案，按种类给（组件不拼句子）。 */
    problemLabels: {
        type: PropType<Readonly<Partial<Record<FileNameProblem, string>>>>;
        default: () => {};
    };
}>> & Readonly<{
    onRename?: (...args: any[]) => any;
    "onUpdate:favored"?: (...args: any[]) => any;
}>, {
    state: SaveState;
    stateLabel: string;
    favored: boolean;
    editable: boolean;
    problemLabels: Readonly<Partial<Record<FileNameProblem, string>>>;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
