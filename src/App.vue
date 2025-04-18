<script setup lang="ts"></script>

<template>
  <RouterView></RouterView>
</template>

<style lang="scss">
#app {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: var(--el-bg-color);
}

::-webkit-scrollbar {
  display: none;
}
</style>
