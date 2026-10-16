const require_icon = require("./icon.cjs");
let vue = require("vue");
//#region src/vue/command-button.ts
var OjCommandButton = (0, vue.defineComponent)({
	name: "OjCommandButton",
	props: {
		source: {
			type: Object,
			required: true
		},
		id: {
			type: String,
			required: true
		},
		size: {
			type: String,
			default: "medium"
		}
	},
	setup(props) {
		const view = (0, vue.shallowRef)({ enabled: true });
		let stop = () => {};
		function bind() {
			stop();
			view.value = props.source.state(props.id) ?? { enabled: true };
			stop = props.source.subscribe(props.id, (next) => {
				view.value = next;
			});
		}
		(0, vue.onMounted)(bind);
		(0, vue.watch)(() => props.id, bind);
		(0, vue.onUnmounted)(() => stop());
		return () => {
			const command = props.source.get(props.id);
			const state = view.value;
			const enabled = state.enabled !== false;
			const label = command ? props.source.resolve(command.label) : props.id;
			const pressed = typeof state.active === "boolean" ? String(state.active) : void 0;
			return (0, vue.h)("button", {
				type: "button",
				class: "oj-button",
				"data-size": props.size === "mini" ? "mini" : void 0,
				"data-active": state.active === true ? "" : void 0,
				"data-command": props.id,
				"aria-pressed": pressed,
				"aria-disabled": enabled ? void 0 : "true",
				onClick: () => {
					if (enabled) props.source.run(props.id);
				}
			}, [command?.icon ? (0, vue.h)(require_icon.OjIcon, { name: command.icon }) : null, (0, vue.h)("span", { class: "oj-button__label" }, label)]);
		};
	}
});
//#endregion
exports.OjCommandButton = OjCommandButton;
