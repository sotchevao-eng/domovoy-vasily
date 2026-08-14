import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const rawBase = env.VITE_BASE_PATH?.trim() || '/';
  const base = !rawBase || rawBase === '/' ? '/' : rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

  return {
    base,
    plugins: [react()],
  };
});
