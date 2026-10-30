<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

/**
 * 文档站里的 Playground 宿主（04 §3）。
 *
 * 这一版刻意做得小：`<textarea>` + 运行按钮 + 沙箱 iframe。编辑器（CodeMirror 6）与多文件 SFC
 * 编译是下一步——先把**协议与沙箱边界**钉死，因为出问题的地方几乎都在那里：
 *
 *   - iframe 只给 `allow-scripts`，**不给** `allow-same-origin`：用户代码读不到宿主 DOM 与存储；
 *   - 宿主只在 `event.source` 是该 iframe 时才收消息，否则任何页面都能往这里塞"错误"；
 *   - 高度由 iframe 上报，不用固定值（`OjRibbon` 这类长组件会被截断）；
 *   - 语法/运行/挂载三类错误都回传并显示在下方，**不白屏**。
 */

const props = withDefaults(defineProps<{ code: string; height?: number }>(), { height: 220 })

const frame = ref<HTMLIFrameElement | null>(null)
const source = ref(props.code)
const errors = ref<string[]>([])
const frameHeight = ref(props.height)
const pending = ref(true)

function run(): void {
  errors.value = []
  frame.value?.contentWindow?.postMessage({ type: 'oj-playground:run', code: source.value }, '*')
}

function onMessage(event: MessageEvent): void {
  // 只认自己那个 iframe：沙箱里的页面与宿主不同源，event.origin 不可靠，用 source 判断
  if (event.source !== frame.value?.contentWindow) return
  const data = event.data as { type?: string; message?: string; height?: number } | null
  if (!data || typeof data.type !== 'string') return

  if (data.type === 'oj-playground:ready') {
    pending.value = false
    run()
    return
  }
  if (data.type === 'oj-playground:ok') return
  if (data.type === 'oj-playground:height') {
    frameHeight.value = Math.max(120, Number(data.height) || 0)
    return
  }
  if (data.type === 'oj-playground:error') errors.value = [...errors.value, String(data.message ?? '')]
}

onMounted(() => window.addEventListener('message', onMessage))
onBeforeUnmount(() => window.removeEventListener('message', onMessage))
watch(
  () => props.code,
  (next) => {
    source.value = next
  },
)
</script>

<template>
  <div class="oj-playground">
    <div class="oj-playground__toolbar">
      <span class="oj-playground__hint">改完点运行 · 沙箱内没有宿主权限</span>
      <button type="button" class="oj-button" data-size="mini" :disabled="pending" @click="run">运行</button>
    </div>
    <textarea v-model="source" class="oj-playground__code" spellcheck="false" aria-label="示例代码" />
    <iframe
      ref="frame"
      class="oj-playground__frame"
      title="预览"
      sandbox="allow-scripts"
      src="/playground/frame/index.html"
      :style="{ height: `${frameHeight}px` }"
    />
    <ul v-if="errors.length > 0" class="oj-playground__errors" role="alert">
      <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
    </ul>
  </div>
</template>

<style scoped>
.oj-playground {
  margin: var(--oj-space-4) 0;
  border: 1px solid var(--oj-border-1);
  border-radius: var(--oj-radius-lg);
  overflow: hidden;
}

.oj-playground__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--oj-space-2);
  padding: var(--oj-space-2);
  border-bottom: 1px solid var(--oj-border-1);
  background: var(--oj-bg-page);
}

.oj-playground__hint {
  color: var(--oj-text-3);
  font-size: 12px;
}

.oj-playground__code {
  display: block;
  width: 100%;
  min-height: 140px;
  padding: var(--oj-space-3);
  border: 0;
  border-bottom: 1px solid var(--oj-border-1);
  background: var(--oj-bg-container);
  color: var(--oj-text-1);
  font: 13px/1.6 var(--oj-font-mono);
  resize: vertical;
}

.oj-playground__frame {
  display: block;
  width: 100%;
  border: 0;
  background: var(--oj-bg-container);
}

.oj-playground__errors {
  margin: 0;
  padding: var(--oj-space-2) var(--oj-space-3);
  background: var(--oj-danger-1);
  color: var(--oj-danger-7);
  font: 12px/1.6 var(--oj-font-mono);
  list-style: none;
}
</style>
