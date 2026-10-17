/* ============================================================
   richardsonLucy.js — Deconvolução Iterativa de Richardson–Lucy
   Seminário 7 · Bloco 3 (Eduardo Marinho): Máxima Verossimilhança e Iterações
   
   - Algoritmo de Richardson (1972) & Lucy (1974)
   - x^(k+1) = x^(k) * [ h* convolve ( y / (h convolve x^(k) + eps) ) ]
   - Preservação Estrita de Positividade e Conservação de Fluxo
   - Demonstração Interativa C: Semi-convergência e Amplificação de Ruído
   ============================================================ */
(function () {
  'use strict';

  const RL = {};
  window.RL = RL;

  /* ------------------------------------------------------------
     1) Algoritmo de Richardson–Lucy em 2D
     ------------------------------------------------------------ */
  RL.runIterations = function (degraded, psf, N, psfSize, maxIter, onStep) {
    // Estimativa inicial: imagem uniforme ou a própria imagem degradada positiva
    let xHat = new Float32Array(degraded.length);
    for (let i = 0; i < degraded.length; i++) {
      xHat[i] = Math.max(1e-4, degraded[i]);
    }

    // PSF adjunta h*(x, y) = h(-x, -y)
    const psfAdj = new Float32Array(psfSize * psfSize);
    for (let y = 0; y < psfSize; y++) {
      for (let x = 0; x < psfSize; x++) {
        psfAdj[(psfSize - 1 - y) * psfSize + (psfSize - 1 - x)] = psf[y * psfSize + x];
      }
    }

    const eps = 1e-7;

    for (let iter = 1; iter <= maxIter; iter++) {
      // 1. Projeção direta: reblur = h * xHat
      const reblur = Degradation.convolve2D(xHat, psf, N, psfSize);

      // 2. Razão entre a observação e a projeção: ratio = y / (reblur + eps)
      const ratio = new Float32Array(N * N);
      for (let i = 0; i < N * N; i++) {
        ratio[i] = degraded[i] / (reblur[i] + eps);
      }

      // 3. Retroprojeção: correction = h* * ratio
      const correction = Degradation.convolve2D(ratio, psfAdj, N, psfSize);

      // 4. Atualização multiplicativa: xHat = xHat .* correction
      for (let i = 0; i < N * N; i++) {
        xHat[i] = Math.max(0, xHat[i] * correction[i]);
      }

      if (onStep) {
        onStep(iter, xHat);
      }
    }

    return xHat;
  };

  /* ------------------------------------------------------------
     2) Demonstração C (Slide 11): Controle de Iterações
     ------------------------------------------------------------ */
  RL.initDemoC = function () {
    const N = PDI.N;
    const orig = PDI.getBenchmarkScene();
    const psfSize = 11;
    const psf = Degradation.createGaussianPSF(psfSize, 1.8);
    const blurred = Degradation.convolve2D(orig, psf, N, psfSize);
    // Adiciona leve ruído de Poisson / Gaussiano
    const degraded = Degradation.addGaussianNoise(blurred, 0.02, 333);

    PDI.drawGray('canvas-rl-deg', degraded, N);

    const sliderIter = document.getElementById('rl-iter');
    const valIter = document.getElementById('rl-iter-val');
    const badgeState = document.getElementById('rl-state-badge');
    const btnPlay = document.getElementById('rl-btn-play');

    const btnK1 = document.getElementById('rl-preset-1');
    const btnK15 = document.getElementById('rl-preset-15');
    const btnK60 = document.getElementById('rl-preset-60');

    // Pré-computa iterações-chave para resposta instantânea ao arrastar o slider
    const cache = {};
    const checkpoints = [1, 2, 4, 8, 12, 16, 22, 30, 45, 60, 80, 100];

    let currentEstimate = new Float32Array(degraded.length);
    for (let i = 0; i < degraded.length; i++) currentEstimate[i] = Math.max(1e-4, degraded[i]);

    let lastComputedIter = 0;

    function getEstimateAt(targetIter) {
      if (cache[targetIter]) return cache[targetIter];

      // Computa progressivamente até o target
      let startIter = lastComputedIter;
      let xHat = new Float32Array(currentEstimate);

      if (targetIter < lastComputedIter) {
        // Reinicia se o alvo for menor
        startIter = 0;
        xHat = new Float32Array(degraded.length);
        for (let i = 0; i < degraded.length; i++) xHat[i] = Math.max(1e-4, degraded[i]);
      }

      const psfAdj = new Float32Array(psfSize * psfSize);
      for (let y = 0; y < psfSize; y++) {
        for (let x = 0; x < psfSize; x++) {
          psfAdj[(psfSize - 1 - y) * psfSize + (psfSize - 1 - x)] = psf[y * psfSize + x];
        }
      }

      const eps = 1e-7;
      for (let k = startIter + 1; k <= targetIter; k++) {
        const reblur = Degradation.convolve2D(xHat, psf, N, psfSize);
        const ratio = new Float32Array(N * N);
        for (let i = 0; i < N * N; i++) ratio[i] = degraded[i] / (reblur[i] + eps);
        const corr = Degradation.convolve2D(ratio, psfAdj, N, psfSize);
        for (let i = 0; i < N * N; i++) xHat[i] = Math.max(0, xHat[i] * corr[i]);

        if (checkpoints.includes(k) || k === targetIter) {
          cache[k] = new Float32Array(xHat);
        }
      }

      currentEstimate = xHat;
      lastComputedIter = targetIter;
      return xHat;
    }

    function render(targetIter) {
      targetIter = targetIter || parseInt(sliderIter.value, 10);
      sliderIter.value = targetIter;

      if (valIter) valIter.textContent = `${targetIter} iterações`;

      if (badgeState) {
        if (targetIter <= 3) {
          badgeState.className = 'badge badge-warn';
          badgeState.textContent = 'Poucas iterações: Detalhes ainda borrados (sub-restauração)';
        } else if (targetIter >= 45) {
          badgeState.className = 'badge badge-warn';
          badgeState.textContent = 'Excesso de iterações: Ruído pontual amplificado (artefatos granulares)';
        } else {
          badgeState.className = 'badge badge-ok';
          badgeState.textContent = 'Iterações ótimas: Detalhes finos recuperados sem explosão de ruído';
        }
      }

      const result = getEstimateAt(targetIter);
      PDI.drawGray('canvas-rl-rest', result, N);
      PDI.drawProfilePlot('canvas-rl-profile', result, 20, `Corte Y=20 (RL k=${targetIter})`, PDI.cssVar('--c-edu', '#d97706'));
    }

    if (sliderIter) {
      sliderIter.oninput = () => render(parseInt(sliderIter.value, 10));
    }

    let playing = false;
    let playInterval = null;

    function stopPlay() {
      playing = false;
      if (playInterval) clearInterval(playInterval);
      playInterval = null;
      if (btnPlay) btnPlay.textContent = '▶ Reproduzir Evolução';
    }

    function startPlay() {
      playing = true;
      if (btnPlay) btnPlay.textContent = '⏸ Pausar';
      let k = parseInt(sliderIter.value, 10);
      if (k >= 80) k = 1;

      playInterval = setInterval(() => {
        k += (k < 15 ? 1 : 4);
        if (k > 80) {
          stopPlay();
          return;
        }
        render(k);
      }, 160);
    }

    if (btnPlay) {
      btnPlay.onclick = () => {
        if (playing) stopPlay();
        else startPlay();
      };
    }

    if (btnK1) btnK1.onclick = () => { stopPlay(); render(1); };
    if (btnK15) btnK15.onclick = () => { stopPlay(); render(15); };
    if (btnK60) btnK60.onclick = () => { stopPlay(); render(60); };

    PDI.onLeave(stopPlay);

    // Primeira renderização
    render(15);
  };
})();
