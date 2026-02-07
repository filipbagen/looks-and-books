/**
 * Custom smooth scroll implementation to match original behavior.
 * Duration: 700ms
 * Easing: easeInOutQuad
 * Offset: 24px
 */
export function smoothScrollTo(targetId: string): void {
  const target = document.getElementById(targetId);
  if (!target) return;

  const scrollDuration = 700;
  const delayDuration = 50;
  const offset = 24;

  setTimeout(() => {
    const start = window.performance.now();
    const startY = window.scrollY;
    // Subtract offset so that the final scroll position is 24px above the target's top.
    const targetY = target.getBoundingClientRect().top + window.scrollY;
    const deltaY = targetY - offset - startY;

    function easeInOutQuad(t: number): number {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    function move(pos: number) {
      window.scroll(0, startY + deltaY * pos);
    }

    function update(ts: number) {
      const elapsed = ts - start;
      const pos = Math.min(elapsed / scrollDuration, 1);

      if (pos >= 1) {
        return move(1);
      }

      move(easeInOutQuad(pos));
      requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }, delayDuration);
}
