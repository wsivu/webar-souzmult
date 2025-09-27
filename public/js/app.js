(() => {
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
onLost() { if (rainTimer) { clearInterval(rainTimer); rainTimer = null; } orangeCount = 0; orangeContainer && (orangeContainer.innerHTML = ''); }
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
const hare = $('#hare-model');
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
