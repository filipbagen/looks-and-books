export function smoothScrollTo(targetId) {
  const scrollDuration = 700;
  const delayDuration = 50;
  const offset = 24; // Adjust the offset (24px above the target)
  const target = document.getElementById(targetId);

  if (!target) return;

  setTimeout(() => {
    const start = window.performance.now();
    const startY = window.scrollY;
    // Subtract offset so that the final scroll position is 24px above the target's top.
    const deltaY = target.getBoundingClientRect().top - offset;

    function easeInOutQuad(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    function move(pos) {
      window.scroll(0, startY + deltaY * pos);
    }

    function update(ts) {
      const pos = (ts - start) / scrollDuration;

      if (pos >= 1) {
        return move(1);
      }

      move(easeInOutQuad(pos));
      window.requestAnimationFrame(update);
    }

    window.requestAnimationFrame(update);
  }, delayDuration);
}
