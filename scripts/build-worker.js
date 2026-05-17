import { build } from 'esbuild'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const isDev = process.argv.includes('--dev')

console.log(`\n🔨 Building worker [${isDev ? 'development' : 'production'}]...\n`)

await build({
  entryPoints: [resolve(__dirname, '../src/worker/index.ts')],
  bundle: true,
  outfile: resolve(__dirname, '../dist/worker.js'),
  platform: 'neutral',
  format: 'esm',
  target: 'es2022',
  minify: !isDev,
  sourcemap: isDev,
  treeShaking: true,
  define: {
    'process.env.NODE_ENV': isDev ? '"development"' : '"production"',
  },
  external: [
    '__STATIC_CONTENT_MANIFEST',
  ],
  conditions: ['worker', 'browser'],
  mainFields: ['browser', 'module', 'main'],
  banner: {
    js: '// Ultron Bimbel Worker - bibohunter.me',
  },
}).then(() => {
  console.log('✅ Worker built successfully → dist/worker.js\n')
}).catch((err) => {
  console.error('❌ Build failed:', err)
  process.exit(1)
})
