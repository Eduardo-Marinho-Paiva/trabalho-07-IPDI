/* ============================================================
   presentation.js — Núcleo da Apresentação e Motor de Processamento
   Seminário 7: Deconvolução e Restauração de Imagens (PDI)
   
   1) Controle de Navegação (Teclado, Botões, Menu, Fullscreen, Progresso)
   2) Cenas Sintéticas Padronizadas (64x64) com Estrelas, Bordas, Degraus e Rampas
   3) Implementação Pura de FFT 2D (Radix-2 Cooley-Tukey)
   4) Utilitários de Canvas, Plotagem 1D e Gerenciador de Ciclo de Vida
   ============================================================ */
(function () {
  'use strict';

  /* ------------------------------------------------------------
     0) Namespace Global PDI
     ------------------------------------------------------------ */
  const PDI = {
    version: '1.0',
    N: 64, // Dimensão das imagens padrão para operações em tempo real
    loops: [],
    disposers: []
  };
  window.PDI = PDI;

  /* ------------------------------------------------------------
     1) PRNG Determinístico (Mulberry32)
     Garante que o ruído e as cenas sejam rigorosamente idênticos
     e reprodutíveis em qualquer navegador.
     ------------------------------------------------------------ */
  function prng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  PDI.prng = prng;

  /* ------------------------------------------------------------
     2) Cenas Sintéticas de Teste Padronizadas (N = 64)
     A cena padrão foi cuidadosamente elaborada com 4 elementos-chave:
     - Fontes pontuais (estrelas): revelam a PSF diretamente no domínio espacial.
     - Formas geométricas com bordas nítidas: avaliam recuperação de contornos e ringing.
     - Rampa de gradiente contínuo: evidencia o efeito de staircasing em Variação Total.
     - Padrão periódico de barras finas: testa a atenuação e recuperação de altas frequências.
     ------------------------------------------------------------ */
  let cachedBenchmarkScene = null;
  let cachedMedicalScene = null;

  function buildBenchmarkScene(N) {
    N = N || PDI.N;
    const data = new Float32Array(N * N);

    // 1. Fundo neutro baixo
    for (let i = 0; i < data.length; i++) data[i] = 0.08;

    // 2. Rampa suave de intensidade (X: 6..28, Y: 8..24) para testar staircasing
    for (let y = 8; y <= 24; y++) {
      for (let x = 6; x <= 28; x++) {
        const ramp = 0.15 + 0.65 * ((x - 6) / 22);
        data[y * N + x] = ramp;
      }
    }

    // 3. Disco nítido de alto contraste (Centro: (46, 20), Raio: 9)
    const cx = 46, cy = 20, r = 9;
    for (let y = cy - r; y <= cy + r; y++) {
      for (let x = cx - r; x <= cx + r; x++) {
        const d2 = (x - cx) * (x - cx) + (y - cy) * (y - cy);
        if (d2 <= r * r) {
          data[y * N + x] = 0.95;
        }
      }
    }

    // 4. Retângulo e borda diagonal nítida (X: 8..26, Y: 36..54)
    for (let y = 36; y <= 54; y++) {
      for (let x = 8; x <= 26; x++) {
        if ((x - 8) + (y - 36) >= 12) {
          data[y * N + x] = 0.85;
        } else {
          data[y * N + x] = 0.40;
        }
      }
    }

    // 5. Padrão de barras de alta frequência (X: 34..58, Y: 40..50)
    for (let y = 40; y <= 50; y++) {
      for (let x = 34; x <= 58; x++) {
        data[y * N + x] = ((x % 4) < 2) ? 0.90 : 0.15;
      }
    }

    // 6. Fontes pontuais astronômicas (PSF probes)
    const stars = [[12, 14], [20, 20], [42, 10], [54, 32], [32, 32], [58, 58]];
    stars.forEach(([sx, sy]) => {
      if (sx >= 0 && sx < N && sy >= 0 && sy < N) {
        data[sy * N + sx] = 1.0;
      }
    });

    return data;
  }

  function buildMedicalScene(N) {
    N = N || PDI.N;
    const data = new Float32Array(N * N);
    const cx = N / 2, cy = N / 2;

    // Fantoma simplificado tipo cabeça / cérebro (Shepp-Logan style)
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const dx = (x - cx) / (N * 0.42);
        const dy = (y - cy) / (N * 0.46);
        const r2 = dx * dx + dy * dy;

        let val = 0.05; // fundo
        if (r2 <= 1.0) {
          val = 0.35; // crânio/tecido
          // cavidades internas
          const d1 = Math.hypot((x - (cx - 10)) / 12, (y - (cy - 6)) / 16);
          const d2 = Math.hypot((x - (cx + 10)) / 12, (y - (cy - 6)) / 16);
          if (d1 <= 1.0 || d2 <= 1.0) val = 0.75;

          // estrutura central fina
          if (Math.hypot(x - cx, y - (cy + 10)) <= 6) val = 0.95;
          if (Math.hypot(x - (cx - 6), y - (cy + 12)) <= 2.5) val = 0.10;
          if (Math.hypot(x - (cx + 6), y - (cy + 12)) <= 2.5) val = 0.10;
        }
        data[y * N + x] = val;
      }
    }
    return data;
  }

  PDI.getBenchmarkScene = function () {
    if (!cachedBenchmarkScene) cachedBenchmarkScene = buildBenchmarkScene(PDI.N);
    return new Float32Array(cachedBenchmarkScene);
  };

  PDI.getMedicalScene = function () {
    if (!cachedMedicalScene) cachedMedicalScene = buildMedicalScene(PDI.N);
    return new Float32Array(cachedMedicalScene);
  };

  /* ------------------------------------------------------------
     3) Utilitários de Canvas e Desenho
     ------------------------------------------------------------ */
  PDI.ctx = function (id) {
    const c = typeof id === 'string' ? document.getElementById(id) : id;
    if (!c) return null;
    const x = c.getContext('2d');
    return x ? { c, x, w: c.width, h: c.height } : null;
  };

  PDI.canvasBg = function () {
    return getComputedStyle(document.body).getPropertyValue('--canvas-bg').trim() || '#f1f5f9';
  };

  PDI.cssVar = function (name, fallback) {
    return getComputedStyle(document.body).getPropertyValue(name).trim() || fallback;
  };

  /* Desenha Float32Array (0..1) em escala de cinza no canvas com reescalonamento */
  PDI.drawGray = function (id, data, n) {
    const o = PDI.ctx(id);
    if (!o) return;
    const { x, w, h } = o;
    const im = x.createImageData(w, h);
    n = n || Math.round(Math.sqrt(data.length));

    for (let j = 0; j < h; j++) {
      const sj = Math.floor((j / h) * n);
      for (let i = 0; i < w; i++) {
        const si = Math.floor((i / w) * n);
        let val = data[sj * n + si];
        val = val < 0 ? 0 : val > 1 ? 1 : val;
        const v255 = (val * 255) | 0;

        const k = (j * w + i) * 4;
        im.data[k] = v255;
        im.data[k + 1] = v255;
        im.data[k + 2] = v255;
        im.data[k + 3] = 255;
      }
    }
    x.putImageData(im, 0, 0);
  };

  /* Desenha o gráfico de perfil 1D (corte horizontal de intensidade) em alta definição */
  PDI.drawProfilePlot = function (canvasId, data, rowY, label, color) {
    const c = typeof canvasId === 'string' ? document.getElementById(canvasId) : canvasId;
    if (!c) return;
    const x = c.getContext('2d');
    if (!x) return;

    const N = Math.round(Math.sqrt(data.length));
    rowY = Math.max(0, Math.min(N - 1, rowY || Math.floor(N / 2)));
    color = color || PDI.cssVar('--accent', '#2563eb');

    // HiDPI Scaling para nitidez vetorial absoluta em qualquer tela
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const rect = c.getBoundingClientRect();
    const displayW = Math.max(260, Math.round(rect.width || c.getAttribute('width') || 280));
    const displayH = Math.max(130, Math.round(rect.height || c.getAttribute('height') || 150));

    if (c.width !== Math.round(displayW * dpr) || c.height !== Math.round(displayH * dpr)) {
      c.width = Math.round(displayW * dpr);
      c.height = Math.round(displayH * dpr);
    }

    x.save();
    x.scale(dpr, dpr);

    const padLeft = 34;
    const padRight = 14;
    const padTop = 24;
    const padBottom = 22;
    const plotW = displayW - padLeft - padRight;
    const plotH = displayH - padTop - padBottom;

    // Fundo nítido do gráfico
    x.fillStyle = PDI.canvasBg();
    x.fillRect(0, 0, displayW, displayH);

    // Contorno da área de dados
    x.strokeStyle = PDI.cssVar('--border', '#cbd5e1');
    x.lineWidth = 1;
    x.strokeRect(padLeft, padTop, plotW, plotH);

    // Linhas de grade e valores no eixo Y
    const yTicks = [
      { val: 0.0, label: '0.0' },
      { val: 0.5, label: '0.5' },
      { val: 1.0, label: '1.0' }
    ];

    x.font = '600 10px var(--font-mono, monospace)';
    x.fillStyle = PDI.cssVar('--text-secondary', '#475569');
    x.textAlign = 'right';
    x.textBaseline = 'middle';

    yTicks.forEach(t => {
      const py = padTop + plotH - t.val * plotH;
      x.strokeStyle = PDI.cssVar('--border', '#e2e8f0');
      x.lineWidth = 1;
      x.setLineDash([3, 3]);
      x.beginPath();
      x.moveTo(padLeft, py);
      x.lineTo(padLeft + plotW, py);
      x.stroke();
      x.setLineDash([]);
      x.fillText(t.label, padLeft - 6, py);
    });

    // Marcadores e posições no eixo X
    const xTicks = [0, 16, 32, 48, 64];
    x.textAlign = 'center';
    x.textBaseline = 'top';
    xTicks.forEach(xv => {
      const px = padLeft + (xv / 64) * plotW;
      x.strokeStyle = PDI.cssVar('--border', '#e2e8f0');
      x.lineWidth = 1;
      x.setLineDash([2, 2]);
      x.beginPath();
      x.moveTo(px, padTop);
      x.lineTo(px, padTop + plotH);
      x.stroke();
      x.setLineDash([]);
      x.fillText(String(xv), px, padTop + plotH + 4);
    });

    // 1. Curva de Referência Ideal (Ground Truth) em linha tracejada discreta
    const groundTruth = PDI.getBenchmarkScene();
    if (groundTruth) {
      x.strokeStyle = PDI.cssVar('--text-muted', '#94a3b8');
      x.lineWidth = 1.8;
      x.setLineDash([4, 3]);
      x.beginPath();
      for (let i = 0; i < N; i++) {
        const val = Math.max(0, Math.min(1, groundTruth[rowY * N + i]));
        const px = padLeft + (i / (N - 1)) * plotW;
        const py = padTop + plotH - val * plotH;
        if (i === 0) x.moveTo(px, py);
        else x.lineTo(px, py);
      }
      x.stroke();
      x.setLineDash([]);
    }

    // 2. Área sombreada suave sob a curva atual
    const grad = x.createLinearGradient(0, padTop, 0, padTop + plotH);
    grad.addColorStop(0, color + '35');
    grad.addColorStop(1, color + '05');

    x.beginPath();
    x.moveTo(padLeft, padTop + plotH);
    for (let i = 0; i < N; i++) {
      const val = Math.max(0, Math.min(1, data[rowY * N + i]));
      const px = padLeft + (i / (N - 1)) * plotW;
      const py = padTop + plotH - val * plotH;
      x.lineTo(px, py);
    }
    x.lineTo(padLeft + plotW, padTop + plotH);
    x.closePath();
    x.fillStyle = grad;
    x.fill();

    // 3. Traçado principal com suavização anti-aliased
    x.strokeStyle = color;
    x.lineWidth = 2.4;
    x.lineJoin = 'round';
    x.lineCap = 'round';
    x.beginPath();
    for (let i = 0; i < N; i++) {
      const val = Math.max(0, Math.min(1, data[rowY * N + i]));
      const px = padLeft + (i / (N - 1)) * plotW;
      const py = padTop + plotH - val * plotH;
      if (i === 0) x.moveTo(px, py);
      else x.lineTo(px, py);
    }
    x.stroke();

    // Cabeçalho e Legenda no topo do gráfico
    x.textAlign = 'left';
    x.textBaseline = 'top';
    x.fillStyle = PDI.cssVar('--text-primary', '#0f172a');
    x.font = '700 11px var(--font-main, sans-serif)';
    x.fillText(label || `Corte Y=${rowY}`, padLeft, 6);

    // Legenda no topo direito
    x.textAlign = 'right';
    x.font = '600 9.5px var(--font-mono, monospace)';
    x.fillStyle = color;
    x.fillText('— Estimada', displayW - padRight - 55, 6);
    x.fillStyle = PDI.cssVar('--text-muted', '#94a3b8');
    x.fillText('-- Ideal', displayW - padRight, 6);

    x.restore();
  };

  /* ------------------------------------------------------------
     4) Algoritmo FFT 2D (Radix-2 Cooley-Tukey Puro)
     Permite filtragem real no domínio da frequência para a
     deconvolução de Wiener em milissegundos sem bibliotecas externas.
     ------------------------------------------------------------ */
  function bitReverse(n, bits) {
    let reversed = 0;
    for (let i = 0; i < bits; i++) {
      reversed = (reversed << 1) | (n & 1);
      n >>= 1;
    }
    return reversed;
  }

  function fft1D(re, im, N, inverse) {
    const bits = Math.round(Math.log2(N));
    for (let i = 0; i < N; i++) {
      const j = bitReverse(i, bits);
      if (j > i) {
        let tr = re[i]; re[i] = re[j]; re[j] = tr;
        let ti = im[i]; im[i] = im[j]; im[j] = ti;
      }
    }

    const dir = inverse ? 1 : -1;
    for (let len = 2; len <= N; len <<= 1) {
      const half = len >> 1;
      const angle = (dir * 2 * Math.PI) / len;
      const wStepR = Math.cos(angle);
      const wStepI = Math.sin(angle);

      for (let i = 0; i < N; i += len) {
        let wr = 1.0;
        let wi = 0.0;
        for (let j = 0; j < half; j++) {
          const uR = re[i + j];
          const uI = im[i + j];
          const vR = re[i + j + half] * wr - im[i + j + half] * wi;
          const vI = re[i + j + half] * wi + im[i + j + half] * wr;

          re[i + j] = uR + vR;
          im[i + j] = uI + vI;
          re[i + j + half] = uR - vR;
          im[i + j + half] = uI - vI;

          const nWr = wr * wStepR - wi * wStepI;
          wi = wr * wStepI + wi * wStepR;
          wr = nWr;
        }
      }
    }

    if (inverse) {
      for (let i = 0; i < N; i++) {
        re[i] /= N;
        im[i] /= N;
      }
    }
  }

  PDI.fft2D = function (re, im, N, inverse) {
    // 1. Linhas
    const rowR = new Float32Array(N);
    const rowI = new Float32Array(N);
    for (let y = 0; y < N; y++) {
      const offset = y * N;
      for (let x = 0; x < N; x++) {
        rowR[x] = re[offset + x];
        rowI[x] = im[offset + x];
      }
      fft1D(rowR, rowI, N, inverse);
      for (let x = 0; x < N; x++) {
        re[offset + x] = rowR[x];
        im[offset + x] = rowI[x];
      }
    }

    // 2. Colunas
    const colR = new Float32Array(N);
    const colI = new Float32Array(N);
    for (let x = 0; x < N; x++) {
      for (let y = 0; y < N; y++) {
        colR[y] = re[y * N + x];
        colI[y] = im[y * N + x];
      }
      fft1D(colR, colI, N, inverse);
      for (let y = 0; y < N; y++) {
        re[y * N + x] = colR[y];
        im[y * N + x] = colI[y];
      }
    }
  };

  /* Centraliza o espectro de Fourier (shift de frequências zero para o centro) */
  PDI.fftShift = function (data, N) {
    const out = new Float32Array(N * N);
    const half = N >> 1;
    for (let y = 0; y < N; y++) {
      const ny = (y + half) % N;
      for (let x = 0; x < N; x++) {
        const nx = (x + half) % N;
        out[ny * N + nx] = data[y * N + x];
      }
    }
    return out;
  };

  /* ------------------------------------------------------------
     5) Gerenciador de Animações e Limpeza de Estado
     ------------------------------------------------------------ */
  PDI.loop = function (callback) {
    let animId = null;
    let running = true;
    function step(ts) {
      if (!running) return;
      callback(ts);
      animId = requestAnimationFrame(step);
    }
    animId = requestAnimationFrame(step);

    const handle = {
      stop: () => {
        running = false;
        if (animId) cancelAnimationFrame(animId);
        animId = null;
      },
      get running() { return running; }
    };
    PDI.loops.push(handle);
    return handle;
  };

  PDI.stopAll = function () {
    PDI.loops.forEach(h => h.stop());
    PDI.loops = [];
  };

  PDI.onLeave = function (fn) {
    PDI.disposers.push(fn);
  };

  PDI.resetAll = function () {
    PDI.stopAll();
    PDI.disposers.forEach(f => {
      try { f(); } catch (e) { console.warn(e); }
    });
    PDI.disposers = [];
  };

  /* ------------------------------------------------------------
     6) Navegação de Slides
     ------------------------------------------------------------ */
  const slides = Array.from(document.querySelectorAll('.slide'));
  const totalSlides = slides.length;
  let currentSlideIndex = -1;

  const elements = {
    progressFill: document.getElementById('progress-fill'),
    counter: document.getElementById('slide-counter'),
    section: document.getElementById('section-indicator'),
    navToggle: document.getElementById('nav-toggle'),
    navItems: document.getElementById('nav-items'),
    fullscreenBtn: document.getElementById('fullscreen-btn'),
    prevBtn: document.getElementById('prev-btn'),
    nextBtn: document.getElementById('next-btn')
  };

  const navButtons = Array.from(elements.navItems ? elements.navItems.querySelectorAll('button[data-slide]') : []);

  function getSectionName(index) {
    return slides[index]?.getAttribute('data-section') || '';
  }

  function updateSlideUI() {
    if (elements.progressFill) {
      elements.progressFill.style.width = ((currentSlideIndex + 1) / totalSlides * 100) + '%';
    }
    if (elements.counter) {
      elements.counter.textContent = `${currentSlideIndex + 1} / ${totalSlides}`;
    }
    if (elements.section) {
      elements.section.textContent = getSectionName(currentSlideIndex);
    }
    navButtons.forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.slide, 10) === currentSlideIndex);
    });
    if (elements.prevBtn) elements.prevBtn.disabled = currentSlideIndex === 0;
    if (elements.nextBtn) elements.nextBtn.disabled = currentSlideIndex === totalSlides - 1;
  }

  function enterSlide(index) {
    const initAttr = slides[index].getAttribute('data-init');
    if (!initAttr) return;

    const functionNames = initAttr.split(',').map(s => s.trim()).filter(Boolean);
    functionNames.forEach(fn => {
      try {
        const parts = fn.split('.');
        if (parts.length === 2 && window[parts[0]] && typeof window[parts[0]][parts[1]] === 'function') {
          window[parts[0]][parts[1]]();
        } else if (typeof window[fn] === 'function') {
          window[fn]();
        } else {
          console.warn('Função init não encontrada:', fn);
        }
      } catch (err) {
        console.error('Erro ao executar inicialização do slide:', fn, err);
      }
    });
  }

  function goToSlide(index, direction) {
    if (index < 0 || index >= totalSlides || index === currentSlideIndex) return;

    PDI.resetAll();
    slides.forEach(s => {
      s.classList.remove('active');
      s.setAttribute('aria-hidden', 'true');
    });

    currentSlideIndex = index;
    const activeSlide = slides[currentSlideIndex];
    activeSlide.classList.add('active');
    activeSlide.setAttribute('aria-hidden', 'false');

    // Reinicia animações dos elementos filhos com classe .anim
    activeSlide.querySelectorAll('.anim').forEach((node, k) => {
      node.style.animation = 'none';
      node.offsetHeight; // Força reflow
      node.style.animation = '';
      node.style.animationDelay = (k * 40) + 'ms';
    });

    updateSlideUI();
    enterSlide(currentSlideIndex);
  }

  function nextSlide() { goToSlide(currentSlideIndex + 1, 1); }
  function prevSlide() { goToSlide(currentSlideIndex - 1, -1); }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  }

  /* Modo Foco: tela cheia limpa, oculta seções, botões, hint e tema */
  function toggleFocusMode(forceState) {
    const isFocus = typeof forceState === 'boolean'
      ? (forceState ? document.body.classList.add('focus-mode') || true : document.body.classList.remove('focus-mode') || false)
      : document.body.classList.toggle('focus-mode');

    if (isFocus) {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
    // Re-renderiza gráficos para ajustar ao novo tamanho útil
    if (currentSlideIndex >= 0) {
      setTimeout(() => enterSlide(currentSlideIndex), 60);
    }
  }

  // Atalhos de Teclado
  document.addEventListener('keydown', (e) => {
    // Se estiver em modo foco e pressionar Esc, sai do modo foco
    if (e.key === 'Escape' && document.body.classList.contains('focus-mode')) {
      toggleFocusMode(false);
      return;
    }

    // Ignora quando o foco estiver em inputs ou controles
    if (e.target && /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(e.target.tagName)) {
      if (e.key === 'Escape') e.target.blur();
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case 'PageDown':
      case ' ':
        e.preventDefault();
        nextSlide();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        prevSlide();
        break;
      case 'Home':
        e.preventDefault();
        goToSlide(0);
        break;
      case 'End':
        e.preventDefault();
        goToSlide(totalSlides - 1);
        break;
      case 'f':
      case 'F':
        e.preventDefault();
        toggleFullscreen();
        break;
      case 'z':
      case 'Z':
        e.preventDefault();
        toggleFocusMode();
        break;
      case 't':
      case 'T':
        e.preventDefault();
        document.getElementById('theme-toggle')?.click();
        break;
      case 'm':
      case 'M':
        e.preventDefault();
        toggleMenu();
        break;
      case 'Escape':
        closeMenu();
        break;
    }
  });

  function toggleMenu() {
    if (!elements.navItems) return;
    elements.navItems.classList.toggle('open');
  }

  function closeMenu() {
    if (!elements.navItems) return;
    elements.navItems.classList.remove('open');
  }

  if (elements.navToggle) elements.navToggle.addEventListener('click', toggleMenu);
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      goToSlide(parseInt(btn.dataset.slide, 10));
      closeMenu();
    });
  });

  if (elements.nextBtn) elements.nextBtn.addEventListener('click', nextSlide);
  if (elements.prevBtn) elements.prevBtn.addEventListener('click', prevSlide);
  if (elements.fullscreenBtn) elements.fullscreenBtn.addEventListener('click', toggleFullscreen);

  const focusBtn = document.getElementById('focus-btn');
  if (focusBtn) focusBtn.addEventListener('click', () => toggleFocusMode(true));

  const focusExitBtn = document.getElementById('focus-exit-btn');
  if (focusExitBtn) focusExitBtn.addEventListener('click', () => toggleFocusMode(false));

  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && document.body.classList.contains('focus-mode')) {
      toggleFocusMode(false);
    }
  });

  // Renderizador KaTeX para fórmulas matemáticas elegantes
  function renderKaTeX() {
    if (window.renderMathInElement) {
      try {
        window.renderMathInElement(document.body, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '\\[', right: '\\]', display: true },
            { left: '\\(', right: '\\)', display: false },
            { left: '$', right: '$', display: false }
          ],
          throwOnError: false
        });
      } catch (err) {
        console.warn('KaTeX render warning:', err);
      }
    }
  }

  // Redesenho quando o tema mudar
  window.addEventListener('pdi:themechange', () => {
    if (currentSlideIndex >= 0) enterSlide(currentSlideIndex);
  });

  // Inicializa o primeiro slide e formatação matemática
  window.addEventListener('DOMContentLoaded', () => {
    renderKaTeX();
    goToSlide(0);
  });

  PDI.goToSlide = goToSlide;
  PDI.nextSlide = nextSlide;
  PDI.prevSlide = prevSlide;
})();
