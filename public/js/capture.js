// Снимок кадра (включается после arReady/loaded)
(() => {
  const btn = document.getElementById('btn-snap');
  if (!btn) return;

  const scene = document.querySelector('a-scene');
  const enable = () => (btn.disabled = false);
  scene?.addEventListener('arReady', enable);
  scene?.addEventListener('loaded', enable);

  btn.addEventListener('click', async () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return alert('Камера не готова: откройте сайт по HTTPS и разрешите доступ к камере.');

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
