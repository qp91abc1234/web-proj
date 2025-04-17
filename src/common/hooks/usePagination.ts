import { ref } from 'vue'

type PaginationData = {
  total?: number
  currentPage?: number
  pageSizes?: number[]
  pageSize?: number
  layout?: string
}

/** 默认的分页参数 */
const DEFAULT_PAGINATION_DATA = {
  total: 0,
  currentPage: 1,
  pageSizes: [10, 20, 50],
  pageSize: 10,
  layout: 'total, sizes, prev, pager, next, jumper'
}

export function usePagination(data: PaginationData = {}) {
  const paginationData = ref({ ...DEFAULT_PAGINATION_DATA, ...data })

  const handleCurrentChange = (value: number) => {
    paginationData.value.currentPage = value
  }

  const handleSizeChange = (value: number) => {
    paginationData.value.pageSize = value
  }

  return { paginationData, handleCurrentChange, handleSizeChange }
}
