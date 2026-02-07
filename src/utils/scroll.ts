export function smoothScrollTo(targetId: string): void {
  const target = document.getElementById(targetId);
  if (!target) return;

  setTimeout(() => {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);
}
