/**
 * `OjNumberField`（03 §3）：无单位/带单位的数值输入。
 *
 * 输入过程**不重渲染**：`draft` 刻意是普通变量而不是 `ref`。绑成 `ref` 后每敲一个字符就会
 * 用 `props.modelValue` 重算 value，光标跳到末尾——这是受控输入最经典的那个坑。
 * 提交时机只有三个：失焦、回车、步进按钮。
 *
 * 步进按钮与方向键都走 `stepNumber`（夹取 + 精度），所以"在 1 上按减号"不会变成 0。
 */
export declare const OjNumberField: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    modelValue: {
        type: NumberConstructor;
        required: true;
    };
    min: {
        type: NumberConstructor;
        default: undefined;
    };
    max: {
        type: NumberConstructor;
        default: undefined;
    };
    step: {
        type: NumberConstructor;
        default: number;
    };
    precision: {
        type: NumberConstructor;
        default: number;
    };
    /** 输入框的可访问名。按钮另有自己的标签，不共用。 */
    label: {
        type: StringConstructor;
        required: true;
    };
    decreaseLabel: {
        type: StringConstructor;
        required: true;
    };
    increaseLabel: {
        type: StringConstructor;
        required: true;
    };
    suffix: {
        type: StringConstructor;
        default: string;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "update:modelValue"[], "update:modelValue", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    modelValue: {
        type: NumberConstructor;
        required: true;
    };
    min: {
        type: NumberConstructor;
        default: undefined;
    };
    max: {
        type: NumberConstructor;
        default: undefined;
    };
    step: {
        type: NumberConstructor;
        default: number;
    };
    precision: {
        type: NumberConstructor;
        default: number;
    };
    /** 输入框的可访问名。按钮另有自己的标签，不共用。 */
    label: {
        type: StringConstructor;
        required: true;
    };
    decreaseLabel: {
        type: StringConstructor;
        required: true;
    };
    increaseLabel: {
        type: StringConstructor;
        required: true;
    };
    suffix: {
        type: StringConstructor;
        default: string;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & Readonly<{
    "onUpdate:modelValue"?: (...args: any[]) => any;
}>, {
    min: number;
    max: number;
    step: number;
    precision: number;
    suffix: string;
    disabled: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
