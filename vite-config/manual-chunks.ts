interface ManualChunkGroup {
  name: string
  keywords: string[]
}

type ManualChunkResolver = (id: string) => string | undefined

const manualChunkGroups: ReadonlyArray<ManualChunkGroup> = [
  { name: 'vue-core', keywords: ['vue', 'vue-router', 'pinia'] },
  { name: 'ui-lib', keywords: ['element-plus', '@element-plus/icons-vue'] },
  { name: 'vueuse', keywords: ['@vueuse'] },
  { name: 'network-date', keywords: ['axios', 'dayjs'] },
  { name: 'utility', keywords: ['lodash-es', 'crypto-js', 'uuid', 'nanoid', 'mitt'] },
  { name: 'vconsole', keywords: ['vconsole'] }
]

const matchesChunkKeyword = (id: string, keyword: string) =>
  id.includes(`/node_modules/${keyword}/`) || id.includes(`/node_modules/${keyword}`)

export const manualChunks: ManualChunkResolver = (id) => {
  const normalizedId = id.replace(/\\/g, '/')
  if (!normalizedId.includes('node_modules')) return undefined

  for (const group of manualChunkGroups) {
    if (group.keywords.some((keyword) => matchesChunkKeyword(normalizedId, keyword))) {
      return group.name
    }
  }
  return 'vendor'
}
