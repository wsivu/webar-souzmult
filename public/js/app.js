(() => {
  const $ = (sel, root=document) => root.querySelector(sel);
  const rnd = (a,b)=> a + Math.random()*(b-a);
  const buzz = ms => 'vibrate' in navigator && navigator.vibrate(ms);

  const hint = $('#hint');
  const pre = $('#preloader');
  const ui = $('#ui');

  const showHint = (text) => { if(hint){ hint.textContent = text; hint.classList.remove('hidden'); } };
  const hideHint = () => hint && hint.classList.add('hidden');

  // Блокировка снимка до готовности AR
  const snapBtn = document.getElementById('btn-snap');
  const enableSnap = () => { if (snapBtn) snapBtn.disabled = false; };

  // Повернуть устройство
  const rotate = $('#rotate');
  const onResize = () => {
    if (!rotate) return;
    const portrait = window.matchMedia('(orientation: portrait)').matches;
    rotate.classList.toggle('hidden', portrait);
  };
  window.addEventListener('resize', onResize); onResize();

  // Подсказка по ?s=...
  const s = new URLSearchParams(location.search).get('s');
  if (s === 'cheb') showHint('Подойдите к скульптуре Чебурашки и наведите камеру');
  if (s === 'shapo') showHint('Наведите на Шапокляк/Гену — появится Лариска');
  if (s === 'volk') showHint('Найдите Волка на скамейке — рядом появится Заяц');

  // СЦЕНА
  const scene = document.querySelector('a-scene');

  // ЕДИНЫЙ старт — по клику на кнопку или по первому тапу (если кнопку скрыли)
  const gate = $('#start-gate');
  const startBtn = $('#start-ar');

  async function startAR() {
    try {
      if (pre) pre.classList.remove('hidden'); // на всякий
      await new Promise(res => {
        if (scene.hasLoaded) res(); else scene.addEventListener('loaded', res, {once:true});
      });
      const arSystem = scene.systems['mindar-image-system'];
      console.log('[AR] starting…', arSystem);
      await arSystem.start(); // ВАЖНО: ручной старт вместо autoStart
      console.log('[AR] started');
      gate?.classList.add('hidden');
    } catch (e) {
      console.error('[AR] start error', e);
      showHint('Не удалось запустить AR: проверьте HTTPS, разрешение камеры и доступность targets.mind.');
      gate?.classList.remove('hidden');
    }
  }

  // Кнопка запуска
  startBtn?.addEventListener('click', () => startAR());

  // Дополнительно: первый тап по сцене тоже стартует (на случай если оверлей скрыли стилями)
  scene?.addEventListener('click', async () => {
    if (!gate || gate.classList.contains('hidden')) return;
    await startAR();
  }, { once: true });

  // События MindAR
  scene?.addEventListener('loaded', () => pre && pre.classList.add('hidden'));
  scene?.addEventListener('arReady', () => { pre && pre.classList.add('hidden'); enableSnap(); });
  scene?.addEventListener('arError', (e) => {
    pre && pre.classList.add('hidden');
    console.error('[AR] arError', e);
    showHint('Ошибка AR: откройте сайт по HTTPS и дайте доступ к камере. Проверьте targets.mind.');
    gate?.classList.remove('hidden');
  });

  // Трекинг активных целей
  const active = new Set();
  const bindTarget = (el, {onFound, onLost, name, tip}) => {
    if(!el) return;
    el.addEventListener('targetFound', () => {
      active.add(el.id);
      showHint(tip || name);
      buzz(10);
      onFound && onFound();
    });
    el.addEventListener('targetLost', () => {
      active.delete(el.id);
      hideHint();
      onLost && onLost();
    });
  };

  // ЧЕБУРАШКА — дождь апельсинов (примитивы)
  const orangeContainer = $('#orange-rain');
  let rainTimer = null, orangeCount = 0;
  const ORANGE_CAP = 40;

  function spawnOrange(){
    if (!orangeContainer) return;
    if (orangeCount >= ORANGE_CAP) return;

    const o = document.createElement('a-sphere');
    o.setAttribute('radius', rnd(0.04, 0.08));
    o.setAttribute('material', 'color: orange; metalness:0.05; roughness:0.9');

    const x = rnd(-0.5, 0.5);
    const y = rnd(0.8, 1.4);
    const z = rnd(-0.4, 0.4);
    o.setAttribute('position', `${x} ${y} ${z}`);

    const dur = Math.floor(rnd(1600, 2600));
    o.setAttribute('animation__fall', `property: position; to: ${x} -0.5 0; dur: ${dur}; easing: linear; loop: false`);

    o.addEventListener('animationcomplete__fall', () => {
      o.remove();
      orangeCount = Math.max(0, orangeCount - 1);
    });

    orangeContainer.appendChild(o);
    orangeCount++;
  }

  bindTarget($('#tgt-cheb'), {
    name: 'Чебура
