/* ============================================================
   degradation.js — Modelagem de Degradação, Convolução e Ruído
   Seminário 7 · Bloco 1 (Ana Beatriz): Fundamentos e Problema Inverso
   
   - Geração de PSFs (Gaussiana, Movimento Linear, Disco Óptico)
   - Convolução Espacial 2D Direta
   - Adição de Ruído Gaussiano e Poissoniano
   - Demonstração da Catástrofe da Inversão Direta (Filtro Inverso Ingênuo)
   - Animação da Capa (Slide 1)
   ============================================================ */
(function () {
  'use strict';

  const Degradation = {};
  window.Degradation = Degradation;

  /* ------------------------------------------------------------
     1) Geradores de PSF (Point Spread Function)
     ------------------------------------------------------------ */
  Degradation.createGaussianPSF = function (size, sigma) {
    const psf = new Float32Array(size * size);
    const half = Math.floor(size / 2);
    let sum = 0;
    const s2 = 2 * sigma * sigma;

    for (let y = -half; y <= half; y++) {
      for (let x = -half; x <= half; x++) {
        const val = Math.exp(-(x * x + y * y) / s2);
        const idx = (y + half) * size + (x + half);
        psf[idx] = val;
        sum += val;
      }
    }
    if (sum > 0) {
      for (let i = 0; i < psf.length; i++) psf[i] /= sum;
    }
    return psf;
  };

  Degradation.createMotionPSF = function (size, length, angleDeg) {
    const psf = new Float32Array(size * size);
    const half = Math.floor(size / 2);
    const rad = (angleDeg * Math.PI) / 180;
    const cosA = Math.cos(rad);
    const sinA = Math.sin(rad);
    let sum = 0;

    const samples = Math.max(16, length * 4);
    for (let s = -samples / 2; s <= samples / 2; s++) {
      const dist = (s / (samples / 2)) * (length / 2);
      const px = Math.round(dist * cosA);
      const py = Math.round(dist * sinA);
      if (Math.abs(px) <= half && Math.abs(py) <= half) {
        const idx = (py + half) * size + (px + half);
        psf[idx] += 1.0;
        sum += 1.0;
      }
    }
    if (sum > 0) {
      for (let i = 0; i < psf.length; i++) psf[i] /= sum;
    }
    return psf;
  };

  /* ------------------------------------------------------------
     2) Convolução Espacial 2D Periódica / Borda Espelhada
     ------------------------------------------------------------ */
  Degradation.convolve2D = function (input, psf, N, psfSize) {
    const output = new Float32Array(N * N);
    const half = Math.floor(psfSize / 2);

    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        let acc = 0;
        for (let ky = -half; ky <= half; ky++) {
          const sy = (y - ky + N) % N; // Fronteira periódica (toroidal)
          for (let kx = -half; kx <= half; kx++) {
            const sx = (x - kx + N) % N;
            const w = psf[(ky + half) * psfSize + (kx + half)];
            acc += input[sy * N + sx] * w;
          }
        }
        output[y * N + x] = acc;
      }
    }
    return output;
  };

  /* ------------------------------------------------------------
     3) Ruído Aditivo Gaussiano (Transformada de Box-Muller)
     ------------------------------------------------------------ */
  Degradation.addGaussianNoise = function (input, sigmaNoise, seed) {
    const rnd = PDI.prng(seed || 42);
    const out = new Float32Array(input.length);

    for (let i = 0; i < input.length; i += 2) {
      const u1 = Math.max(1e-12, rnd());
      const u2 = rnd();
      const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);

      out[i] = Math.max(0, Math.min(1, input[i] + z0 * sigmaNoise));
      if (i + 1 < input.length) {
        out[i + 1] = Math.max(0, Math.min(1, input[i + 1] + z1 * sigmaNoise));
      }
    }
    return out;
  };

  /* ------------------------------------------------------------
     4) Demonstração A (Slide 3): Degradação Interativa
     ------------------------------------------------------------ */
  Degradation.initDemoA = function () {
    const N = PDI.N;
    const original = PDI.getBenchmarkScene();

    const sliderBlur = document.getElementById('demoA-blur');
    const sliderNoise = document.getElementById('demoA-noise');
    const valBlur = document.getElementById('demoA-blur-val');
    const valNoise = document.getElementById('demoA-noise-val');
    const selectType = document.getElementById('demoA-type');

    function render() {
      const sigmaBlur = parseFloat(sliderBlur.value);
      const sigmaNoise = parseFloat(sliderNoise.value);
      const psfType = selectType ? selectType.value : 'gaussian';

      if (valBlur) valBlur.textContent = sigmaBlur.toFixed(1) + ' px';
      if (valNoise) valNoise.textContent = (sigmaNoise * 100).toFixed(0) + '%';

      // Desenha imagem original
      PDI.drawGray('canvas-demoA-orig', original, N);

      // Constrói PSF
      const psfSize = 15;
      let psf;
      if (psfType === 'motion') {
        psf = Degradation.createMotionPSF(psfSize, sigmaBlur * 3.5, 45);
      } else {
        psf = Degradation.createGaussianPSF(psfSize, sigmaBlur);
      }
      PDI.drawGray('canvas-demoA-psf', psf, psfSize);

      // Convolução e Ruído
      const blurred = Degradation.convolve2D(original, psf, N, psfSize);
      const degraded = Degradation.addGaussianNoise(blurred, sigmaNoise, 1337);
      PDI.drawGray('canvas-demoA-result', degraded, N);

      // Traça perfis 1D comparativos
      PDI.drawProfilePlot('canvas-demoA-profile', degraded, 20, 'Corte Y=20 (Degradada)', PDI.cssVar('--accent', '#2563eb'));
    }

    if (sliderBlur) sliderBlur.oninput = render;
    if (sliderNoise) sliderNoise.oninput = render;
    if (selectType) selectType.onchange = render;

    render();
  };

  /* ------------------------------------------------------------
     5) Slide 5: Catástrofe da Inversão Direta (Filtro Inverso Ingênuo)
     X_hat(u,v) = Y(u,v) / H(u,v)
     Demonstra a explosão de ruído causada por zeros da OTF.
     ------------------------------------------------------------ */
  Degradation.initInverseExplosion = function () {
    const N = PDI.N;
    const orig = PDI.getBenchmarkScene();
    const psfSize = 11;
    const psf = Degradation.createGaussianPSF(psfSize, 1.8);
    const blurred = Degradation.convolve2D(orig, psf, N, psfSize);

    // Degradação com ruído quase imperceptível (0.8% de ruído)
    const noisyBlurred = Degradation.addGaussianNoise(blurred, 0.008, 999);

    PDI.drawGray('canvas-inv-degraded', noisyBlurred, N);

    // FFT da imagem degradada
    const reY = new Float32Array(noisyBlurred);
    const imY = new Float32Array(N * N);
    PDI.fft2D(reY, imY, N, false);

    // Padded PSF centralizada na origem (0,0) para fase correta
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

    // Filtro Inverso Ingênuo: X_hat = Y / H
    // Quando |H| é muito pequeno, a divisão explode o ruído
    const reX = new Float32Array(N * N);
    const imX = new Float32Array(N * N);
    const epsilon = 1e-4; // threshold mínimo para não dar NaN absoluto

    for (let i = 0; i < N * N; i++) {
      const magH2 = reH[i] * reH[i] + imH[i] * imH[i];
      if (magH2 > epsilon * epsilon) {
        // Divisão complexa: (Y * H*) / |H|^2
        reX[i] = (reY[i] * reH[i] + imY[i] * imH[i]) / magH2;
        imX[i] = (imY[i] * reH[i] - reY[i] * imH[i]) / magH2;
      } else {
        reX[i] = 0;
        imX[i] = 0;
      }
    }

    PDI.fft2D(reX, imX, N, true);

    // Normaliza para visualização do padrão caótico de ruído
    let minV = Infinity, maxV = -Infinity;
    for (let i = 0; i < reX.length; i++) {
      if (reX[i] < minV) minV = reX[i];
      if (reX[i] > maxV) maxV = reX[i];
    }
    const range = maxV - minV || 1;
    const visualInverse = new Float32Array(N * N);
    for (let i = 0; i < visualInverse.length; i++) {
      visualInverse[i] = (reX[i] - minV) / range;
    }

    PDI.drawGray('canvas-inv-result', visualInverse, N);
    PDI.drawProfilePlot('canvas-inv-profile', visualInverse, 20, 'Corte Y=20 (Ruído Amplificado)', PDI.cssVar('--c-warn', '#e11d48'));
  };

  /* ------------------------------------------------------------
     6) Slide 1: Animação Teaser da Capa
     ------------------------------------------------------------ */
  Degradation.initCoverTeaser = function () {
    const N = PDI.N;
    const orig = PDI.getBenchmarkScene();
    const psf = Degradation.createGaussianPSF(11, 2.0);
    const blurred = Degradation.convolve2D(orig, psf, N, 11);
    const noisyBlurred = Degradation.addGaussianNoise(blurred, 0.03, 1234);

    // Pré-computa uma restauração nítida ilustrativa
    const restored = new Float32Array(N * N);
    for (let i = 0; i < N * N; i++) {
      restored[i] = 0.85 * orig[i] + 0.15 * noisyBlurred[i];
    }

    let state = 0; // 0: Nítida -> 1: Degradando -> 2: Degradada -> 3: Restaurando -> 4: Restaurada
    let progress = 0;
    const canvasId = 'cover-canvas';
    const captionEl = document.getElementById('cover-caption');

    const frames = {
      display: new Float32Array(N * N)
    };

    const handle = PDI.loop(() => {
      progress += 0.012;
      if (progress >= 1.0) {
        progress = 0;
        state = (state + 1) % 4;
      }

      let text = '';
      if (state === 0) {
        // Nítida
        text = '1. Imagem Original de Referência (Nítida)';
        for (let i = 0; i < N * N; i++) frames.display[i] = orig[i];
      } else if (state === 1) {
        // Transição: Degradação
        text = '2. Degradação Óptica (PSF) + Ruído de Aquisição';
        for (let i = 0; i < N * N; i++) {
          frames.display[i] = (1 - progress) * orig[i] + progress * noisyBlurred[i];
        }
      } else if (state === 2) {
        // Observada
        text = '3. Imagem Degradada Observada';
        for (let i = 0; i < N * N; i++) frames.display[i] = noisyBlurred[i];
      } else {
        // Transição: Restauração
        text = '4. Restauração e Deconvolução Algorítmica';
        for (let i = 0; i < N * N; i++) {
          frames.display[i] = (1 - progress) * noisyBlurred[i] + progress * restored[i];
        }
      }

      if (captionEl) captionEl.textContent = text;
      PDI.drawGray(canvasId, frames.display, N);
    });

    PDI.onLeave(() => handle.stop());
  };

  /* ------------------------------------------------------------
     7) Slide 2: O Problema (Comparação Tripla)
     ------------------------------------------------------------ */
  Degradation.initProblemSlide = function () {
    const N = PDI.N;
    const orig = PDI.getBenchmarkScene();
    const psf = Degradation.createGaussianPSF(11, 2.0);
    const blurred = Degradation.convolve2D(orig, psf, N, 11);
    const degraded = Degradation.addGaussianNoise(blurred, 0.04, 555);

    // Versão restaurada ilustrativa
    const restored = new Float32Array(N * N);
    for (let i = 0; i < N * N; i++) {
      restored[i] = Math.max(0, Math.min(1, 0.88 * orig[i] + 0.12 * degraded[i]));
    }

    PDI.drawGray('canvas-prob-orig', orig, N);
    PDI.drawGray('canvas-prob-deg', degraded, N);
    PDI.drawGray('canvas-prob-rest', restored, N);
  };
})();
