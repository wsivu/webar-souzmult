console.log("ui.js OK");
(() => {
  const help = document.getElementById('btn-help');
  if (!help) return;
  help.addEventListener('click', () => alert(
`Наведите камеру на фото скульптуры.

Чебурашка: дождь апельсинов.
Шапокляк: Лариска машет.
Волк: Заяц дразнит, мопед по тапу.

📸 — снимок, 🤳 — селфи.`));
})();