<script setup lang="ts">
import {
  CircleCheck,
  DataAnalysis,
  Document,
  Moon,
  Setting,
  Sunny,
  User,
  UserFilled,
  View,
  Warning
} from '@element-plus/icons-vue'
import { ref, computed, markRaw } from 'vue'

const currentTime = ref(new Date())

// 更新当前时间
setInterval(() => {
  currentTime.value = new Date()
}, 1000)

// 获取问候语
const greeting = computed(() => {
  const hour = currentTime.value.getHours()
  if (hour < 6) return '凌晨好'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 17) return '下午好'
  if (hour < 19) return '傍晚好'
  if (hour < 22) return '晚上好'
  return '夜深了'
})

// 格式化时间
const formattedTime = computed(() => {
  return currentTime.value.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
})

// 统计数据
const statistics = ref([
  { title: '今日访问', value: 1234, icon: markRaw(View), color: '#409eff' },
  { title: '今日订单', value: 56, icon: markRaw(Document), color: '#67c23a' },
  { title: '待处理', value: 8, icon: markRaw(Warning), color: '#e6a23c' },
  { title: '总用户数', value: 5678, icon: markRaw(User), color: '#f56c6c' }
])

// 快捷入口
const shortcuts = ref([
  { title: '用户管理', icon: markRaw(User), path: '/system/user' },
  { title: '角色管理', icon: markRaw(UserFilled), path: '/system/role' },
  { title: '系统设置', icon: markRaw(Setting), path: '/system/setting' },
  { title: '数据统计', icon: markRaw(DataAnalysis), path: '/data/statistics' }
])
</script>

<template>
  <div class="home-page">
    <!-- 欢迎卡片 -->
    <el-card class="welcome-card">
      <div class="welcome-content">
        <div class="welcome-text">
          <h2>{{ greeting }}，欢迎回来！</h2>
          <p class="time">{{ formattedTime }}</p>
          <p class="description">这是一个基于 Vue3 + Element Plus + Pinia 的后台管理系统</p>
        </div>
        <div class="welcome-image">
          <el-icon :size="120" color="#409eff">
            <Sunny v-if="greeting.includes('上午')" />
            <Sunny v-else-if="greeting.includes('中午')" />
            <Sunny v-else-if="greeting.includes('下午')" />
            <Moon v-else />
          </el-icon>
        </div>
      </div>
    </el-card>

    <!-- 统计数据 -->
    <div class="statistics-grid">
      <el-card v-for="item in statistics" :key="item.title" class="statistic-card" shadow="hover">
        <div class="statistic-content">
          <div class="statistic-icon" :style="{ backgroundColor: item.color }">
            <el-icon :size="32">
              <component :is="item.icon" />
            </el-icon>
          </div>
          <div class="statistic-info">
            <div class="statistic-value">{{ item.value }}</div>
            <div class="statistic-title">{{ item.title }}</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 快捷入口 -->
    <el-card class="shortcuts-card">
      <template #header>
        <div class="card-header">
          <span>快捷入口</span>
        </div>
      </template>
      <div class="shortcuts-grid">
        <div v-for="item in shortcuts" :key="item.title" class="shortcut-item">
          <el-icon :size="40" color="#409eff">
            <component :is="item.icon" />
          </el-icon>
          <div class="shortcut-title">{{ item.title }}</div>
        </div>
      </div>
    </el-card>

    <!-- 系统信息 -->
    <div class="info-grid">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>技术栈</span>
          </div>
        </template>
        <div class="tech-stack">
          <el-tag type="primary">Vue 3.5+</el-tag>
          <el-tag type="success">Element Plus 2.9+</el-tag>
          <el-tag type="warning">Pinia 2.3+</el-tag>
          <el-tag type="danger">Vue Router 4.5+</el-tag>
          <el-tag type="info">TypeScript 5.6+</el-tag>
          <el-tag>Vite 6.0+</el-tag>
          <el-tag type="primary">UnoCSS</el-tag>
          <el-tag type="success">Axios</el-tag>
        </div>
      </el-card>

      <el-card>
        <template #header>
          <div class="card-header">
            <span>功能特性</span>
          </div>
        </template>
        <ul class="feature-list">
          <li>
            <el-icon color="#67c23a"><CircleCheck /></el-icon> 动态路由和权限管理
          </li>
          <li>
            <el-icon color="#67c23a"><CircleCheck /></el-icon> 响应式布局
          </li>
          <li>
            <el-icon color="#67c23a"><CircleCheck /></el-icon> 主题切换
          </li>
          <li>
            <el-icon color="#67c23a"><CircleCheck /></el-icon> 页面标签导航
          </li>
          <li>
            <el-icon color="#67c23a"><CircleCheck /></el-icon> 用户认证
          </li>
          <li>
            <el-icon color="#67c23a"><CircleCheck /></el-icon> 代码规范检查
          </li>
        </ul>
      </el-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.home-page {
  padding: 20px;

  .welcome-card {
    margin-bottom: 20px;

    .welcome-content {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .welcome-text {
        flex: 1;

        h2 {
          margin: 0 0 12px;
          font-size: 28px;
          color: var(--el-text-color-primary);
        }

        .time {
          margin: 0 0 12px;
          font-size: 16px;
          color: var(--el-text-color-regular);
        }

        .description {
          margin: 0;
          font-size: 14px;
          color: var(--el-text-color-secondary);
        }
      }

      .welcome-image {
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.8;
      }
    }
  }

  .statistics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 20px;

    .statistic-card {
      .statistic-content {
        display: flex;
        gap: 20px;
        align-items: center;

        .statistic-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          color: white;
          border-radius: 12px;
        }

        .statistic-info {
          flex: 1;

          .statistic-value {
            margin-bottom: 8px;
            font-size: 28px;
            font-weight: bold;
            color: var(--el-text-color-primary);
          }

          .statistic-title {
            font-size: 14px;
            color: var(--el-text-color-secondary);
          }
        }
      }
    }
  }

  .shortcuts-card {
    margin-bottom: 20px;

    .shortcuts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 20px;

      .shortcut-item {
        display: flex;
        flex-direction: column;
        gap: 12px;
        align-items: center;
        padding: 20px;
        cursor: pointer;
        border: 1px solid var(--el-border-color-lighter);
        border-radius: 8px;
        transition: all 0.3s;

        &:hover {
          border-color: #409eff;
          box-shadow: 0 4px 12px rgb(64 158 255 / 20%);
          transform: translateY(-4px);
        }

        .shortcut-title {
          font-size: 14px;
          color: var(--el-text-color-regular);
        }
      }
    }
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;

    .tech-stack {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .feature-list {
      padding: 0;
      margin: 0;
      list-style: none;

      li {
        display: flex;
        gap: 8px;
        align-items: center;
        padding: 8px 0;
        font-size: 14px;
        color: var(--el-text-color-regular);
      }
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 600;
  }
}

@media (width <= 768px) {
  .home-page {
    padding: 12px;

    .welcome-content {
      flex-direction: column;
      text-align: center;

      .welcome-image {
        margin-top: 20px;
      }
    }

    .statistics-grid {
      grid-template-columns: 1fr;
    }

    .shortcuts-card {
      .shortcuts-grid {
        grid-template-columns: 1fr;
      }
    }

    .info-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
