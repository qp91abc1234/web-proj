<script setup lang="ts">
/**
 * GFlex - Flex 布局组件
 *
 * 使用示例：
 *
 * 1. 基础用法 - 水平居中
 * <g-flex justify="center" align="center">
 *   <div>内容</div>
 * </g-flex>
 *
 * 2. 垂直布局
 * <g-flex dir="column" :gap="16">
 *   <div>项目1</div>
 *   <div>项目2</div>
 * </g-flex>
 *
 * 3. 两端对齐
 * <g-flex justify="space-between" align="center">
 *   <div>左侧</div>
 *   <div>右侧</div>
 * </g-flex>
 *
 * 4. 换行布局
 * <g-flex wrap="wrap" :gap="10">
 *   <div v-for="i in 10">项目{{ i }}</div>
 * </g-flex>
 *
 * 5. inline-flex
 * <g-flex inline justify="center">行内flex</g-flex>
 */
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    dir?: 'row' | 'column' | 'row-reverse' | 'column-reverse' // flex-direction
    justify?:
      | 'flex-start'
      | 'flex-end'
      | 'center'
      | 'space-between'
      | 'space-around'
      | 'space-evenly' // justify-content
    align?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch' // align-items
    wrap?: 'nowrap' | 'wrap' | 'wrap-reverse' // flex-wrap
    gap?: string | number // gap 间距
    inline?: boolean // 是否使用 inline-flex
  }>(),
  {
    dir: 'row',
    justify: 'flex-start',
    align: 'stretch',
    wrap: 'nowrap',
    gap: '',
    inline: false
  }
)

// 计算样式
const flexStyle = computed(() => {
  const style: Record<string, string> = {
    display: props.inline ? 'inline-flex' : 'flex',
    'flex-direction': props.dir,
    'justify-content': props.justify,
    'align-items': props.align,
    'flex-wrap': props.wrap
  }

  // 处理 gap，支持数字（默认px）和字符串
  if (props.gap) {
    style.gap = typeof props.gap === 'number' ? `${props.gap}px` : props.gap
  }

  return style
})
</script>

<template>
  <div class="g-flex" :style="flexStyle">
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped></style>
