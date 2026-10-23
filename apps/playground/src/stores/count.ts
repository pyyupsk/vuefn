import { defineStore } from 'pinia';

export const useCountStore = defineStore('count', {
  state: () => ({ value: 0 }),
  actions: {
    increment() {
      this.value += 1;
    },
  },
});
