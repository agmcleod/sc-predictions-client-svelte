import sveltePreprocess from 'svelte-preprocess'
import { optimizeImports, optimizeCss } from 'carbon-preprocess-svelte'
import adapter from '@sveltejs/adapter-static'

export default {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [sveltePreprocess(), optimizeImports()],
  kit: {
    adapter: adapter(),
    vite: {
      plugins: [process.env.NODE_ENV === 'production' && optimizeCss()],
    },
  },
}
