import { defineConfig } from 'vitest/config'

/**
 * `ui` 的单测车道（02 §7：Vitest + @vue/test-utils）。
 *
 * 与另外两条车道刻意分开，靠目录与后缀隔开：
 *   - 后缀 `.test.ts`（test 下任意层级）→ `node --test`，零依赖，
 *     `pnpm verify` 在没有 node_modules 时也要跑
 *   - `test/unit` 下的 `.spec.ts` → Vitest，需要 vue + DOM
 *   - `test/visual` 下的 `.spec.ts` → Playwright，需要真浏览器
 * 混在一起的话，零依赖那条链会被 vue 的裸导入拖死。
 *
 * 用 `happy-dom` 而不是 jsdom：本车道要验的是**响应式与重渲染次数**，不是布局；
 * jsdom 更全也更慢，而 happy-dom 足够提供 `requestAnimationFrame`，让命令注册表的合帧真的发生。
 *
 * 注意：本文件里不要写 glob 字面量（它含 `*斜杠`，会把上面这段块注释提前闭合）。
 */
export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['test/unit/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      // 只量 `src`：`test` 自己被算进去等于用测试给自己打分。
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts'],
      reporter: ['text'],
      /**
       * 02 §7 的两条阈值，按目录分开卡：
       *   - 组件行 ≥85%：`src/vue/**`。命令注册表那种"多一条分支就多一条没测的路径"的
       *     代码靠单点阈值守不住，85% 是"新组件不能只写 happy path"的底线；
       *   - 注册表 ≥95%：`registry.ts` 被每条命令、每个快捷键穿过，漏一个分支就是
       *     "某个组件在某个宿主里静默不响应"，所以口径更严。
       * 拿不到数就失败（`--coverage` 忘了带时会直接报 no coverage），
       * 这样不会出现"门禁在但没跑"的情况。
       */
      thresholds: {
        'src/vue/**/*.ts': { lines: 85 },
        'src/vue/registry.ts': { lines: 95 },
        'src/vue/popper.ts': { lines: 95 },
      },
    },
  },
})
