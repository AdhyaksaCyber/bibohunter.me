// scripts/build-worker.js
import { build } from 'esbuild';
import { resolve } from 'path';

const isDev = process.argv.includes('--dev');

build({
  entryPoints: [resolve('src/worker/index.ts')],
  bundle: true,
  outfile: 'dist/worker.js',
  format: 'esm',
  platform: 'browser', // Cloudflare Workers runtime
  target: 'es2022',
  minify: !isDev,
  sourcemap: isDev,
  external: ['__STATIC_CONTENT_MANIFEST'], // Cloudflare internal
  define: {
    'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
  },
  logLevel: 'info',
}).catch(() => process.exit(1));
