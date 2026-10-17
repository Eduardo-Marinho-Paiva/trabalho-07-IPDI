/* ============================================================
   theme.js — Alternância de Tema com Persistência
   Seminário 7 · Processamento Digital de Imagens (PDI)
   Light (padrão) e Dark, salvos em localStorage.
   ============================================================ */
(function () {
  'use strict';
  const KEY = 'pdi-trab7-theme';
  const toggle = document.getElementById('theme-toggle');
  const lLink = document.getElementById('theme-light');
  const dLink = document.getElementById('theme-dark');
  const label = document.getElementById('theme-label');

  function apply(mode) {
    const dark = mode === 'dark';
    document.body.classList.toggle('dark', dark);
    document.body.classList.toggle('light', !dark);
    if (lLink) lLink.disabled = dark;
    if (dLink) dLink.disabled = !dark;
    if (label) label.textContent = dark ? 'Dark' : 'Light';
    if (toggle) toggle.setAttribute('aria-label', dark ? 'Alternar para tema claro' : 'Alternar para tema escuro');
    try {
      localStorage.setItem(KEY, mode);
    } catch (e) {
      /* navegação anônima / restrição de storage */
    }
    window.dispatchEvent(new CustomEvent('pdi:themechange', { detail: { mode } }));
  }

  function current() {
    return document.body.classList.contains('dark') ? 'dark' : 'light';
  }

  let saved = null;
  try {
    saved = localStorage.getItem(KEY);
  } catch (e) {
    saved = null;
  }
  apply(saved === 'dark' ? 'dark' : 'light');

  if (toggle) {
    toggle.addEventListener('click', () => apply(current() === 'dark' ? 'light' : 'dark'));
  }

  window.PDITheme = { apply, current };
})();
