/* ============================================================
   entropy.js — Métodos Baseados em Entropia e Máxima Entropia (MEM)
   Seminário 7 · Bloco 4 (Luis Jeronimo): Critérios de Informação e Regularização
   
   - Entropia de Shannon do Histograma: H(X) = -sum( p_i * log2(p_i) )
   - Formulação de Máxima Entropia (Gull & Daniell, Nature 1978; Skilling 1989)
   - Regularização por Entropia Espacial Relativa: S(x) = -sum( x_i * ln(x_i / m_i) )
   - Demonstração Interativa D: Histograma em Tempo Real & Comportamento do MEM
   ============================================================ */
(function () {
  'use strict';

  const Entropy = {};
  window.Entropy = Entropy;

  /* ------------------------------------------------------------
     1) Cálculo da Entropia de Shannon do Histograma de Intensidades
     ------------------------------------------------------------ */
  Entropy.computeHistogramAndShannon = function (data) {
    const bins = 256;
    const hist = new Float32Array(bins);
    const N = data.length;

    for (let i = 0; i < N; i++) {
      const v = Math.max(0, Math.min(255, Math.floor(data[i] * 255.999)));
      hist[v]++;
    }

    let H = 0;
    const p = new Float32Array(bins);
    for (let i = 0; i < bins; i++) {
      if (hist[i] > 0) {
        const prob = hist[i] / N;
        p[i] = prob;
        H -= prob * (Math.log2(prob));
      }
    }

    return { hist, p, H, maxH: 8.0 }; // 8 bits para 256 níveis
  };

  /* ------------------------------------------------------------
     2) Desenho do Histograma em Canvas em Alta Resolução
     ------------------------------------------------------------ */
  Entropy.drawHistogram = function (canvasId, p, H, color) {
    const c = typeof canvasId === 'string' ? document.getElementById(canvasId) : canvasId;
    if (!c) return;
    const x = c.getContext('2d');
    if (!x) return;
    color = color || PDI.cssVar('--c-luis', '#7c3aed');

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

    const padLeft = 32;
    const padRight = 14;
    const padTop = 26;
    const padBottom = 22;
    const plotW = displayW - padLeft - padRight;
    const plotH = displayH - padTop - padBottom;

    x.fillStyle = PDI.canvasBg();
    x.fillRect(0, 0, displayW, displayH);

    // Borda do gráfico
    x.strokeStyle = PDI.cssVar('--border', '#cbd5e1');
    x.lineWidth = 1;
    x.strokeRect(padLeft, padTop, plotW, plotH);

    // Encontra pico para normalizar visualização
    let maxP = 0;
    for (let i = 0; i < 256; i++) {
      if (p[i] > maxP) maxP = p[i];
    }
    maxP = maxP || 1;

    // Linhas de grade horizontais tracejadas
    [0.25, 0.5, 0.75].forEach(ratio => {
      const gy = padTop + plotH - ratio * plotH;
      x.strokeStyle = PDI.cssVar('--border', '#e2e8f0');
      x.setLineDash([3, 3]);
      x.beginPath();
      x.moveTo(padLeft, gy);
      x.lineTo(padLeft + plotW, gy);
      x.stroke();
      x.setLineDash([]);
    });

    // Marcadores do eixo X (0, 64, 128, 192, 255)
    const xTicks = [0, 64, 128, 192, 255];
    x.font = '600 9.5px var(--font-mono, monospace)';
    x.fillStyle = PDI.cssVar('--text-secondary', '#475569');
    x.textAlign = 'center';
    x.textBaseline = 'top';

    xTicks.forEach(val => {
      const px = padLeft + (val / 255) * plotW;
      x.fillText(String(val), px, padTop + plotH + 4);
    });

    // Barras do histograma com gradiente suave
    const barW = Math.max(0.8, plotW / 256);
    const grad = x.createLinearGradient(0, padTop, 0, padTop + plotH);
    grad.addColorStop(0, color);
    grad.addColorStop(1, color + '99');
    x.fillStyle = grad;

    for (let i = 0; i < 256; i++) {
      if (p[i] > 0) {
        const bh = (p[i] / maxP) * (plotH - 2);
        const bx = padLeft + (i / 256) * plotW;
        const by = padTop + plotH - bh;
        x.fillRect(bx, by, Math.max(1, barW), bh);
      }
    }

    // Título e Rótulo da Entropia com destaque
    x.textAlign = 'left';
    x.textBaseline = 'top';
    x.fillStyle = PDI.cssVar('--text-primary', '#0f172a');
    x.font = '700 11px var(--font-main, sans-serif)';
    x.fillText('Histograma de Intensidades', padLeft, 6);

    x.textAlign = 'right';
    x.font = '700 11px var(--font-mono, monospace)';
    x.fillStyle = color;
    x.fillText(`H(X) = ${H.toFixed(3)} bits (máx 8.0)`, displayW - padRight, 6);

    x.restore();
  };

  /* ------------------------------------------------------------
     3) Demonstração D (Slide 13): Entropia e Histogramas
     ------------------------------------------------------------ */
  Entropy.initDemoShannon = function () {
    const N = PDI.N;

    // 4 Cenários de Imagens
    // 1. Alto Contraste Binário
    const binaryImg = new Float32Array(N * N);
    for (let i = 0; i < N * N; i++) binaryImg[i] = (i % 2 === 0) ? 0.05 : 0.95;

    // 2. Imagem Natural Nítida (Benchmark)
    const naturalImg = PDI.getBenchmarkScene();

    // 3. Imagem Desfocada
    const psf = Degradation.createGaussianPSF(11, 2.5);
    const blurredImg = Degradation.convolve2D(naturalImg, psf, N, 11);

    // 4. Ruído Uniforme Puro (Distribuição Plana -> Máxima Incerteza)
    const rnd = PDI.prng(404);
    const uniformNoiseImg = new Float32Array(N * N);
    for (let i = 0; i < N * N; i++) uniformNoiseImg[i] = rnd();

    const selector = document.getElementById('shannon-select');
    const descEl = document.getElementById('shannon-desc');

    function update() {
      const choice = selector ? selector.value : 'natural';
      let data, desc;

      if (choice === 'binary') {
        data = binaryImg;
        desc = 'Dois picos isolados (0 e 1): baixíssima incerteza sobre o valor do pixel (H baixo).';
      } else if (choice === 'natural') {
        data = naturalImg;
        desc = 'Imagem com múltiplos tons, formas e gradientes: incerteza intermediária natural.';
      } else if (choice === 'blurred') {
        data = blurredImg;
        desc = 'Imagem desfocada: intensidades extremas se misturam no centro, reduzindo ligeiramente a dispersão de tons.';
      } else {
        data = uniformNoiseImg;
        desc = 'Ruído uniforme: todos os 256 níveis são igualmente prováveis. Incerteza máxima (H ≈ 8.0 bits). Prova que maior entropia NÃO significa melhor imagem!';
      }

      if (descEl) descEl.textContent = desc;

      PDI.drawGray('canvas-shannon-img', data, N);
      const res = Entropy.computeHistogramAndShannon(data);
      Entropy.drawHistogram('canvas-shannon-hist', res.p, res.H, PDI.cssVar('--c-luis', '#7c3aed'));
    }

    if (selector) selector.onchange = update;
    update();
  };

  /* ------------------------------------------------------------
     4) Demonstração do Método de Máxima Entropia (MEM) — Slide 15
     Formulação de Gull & Daniell (1978):
     min 0.5 * ||Hx - y||^2 - alpha * S(x)
     onde S(x) = -sum( x_i * ln(x_i / m_i) )
     ------------------------------------------------------------ */
  Entropy.deconvolveMEM = function (degraded, psf, N, psfSize, alpha, maxIter) {
    // Solver aproximado por gradiente com restrição de positividade
    const xHat = new Float32Array(degraded.length);
    const m = 0.1; // modelo a priori uniforme

    for (let i = 0; i < degraded.length; i++) {
      xHat[i] = Math.max(0.01, degraded[i]);
    }

    const psfAdj = new Float32Array(psfSize * psfSize);
    for (let y = 0; y < psfSize; y++) {
      for (let x = 0; x < psfSize; x++) {
        psfAdj[(psfSize - 1 - y) * psfSize + (psfSize - 1 - x)] = psf[y * psfSize + x];
      }
    }

    const lr = 0.05;

    for (let iter = 0; iter < (maxIter || 25); iter++) {
      // Gradiente da fidelidade aos dados: H* (Hx - y)
      const hx = Degradation.convolve2D(xHat, psf, N, psfSize);
      const diff = new Float32Array(N * N);
      for (let i = 0; i < N * N; i++) diff[i] = hx[i] - degraded[i];
      const gradData = Degradation.convolve2D(diff, psfAdj, N, psfSize);

      // Gradiente da entropia relativa -S(x): ln(x/m) + 1
      for (let i = 0; i < N * N; i++) {
        const gradEntropy = Math.log(Math.max(1e-5, xHat[i]) / m) + 1.0;
        const totalGrad = gradData[i] + alpha * gradEntropy;
        xHat[i] = Math.max(1e-4, Math.min(1.0, xHat[i] - lr * totalGrad));
      }
    }

    return xHat;
  };

  Entropy.initDemoMEM = function () {
    const N = PDI.N;
    const orig = PDI.getBenchmarkScene();
    const psfSize = 11;
    const psf = Degradation.createGaussianPSF(psfSize, 1.8);
    const blurred = Degradation.convolve2D(orig, psf, N, psfSize);
    const degraded = Degradation.addGaussianNoise(blurred, 0.02, 888);

    PDI.drawGray('canvas-mem-deg', degraded, N);

    const sliderAlpha = document.getElementById('mem-alpha');
    const valAlpha = document.getElementById('mem-alpha-val');
    const badgeState = document.getElementById('mem-state-badge');

    function render() {
      const alpha = parseFloat(sliderAlpha.value);
      if (valAlpha) valAlpha.textContent = `α = ${alpha.toFixed(3)}`;

      if (badgeState) {
        if (alpha < 0.005) {
          badgeState.className = 'badge badge-warn';
          badgeState.textContent = 'α muito baixo: Predomina fidelidade aos dados, ruído residual visível';
        } else if (alpha > 0.06) {
          badgeState.className = 'badge badge-warn';
          badgeState.textContent = 'α muito alto: Modelo uniforme atrai a solução, achatando contrastes';
        } else {
          badgeState.className = 'badge badge-ok';
          badgeState.textContent = 'α ideal: Detalhes preservados e ausência de anelamento (Gibbs)';
        }
      }

      const restored = Entropy.deconvolveMEM(degraded, psf, N, psfSize, alpha, 25);
      PDI.drawGray('canvas-mem-rest', restored, N);
      PDI.drawProfilePlot('canvas-mem-profile', restored, 20, `Corte Y=20 (MEM α=${alpha.toFixed(3)})`, PDI.cssVar('--c-luis', '#7c3aed'));
    }

    if (sliderAlpha) sliderAlpha.oninput = render;
    render();
  };
})();
