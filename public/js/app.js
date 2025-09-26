(() => {
  const $ = (sel, root=document) => root.querySelector(sel);
  const rnd = (a,b)=> a + Math.random()*(b-a);
  const buzz = ms => 'vibrate' in navigator && navigator.vibrate(ms);

  const hint = $('#hint');
  const pre  = $('#preloader');
  const ui   = $('#ui');

  const showHint = (text) => { if(hint){ hint.textContent = text; hint.classList.remove('hidden'); } };
  const hideHint = () => hint && hint.classList.add('hidden');

  const snapBtn = document.getElementById('btn-snap');
  const enableSnap = () => { if (snapBtn) snapBtn.disabled = false; };

  // iOS гейт
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const gate = $('#ios-gate');
  if (isIOS && isSafari && gate) gate.classList.remove('hidden');
  $('#ios-allow')?.addEventListener('click', ()=> gate.classList.add('hidden'));

  // Ориентация
  const rotate = $('#rotate');
  const onResize = () => {
    if (!rotate) return;
    const portrait = window.matchMedia('(orientation: portrait)').matches;
    rotate.classList.toggle('hidden', portrait);
  };
  window.addEventListener('resize', onResize); onResize();

  // Подсказка по ?s=
  const s = new URLSearchParams(location.search).get('s');
  if (s === 'cheb') showHint('Подойдите к скульптуре Чебурашки и наведите камеру');
  if (s === 'shapo') showHint('Наведите на Шапокляк/Гену — появится Лариска');
  if (s === 'volk') showHint('Найдите Волка на скамейке — рядом появится Заяц');

  // Сцена и диагностика MindAR/A-Frame
  const scene = document.querySelector('a-scene');
  if (scene) {
    scene.addEventListener('loaded', () => { pre && pre.classList.add('hidden'); console.log('[A-Frame] loaded'); });
    scene.addEventListener('arReady', () => { pre && pre.classList.add('hidden'); enableSnap(); console.log('[MindAR] arReady'); });
    scene.addEventListener('arError', (e) => {
      pre && pre.classList.add('hidden');
      console.error('[MindAR] arError', e?.detail || e);
      showHint('AR не стартовал. Проверьте HTTPS, разрешение камеры и наличие ./targets/targets.mind');
    });
    scene.addEventListener('camera-init', () => console.log('[Camera] camera-init'));
    scene.addEventListener('camera-error', (e) => console.error('[Camera] camera-error', e?.detail || e));
  }

  // Активные цели
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

  // ЧЕБУРАШКА — дождь апельсинов
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
    name: 'Чебурашка', tip: 'Чебурашка — ловите апельсинки! 🍊',
    onFound() { if (!rainTimer) rainTimer = setInterval(spawnOrange, 260); },
    onLost()  { if (rainTimer) { clearInterval(rainTimer); rainTimer = null; } orangeCount = 0; orangeContainer && (orangeContainer.innerHTML = ''); }
  });

  // ШАПОКЛЯК — «Лариска машет»
  const lariska = $('#lariska-model');
  if (lariska) {
    lariska.addEventListener('click', () => {
      lariska.setAttribute('animation__wave','property: rotation; to: 0 45 0; dir: alternate; dur: 350; loop: 4; easing: easeInOutSine');
      setTimeout(() => lariska.removeAttribute('animation__wave'), 1600);
    });
  }
  bindTarget($('#tgt-shapo'), {
    name:'Шапокляк', tip:'Лариска рядом — нажми, чтобы помахала 🐭',
    onFound(){}, onLost(){}
  });

  // ВОЛК — заяц + мопед
  const moped = $('#moped-model');
  const hare  = $('#hare-model');
  if (hare) {
    hare.addEventListener('click', () => {
      hare.setAttribute('animation__hop','property: position; to: 0.35 0.16 0.05; dir: alternate; dur: 250; loop: 2; easing:easeOutQuad');
      setTimeout(() => hare.removeAttribute('animation__hop'), 700);
    });
  }
  const sceneEl = document.querySelector('a-scene');
  if (sceneEl) {
    sceneEl.addEventListener('click', (e) => {
      if (ui && ui.contains(e.target)) return;
      if (!moped) return;
      if (!active.has('tgt-volk')) return;
      const vis = moped.getAttribute('visible');
      moped.setAttribute('visible', !(vis === true || vis === 'true'));
    });
  }
  bindTarget($('#tgt-volk'), {
    name:'Волк', tip:'Заяц здесь! Ткни — а он подпрыгнет 🐇',
    onFound(){}, onLost(){ moped && moped.setAttribute('visible', false); }
  });

  // Селфи
  document.getElementById('btn-selfie')?.addEventListener('click', ()=> location.href = 'face.html');
})();
