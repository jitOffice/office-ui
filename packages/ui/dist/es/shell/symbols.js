//#region src/shell/symbols.ts
var SYMBOL_GROUPS = [
	{
		id: "common",
		symbols: [
			{
				char: "©",
				name: "copyright"
			},
			{
				char: "®",
				name: "registered"
			},
			{
				char: "™",
				name: "trademark"
			},
			{
				char: "§",
				name: "section"
			},
			{
				char: "¶",
				name: "paragraph"
			},
			{
				char: "°",
				name: "degree"
			},
			{
				char: "‰",
				name: "per mille"
			},
			{
				char: "№",
				name: "numero"
			}
		]
	},
	{
		id: "math",
		symbols: [
			{
				char: "±",
				name: "plus minus"
			},
			{
				char: "×",
				name: "multiply"
			},
			{
				char: "÷",
				name: "divide"
			},
			{
				char: "≠",
				name: "not equal"
			},
			{
				char: "≤",
				name: "less or equal"
			},
			{
				char: "≥",
				name: "greater or equal"
			},
			{
				char: "∞",
				name: "infinity"
			},
			{
				char: "∑",
				name: "sum"
			},
			{
				char: "√",
				name: "square root"
			},
			{
				char: "π",
				name: "pi"
			},
			{
				char: "≈",
				name: "almost equal"
			},
			{
				char: "µ",
				name: "micro"
			}
		]
	},
	{
		id: "arrow",
		symbols: [
			{
				char: "←",
				name: "left arrow"
			},
			{
				char: "→",
				name: "right arrow"
			},
			{
				char: "↑",
				name: "up arrow"
			},
			{
				char: "↓",
				name: "down arrow"
			},
			{
				char: "↔",
				name: "left right arrow"
			},
			{
				char: "⇄",
				name: "swap arrows"
			},
			{
				char: "⇧",
				name: "shift arrow"
			},
			{
				char: "⇒",
				name: "double right arrow"
			}
		]
	},
	{
		id: "currency",
		symbols: [
			{
				char: "$",
				name: "dollar"
			},
			{
				char: "€",
				name: "euro"
			},
			{
				char: "£",
				name: "pound"
			},
			{
				char: "¥",
				name: "yen"
			},
			{
				char: "₩",
				name: "won"
			},
			{
				char: "₹",
				name: "rupee"
			},
			{
				char: "¢",
				name: "cent"
			}
		]
	},
	{
		id: "punctuation",
		symbols: [
			{
				char: "—",
				name: "em dash"
			},
			{
				char: "–",
				name: "en dash"
			},
			{
				char: "…",
				name: "ellipsis"
			},
			{
				char: "·",
				name: "middle dot"
			},
			{
				char: "“",
				name: "left double quote"
			},
			{
				char: "”",
				name: "right double quote"
			},
			{
				char: "‘",
				name: "left single quote"
			},
			{
				char: "’",
				name: "right single quote"
			}
		]
	}
];
/**
* 按名字过滤。空查询返回原表（保持分组结构，调用方据此渲染标题）。
* 同时接受直接输入字符：用户已经知道要插哪个符号时，比记名字快。
*/
function filterSymbols(groups, query) {
	const needle = query.trim().toLowerCase();
	if (needle.length === 0) return [...groups];
	return groups.map((group) => ({
		id: group.id,
		symbols: group.symbols.filter((symbol) => symbol.char === needle || symbol.name.toLowerCase().includes(needle))
	})).filter((group) => group.symbols.length > 0);
}
/** 摊平成一维（键盘导航按下标走，分组只是视觉）。 */
function flattenSymbols(groups) {
	return groups.flatMap((group) => [...group.symbols]);
}
//#endregion
export { SYMBOL_GROUPS, filterSymbols, flattenSymbols };
