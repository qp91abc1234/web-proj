import { createStorageRef } from '../../../common/utils/storage'

import 'element-plus/theme-chalk/dark/css-vars.css'

export function useTheme() {
  const colorMix = (color1, color2, weight) => {
    weight = Math.max(Math.min(Number(weight), 1), 0)
    const r1 = parseInt(color1.substring(1, 3), 16)
    const g1 = parseInt(color1.substring(3, 5), 16)
    const b1 = parseInt(color1.substring(5, 7), 16)
    const r2 = parseInt(color2.substring(1, 3), 16)
    const g2 = parseInt(color2.substring(3, 5), 16)
    const b2 = parseInt(color2.substring(5, 7), 16)
    const r = Math.round(r1 * (1 - weight) + r2 * weight)
    const g = Math.round(g1 * (1 - weight) + g2 * weight)
    const b = Math.round(b1 * (1 - weight) + b2 * weight)
    const rr = `0${(r || 0).toString(16)}`.slice(-2)
    const gg = `0${(g || 0).toString(16)}`.slice(-2)
    const bb = `0${(b || 0).toString(16)}`.slice(-2)
    return `#${rr}${gg}${bb}`
  }

  const changeThemeColor = (config) => {
    const mixColor = {
      light: ['#ffffff', '#000000'],
      dark: ['#000000', '#ffffff']
    }
    const documentElement = document.documentElement as HTMLElement
    const modeStr = config.darkMode ? 'dark' : 'light'

    documentElement.setAttribute('class', modeStr === 'dark' ? 'dark' : '')
    Object.keys(config).forEach((key) => {
      if (key === 'darkMode') return
      const prefix = `--el-color-${key}`
      const initialColor = config[key]
      documentElement.style.setProperty(prefix, initialColor)
      ;[3, 5, 7, 8, 9].forEach((idx) => {
        const color = colorMix(initialColor, mixColor[modeStr][0], idx / 10)
        documentElement.style.setProperty(`${prefix}-light-${idx}`, color)
      })
      const color = colorMix(initialColor, mixColor[modeStr][1], 0.2)
      documentElement.style.setProperty(`${prefix}-dark-2`, color)
    })
  }

  const themeCfg = createStorageRef(
    'themeCfg',
    {
      darkMode: false,
      primary: '#409eff'
    },
    { cb: changeThemeColor, immediate: true }
  )

  return {
    themeCfg
  }
}
