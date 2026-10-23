import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import { vuefn } from 'vuefn/vite';

export default defineConfig({
  plugins: [vuefn(), vue()],
});
