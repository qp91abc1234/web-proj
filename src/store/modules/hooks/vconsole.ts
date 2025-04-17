import VConsole from 'vconsole'

import { createStorageRef } from '../../../common/utils/storage'

export function useVConsole() {
  const changeVConsole = async (val) => {
    const ele = document.getElementById('__vconsole')
    if (val) {
      if (ele) {
        ele.style.display = 'block'
      } else {
        new VConsole()
      }
    } else if (ele) {
      ele.style.display = 'none'
    }
  }

  const vConsole = createStorageRef('vConsole', false, { cb: changeVConsole, immediate: true })

  return {
    vConsole
  }
}
