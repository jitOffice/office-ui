/**
 * @jitoffice/i18n — 由 packages/i18n/scripts/gen-keys.ts 生成，请勿手改。
 * 源：packages/i18n/src/locales/*.ts（86 个 key · 4 种语言）。
 */
import type { OjMessageValue } from '../types.ts';
export type IntlKey = 'oj.common.confirm' | 'oj.common.cancel' | 'oj.common.close' | 'oj.common.clear' | 'oj.common.more' | 'oj.common.loading' | 'oj.common.empty' | 'oj.common.yes' | 'oj.common.no' | 'oj.common.inputPlaceholder' | 'oj.common.selectPlaceholder' | 'oj.tableGridPicker.label' | 'oj.tableGridPicker.size' | 'oj.tableGridPicker.insertDialog' | 'oj.tableGridPicker.exceedMax' | 'oj.tableGridPicker.rows' | 'oj.tableGridPicker.cols' | 'oj.ribbon.collapse' | 'oj.ribbon.expand' | 'oj.ribbon.moreCommands' | 'oj.ribbon.keyTipsHint' | 'oj.ribbon.showAll' | 'oj.colorPicker.themeColors' | 'oj.colorPicker.standardColors' | 'oj.colorPicker.recent' | 'oj.colorPicker.custom' | 'oj.colorPicker.noColor' | 'oj.colorPicker.auto' | 'oj.colorPicker.moreColors' | 'oj.colorPicker.eyedropper' | 'oj.fontPicker.recent' | 'oj.fontPicker.all' | 'oj.fontPicker.chinese' | 'oj.fontPicker.latin' | 'oj.fontPicker.notInstalled' | 'oj.fontPicker.preview' | 'oj.validation.required' | 'oj.validation.numberOnly' | 'oj.validation.range' | 'oj.validation.maxLength' | 'oj.validation.invalidColor' | 'oj.command.bold' | 'oj.command.italic' | 'oj.command.underline' | 'oj.command.alignLeft' | 'oj.command.heading' | 'oj.command.blockquote' | 'oj.command.bulletList' | 'oj.command.orderedList' | 'oj.command.codeBlock' | 'oj.command.hardBreak' | 'oj.command.horizontalRule' | 'oj.command.insertTable' | 'oj.shell.tabs.start' | 'oj.shell.tabs.insert' | 'oj.shell.tabs.view' | 'oj.shell.search.find' | 'oj.shell.search.replace' | 'oj.shell.search.next' | 'oj.shell.search.previous' | 'oj.shell.search.matchCase' | 'oj.shell.search.count' | 'oj.shell.search.replaceAction' | 'oj.shell.search.replaceAll' | 'oj.shell.zoom.zoomOut' | 'oj.shell.zoom.zoomIn' | 'oj.shell.zoom.reset' | 'oj.shell.files.title' | 'oj.shell.files.search' | 'oj.shell.files.empty' | 'oj.shell.dialog.insertTitle' | 'oj.shell.dialog.rows' | 'oj.shell.dialog.cols' | 'oj.shell.paper.untitled' | 'oj.shell.watermark.sample' | 'oj.shell.watermark.toggle' | 'oj.shell.ai.title' | 'oj.shell.ai.placeholder' | 'oj.shell.ai.send' | 'oj.shell.ai.notice' | 'oj.shell.signature.clear' | 'oj.shell.signature.open' | 'oj.shell.stamp.sample' | 'oj.shell.stamp.open' | 'oj.shell.status.kernel' | 'oj.shell.insert.image';
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
    'oj.shell.search.count': {
        current: OjMessageValue;
        total: OjMessageValue;
    };
}
export type MessageValues<K extends IntlKey> = K extends keyof IntlValues ? IntlValues[K] : Record<string, never>;
