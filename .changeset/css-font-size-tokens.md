---
'@jitoffice/ui': patch
---

组件样式里的字号改为走 token（16 处 `12px` / `14px` / `20px` → `var(--oj-fs-12|14|20)`），
并新增门禁 `pnpm lint:css-magic` 防止回退。

为什么值得改：字号写死后，`ja` 档位把 `--oj-fs-14` 覆写成 13px 时组件不会跟着降——
日文界面下工具栏反而比中文大一号。改成 token 之后，语言档位与 `compact` 密度档位对字号的
覆写才能真的生效（`compact` 下 14px → 13px 是预期变化，不是回归）。

三处刻意保留字面量，并在门禁里逐条登记了理由：`.oj-ruler` 刻度 10px（读数要比正文小一档）、
`.oj-watermark__layer` 48px（水印要横跨整页）、`.oj-ribbon__keytip` 11px（16px 方框内单字符）。
间距与圆角的魔法数**仍未守**：token 标度覆盖不了 2px / 7px / 28px / 56px，需要先定标度。
