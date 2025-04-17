<script setup lang="ts">
withDefaults(
  defineProps<{
    dir?: 'row' | 'column'
    justify?: 'initial' | 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around'
    align?: 'initial' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch'
    wrap?: boolean
  }>(),
  {
    dir: 'row',
    justify: 'initial',
    align: 'initial',
    wrap: false
  }
)
</script>

<template>
  <div
    class="flex"
    :style="{
      'flex-direction': dir,
      'justify-content': justify,
      'align-items': align
    }"
  >
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped></style>
