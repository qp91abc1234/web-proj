---
name: use-countdown-hook
description: 中文优先实现并修改 useCountDown 倒计时 Hook，涵盖 requestAnimationFrame 计时、idle/running/paused 状态流转、暂停恢复补偿、mm:ss 格式化输出。Use when 用户提到倒计时、useCountDown、暂停/恢复计时 (pause/resume)、剩余时间格式化 (remaining time formatting) 或倒计时行为调整。
---

# useCountDown Hook

## 目标（Purpose）

为 `src/common/hooks/use-countdown.ts` 提供“实现优先”的指导。
当用户要求新增或修改倒计时行为时，优先直接改代码，并保持 API 兼容与运行时正确性。

## 事实来源（Source of truth）

- Hook 文件：`src/common/hooks/use-countdown.ts`
- 运行模型：`useRafFn` + `Date.now()` 计算 elapsed time
- 状态机：`idle -> running -> paused -> running -> idle`

## 需保持的公开契约（Public contract）

除非用户明确要求 breaking change，否则保持以下导出和语义不变：

- 类型 `CountDownStatus = 'idle' | 'running' | 'paused'`
- 入参 `options`：`seconds?`, `onFinish?`, `onStart?`, `onStop?`
- 返回 refs/computed：
  - `remainingTime`（向上取整秒数, ceil integer seconds）
  - `remainingTimeExact`（精确秒数, float seconds）
  - `formattedTime`（`mm:ss`）
  - `status`, `isRunning`, `isPaused`, `isIdle`
- 返回 actions：`start`, `stop`, `pause`, `resume`, `reset`

## 默认实现规则（Implementation defaults）

实现或重构时默认遵循：

1. 使用 `useRafFn(..., { immediate: false })`。
2. 使用暂停补偿计算 elapsed：
   - `elapsed = (Date.now() - startTime - pausedTime) / 1000`
3. 对剩余时间做下限钳制（clamp）：
   - `remainingTimeExact = Math.max(0, seconds - elapsed)`
4. 结束条件（finish）：
   - 当精确剩余时间到 `0`：先设 `status = 'idle'`，再 `pauseRaf()`，最后调用 `onFinish`。
5. 状态守卫（state guards）：
   - `start`：若已 `running` 则 no-op
   - `stop`：若已 `idle` 则 no-op
   - `pause`：仅允许从 `running` 进入
   - `resume`：仅允许从 `paused` 进入
6. 生命周期清理（cleanup）：
   - 在 `onScopeDispose` 中调用 `pauseRaf()`。

## 变更流程（implementation-first）

当用户提出倒计时改造需求，按以下顺序执行：

1. 先更新 `use-countdown.ts` 核心计时逻辑。
2. 非用户明确要求时，不改动对外 API。
3. 核心逻辑正确后，再补充或调整派生状态（`computed`）。
4. 校验边界行为：
   - 快速连续 `pause/resume`
   - 多次重复 `start`
   - 暂停后 `stop/reset`
   - 剩余时间不小于 0，且每次运行只触发一次 `onFinish`
5. 仅在用户要求时给 usage snippet；默认聚焦“改了哪些文件与逻辑”。

## 输出要求（Output requirements）

处理实现类任务时，响应应包含：

- 变更文件列表（Files changed）
- 为什么逻辑正确（1-3 条）
- 可选的手工验证步骤（简短）

除非用户要求，不输出长篇理论解释。

## 可选增强模式（Optional enhancements）

仅在用户明确提出时启用：

- 增加 `hh:mm:ss` 格式开关
- 增加 `autoStart` 选项
- 增加 `onTick` 回调（含 throttling/debounce）
- 支持动态 `seconds` 重置策略

新增选项时必须保持向后兼容，并提供合理默认值。

## 快速验收清单（Checklist）

- [ ] 无非法状态流转（No invalid transitions）
- [ ] 暂停时长不计入 elapsed
- [ ] 剩余时间不为负数
- [ ] `formattedTime` 仍输出零填充 `mm:ss`
- [ ] 在 finish/stop/dispose 时 RAF 均已暂停
