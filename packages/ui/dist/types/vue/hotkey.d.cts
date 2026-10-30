import type { PropType } from 'vue';
import type { OjHotkeyBinding, OjPlatform } from '../hotkey.cjs';
/**
 * `OjHotkey`（03 §3 B 组）：把命令表里的 `keys` 绑到真实键盘事件上。渲染 `null`，
 * 只负责监听、匹配、发事件——执行由使用方交给命令注册表（`registry.run(id)`）。
 *
 * 三条必须在这里做对的语义：
 *   1. **IME 期间不响应**（03 §5 第 7 条）。中日文输入法的合成阶段按 Enter/Esc 是给
 *      输入法的，抢过来就等于在核心场景里让用户打不出字。
 *   2. **`event.defaultPrevented` 之后不再抢**。前一个处理器已经处理过的键（比如浮层里的
 *      `Esc`），快捷键层必须让路。
 *   3. **只发意图，不判断能不能执行**。`enabled` / `when` 属于注册表，它比这一层知道得多。
 */
export declare const OjHotkey: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    bindings: {
        type: PropType<readonly OjHotkeyBinding[]>;
        required: true;
    };
    /** 不给就按运行时平台推断；显式给可以用在"按宿主平台显示/匹配"的场景 */
    platform: {
        type: PropType<OjPlatform | undefined>;
        default: undefined;
    };
    enabled: {
        type: BooleanConstructor;
        default: boolean;
    };
}>, () => null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "run"[], "run", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    bindings: {
        type: PropType<readonly OjHotkeyBinding[]>;
        required: true;
    };
    /** 不给就按运行时平台推断；显式给可以用在"按宿主平台显示/匹配"的场景 */
    platform: {
        type: PropType<OjPlatform | undefined>;
        default: undefined;
    };
    enabled: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & Readonly<{
    onRun?: (...args: any[]) => any;
}>, {
    platform: OjPlatform | undefined;
    enabled: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
