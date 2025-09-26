(() => {
  const $ = (sel, root=document) => root.querySelector(sel);

  const rnd = (a,b)=> a + Math.random()*(b-a);
  const buzz = ms => 'vibrate' in navigator && navigator.vibrate(ms);

  const hint = $('#hint');
  const showHint = (text) => { if(hint){ hint.textContent = text; hint.classList.remove('hidden'); } };
  const hideHint = () => hint && hint.classList.add('hidden');

  // Кто сейчас «в кадре»
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

  // ===== ЧЕБУРАШКА — апельсиновый дождь =====
  const orangeContainer = $('#orange-rain');
  let rainTimer = null;
  let orangeCount = 0;
  const ORANGE_CAP = 40;

  function spawnOrange(){
    if (!orangeContainer) return;
    if (orangeCount >= ORANGE_CAP) return;

    const o = document.createElement('a-sphere');
    o.classList.add('orange');
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
    onFound() {
      if (!rainTimer) rainTimer = setInterval(spawnOrange, 260);
    },
    onLost() {
      if (rainTimer) { clearInterval(rainTimer); rainTimer = null; }
      orangeCount = 0;
      if (orangeContainer) orangeContainer.innerHTML = '';
    }
  });

  // ===== ШАПОКЛЯК — Лариска машет =====
  const lariska = $('#lariska-model');
  if (lariska) {
    lariska.addEventListener('click', () => {
      lariska.setAttribute('animation__wave','property: rotation; to: 0 45 0; dir: alternate; dur: 350; loop: 4; easing: easeInOutSine');
      buzz(8);
      setTimeout(() => lariska.removeAttribute('animation__wave'), 1600);
    });
  }
  bindTarget($('#tgt-shapo'), {
    name:'Шапокляк', tip:'Лариска рядом — нажми, чтобы помахала 🐭',
    onFound(){}, onLost(){}
  });

  // ===== ВОЛК — заяц дразнит, мопед по тапу =====
  const moped = $('#moped-model');
  const hare = $('#hare-model');
  if (hare) {
    hare.addEventListener('click', () => {
      hare.setAttribute('animation__hop','property: position; to: 0.35 0.12 0.05; dir: alternate; dur: 250; loop: 2; easing:easeOutQuad');
      setTimeout(() => hare.removeAttribute('animation__hop'), 700);
    });
  }

  const sceneEl = document.querySelector('a-scene');
  const uiEl = $('#ui');
  if (sceneEl) {
    sceneEl.addEventListener('click', (e) => {
      if (uiEl && uiEl.contains(e.target)) return;       // игнор кликов по UI
      if (!moped) return;
      if (!active.has('tgt-volk')) return;               // только когда Волк трекится
      const vis = moped.getAttribute('visible');
      moped.setAttribute('visible', !(vis === true || vis === 'true'));
    });
  }
  bindTarget($('#tgt-volk'), {
    name:'Волк', tip:'Заяц здесь! Ткни — а он подпрыгнет 🐇',
    onFound(){}, onLost(){ moped && moped.setAttribute('visible', false); }
  });

  // ===== Селфи-режим =====
  const selfieBtn = document.getElementById('btn-selfie');
  if (selfieBtn) selfieBtn.onclick = () => location.href = 'face.html';

  // ===== Ориентация =====
  const rotate = $('#rotate');
  const onResize = () => {
    if (!rotate) return;
    const portrait = window.matchMedia('(orientation: portrait)').matches;
    rotate.classList.toggle('hidden', portrait);
  };
  window.addEventListener('resize', onResize);
  onResize();

  // ===== iOS аудио/камера-гейт =====
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const gate = $('#ios-gate');
  const allowBtn = $('#ios-allow');
  if (isIOS && isSafari && gate && allowBtn) {
    gate.classList.remove('hidden');
    allowBtn.addEventListener('click', () => {
      gate.classList.add('hidden');
      const s = document.getElementById('sfx-pop');
      s && s.play && s.play().catch(()=>{});
    });
  }

  // ===== Подсказка по ?s=... =====
  const s = new URLSearchParams(location.search).get('s');
  if (s === 'cheb') showHint('Подойдите к скульптуре Чебурашки и наведите камеру');
  if (s === 'shapo') showHint('Наведите на Шапокляк/Гену — появится Лариска');
  if (s === 'volk') showHint('Найдите Волка на скамейке — рядом появится Заяц');

  // ===== Прелоадер + события MindAR =====
  const pre = document.getElementById('preloader');
  const scene = document.querySelector('a-scene');
  if (scene) {
    scene.addEventListener('loaded', () => pre && pre.classList.add('hidden'));
    scene.addEventListener('arReady', () => pre && pre.classList.add('hidden'));
    scene.addEventListener('arError', () => {
      showHint('Не удалось запустить AR: проверьте разрешение камеры или смените браузер.');
    });
  }

  // ===== Service Worker для кэша ассетов (опционально) =====
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(()=>{});
  }
})();
