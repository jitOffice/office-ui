const require_icon = require("./icon.cjs");
const require_locale = require("./locale.cjs");
const require_locale_switcher = require("./locale-switcher.cjs");
const require_command_button = require("./command-button.cjs");
const require_command_launcher = require("./command-launcher.cjs");
const require_popper = require("./popper.cjs");
const require_portal = require("./portal.cjs");
const require_context_menu = require("./context-menu.cjs");
const require_toggle_button = require("./toggle-button.cjs");
const require_split_button = require("./split-button.cjs");
const require_dropdown_button = require("./dropdown-button.cjs");
const require_dropdown = require("./dropdown.cjs");
const require_ribbon_group = require("./ribbon-group.cjs");
const require_toolbar = require("./toolbar.cjs");
const require_hotkey = require("./hotkey.cjs");
const require_status_bar = require("./status-bar.cjs");
const require_ribbon_gallery = require("./ribbon-gallery.cjs");
const require_command_palette = require("./command-palette.cjs");
const require_trigger = require("./trigger.cjs");
const require_tooltip = require("./tooltip.cjs");
const require_ribbon_tab = require("./ribbon-tab.cjs");
const require_ribbon = require("./ribbon.cjs");
const require_table_grid_picker = require("./table-grid-picker.cjs");
const require_tabs = require("./tabs.cjs");
const require_dialog = require("./dialog.cjs");
const require_search_bar = require("./search-bar.cjs");
const require_zoom_control = require("./zoom-control.cjs");
const require_file_tree = require("./file-tree.cjs");
const require_ruler = require("./ruler.cjs");
const require_signature_pad = require("./signature-pad.cjs");
const require_stamp = require("./stamp.cjs");
const require_watermark = require("./watermark.cjs");
const require_ai_panel = require("./ai-panel.cjs");
const require_code_block = require("./code-block.cjs");
//#region src/vue/registry.ts
/**
* 名称 → 组件表（02 §4.2 / §4.3 的地基）。
*
* 为什么是**显式表**而不是从导出里推导：`OJ.create('oj-table-grid-picker')` 与
* `<div data-oj="table-grid-picker">` 里的字符串是**公开契约**，写错一个字母就是运行时报
* "找不到组件"。推导出来的名字一旦因为重构改了组件变量名就静默变化，而这层映射是给
* 没有 TS 的 jQuery 用户用的——他们拿不到任何编译期提示。
*
* 键统一带 `oj-` 前缀；`resolveOjComponent` 同时接受不带前缀的简写（PRD 的 `data-oj="ribbon"`
* 就是这么写的），两种写法在文档里都出现，不能只认一种。
*/
var OJ_COMPONENTS = {
	"oj-ai-panel": require_ai_panel.OjAiPanel,
	"oj-code-block": require_code_block.OjCodeBlock,
	"oj-command-button": require_command_button.OjCommandButton,
	"oj-command-launcher": require_command_launcher.OjCommandLauncher,
	"oj-command-palette": require_command_palette.OjCommandPalette,
	"oj-context-menu": require_context_menu.OjContextMenu,
	"oj-dialog": require_dialog.OjDialog,
	"oj-dropdown": require_dropdown.OjDropdown,
	"oj-dropdown-button": require_dropdown_button.OjDropdownButton,
	"oj-file-tree": require_file_tree.OjFileTree,
	"oj-hotkey": require_hotkey.OjHotkey,
	"oj-icon": require_icon.OjIcon,
	"oj-locale-provider": require_locale.OjLocaleProvider,
	"oj-locale-switcher": require_locale_switcher.OjLocaleSwitcher,
	"oj-popper": require_popper.OjPopper,
	"oj-portal": require_portal.OjPortal,
	"oj-ribbon": require_ribbon.OjRibbon,
	"oj-ribbon-gallery": require_ribbon_gallery.OjRibbonGallery,
	"oj-ribbon-group": require_ribbon_group.OjRibbonGroup,
	"oj-ribbon-tab": require_ribbon_tab.OjRibbonTab,
	"oj-ruler": require_ruler.OjRuler,
	"oj-search-replace-bar": require_search_bar.OjSearchReplaceBar,
	"oj-signature-pad": require_signature_pad.OjSignaturePad,
	"oj-split-button": require_split_button.OjSplitButton,
	"oj-stamp": require_stamp.OjStamp,
	"oj-status-bar": require_status_bar.OjStatusBar,
	"oj-table-grid-picker": require_table_grid_picker.OjTableGridPicker,
	"oj-tabs": require_tabs.OjTabs,
	"oj-toggle-button": require_toggle_button.OjToggleButton,
	"oj-toolbar": require_toolbar.OjToolbar,
	"oj-tooltip": require_tooltip.OjTooltip,
	"oj-trigger": require_trigger.OjTrigger,
	"oj-watermark": require_watermark.OjWatermark,
	"oj-zoom-control": require_zoom_control.OjZoomControl
};
function resolveOjComponent(name) {
	const key = name.trim().toLowerCase();
	if (key.length === 0) return void 0;
	return OJ_COMPONENTS[key] ?? OJ_COMPONENTS[`oj-${key}`];
}
/** 给文档与 web-types 生成用：稳定排序，避免每次构建产出不同的 diff */
function ojComponentNames() {
	return Object.keys(OJ_COMPONENTS).sort();
}
//#endregion
exports.OJ_COMPONENTS = OJ_COMPONENTS;
exports.ojComponentNames = ojComponentNames;
exports.resolveOjComponent = resolveOjComponent;
