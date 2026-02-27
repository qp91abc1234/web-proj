<script lang="ts" setup>
/**
 * 异步远程选择器组件，支持远程搜索与滚动加载更多
 *
 * @description
 * 基于 el-select 的 remote 模式：输入时按关键词分页请求选项列表，
 * 下拉内滚动触底时加载下一页。通过 fetchOption 按 value 拉取单条用于回显。
 * 使用 useAsyncWatch 与 AbortController 处理竞态，避免旧请求覆盖新结果。
 *
 * @props modelValue - 当前选中项的 value（v-model）
 * @props fetchOption - 按 value 拉取单条选项（回显用），需支持 signal 取消
 * @props fetchOptions - 按 query 分页拉取列表，返回 { data, total }，需支持 signal
 * @props placeholder - 占位文案
 * @props pageSize - 每页条数（内部与 10 取较大值）
 * @props label / value - 选项的 label、value 字段名
 * @props threshold - 触底判定阈值（像素）
 *
 * @slot loadmore - 还有更多时展示（如「加载更多」）
 * @slot nomore - 没有更多时展示（如「没有更多了」）
 *
 * @example
 * ```vue
 * <AsyncSelect
 *   v-model="selected"
 *   :fetch-option="(val, signal) => api.getOption(val, { signal })"
 *   :fetch-options="(q, page, size, signal) => api.getOptions({ query: q, page, pageSize: size, signal })"
 *   placeholder="请输入关键词"
 * >
 *   <template #loadmore>加载更多</template>
 *   <template #nomore>没有更多了</template>
 * </AsyncSelect>
 * ```
 */
import { useAsyncWatch } from '@/common/hooks/use-async-watch'
import { useDebounceFn } from '@vueuse/core'
import type { ElSelect } from 'element-plus'
import {
  computed,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  render,
  useSlots
} from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    fetchOption: (value: string, signal: AbortSignal) => Promise<any>
    fetchOptions: (
      query: string,
      page: number,
      pageSize: number,
      signal: AbortSignal
    ) => Promise<{ data: any[]; total: number }>
    placeholder?: string
    pageSize?: number
    label?: string
    value?: string
    threshold?: number
  }>(),
  {
    modelValue: '',
    fetchOption: () => Promise.resolve({}),
    fetchOptions: () => Promise.resolve({ data: [], total: 0 }),
    placeholder: 'Please enter a keyword',
    pageSize: 10,
    label: 'label',
    value: 'value',
    threshold: 20
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const slots = useSlots()

const options = ref<any[]>([])
const selectedOption = ref<any>(null)
const loading = ref(false)
const paginationInfo = reactive({
  query: '',
  pageIndex: 1,
  total: 0,
  nomore: false
})

const selectRef = ref<InstanceType<typeof ElSelect>>()
let scrollRef: HTMLElement | null = null
let requestId = 0
let controller: AbortController | null = null

const pageSize = computed(() => {
  return props.pageSize < 10 ? 10 : props.pageSize
})

useAsyncWatch(
  () => props.modelValue,
  async (newVal, _, isValid, signal) => {
    if (!newVal) {
      selectedOption.value = null
      return
    }
    let ret = selectedOption.value
    if (!selectedOption.value || selectedOption.value[props.value] !== newVal)
      ret = options.value.find((item) => item[props.value] === newVal)
    if (!ret) ret = await props.fetchOption(newVal, signal)
    if (!ret) return
    if (!isValid()) return
    selectedOption.value = ret
  },
  { immediate: true }
)

onMounted(() => {
  if (!selectRef.value) return
  scrollRef = selectRef.value.popperRef?.querySelector('.el-scrollbar__wrap') as HTMLElement | null
  if (!scrollRef) return
  scrollRef.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  if (scrollRef) {
    scrollRef.removeEventListener('scroll', handleScroll)
  }
})

const fetchOptions = async () => {
  controller?.abort()
  controller = new AbortController()
  const currentRequestId = ++requestId
  const ret = await props.fetchOptions(
    paginationInfo.query,
    paginationInfo.pageIndex,
    pageSize.value,
    controller.signal
  )
  if (currentRequestId !== requestId) return null
  else return ret
}

const remoteMethod = async (query: string) => {
  Object.assign(paginationInfo, {
    query,
    pageIndex: 1,
    total: 0,
    nomore: false
  })

  loading.value = true
  let ret: { data: any[]; total: number } | null = null
  try {
    ret = await fetchOptions()
  } finally {
    loading.value = false
  }
  if (!ret) return
  options.value = ret.data
  Object.assign(paginationInfo, {
    pageIndex: paginationInfo.pageIndex + 1,
    total: ret.total,
    nomore: options.value.length >= ret.total
  })

  nextTick(() => {
    if (!scrollRef) return
    scrollRef.scrollTop = 0
    if (paginationInfo.nomore) {
      if (!slots.nomore) return
      render(h(slots.nomore), scrollRef)
    } else {
      if (!slots.loadmore) return
      render(h(slots.loadmore), scrollRef)
    }
  })
}

const handleScroll = useDebounceFn(async (e: Event) => {
  const el = e.target as HTMLElement
  if (!el) return

  const { scrollTop, clientHeight, scrollHeight } = el
  const isBottom = scrollTop + clientHeight >= scrollHeight - props.threshold
  if (!isBottom) return

  if (paginationInfo.nomore) return

  const ret = await fetchOptions()
  if (!ret) return

  options.value = [...options.value, ...ret.data]
  Object.assign(paginationInfo, {
    pageIndex: paginationInfo.pageIndex + 1,
    total: ret.total,
    nomore: options.value.length >= ret.total
  })

  if (!scrollRef) return
  if (paginationInfo.nomore) {
    if (!slots.nomore) return
    render(h(slots.nomore), scrollRef)
  }
}, 100)
</script>

<template>
  <div>
    <el-select
      ref="selectRef"
      :model-value="props.modelValue"
      @update:modelValue="emit('update:modelValue', $event)"
      filterable
      clearable
      remote
      :remote-method="remoteMethod"
      :options="options"
      :loading="loading"
      :props="{ label: props.label, value: props.value }"
    >
      <template #label>
        <span>{{ selectedOption?.[props.label] || props.placeholder }}</span>
      </template>
    </el-select>
    <div class="footer">
      <slot name="loadmore"></slot>
      <slot name="nomore"></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.footer {
  width: 0;
  height: 0;
  overflow: hidden;
}
</style>
