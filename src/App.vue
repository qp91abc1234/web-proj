<script setup lang="ts"></script>

<template>
  <RouterView></RouterView>
</template>

<style lang="scss">
#app {
  position: relative;
  background-color: var(--el-bg-color);
  width: 100vw;
  height: 100vh;
}

::-webkit-scrollbar {
  display: none;
}
</style>
