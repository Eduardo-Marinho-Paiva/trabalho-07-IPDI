/* ============================================================
   totalVariation.js — Restauração por Variação Total (ROF 1992)
   Seminário 7 · Bloco 5 (Paulo Sérgio): Regularização Espacial e Preservação de Bordas
   
   - Modelo de Rudin, Osher e Fatemi (Physica D, 1992)
   - min 0.5 * ||Hx - y||^2 + lambda * TV(x)
   - Divergência e Gradiente Espacial: div( grad(x) / |grad(x)| )
   - Preservação Estrita de Descontinuidades (Bordas Nítidas)
   - Efeito de Staircasing em Rampas Suaves
   - Demonstração Interativa E & Bancada Comparativa (Slide 23)
   ============================================================ */
(function () {
  'use strict';

  const TV = {};
  window.TV = TV;

  /* ------------------------------------------------------------
     1) Operadores Discretos de Gradiente e Divergência 2D
     ------------------------------------------------------------ */
  function computeGrad(img, N) {
    const gx = new Float32Array(N * N);
    const gy = new Float32Array(N * N);

    for (let y = 0; y < N; y++) {
      const ym1 = (y + 1) % N;
      for (let x = 0; x < N; x++) {
        const xm1 = (x + 1) % N;
        gx[y * N + x] = img[y * N + xm1] - img[y * N + x];
        gy[y * N + x] = img[ym1 * N + x] - img[y * N + x];
      }
    }
    return { gx, gy };
  }

  function computeDiv(px, py, N) {
    const div = new Float32Array(N * N);

    for (let y = 0; y < N; y++) {
      const yp1 = (y - 1 + N) % N;
      for (let x = 0; x < N; x++) {
        const xp1 = (x - 1 + N) % N;
        const dx = px[y * N + x] - px[y * N + xp1];
        const dy = py[y * N + x] - py[yp1 * N + x];
        div[y * N + x] = dx + dy;
      }
    }
    return div;
  }

  /* ------------------------------------------------------------
     2) Solver de Deconvolução com Regularização TV
     ------------------------------------------------------------ */
  TV.deconvolve = function (degraded, psf, N, psfSize, lambda, maxIter) {
    maxIter = maxIter || 24;
    let xHat = new Float32Array(degraded);

    const psfAdj = new Float32Array(psfSize * psfSize);
    for (let y = 0; y < psfSize; y++) {
      for (let x = 0; x < psfSize; x++) {
        psfAdj[(psfSize - 1 - y) * psfSize + (psfSize - 1 - x)] = psf[y * psfSize + x];
      }
    }

    const eps = 1e-4; // Regularização para diferenciabilidade em |grad| = 0
    const stepSize = 0.12;

    for (let iter = 0; iter < maxIter; iter++) {
      // 1. Termo de fidelidade: H*(Hx - y)
      const hx = Degradation.convolve2D(xHat, psf, N, psfSize);
      const res = new Float32Array(N * N);
      for (let i = 0; i < N * N; i++) res[i] = hx[i] - degraded[i];
      const gradData = Degradation.convolve2D(res, psfAdj, N, psfSize);

      // 2. Termo de TV: -div( grad(x) / sqrt(|grad(x)|^2 + eps^2) )
      const { gx, gy } = computeGrad(xHat, N);
      const px = new Float32Array(N * N);
      const py = new Float32Array(N * N);

      for (let i = 0; i < N * N; i++) {
        const norm = Math.sqrt(gx[i] * gx[i] + gy[i] * gy[i] + eps * eps);
        px[i] = gx[i] / norm;
        py[i] = gy[i] / norm;
      }

      const divP = computeDiv(px, py, N);

      // 3. Passo de gradiente
      for (let i = 0; i < N * N; i++) {
        const update = gradData[i] - lambda * divP[i];
        xHat[i] = Math.max(0, Math.min(1, xHat[i] - stepSize * update));
      }
    }

    return xHat;
  };

  /* ------------------------------------------------------------
     3) Demonstração E (Slide 18): Variação Total Interativa
     ------------------------------------------------------------ */
  TV.initDemoE = function () {
    const N = PDI.N;
    const orig = PDI.getBenchmarkScene();
    const psfSize = 11;
    const psf = Degradation.createGaussianPSF(psfSize, 1.8);
    const blurred = Degradation.convolve2D(orig, psf, N, psfSize);
    const degraded = Degradation.addGaussianNoise(blurred, 0.025, 654);

    PDI.drawGray('canvas-tv-deg', degraded, N);

    const sliderLambda = document.getElementById('tv-lambda');
    const valLambda = document.getElementById('tv-lambda-val');
    const badgeState = document.getElementById('tv-state-badge');

    const btnLow = document.getElementById('tv-preset-low');
    const btnOpt = document.getElementById('tv-preset-opt');
    const btnHigh = document.getElementById('tv-preset-high');

    function render() {
      const lambda = parseFloat(sliderLambda.value);
      if (valLambda) valLambda.textContent = `λ = ${lambda.toFixed(3)}`;

      if (badgeState) {
        if (lambda < 0.015) {
          badgeState.className = 'badge badge-warn';
          badgeState.textContent = 'λ baixo: Pouca regularização, ruído residual disperso';
        } else if (lambda > 0.08) {
          badgeState.className = 'badge badge-warn';
          badgeState.textContent = 'λ alto: Efeito Staircasing (degraus artificiais na rampa) e perda de texturas';
        } else {
          badgeState.className = 'badge badge-ok';
          badgeState.textContent = 'λ equilibrado: Bordas preservadas nítidas e ruído atenuado';
        }
      }

      const restored = TV.deconvolve(degraded, psf, N, psfSize, lambda, 24);
      PDI.drawGray('canvas-tv-rest', restored, N);

      // Perfil 1D passando pela rampa e pelo disco nítido (linha Y=18)
      PDI.drawProfilePlot('canvas-tv-profile', restored, 18, `Corte Y=18 (TV λ=${lambda.toFixed(3)})`, PDI.cssVar('--c-paulo', '#e11d48'));
    }

    if (sliderLambda) sliderLambda.oninput = render;

    if (btnLow) btnLow.onclick = () => { sliderLambda.value = 0.005; render(); };
    if (btnOpt) btnOpt.onclick = () => { sliderLambda.value = 0.035; render(); };
    if (btnHigh) btnHigh.onclick = () => { sliderLambda.value = 0.140; render(); };

    render();
  };

  /* ------------------------------------------------------------
     4) Slide 23: Bancada Comparativa Central dos 4 Métodos
     Permite alternar entre Wiener, Richardson-Lucy, MEM e TV
     sobre a mesmíssima imagem de teste degradada!
     ------------------------------------------------------------ */
  TV.initComparisonSlide = function () {
    const N = PDI.N;
    const orig = PDI.getBenchmarkScene();
    const psfSize = 11;
    const psf = Degradation.createGaussianPSF(psfSize, 1.8);
    const blurred = Degradation.convolve2D(orig, psf, N, psfSize);
    const degraded = Degradation.addGaussianNoise(blurred, 0.02, 1010);

    // Desenha referência e degradada
    PDI.drawGray('canvas-cmp-orig', orig, N);
    PDI.drawGray('canvas-cmp-deg', degraded, N);

    // Pré-computa os 4 resultados para resposta instantânea
    const results = {
      wiener: Wiener.deconvolve(degraded, psf, N, psfSize, 0.005).restored,
      rl: RL.runIterations(degraded, psf, N, psfSize, 18),
      mem: Entropy.deconvolveMEM(degraded, psf, N, psfSize, 0.02, 22),
      tv: TV.deconvolve(degraded, psf, N, psfSize, 0.035, 24)
    };

    const descriptions = {
      wiener: {
        name: 'Deconvolução de Wiener',
        member: 'Cindy Vitoria',
        color: '--c-cindy',
        char: 'Filtragem no domínio Fourier. Rápida (O(N log N)), mas propensa a anelamento (Gibbs) ao redor de bordas nítidas.'
      },
      rl: {
        name: 'Richardson–Lucy (18 iterações)',
        member: 'Eduardo Marinho',
        color: '--c-edu',
        char: 'Atualização iterativa multiplicativa baseada em Poisson. Alta resolução de fontes pontuais, com leve granulação.'
      },
      mem: {
        name: 'Máxima Entropia (MEM)',
        member: 'Luis Jeronimo',
        color: '--c-luis',
        char: 'Regularização por entropia espacial relativa. Excelente supressão de ringing com fundo uniforme e suave.'
      },
      tv: {
        name: 'Variação Total (ROF)',
        member: 'Paulo Sérgio',
        color: '--c-paulo',
        char: 'Regularização L1 da norma do gradiente. Bordas perfeitamente nítidas sem anelamento, com platôs (staircasing).'
      }
    };

    const tabBtns = Array.from(document.querySelectorAll('.comp-tab-btn'));
    const badgeMethod = document.getElementById('cmp-method-badge');
    const descText = document.getElementById('cmp-desc-text');

    function selectMethod(methodKey) {
      tabBtns.forEach(b => b.classList.toggle('active', b.dataset.method === methodKey));

      const data = results[methodKey];
      const meta = descriptions[methodKey];

      if (badgeMethod) {
        badgeMethod.textContent = `${meta.name} · ${meta.member}`;
        badgeMethod.style.backgroundColor = `var(${meta.color})`;
        badgeMethod.style.color = '#ffffff';
      }

      if (descText) descText.textContent = meta.char;

      PDI.drawGray('canvas-cmp-rest', data, N);
      PDI.drawProfilePlot('canvas-cmp-profile', data, 20, `Corte Y=20 (${meta.name})`, PDI.cssVar(meta.color, '#2563eb'));
    }

    tabBtns.forEach(btn => {
      btn.onclick = () => selectMethod(btn.dataset.method);
    });

    selectMethod('wiener');
  };
})();
