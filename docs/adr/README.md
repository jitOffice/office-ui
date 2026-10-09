# ADR 架构决策记录

本目录记录会影响**公开 API、包结构、产物格式、依赖面或浏览器支持范围**的决策。

## 何时必须新开 ADR

满足以下任一条即需要：

1. 改变 `--oj-*` 变量命名规则或 class 命名规则
2. 改变包的划分、依赖方向或新增/移除运行时依赖
3. 改变构建产物格式、`exports` 映射或 `sideEffects` 判定
4. 改变支持的浏览器范围
5. 与 `prd/` 中既有结论**相反**的任何决定
6. 引入第三方代码或资产（触发 `NOTICE` 更新）

不需要 ADR 的：新增一个组件（走 PR + 组件清单更新）、内部重构（不改公开契约）、修 bug。

## 判据要求

**不接受"某大库也这么做"作为唯一依据。** 每条决策必须给出至少一个本项目特有的理由（办公场景约束、内网部署约束、canvas 渲染约束、或实测数据）。

## 索引

| ADR | 标题 | 状态 |
|---|---|---|
| [0001](./0001-namespace-and-prefix.md) | 命名空间与前缀策略 | Accepted |
| [0002](./0002-browser-baseline.md) | 浏览器支持基线与转译目标 | Accepted |
| [0003](./0003-no-per-component-css.md) | CSS 不做逐组件分包 | Accepted |
| [0004](./0004-zero-runtime-dependencies.md) | 零运行时依赖 | Accepted |
| [0005](./0005-framework-neutral-command-registry.md) | 命令注册表框架中立，响应式契约只用 `subscribe` | Accepted |

模板见 [_template.md](./_template.md)。
