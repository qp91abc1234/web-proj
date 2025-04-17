import { defineConfig } from 'unocss'
import presetWind3 from '@unocss/preset-wind3'
import transformerDirectives from '@unocss/transformer-directives'
import transformerVariantGroup from '@unocss/transformer-variant-group'

export default defineConfig({
  presets: [presetWind3()],
  shortcuts: {
    'wh-full': 'w-full h-full',
    'flex-h': 'flex flex-row',
    'flex-v': 'flex flex-col',
    'flex-center': 'flex items-center justify-center',
    'flex-h-center': 'flex items-center',
    'flex-v-center': 'flex flex-col items-center'
  },
  transformers: [transformerDirectives(), transformerVariantGroup()]
})
