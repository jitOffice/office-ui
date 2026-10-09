"use strict";
/*
 * @jitoffice/tokens — 由 packages/tokens/scripts/generate.ts 生成，请勿手改。
源：packages/tokens/src/tokens.ts（唯一手写来源）。
 *
 * 值已全部解析为字面量，不含 var()，可在 canvas、Worker 与 SSR 中直接使用。
 * canvas 侧不要长期缓存：主题切换时重新调用 createTokens()。
 */

const BASE = {
  "brand": {
    "1": "#F0F5FF",
    "2": "#CCDCFF",
    "3": "#A3BFFF",
    "4": "#709CFF",
    "5": "#427CFF",
    "6": "#165DFF",
    "7": "#0046E6",
    "8": "#003ABD",
    "9": "#002F99",
    "10": "#002270"
  },
  "success": {
    "1": "#E8FDF6",
    "2": "#D0FBED",
    "3": "#ABF8DE",
    "4": "#7CF4CC",
    "5": "#51F0BB",
    "6": "#27ECAB",
    "7": "#12D393",
    "8": "#10B981",
    "9": "#0C8D62",
    "10": "#096748"
  },
  "warning": {
    "1": "#FEF0E6",
    "2": "#FEE1CD",
    "3": "#FDC9A6",
    "4": "#FBAB74",
    "5": "#FA9047",
    "6": "#F97316",
    "7": "#E05F06",
    "8": "#B84E05",
    "9": "#953F04",
    "10": "#6D2E03"
  },
  "danger": {
    "1": "#FFE5E5",
    "2": "#FFCCCC",
    "3": "#FFA3A3",
    "4": "#FF6B6B",
    "5": "#FF4242",
    "6": "#FF1414",
    "7": "#E60000",
    "8": "#BD0000",
    "9": "#990000",
    "10": "#700000"
  },
  "gray": {
    "1": "#F5F5F5",
    "2": "#E6E6E6",
    "3": "#D9D9D9",
    "4": "#C7C7C7",
    "5": "#ADADAD",
    "6": "#8C8C8C",
    "7": "#6B6B6B",
    "8": "#4D4D4D",
    "9": "#303030",
    "10": "#151515"
  },
  "chart": {
    "1": "#165DFF",
    "2": "#10B981",
    "3": "#F97316",
    "4": "#7C3AED",
    "5": "#0891B2",
    "6": "#DB2777",
    "7": "#FACC15",
    "8": "#4F46E5"
  },
  "color": {
    "brand": "#165DFF",
    "success": "#10B981",
    "warning": "#F97316",
    "danger": "#FF6B6B",
    "info": "#165DFF"
  },
  "text": {
    "1": "#151515",
    "2": "#3D3D45",
    "3": "#6C6F7D",
    "4": "#8A8C96",
    "5": "#C9CAD1",
    "inverse": "#FFFFFF",
    "brand": "#165DFF",
    "link": "#165DFF",
    "success": "#096748",
    "warning": "#B84E05",
    "danger": "#D93A3A"
  },
  "bg": {
    "page": "#F7F8FC",
    "container": "#FFFFFF",
    "elevated": "#FFFFFF",
    "glass": "rgba(255, 255, 255, 0.92)",
    "glassSoft": "rgba(255, 255, 255, 0.72)",
    "mask": "rgba(21, 21, 21, 0.45)",
    "hover": "#F2F3F7",
    "active": "#E8ECFF",
    "brand": "#165DFF",
    "brandSubtle": "#F0F5FF",
    "successSubtle": "#E8FDF6",
    "warningSubtle": "#FEF0E6",
    "dangerSubtle": "#FFE5E5"
  },
  "border": {
    "1": "#E8ECFF",
    "2": "#E5E6EB",
    "3": "#D0D2DB",
    "grid": "#EDEEF2",
    "brand": "#165DFF"
  },
  "focus": {
    "ring": "0 0 0 2px #A3BFFF"
  },
  "shadow": {
    "1": "0 1px 2px rgba(21, 21, 21, 0.04), 0 2px 8px rgba(22, 93, 255, 0.06)",
    "2": "0 4px 16px rgba(21, 21, 21, 0.08), 0 1px 3px rgba(22, 93, 255, 0.08)",
    "3": "0 12px 40px rgba(21, 21, 21, 0.14)"
  },
  "glass": {
    "blur": "40px",
    "blurSoft": "8px",
    "highlight": "inset 0 1px 2px rgba(255, 255, 255, 0.9)"
  },
  "radius": {
    "xs": "4px",
    "sm": "6px",
    "md": "8px",
    "lg": "12px",
    "xl": "20px",
    "full": "9999px"
  },
  "space": {
    "1": "4px",
    "2": "8px",
    "3": "12px",
    "4": "16px",
    "5": "20px",
    "6": "24px",
    "8": "32px",
    "10": "40px"
  },
  "font": {
    "sans": "\"Inter Variable\", ui-sans-serif, system-ui, \"PingFang SC\", \"Microsoft YaHei\", \"Hiragino Kaku Gothic ProN\", \"Yu Gothic UI\", \"Noto Sans JP\", \"Noto Sans SC\", sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Noto Color Emoji\"",
    "mono": "\"JetBrains Mono\", ui-monospace, SFMono-Regular, Consolas, monospace",
    "monoCjk": "\"Sarasa Mono SC\", \"Source Han Mono SC\", \"JetBrains Mono\", ui-monospace, SFMono-Regular, Consolas, monospace",
    "doc": "\"Source Han Serif SC\", \"Noto Serif SC\", \"Songti SC\", SimSun, serif"
  },
  "fs": {
    "12": "12px",
    "13": "13px",
    "14": "14px",
    "16": "16px",
    "18": "18px",
    "20": "20px",
    "24": "24px",
    "32": "32px"
  },
  "lh": {
    "tight": "1.25",
    "normal": "1.5",
    "loose": "1.75"
  },
  "letter": {
    "spacing": "0em"
  },
  "motion": {
    "duration": {
      "fast": "100ms",
      "base": "200ms",
      "slow": "300ms"
    },
    "ease": {
      "out": "cubic-bezier(0.34, 0.69, 0.10, 1.00)",
      "std": "cubic-bezier(0.40, 0.00, 0.20, 1.00)"
    }
  },
  "control": {
    "height": {
      "xs": "24px",
      "sm": "28px",
      "md": "32px",
      "lg": "40px"
    }
  },
  "ribbon": {
    "height": "96px"
  },
  "z": {
    "canvas": "0",
    "sticky": "10",
    "ribbon": "100",
    "drawer": "500",
    "dropdown": "1000",
    "modal": "2000",
    "popover": "3000",
    "toast": "4000",
    "max": "9000"
  },
  "button": {
    "height": "32px",
    "padding": {
      "x": "16px"
    },
    "radius": "6px",
    "bg": "transparent",
    "color": "#151515",
    "border": "#D0D2DB",
    "gap": "8px",
    "icon": {
      "size": "16px"
    }
  },
  "grid": {
    "picker": {
      "cell": "16px",
      "gap": "2px",
      "cellBg": "#E5E6EB",
      "cellActiveBg": "#165DFF",
      "labelColor": "#6C6F7D",
      "maxCols": "10",
      "maxRows": "10"
    }
  }
}

const DIFFS = {
  "light.comfortable.zh-TW": {
    "font": {
      "sans": "\"Inter Variable\", ui-sans-serif, system-ui, \"PingFang TC\", \"Microsoft JhengHei\", \"Noto Sans TC\", sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Noto Color Emoji\""
    }
  },
  "light.comfortable.ja": {
    "font": {
      "sans": "\"Yu Gothic UI\", \"Hiragino Kaku Gothic ProN\", \"Hiragino Sans\", \"Noto Sans JP\", Meiryo, sans-serif"
    },
    "fs": {
      "14": "13px",
      "16": "15px"
    },
    "lh": {
      "normal": "1.5715"
    },
    "letter": {
      "spacing": "0.02em"
    }
  },
  "light.compact.zh": {
    "fs": {
      "14": "13px",
      "16": "14px",
      "18": "16px",
      "20": "18px",
      "24": "22px",
      "32": "28px"
    },
    "control": {
      "height": {
        "xs": "22px",
        "sm": "24px",
        "md": "28px",
        "lg": "34px"
      }
    },
    "ribbon": {
      "height": "76px"
    },
    "button": {
      "height": "28px",
      "padding": {
        "x": "12px"
      }
    }
  },
  "light.compact.zh-TW": {
    "font": {
      "sans": "\"Inter Variable\", ui-sans-serif, system-ui, \"PingFang TC\", \"Microsoft JhengHei\", \"Noto Sans TC\", sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Noto Color Emoji\""
    },
    "fs": {
      "14": "13px",
      "16": "14px",
      "18": "16px",
      "20": "18px",
      "24": "22px",
      "32": "28px"
    },
    "control": {
      "height": {
        "xs": "22px",
        "sm": "24px",
        "md": "28px",
        "lg": "34px"
      }
    },
    "ribbon": {
      "height": "76px"
    },
    "button": {
      "height": "28px",
      "padding": {
        "x": "12px"
      }
    }
  },
  "light.compact.ja": {
    "font": {
      "sans": "\"Yu Gothic UI\", \"Hiragino Kaku Gothic ProN\", \"Hiragino Sans\", \"Noto Sans JP\", Meiryo, sans-serif"
    },
    "fs": {
      "14": "13px",
      "16": "15px",
      "18": "16px",
      "20": "18px",
      "24": "22px",
      "32": "28px"
    },
    "lh": {
      "normal": "1.5715"
    },
    "letter": {
      "spacing": "0.02em"
    },
    "control": {
      "height": {
        "xs": "22px",
        "sm": "24px",
        "md": "28px",
        "lg": "34px"
      }
    },
    "ribbon": {
      "height": "76px"
    },
    "button": {
      "height": "28px",
      "padding": {
        "x": "12px"
      }
    }
  },
  "dark.comfortable.zh": {
    "brand": {
      "1": "#002270",
      "2": "#002F99",
      "3": "#003ABD",
      "4": "#0046E6",
      "5": "#165DFF",
      "6": "#4080FF",
      "7": "#709CFF",
      "8": "#A3BFFF",
      "9": "#CCDCFF",
      "10": "#F0F5FF"
    },
    "success": {
      "1": "#096748",
      "2": "#0C8D62",
      "3": "#10B981",
      "4": "#12D393",
      "5": "#27ECAB",
      "6": "#51F0BB",
      "7": "#7CF4CC",
      "8": "#ABF8DE",
      "9": "#D0FBED",
      "10": "#E8FDF6"
    },
    "warning": {
      "1": "#6D2E03",
      "2": "#953F04",
      "3": "#B84E05",
      "4": "#E05F06",
      "5": "#F97316",
      "6": "#FA9047",
      "7": "#FBAB74",
      "8": "#FDC9A6",
      "9": "#FEE1CD",
      "10": "#FEF0E6"
    },
    "danger": {
      "1": "#700000",
      "2": "#990000",
      "3": "#BD0000",
      "4": "#E60000",
      "5": "#FF1414",
      "6": "#FF4242",
      "7": "#FF6B6B",
      "8": "#FFA3A3",
      "9": "#FFCCCC",
      "10": "#FFE5E5"
    },
    "gray": {
      "1": "#151515",
      "2": "#303030",
      "3": "#4D4D4D",
      "4": "#6B6B6B",
      "5": "#8C8C8C",
      "6": "#ADADAD",
      "7": "#C7C7C7",
      "8": "#D9D9D9",
      "9": "#E6E6E6",
      "10": "#F5F5F5"
    },
    "color": {
      "brand": "#4080FF",
      "success": "#ABF8DE",
      "warning": "#FA9047",
      "danger": "#E60000",
      "info": "#4080FF"
    },
    "text": {
      "1": "#F2F3F5",
      "2": "#D4D6DE",
      "3": "#A0A3B0",
      "4": "#7A7D8B",
      "5": "#55585F",
      "inverse": "#151515",
      "brand": "#4080FF",
      "link": "#4080FF",
      "success": "#E8FDF6",
      "warning": "#FDC9A6",
      "danger": "#EA9090"
    },
    "bg": {
      "page": "#101114",
      "container": "#17181C",
      "elevated": "#1F2027",
      "glass": "rgba(23, 24, 28, 0.88)",
      "glassSoft": "rgba(23, 24, 28, 0.6)",
      "mask": "rgba(0, 0, 0, 0.6)",
      "hover": "#262832",
      "active": "#1D2A45",
      "brand": "#4080FF",
      "brandSubtle": "#1B2440",
      "successSubtle": "#096748",
      "warningSubtle": "#6D2E03",
      "dangerSubtle": "#700000"
    },
    "border": {
      "1": "#26304D",
      "2": "#2A2C34",
      "3": "#3A3D47",
      "grid": "#23252C",
      "brand": "#4080FF"
    },
    "focus": {
      "ring": "0 0 0 2px #003ABD"
    },
    "shadow": {
      "1": "0 1px 2px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.3)",
      "2": "0 4px 16px rgba(0, 0, 0, 0.44), 0 1px 3px rgba(0, 0, 0, 0.4)",
      "3": "0 12px 40px rgba(0, 0, 0, 0.6)"
    },
    "glass": {
      "highlight": "inset 0 1px 2px rgba(255, 255, 255, 0.08)"
    },
    "button": {
      "color": "#F2F3F5",
      "border": "#3A3D47"
    },
    "grid": {
      "picker": {
        "cellBg": "#2A2C34",
        "cellActiveBg": "#4080FF",
        "labelColor": "#A0A3B0"
      }
    }
  },
  "dark.comfortable.zh-TW": {
    "brand": {
      "1": "#002270",
      "2": "#002F99",
      "3": "#003ABD",
      "4": "#0046E6",
      "5": "#165DFF",
      "6": "#4080FF",
      "7": "#709CFF",
      "8": "#A3BFFF",
      "9": "#CCDCFF",
      "10": "#F0F5FF"
    },
    "success": {
      "1": "#096748",
      "2": "#0C8D62",
      "3": "#10B981",
      "4": "#12D393",
      "5": "#27ECAB",
      "6": "#51F0BB",
      "7": "#7CF4CC",
      "8": "#ABF8DE",
      "9": "#D0FBED",
      "10": "#E8FDF6"
    },
    "warning": {
      "1": "#6D2E03",
      "2": "#953F04",
      "3": "#B84E05",
      "4": "#E05F06",
      "5": "#F97316",
      "6": "#FA9047",
      "7": "#FBAB74",
      "8": "#FDC9A6",
      "9": "#FEE1CD",
      "10": "#FEF0E6"
    },
    "danger": {
      "1": "#700000",
      "2": "#990000",
      "3": "#BD0000",
      "4": "#E60000",
      "5": "#FF1414",
      "6": "#FF4242",
      "7": "#FF6B6B",
      "8": "#FFA3A3",
      "9": "#FFCCCC",
      "10": "#FFE5E5"
    },
    "gray": {
      "1": "#151515",
      "2": "#303030",
      "3": "#4D4D4D",
      "4": "#6B6B6B",
      "5": "#8C8C8C",
      "6": "#ADADAD",
      "7": "#C7C7C7",
      "8": "#D9D9D9",
      "9": "#E6E6E6",
      "10": "#F5F5F5"
    },
    "color": {
      "brand": "#4080FF",
      "success": "#ABF8DE",
      "warning": "#FA9047",
      "danger": "#E60000",
      "info": "#4080FF"
    },
    "text": {
      "1": "#F2F3F5",
      "2": "#D4D6DE",
      "3": "#A0A3B0",
      "4": "#7A7D8B",
      "5": "#55585F",
      "inverse": "#151515",
      "brand": "#4080FF",
      "link": "#4080FF",
      "success": "#E8FDF6",
      "warning": "#FDC9A6",
      "danger": "#EA9090"
    },
    "bg": {
      "page": "#101114",
      "container": "#17181C",
      "elevated": "#1F2027",
      "glass": "rgba(23, 24, 28, 0.88)",
      "glassSoft": "rgba(23, 24, 28, 0.6)",
      "mask": "rgba(0, 0, 0, 0.6)",
      "hover": "#262832",
      "active": "#1D2A45",
      "brand": "#4080FF",
      "brandSubtle": "#1B2440",
      "successSubtle": "#096748",
      "warningSubtle": "#6D2E03",
      "dangerSubtle": "#700000"
    },
    "border": {
      "1": "#26304D",
      "2": "#2A2C34",
      "3": "#3A3D47",
      "grid": "#23252C",
      "brand": "#4080FF"
    },
    "focus": {
      "ring": "0 0 0 2px #003ABD"
    },
    "shadow": {
      "1": "0 1px 2px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.3)",
      "2": "0 4px 16px rgba(0, 0, 0, 0.44), 0 1px 3px rgba(0, 0, 0, 0.4)",
      "3": "0 12px 40px rgba(0, 0, 0, 0.6)"
    },
    "glass": {
      "highlight": "inset 0 1px 2px rgba(255, 255, 255, 0.08)"
    },
    "font": {
      "sans": "\"Inter Variable\", ui-sans-serif, system-ui, \"PingFang TC\", \"Microsoft JhengHei\", \"Noto Sans TC\", sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Noto Color Emoji\""
    },
    "button": {
      "color": "#F2F3F5",
      "border": "#3A3D47"
    },
    "grid": {
      "picker": {
        "cellBg": "#2A2C34",
        "cellActiveBg": "#4080FF",
        "labelColor": "#A0A3B0"
      }
    }
  },
  "dark.comfortable.ja": {
    "brand": {
      "1": "#002270",
      "2": "#002F99",
      "3": "#003ABD",
      "4": "#0046E6",
      "5": "#165DFF",
      "6": "#4080FF",
      "7": "#709CFF",
      "8": "#A3BFFF",
      "9": "#CCDCFF",
      "10": "#F0F5FF"
    },
    "success": {
      "1": "#096748",
      "2": "#0C8D62",
      "3": "#10B981",
      "4": "#12D393",
      "5": "#27ECAB",
      "6": "#51F0BB",
      "7": "#7CF4CC",
      "8": "#ABF8DE",
      "9": "#D0FBED",
      "10": "#E8FDF6"
    },
    "warning": {
      "1": "#6D2E03",
      "2": "#953F04",
      "3": "#B84E05",
      "4": "#E05F06",
      "5": "#F97316",
      "6": "#FA9047",
      "7": "#FBAB74",
      "8": "#FDC9A6",
      "9": "#FEE1CD",
      "10": "#FEF0E6"
    },
    "danger": {
      "1": "#700000",
      "2": "#990000",
      "3": "#BD0000",
      "4": "#E60000",
      "5": "#FF1414",
      "6": "#FF4242",
      "7": "#FF6B6B",
      "8": "#FFA3A3",
      "9": "#FFCCCC",
      "10": "#FFE5E5"
    },
    "gray": {
      "1": "#151515",
      "2": "#303030",
      "3": "#4D4D4D",
      "4": "#6B6B6B",
      "5": "#8C8C8C",
      "6": "#ADADAD",
      "7": "#C7C7C7",
      "8": "#D9D9D9",
      "9": "#E6E6E6",
      "10": "#F5F5F5"
    },
    "color": {
      "brand": "#4080FF",
      "success": "#ABF8DE",
      "warning": "#FA9047",
      "danger": "#E60000",
      "info": "#4080FF"
    },
    "text": {
      "1": "#F2F3F5",
      "2": "#D4D6DE",
      "3": "#A0A3B0",
      "4": "#7A7D8B",
      "5": "#55585F",
      "inverse": "#151515",
      "brand": "#4080FF",
      "link": "#4080FF",
      "success": "#E8FDF6",
      "warning": "#FDC9A6",
      "danger": "#EA9090"
    },
    "bg": {
      "page": "#101114",
      "container": "#17181C",
      "elevated": "#1F2027",
      "glass": "rgba(23, 24, 28, 0.88)",
      "glassSoft": "rgba(23, 24, 28, 0.6)",
      "mask": "rgba(0, 0, 0, 0.6)",
      "hover": "#262832",
      "active": "#1D2A45",
      "brand": "#4080FF",
      "brandSubtle": "#1B2440",
      "successSubtle": "#096748",
      "warningSubtle": "#6D2E03",
      "dangerSubtle": "#700000"
    },
    "border": {
      "1": "#26304D",
      "2": "#2A2C34",
      "3": "#3A3D47",
      "grid": "#23252C",
      "brand": "#4080FF"
    },
    "focus": {
      "ring": "0 0 0 2px #003ABD"
    },
    "shadow": {
      "1": "0 1px 2px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.3)",
      "2": "0 4px 16px rgba(0, 0, 0, 0.44), 0 1px 3px rgba(0, 0, 0, 0.4)",
      "3": "0 12px 40px rgba(0, 0, 0, 0.6)"
    },
    "glass": {
      "highlight": "inset 0 1px 2px rgba(255, 255, 255, 0.08)"
    },
    "font": {
      "sans": "\"Yu Gothic UI\", \"Hiragino Kaku Gothic ProN\", \"Hiragino Sans\", \"Noto Sans JP\", Meiryo, sans-serif"
    },
    "fs": {
      "14": "13px",
      "16": "15px"
    },
    "lh": {
      "normal": "1.5715"
    },
    "letter": {
      "spacing": "0.02em"
    },
    "button": {
      "color": "#F2F3F5",
      "border": "#3A3D47"
    },
    "grid": {
      "picker": {
        "cellBg": "#2A2C34",
        "cellActiveBg": "#4080FF",
        "labelColor": "#A0A3B0"
      }
    }
  },
  "dark.compact.zh": {
    "brand": {
      "1": "#002270",
      "2": "#002F99",
      "3": "#003ABD",
      "4": "#0046E6",
      "5": "#165DFF",
      "6": "#4080FF",
      "7": "#709CFF",
      "8": "#A3BFFF",
      "9": "#CCDCFF",
      "10": "#F0F5FF"
    },
    "success": {
      "1": "#096748",
      "2": "#0C8D62",
      "3": "#10B981",
      "4": "#12D393",
      "5": "#27ECAB",
      "6": "#51F0BB",
      "7": "#7CF4CC",
      "8": "#ABF8DE",
      "9": "#D0FBED",
      "10": "#E8FDF6"
    },
    "warning": {
      "1": "#6D2E03",
      "2": "#953F04",
      "3": "#B84E05",
      "4": "#E05F06",
      "5": "#F97316",
      "6": "#FA9047",
      "7": "#FBAB74",
      "8": "#FDC9A6",
      "9": "#FEE1CD",
      "10": "#FEF0E6"
    },
    "danger": {
      "1": "#700000",
      "2": "#990000",
      "3": "#BD0000",
      "4": "#E60000",
      "5": "#FF1414",
      "6": "#FF4242",
      "7": "#FF6B6B",
      "8": "#FFA3A3",
      "9": "#FFCCCC",
      "10": "#FFE5E5"
    },
    "gray": {
      "1": "#151515",
      "2": "#303030",
      "3": "#4D4D4D",
      "4": "#6B6B6B",
      "5": "#8C8C8C",
      "6": "#ADADAD",
      "7": "#C7C7C7",
      "8": "#D9D9D9",
      "9": "#E6E6E6",
      "10": "#F5F5F5"
    },
    "color": {
      "brand": "#4080FF",
      "success": "#ABF8DE",
      "warning": "#FA9047",
      "danger": "#E60000",
      "info": "#4080FF"
    },
    "text": {
      "1": "#F2F3F5",
      "2": "#D4D6DE",
      "3": "#A0A3B0",
      "4": "#7A7D8B",
      "5": "#55585F",
      "inverse": "#151515",
      "brand": "#4080FF",
      "link": "#4080FF",
      "success": "#E8FDF6",
      "warning": "#FDC9A6",
      "danger": "#EA9090"
    },
    "bg": {
      "page": "#101114",
      "container": "#17181C",
      "elevated": "#1F2027",
      "glass": "rgba(23, 24, 28, 0.88)",
      "glassSoft": "rgba(23, 24, 28, 0.6)",
      "mask": "rgba(0, 0, 0, 0.6)",
      "hover": "#262832",
      "active": "#1D2A45",
      "brand": "#4080FF",
      "brandSubtle": "#1B2440",
      "successSubtle": "#096748",
      "warningSubtle": "#6D2E03",
      "dangerSubtle": "#700000"
    },
    "border": {
      "1": "#26304D",
      "2": "#2A2C34",
      "3": "#3A3D47",
      "grid": "#23252C",
      "brand": "#4080FF"
    },
    "focus": {
      "ring": "0 0 0 2px #003ABD"
    },
    "shadow": {
      "1": "0 1px 2px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.3)",
      "2": "0 4px 16px rgba(0, 0, 0, 0.44), 0 1px 3px rgba(0, 0, 0, 0.4)",
      "3": "0 12px 40px rgba(0, 0, 0, 0.6)"
    },
    "glass": {
      "highlight": "inset 0 1px 2px rgba(255, 255, 255, 0.08)"
    },
    "fs": {
      "14": "13px",
      "16": "14px",
      "18": "16px",
      "20": "18px",
      "24": "22px",
      "32": "28px"
    },
    "control": {
      "height": {
        "xs": "22px",
        "sm": "24px",
        "md": "28px",
        "lg": "34px"
      }
    },
    "ribbon": {
      "height": "76px"
    },
    "button": {
      "height": "28px",
      "padding": {
        "x": "12px"
      },
      "color": "#F2F3F5",
      "border": "#3A3D47"
    },
    "grid": {
      "picker": {
        "cellBg": "#2A2C34",
        "cellActiveBg": "#4080FF",
        "labelColor": "#A0A3B0"
      }
    }
  },
  "dark.compact.zh-TW": {
    "brand": {
      "1": "#002270",
      "2": "#002F99",
      "3": "#003ABD",
      "4": "#0046E6",
      "5": "#165DFF",
      "6": "#4080FF",
      "7": "#709CFF",
      "8": "#A3BFFF",
      "9": "#CCDCFF",
      "10": "#F0F5FF"
    },
    "success": {
      "1": "#096748",
      "2": "#0C8D62",
      "3": "#10B981",
      "4": "#12D393",
      "5": "#27ECAB",
      "6": "#51F0BB",
      "7": "#7CF4CC",
      "8": "#ABF8DE",
      "9": "#D0FBED",
      "10": "#E8FDF6"
    },
    "warning": {
      "1": "#6D2E03",
      "2": "#953F04",
      "3": "#B84E05",
      "4": "#E05F06",
      "5": "#F97316",
      "6": "#FA9047",
      "7": "#FBAB74",
      "8": "#FDC9A6",
      "9": "#FEE1CD",
      "10": "#FEF0E6"
    },
    "danger": {
      "1": "#700000",
      "2": "#990000",
      "3": "#BD0000",
      "4": "#E60000",
      "5": "#FF1414",
      "6": "#FF4242",
      "7": "#FF6B6B",
      "8": "#FFA3A3",
      "9": "#FFCCCC",
      "10": "#FFE5E5"
    },
    "gray": {
      "1": "#151515",
      "2": "#303030",
      "3": "#4D4D4D",
      "4": "#6B6B6B",
      "5": "#8C8C8C",
      "6": "#ADADAD",
      "7": "#C7C7C7",
      "8": "#D9D9D9",
      "9": "#E6E6E6",
      "10": "#F5F5F5"
    },
    "color": {
      "brand": "#4080FF",
      "success": "#ABF8DE",
      "warning": "#FA9047",
      "danger": "#E60000",
      "info": "#4080FF"
    },
    "text": {
      "1": "#F2F3F5",
      "2": "#D4D6DE",
      "3": "#A0A3B0",
      "4": "#7A7D8B",
      "5": "#55585F",
      "inverse": "#151515",
      "brand": "#4080FF",
      "link": "#4080FF",
      "success": "#E8FDF6",
      "warning": "#FDC9A6",
      "danger": "#EA9090"
    },
    "bg": {
      "page": "#101114",
      "container": "#17181C",
      "elevated": "#1F2027",
      "glass": "rgba(23, 24, 28, 0.88)",
      "glassSoft": "rgba(23, 24, 28, 0.6)",
      "mask": "rgba(0, 0, 0, 0.6)",
      "hover": "#262832",
      "active": "#1D2A45",
      "brand": "#4080FF",
      "brandSubtle": "#1B2440",
      "successSubtle": "#096748",
      "warningSubtle": "#6D2E03",
      "dangerSubtle": "#700000"
    },
    "border": {
      "1": "#26304D",
      "2": "#2A2C34",
      "3": "#3A3D47",
      "grid": "#23252C",
      "brand": "#4080FF"
    },
    "focus": {
      "ring": "0 0 0 2px #003ABD"
    },
    "shadow": {
      "1": "0 1px 2px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.3)",
      "2": "0 4px 16px rgba(0, 0, 0, 0.44), 0 1px 3px rgba(0, 0, 0, 0.4)",
      "3": "0 12px 40px rgba(0, 0, 0, 0.6)"
    },
    "glass": {
      "highlight": "inset 0 1px 2px rgba(255, 255, 255, 0.08)"
    },
    "font": {
      "sans": "\"Inter Variable\", ui-sans-serif, system-ui, \"PingFang TC\", \"Microsoft JhengHei\", \"Noto Sans TC\", sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Noto Color Emoji\""
    },
    "fs": {
      "14": "13px",
      "16": "14px",
      "18": "16px",
      "20": "18px",
      "24": "22px",
      "32": "28px"
    },
    "control": {
      "height": {
        "xs": "22px",
        "sm": "24px",
        "md": "28px",
        "lg": "34px"
      }
    },
    "ribbon": {
      "height": "76px"
    },
    "button": {
      "height": "28px",
      "padding": {
        "x": "12px"
      },
      "color": "#F2F3F5",
      "border": "#3A3D47"
    },
    "grid": {
      "picker": {
        "cellBg": "#2A2C34",
        "cellActiveBg": "#4080FF",
        "labelColor": "#A0A3B0"
      }
    }
  },
  "dark.compact.ja": {
    "brand": {
      "1": "#002270",
      "2": "#002F99",
      "3": "#003ABD",
      "4": "#0046E6",
      "5": "#165DFF",
      "6": "#4080FF",
      "7": "#709CFF",
      "8": "#A3BFFF",
      "9": "#CCDCFF",
      "10": "#F0F5FF"
    },
    "success": {
      "1": "#096748",
      "2": "#0C8D62",
      "3": "#10B981",
      "4": "#12D393",
      "5": "#27ECAB",
      "6": "#51F0BB",
      "7": "#7CF4CC",
      "8": "#ABF8DE",
      "9": "#D0FBED",
      "10": "#E8FDF6"
    },
    "warning": {
      "1": "#6D2E03",
      "2": "#953F04",
      "3": "#B84E05",
      "4": "#E05F06",
      "5": "#F97316",
      "6": "#FA9047",
      "7": "#FBAB74",
      "8": "#FDC9A6",
      "9": "#FEE1CD",
      "10": "#FEF0E6"
    },
    "danger": {
      "1": "#700000",
      "2": "#990000",
      "3": "#BD0000",
      "4": "#E60000",
      "5": "#FF1414",
      "6": "#FF4242",
      "7": "#FF6B6B",
      "8": "#FFA3A3",
      "9": "#FFCCCC",
      "10": "#FFE5E5"
    },
    "gray": {
      "1": "#151515",
      "2": "#303030",
      "3": "#4D4D4D",
      "4": "#6B6B6B",
      "5": "#8C8C8C",
      "6": "#ADADAD",
      "7": "#C7C7C7",
      "8": "#D9D9D9",
      "9": "#E6E6E6",
      "10": "#F5F5F5"
    },
    "color": {
      "brand": "#4080FF",
      "success": "#ABF8DE",
      "warning": "#FA9047",
      "danger": "#E60000",
      "info": "#4080FF"
    },
    "text": {
      "1": "#F2F3F5",
      "2": "#D4D6DE",
      "3": "#A0A3B0",
      "4": "#7A7D8B",
      "5": "#55585F",
      "inverse": "#151515",
      "brand": "#4080FF",
      "link": "#4080FF",
      "success": "#E8FDF6",
      "warning": "#FDC9A6",
      "danger": "#EA9090"
    },
    "bg": {
      "page": "#101114",
      "container": "#17181C",
      "elevated": "#1F2027",
      "glass": "rgba(23, 24, 28, 0.88)",
      "glassSoft": "rgba(23, 24, 28, 0.6)",
      "mask": "rgba(0, 0, 0, 0.6)",
      "hover": "#262832",
      "active": "#1D2A45",
      "brand": "#4080FF",
      "brandSubtle": "#1B2440",
      "successSubtle": "#096748",
      "warningSubtle": "#6D2E03",
      "dangerSubtle": "#700000"
    },
    "border": {
      "1": "#26304D",
      "2": "#2A2C34",
      "3": "#3A3D47",
      "grid": "#23252C",
      "brand": "#4080FF"
    },
    "focus": {
      "ring": "0 0 0 2px #003ABD"
    },
    "shadow": {
      "1": "0 1px 2px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.3)",
      "2": "0 4px 16px rgba(0, 0, 0, 0.44), 0 1px 3px rgba(0, 0, 0, 0.4)",
      "3": "0 12px 40px rgba(0, 0, 0, 0.6)"
    },
    "glass": {
      "highlight": "inset 0 1px 2px rgba(255, 255, 255, 0.08)"
    },
    "font": {
      "sans": "\"Yu Gothic UI\", \"Hiragino Kaku Gothic ProN\", \"Hiragino Sans\", \"Noto Sans JP\", Meiryo, sans-serif"
    },
    "fs": {
      "14": "13px",
      "16": "15px",
      "18": "16px",
      "20": "18px",
      "24": "22px",
      "32": "28px"
    },
    "lh": {
      "normal": "1.5715"
    },
    "letter": {
      "spacing": "0.02em"
    },
    "control": {
      "height": {
        "xs": "22px",
        "sm": "24px",
        "md": "28px",
        "lg": "34px"
      }
    },
    "ribbon": {
      "height": "76px"
    },
    "button": {
      "height": "28px",
      "padding": {
        "x": "12px"
      },
      "color": "#F2F3F5",
      "border": "#3A3D47"
    },
    "grid": {
      "picker": {
        "cellBg": "#2A2C34",
        "cellActiveBg": "#4080FF",
        "labelColor": "#A0A3B0"
      }
    }
  }
}

const tokenNames = ["--oj-bg-active","--oj-bg-brand","--oj-bg-brand-subtle","--oj-bg-container","--oj-bg-danger-subtle","--oj-bg-elevated","--oj-bg-glass","--oj-bg-glass-soft","--oj-bg-hover","--oj-bg-mask","--oj-bg-page","--oj-bg-success-subtle","--oj-bg-warning-subtle","--oj-border-1","--oj-border-2","--oj-border-3","--oj-border-brand","--oj-border-grid","--oj-brand-1","--oj-brand-10","--oj-brand-2","--oj-brand-3","--oj-brand-4","--oj-brand-5","--oj-brand-6","--oj-brand-7","--oj-brand-8","--oj-brand-9","--oj-button-bg","--oj-button-border","--oj-button-color","--oj-button-gap","--oj-button-height","--oj-button-icon-size","--oj-button-padding-x","--oj-button-radius","--oj-chart-1","--oj-chart-2","--oj-chart-3","--oj-chart-4","--oj-chart-5","--oj-chart-6","--oj-chart-7","--oj-chart-8","--oj-color-brand","--oj-color-danger","--oj-color-info","--oj-color-success","--oj-color-warning","--oj-control-height-lg","--oj-control-height-md","--oj-control-height-sm","--oj-control-height-xs","--oj-danger-1","--oj-danger-10","--oj-danger-2","--oj-danger-3","--oj-danger-4","--oj-danger-5","--oj-danger-6","--oj-danger-7","--oj-danger-8","--oj-danger-9","--oj-focus-ring","--oj-font-doc","--oj-font-mono","--oj-font-mono-cjk","--oj-font-sans","--oj-fs-12","--oj-fs-13","--oj-fs-14","--oj-fs-16","--oj-fs-18","--oj-fs-20","--oj-fs-24","--oj-fs-32","--oj-glass-blur","--oj-glass-blur-soft","--oj-glass-highlight","--oj-gray-1","--oj-gray-10","--oj-gray-2","--oj-gray-3","--oj-gray-4","--oj-gray-5","--oj-gray-6","--oj-gray-7","--oj-gray-8","--oj-gray-9","--oj-grid-picker-cell","--oj-grid-picker-cell-active-bg","--oj-grid-picker-cell-bg","--oj-grid-picker-gap","--oj-grid-picker-label-color","--oj-grid-picker-max-cols","--oj-grid-picker-max-rows","--oj-letter-spacing","--oj-lh-loose","--oj-lh-normal","--oj-lh-tight","--oj-motion-duration-base","--oj-motion-duration-fast","--oj-motion-duration-slow","--oj-motion-ease-out","--oj-motion-ease-std","--oj-radius-full","--oj-radius-lg","--oj-radius-md","--oj-radius-sm","--oj-radius-xl","--oj-radius-xs","--oj-ribbon-height","--oj-shadow-1","--oj-shadow-2","--oj-shadow-3","--oj-space-1","--oj-space-10","--oj-space-2","--oj-space-3","--oj-space-4","--oj-space-5","--oj-space-6","--oj-space-8","--oj-success-1","--oj-success-10","--oj-success-2","--oj-success-3","--oj-success-4","--oj-success-5","--oj-success-6","--oj-success-7","--oj-success-8","--oj-success-9","--oj-text-1","--oj-text-2","--oj-text-3","--oj-text-4","--oj-text-5","--oj-text-brand","--oj-text-danger","--oj-text-inverse","--oj-text-link","--oj-text-success","--oj-text-warning","--oj-warning-1","--oj-warning-10","--oj-warning-2","--oj-warning-3","--oj-warning-4","--oj-warning-5","--oj-warning-6","--oj-warning-7","--oj-warning-8","--oj-warning-9","--oj-z-canvas","--oj-z-drawer","--oj-z-dropdown","--oj-z-max","--oj-z-modal","--oj-z-popover","--oj-z-ribbon","--oj-z-sticky","--oj-z-toast"]

const CACHE = new Map()

function isNode(v) {
  return typeof v === 'object' && v !== null
}

function merge(a, b) {
  const out = {}
  for (const k of Object.keys(a)) out[k] = a[k]
  for (const k of Object.keys(b)) {
    const prev = out[k]
    out[k] = isNode(prev) && isNode(b[k]) ? merge(prev, b[k]) : b[k]
  }
  return out
}

function comboKey(options) {
  const o = options || {}
  return (o.theme || 'light') + '.' + (o.density || 'comfortable') + '.' + (o.lang || 'zh')
}

/**
 * 嵌套形态：createTokens({ theme: 'dark' }).bg.container
 * lang 只接受会产生视觉差异的 'zh' | 'zh-TW' | 'ja'，en 与基底同值。
 */
function createTokens(options) {
  const key = comboKey(options)
  if (key === 'light.comfortable.zh') return BASE
  let tree = CACHE.get(key)
  if (!tree) {
    tree = Object.keys(DIFFS).indexOf(key) >= 0 ? merge(BASE, DIFFS[key]) : BASE
    CACHE.set(key, tree)
  }
  return tree
}

module.exports = { createTokens, tokenNames, tokens: BASE }
