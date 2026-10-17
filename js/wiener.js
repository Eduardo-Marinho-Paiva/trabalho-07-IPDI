/* ============================================================
   wiener.js — Deconvolução de Wiener no Domínio da Frequência
   Seminário 7 · Bloco 2 (Cindy Vitoria): Filtragem Estatística
   
   - Implementação Exata do Filtro de Wiener via FFT 2D
   - W(u,v) = H*(u,v) / (|H(u,v)|^2 + K)
   - Análise Espectral da OTF e Função de Transferência do Filtro
   - Demonstração Interativa B: Efeito do Parâmetro K (Compromisso Ruído vs Desfoque)
   ============================================================ */
(function () {
  'use strict';

  const Wiener = {};
  window.Wiener = Wiener;

  /* ------------------------------------------------------------
     1) Algoritmo de Restauração de Wiener via 2D FFT
     ------------------------------------------------------------ */
  Wiener.deconvolve = function (degraded, psf, N, psfSize, K) {
    // 1. FFT da Imagem Degradada
    const reY = new Float32Array(degraded);
    const imY = new Float32Array(N * N);
    PDI.fft2D(reY, imY, N, false);

    // 2. FFT da PSF Padded com Origem em (0,0) para Fase Zero
    const reH = new Float32Array(N * N);
    const imH = new Float32Array(N * N);
    const half = Math.floor(psfSize / 2);
    for (let ky = -half; ky <= half; ky++) {
      const py = (ky + N) % N;
      for (let kx = -half; kx <= half; kx++) {
        const px = (kx + N) % N;
        reH[py * N + px] = psf[(ky + half) * psfSize + (kx + half)];
      }
    }
    PDI.fft2D(reH, imH, N, false);

    // 3. Aplicação do Filtro W(u,v) = H* / (|H|^2 + K)
    const reX = new Float32Array(N * N);
    const imX = new Float32Array(N * N);
    const filterMag = new Float32Array(N * N);

    for (let i = 0; i < N * N; i++) {
      const magH2 = reH[i] * reH[i] + imH[i] * imH[i];
      const denom = magH2 + K;

      // W = (reH - j imH) / denom
      const wRe = reH[i] / denom;
      const wIm = -imH[i] / denom;

      filterMag[i] = Math.sqrt(wRe * wRe + wIm * wIm);

      // X_hat = Y * W
      reX[i] = reY[i] * wRe - imY[i] * wIm;
      imX[i] = reY[i] * wIm + imY[i] * wRe;
    }

    // 4. IFFT 2D
    PDI.fft2D(reX, imX, N, true);

    // 5. Clamping para [0, 1]
    const restored = new Float32Array(N * N);
    for (let i = 0; i < N * N; i++) {
      restored[i] = Math.max(0, Math.min(1, reX[i]));
    }

    return {
      restored,
      filterMag: PDI.fftShift(filterMag, N),
      otfMag: PDI.fftShift(reH.map((r, idx) => Math.sqrt(r * r + imH[idx] * imH[idx])), N)
    };
  };

  /* ------------------------------------------------------------
     2) Demonstração B (Slide 8): Filtro de Wiener Interativo
     ------------------------------------------------------------ */
  Wiener.initDemoB = function () {
    const N = PDI.N;
    const orig = PDI.getBenchmarkScene();
    const psfSize = 11;
    const psf = Degradation.createGaussianPSF(psfSize, 1.8);
    const blurred = Degradation.convolve2D(orig, psf, N, psfSize);
    const degraded = Degradation.addGaussianNoise(blurred, 0.02, 777);

    // Renderiza imagem degradada de entrada
    PDI.drawGray('canvas-wiener-deg', degraded, N);

    const sliderLogK = document.getElementById('wiener-logk');
    const valKDisplay = document.getElementById('wiener-k-val');
    const diagState = document.getElementById('wiener-state-badge');

    const btnLow = document.getElementById('wiener-preset-low');
    const btnOpt = document.getElementById('wiener-preset-opt');
    const btnHigh = document.getElementById('wiener-preset-high');

    function render() {
      const logK = parseFloat(sliderLogK.value);
      const K = Math.pow(10, logK);

      if (valKDisplay) {
        valKDisplay.textContent = `K = ${K < 0.001 ? K.toExponential(2) : K.toFixed(4)}`;
      }

      if (diagState) {
        if (logK < -3.5) {
          diagState.className = 'badge badge-warn';
          diagState.textContent = 'K muito baixo: Ruído Amplificado (Quase Inverso Puro)';
        } else if (logK > -1.2) {
          diagState.className = 'badge badge-warn';
          diagState.textContent = 'K muito alto: Sub-restauração (Desfoque Residual Alto)';
        } else {
          diagState.className = 'badge badge-ok';
          diagState.textContent = 'K equilibrado: Bom compromisso SNR';
        }
      }

      const res = Wiener.deconvolve(degraded, psf, N, psfSize, K);

      // Imagem Restaurada
      PDI.drawGray('canvas-wiener-rest', res.restored, N);

      // Espectro de Frequência do Filtro
      PDI.drawGray('canvas-wiener-spectrum', res.filterMag, N);

      // Perfil 1D
      PDI.drawProfilePlot('canvas-wiener-profile', res.restored, 20, 'Corte Y=20 (Wiener)', PDI.cssVar('--c-cindy', '#059669'));
    }

    if (sliderLogK) sliderLogK.oninput = render;

    if (btnLow) btnLow.onclick = () => { sliderLogK.value = -4.5; render(); };
    if (btnOpt) btnOpt.onclick = () => { sliderLogK.value = -2.3; render(); };
    if (btnHigh) btnHigh.onclick = () => { sliderLogK.value = -0.7; render(); };

    render();
  };
})();
