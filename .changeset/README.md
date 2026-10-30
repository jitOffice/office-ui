# Changesets

这个目录是版本与 changelog 的唯一来源（02 §A3）。**不手改 `CHANGELOG.md`，不手改包版本号**——
两者都由 `changeset version` 从这里的 markdown 生成。

## 一次改动怎么走完

```bash
pnpm changeset            # 交互式：选包 + 选 bump 级别 + 写一段"使用方能感知的变化"
git add .changeset && git commit
```

PR 合并进 `main` 后，`release.yml` 会开一个 **Version Packages** PR（里面是版本号与 CHANGELOG 的 diff）；
合并它，同一个 workflow 接着构建、provenance 签名、`npm publish`。人只做两件判断：写 changeset、看 Version PR。

## 写 changeset 的规矩（CONTRIBUTING §2）

写**使用方能感知的变化**，不写改了哪个文件：

| 好 | 坏 |
|---|---|
| `OjRibbon` 的组启动器在溢出降级后不再重复弹出 | 调整了 `ribbon.ts` 里的 `groupLaunchers` 计算 |
| `@jitoffice/tokens` 新增 `--oj-bg-glass-soft`，旧变量保留 | 改了 seed 与 theme 输出 |
| 修复 `OjTableGridPicker` 在 RTL 下选区错位 | fix bug |

breaking change 用 `major`（`^0.x` 阶段 `minor` 也可以），并在正文第一行写清迁移路径。

## 为什么 changelog 不用 `@changesets/changelog-github`

那个生成器会调 GitHub API 拉 PR 标题与作者。两个问题：私有镜像/内网构建拿不到 API；
以及它会用 PR 标题覆盖人写的说明——而这个仓库的 changelog 质量是靠人写在 changeset 里保证的
（02：开源库没有好的 changelog 就没有升级意愿）。默认生成器只读本地 `.changeset/*.md`，离线可跑。

## 为什么私有包不参与版本

`@jitoffice/docs`、`@jitoffice/internal-build` 是 `private: true`，设了
`privatePackages: { version: false, tag: false }`：它们既不出现在 CHANGELOG，也不会被 bump。
否则文档站会因为"依赖了某个发布包"被 changesets 要求一起升版，产生一串无意义的 diff。

## `format` 为什么是 `false`

默认的 `"auto"` 会去探测仓库里有没有 prettier。本仓库没有装 prettier，但只要某人全局装了，
`changeset version` 的输出就会和他机器上不同——生成物入库的仓库经不起这种漂移。
