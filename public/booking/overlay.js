document.addEventListener('DOMContentLoaded', () => {
  const openBtn = document.getElementById('openOverlayButton');
  const overlay = document.getElementById('overlay');
  const closeBtn = document.getElementById('closeOverlay');

  openBtn.addEventListener('click', () => {
    overlay.classList.remove('hidden');
  });

  closeBtn.addEventListener('click', () => {
    overlay.classList.add('hidden');
  });

  // Close overlay when clicking outside the content box
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.add('hidden');
    }
  });
});