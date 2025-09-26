console.log("capture.js OK");
(() => {
  const btn = document.getElementById('btn-snap');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return alert('Камера ещё не готова');
    const dataURL = canvas.toDataURL('image/jpeg', 0.95);
    try {
      const blob = await (await fetch(dataURL)).blob();
      const file = new File([blob], 'souzmult-ar.jpg', { type: 'image/jpeg' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'AR фото' });
        return;
      }
    } catch {}
    const a = document.createElement('a'); a.href = dataURL; a.download = 'souzmult-ar.jpg'; a.click();
  });
})();