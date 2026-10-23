import vue from '@vitejs/plugin-vue';
import { vuefn } from '@vuefn/core/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vuefn(), vue()],
});
