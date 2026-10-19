/** 选项卡键盘模型。方向键在一组 id 里循环，Home / End 跳到两端。 */

export function selectByKey(ids: readonly string[], current: string, key: string): string {
  if (ids.length === 0) return current
  const index = Math.max(0, ids.indexOf(current))
  if (key === 'ArrowRight') return ids[(index + 1) % ids.length] ?? current
  if (key === 'ArrowLeft') return ids[(index - 1 + ids.length) % ids.length] ?? current
  if (key === 'Home') return ids[0] ?? current
  if (key === 'End') return ids[ids.length - 1] ?? current
  return current
}
