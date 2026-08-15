import { copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const rawBase = env.VITE_BASE_PATH?.trim() || '/';
  const base = !rawBase || rawBase === '/' ? '/' : rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

  return {
    base,
    plugins: [
      react(),
      {
        name: 'spa-github-pages-fallback',
        closeBundle() {
          if (mode !== 'pages') {
            return;
          }

          const index = resolve('dist/index.html');
          const fallback = resolve('dist/404.html');

          if (existsSync(index)) {
            copyFileSync(index, fallback);
          }
        },
      },
    ],
  };
});
