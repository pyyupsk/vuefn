import { nextTick, onMounted, watch } from 'vue';
import type { Ref } from 'vue';

import { isManager } from '@/utils/package-manager';
import type { Manager } from '@/utils/package-manager';

const STORAGE_KEY = 'vuefn-package-manager';

function saved(): Manager {
  const value = globalThis.localStorage?.getItem(STORAGE_KEY);
  return isManager(value) ? value : 'npm';
}

/**
 * Shows the chosen package manager in every command block under `root`, and remembers it.
 * The Markdown renders each block with npm first, so the saved choice is applied after mount
 * and again whenever `page` changes.
 */
export function usePackageManager(root: Readonly<Ref<HTMLElement | null>>, page: () => unknown) {
  function show(manager: Manager) {
    if (!root.value) return;
    for (const tab of root.value.querySelectorAll<HTMLElement>('[data-pm]')) {
      tab.setAttribute('aria-pressed', String(tab.dataset.pm === manager));
    }
    for (const panel of root.value.querySelectorAll<HTMLElement>('[data-pm-panel]')) {
      panel.hidden = panel.dataset.pmPanel !== manager;
    }
    globalThis.localStorage?.setItem(STORAGE_KEY, manager);
  }

  onMounted(() => show(saved()));
  watch(page, async () => {
    await nextTick();
    show(saved());
  });

  return { show };
}
