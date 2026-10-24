import { onBeforeUnmount, onMounted } from 'vue';

/** Fades in the children of each matching element once it scrolls into view. Without script, nothing is hidden. */
export function useReveal(selector: string) {
  let observer: IntersectionObserver | undefined;
  onMounted(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('in');
          observer?.unobserve(entry.target);
        }
      },
      { threshold: 0.15 },
    );
    for (const el of document.querySelectorAll<HTMLElement>(selector)) {
      if (el.getBoundingClientRect().top < innerHeight) continue;
      el.classList.add('reveal');
      observer.observe(el);
    }
  });
  onBeforeUnmount(() => observer?.disconnect());
}
