/**
 * @jitoffice/i18n — 由 packages/i18n/scripts/gen-keys.ts 生成，请勿手改。
 * 源：packages/i18n/src/locales/*.ts（44 个 key · 4 种语言）。
 */
import type { OjMessageValue } from '../types.ts';
export type IntlKey = 'oj.common.confirm' | 'oj.common.cancel' | 'oj.common.close' | 'oj.common.clear' | 'oj.common.more' | 'oj.common.loading' | 'oj.common.empty' | 'oj.common.yes' | 'oj.common.no' | 'oj.common.inputPlaceholder' | 'oj.common.selectPlaceholder' | 'oj.tableGridPicker.label' | 'oj.tableGridPicker.size' | 'oj.tableGridPicker.insertDialog' | 'oj.tableGridPicker.exceedMax' | 'oj.tableGridPicker.rows' | 'oj.tableGridPicker.cols' | 'oj.ribbon.collapse' | 'oj.ribbon.expand' | 'oj.ribbon.moreCommands' | 'oj.ribbon.keyTipsHint' | 'oj.ribbon.showAll' | 'oj.colorPicker.themeColors' | 'oj.colorPicker.standardColors' | 'oj.colorPicker.recent' | 'oj.colorPicker.custom' | 'oj.colorPicker.noColor' | 'oj.colorPicker.auto' | 'oj.colorPicker.moreColors' | 'oj.colorPicker.eyedropper' | 'oj.fontPicker.recent' | 'oj.fontPicker.all' | 'oj.fontPicker.chinese' | 'oj.fontPicker.latin' | 'oj.fontPicker.notInstalled' | 'oj.fontPicker.preview' | 'oj.validation.required' | 'oj.validation.numberOnly' | 'oj.validation.range' | 'oj.validation.maxLength' | 'oj.validation.invalidColor' | 'oj.command.bold' | 'oj.command.horizontalRule' | 'oj.command.insertTable';
/** 有占位符的 key 才出现在这张表里；没有占位符的 key 走 `Record<string, never>`，传任何值都报错。 */
export interface IntlValues {
    'oj.tableGridPicker.size': {
        rows: OjMessageValue;
        cols: OjMessageValue;
    };
    'oj.tableGridPicker.exceedMax': {
        max: OjMessageValue;
    };
    'oj.ribbon.keyTipsHint': {
        key: OjMessageValue;
    };
    'oj.validation.required': {
        label: OjMessageValue;
    };
    'oj.validation.range': {
        min: OjMessageValue;
        max: OjMessageValue;
    };
    'oj.validation.maxLength': {
        max: number;
    };
}
export type MessageValues<K extends IntlKey> = K extends keyof IntlValues ? IntlValues[K] : Record<string, never>;
