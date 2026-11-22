import { nextTick, onMounted, watch } from 'vue';
import type { Ref } from 'vue';

import { MANAGERS, isManager } from '@/utils/package-manager';
import type { Manager } from '@/utils/package-manager';

const STORAGE_KEY = 'vuefn-package-manager';

function saved(): Manager {
  // a browser with blocked storage throws instead of returning null
  try {
    const value = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (isManager(value)) return value;
  } catch {}
  return MANAGERS[0];
}

/**
 * Shows the chosen package manager in every command block under `root`, and remembers it.
 * The Markdown renders each block with npm first, so the saved choice is applied after mount
 * and again whenever `page` changes. A click on a `data-pm` tab picks another one.
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
    try {
      globalThis.localStorage?.setItem(STORAGE_KEY, manager);
    } catch {}
  }

  onMounted(() => {
    show(saved());
    root.value?.addEventListener('click', (event) => {
      const tab = (event.target as Element | null)?.closest<HTMLElement>('[data-pm]');
      if (isManager(tab?.dataset.pm)) show(tab.dataset.pm);
    });
  });
  watch(page, async () => {
    await nextTick();
    show(saved());
  });
}
