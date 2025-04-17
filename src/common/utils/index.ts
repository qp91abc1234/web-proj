import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
import isYesterday from 'dayjs/plugin/isYesterday'

dayjs.extend(isToday)
dayjs.extend(isYesterday)

export function getImageUrl(name) {
  return new URL(`../../assets/${name}`, import.meta.url).href
}

export function formatDateTime(
  datetime: string | number | Date | undefined = undefined,
  opts: {
    template?: string
    isRelativeTime?: boolean
  } = {}
) {
  const { template = 'YYYY-MM-DD HH:mm:ss', isRelativeTime = false } = opts
  const day = dayjs(datetime)
  if (!day.isValid()) return 'N/A'

  if (isRelativeTime) {
    const now = dayjs()
    const diffMinutes = now.diff(day, 'minute')

    // 30分钟内显示"x分钟前"
    if (diffMinutes >= 0 && diffMinutes < 30) {
      return diffMinutes === 0 ? '刚刚' : `${diffMinutes}分钟前`
    }

    if (day.isToday()) {
      return `今天 ${day.format('HH:mm')}`
    }

    if (day.isYesterday()) {
      return `昨天 ${day.format('HH:mm')}`
    }
  }

  return day.format(template)
}
