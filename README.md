# Deconvolução e Restauração de Imagens — Seminário 7 · PDI

Aplicação web educacional e interativa desenvolvida para o Seminário 7 da disciplina de **Processamento Digital de Imagens (PDI)** do curso de **Ciência da Computação**.

Este projeto não é apenas uma apresentação de slides estáticos: trata-se de um software educacional interativo que simula e calcula a formação de imagens degradadas, a instabilidade matemática do problema inverso e a restauração através de quatro paradigmas consagrados na literatura científica.

---

## 1. Integrantes da Equipe (Ordem Alfabética)

1. **Ana Beatriz** — Introdução, Degradação Óptica, Modelo Matemático e Problema Inverso (Slides 1 a 6)
2. **Cindy Vitoria** — Deconvolução de Wiener: Fundamentos, Frequência e Trade-off SNR (Slides 7 a 9)
3. **Eduardo Marinho** — Deconvolução de Richardson–Lucy: Poisson, Iterações e Semi-convergência (Slides 10 a 12)
4. **Luis Jeronimo** — Métodos Baseados em Entropia: Shannon e Máxima Entropia (MEM) (Slides 13 a 15)
5. **Paulo Sérgio** — Variação Total (ROF), Aplicações Médicas/Engenharia e Comparação (Slides 16 a 25)

---

## 2. Tecnologias Utilizadas

- **HTML5 Semântico:** Estruturação dos 25 slides, cabeçalhos, painéis e controles acessíveis.
- **CSS3 Moderno:** Flexbox, CSS Grid, tipografia responsiva, variáveis CSS para alternância de temas (*Light Mode* e *Dark Mode*) com transições discretas.
- **JavaScript Puro (ES6+):** Arquitetura modular sem dependências de frameworks pesados (sem React, Vue ou Angular).
- **Tipografia Matemática KaTeX (Offline):** Todas as formulações matemáticas do seminário formatadas em $\LaTeX$ rigoroso, empacotadas localmente em `lib/katex/` com fontes WOFF2 embutidas (funciona 100% offline).
- **HTML5 Canvas API com Renderização Híbrida:**
  - *Matrizes 2D:* Renderização pixelada nítida (`.pixel-canvas`) para imagens sintetizadas, PSF e espectros de Fourier.
  - *Perfis 1D e Histogramas:* Renderização vetorial anti-serrilhada (`.vector-plot-canvas`) com suporte a monitores de alta densidade (**HiDPI / Retina** via `devicePixelRatio`), eixos cartesianos graduados e dupla legenda gráfica (referência *ground-truth* vs curva restaurada).
- **Motor Matemático Autônomo:**
  - Implementação pura do algoritmo **FFT 2D (Radix-2 Cooley-Tukey)** para filtragem rápida em Fourier.
  - Convolução espacial 2D com fronteiras periódicas e geradores de ruído gaussiano (Box-Muller) e Poisson.
  - Solver iterativo de Expectation-Maximization para Richardson-Lucy.
  - Solver aproximado para Máxima Entropia (Gull & Daniell).
  - Algoritmo de minimização de Variação Total (ROF) por gradiente regularizado.

---

## 3. Como Executar a Apresentação

O projeto foi projetado para execução imediata em qualquer computador ou projetor:

1. **Execução Direta pelo Navegador (Recomendado pela Praticidade):**
   - Basta abrir o arquivo `index.html` diretamente em qualquer navegador moderno (Chrome, Edge, Firefox, Safari).
   - O projeto funciona perfeitamente pelo protocolo local `file:///` porque **todo o processamento de imagem é sintetizado em buffers de memória (`Float32Array`)**, sem requisições assíncronas `fetch()` e sem leitura de bitmaps externos que violariam as políticas de segurança de *CORS* ou *Tainted Canvas* do navegador.

2. **Execução Opcional via Servidor HTTP Local:**
   Caso prefira servir os arquivos por HTTP:
   ```bash
   # Com Python 3
   cd trabalho-07-IPDI
   python -m http.server 8000
   ```
   Em seguida, acesse no navegador: `http://localhost:8000`.

---

## 4. Navegação, Atalhos e Modo Foco

A aplicação foi planejada para apresentações em notebooks e projetores de alta resolução:

| Tecla / Atalho | Ação Executada |
|---|---|
| `→` ou `Espaço` ou `PageDown` | Avança para o próximo slide |
| `←` ou `PageUp` | Retorna para o slide anterior |
| `Home` | Pula para o primeiro slide (Capa) |
| `End` | Pula para o último slide (Referências) |
| `Z` ou `z` | Alterna o **Modo Foco** (Tela Cheia imersiva sem distrações) |
| `F` ou `f` | Alterna o modo de Tela Cheia (*Fullscreen*) convencional |
| `T` ou `t` | Alterna entre **Light Mode** e **Dark Mode** |
| `M` ou `m` | Abre / Fecha o Menu de navegação rápida por seções |
| `Esc` | Fecha o menu de seções ou sai do Modo Foco |

### Sobre o Modo Foco (`Z`):
Ao acionar o atalho `Z`:
- A apresentação entra automaticamente em **Tela Cheia**;
- Oculta todos os elementos secundários da interface:
  1. A div superior esquerda `#section-indicator` (evitando redundância com os crachás dos próprios slides);
  2. O alternador de temas (`Light / Dark`);
  3. Os botões de navegação e tela cheia inferiores;
  4. A barra inferior central de atalhos;
  5. O menu e botão lateral de seções.
- Exibe apenas um botão discreto e translúcido `✕ Sair do Modo Foco` posicionado na **lateral inferior esquerda**, que também pode ser desativado pressionando `Z` ou `Esc`.
- O layout do slide se expande para ocupar 100% da área útil do projetor e readapta a escala dos gráficos dinamicamente.

*Observação:* Quando o usuário estiver manipulando controles interativos (sliders numéricos ou campos de entrada), os atalhos de navegação são temporariamente desativados para evitar avanços acidentais de slide.

---

## 5. Estrutura de Arquivos e Diretórios

```text
trabalho-07-IPDI/
├── index.html                  # Apresentação completa com os 25 slides estruturados
├── lib/
│   └── katex/                  # KaTeX local offline (CSS, JS auto-render e fontes woff2)
├── css/
│   ├── style.css               # Folha de estilos principal, layouts, grids e animações
│   ├── light.css               # Variáveis e cores do tema claro (padrão de projetores)
│   └── dark.css                # Variáveis e cores do tema escuro de alto contraste
├── js/
│   ├── presentation.js         # Gerenciador de navegação, ciclo de vida, FFT 2D e utilitários
│   ├── theme.js                # Alternância de tema com persistência em localStorage
│   ├── degradation.js          # Modelagem da PSF, convolução 2D, ruído e Demo A
│   ├── wiener.js               # Deconvolução de Wiener em Fourier, espectros e Demo B
│   ├── richardsonLucy.js       # Algoritmo de Richardson-Lucy de Poisson e Demo C
│   ├── entropy.js              # Entropia de Shannon, histogramas e Demo D (MEM)
│   └── totalVariation.js       # Variação Total (ROF), Demo E e bancada comparativa
├── assets/
│   ├── images/                 # Diretório de suporte a recursos visuais
│   └── icons/                  # Ícones vetoriais
├── docs/
│   ├── guia-geral.md           # Roteiro mestre, mapa de slides, timing e transições
│   ├── guia-ana.md             # Guia individual de Ana Beatriz (Slides 1 a 6)
│   ├── guia-cindy.md           # Guia individual de Cindy Vitoria (Slides 7 a 9)
│   ├── guia-eduardo.md         # Guia individual de Eduardo Marinho (Slides 10 a 12)
│   ├── guia-luis.md            # Guia individual de Luis Jeronimo (Slides 13 a 15)
│   ├── guia-paulo.md           # Guia individual de Paulo Sérgio (Slides 16 a 25)
│   └── referencias.md          # Referências bibliográficas completas e verificáveis
└── README.md                   # Documentação geral do software educacional
```

---

## 6. Demonstrações Interativas Implementadas

Todas as demonstrações executam cálculos numéricos reais em JavaScript sobre matrizes 2D ($N = 64$), renderizadas em tempo real nos elementos `<canvas>`:

1. **Demonstração da Capa (Slide 1):** Animação contínua exibindo o ciclo físico completo: Referência $\to$ Passagem pela PSF e adição de ruído $\to$ Observação corrompida $\to$ Restauração por deconvolução.
2. **Demonstração A — Degradação (Slide 3):** Controle interativo do raio da PSF gaussiana ($\sigma$), do comprimento de desfoque por movimento linear (45°) e do desvio padrão do ruído aditivo gaussiano, com exibição ampliada da PSF e do perfil 1D.
3. **Demonstração da Inversão Direta (Slide 5):** Cálculo ao vivo da divisão ingênua $\hat{X}(u,v) = Y(u,v) / H(u,v)$ em Fourier, evidenciando a explosão violenta de ruído decorrente de zeros e valores quase nulos na Função de Transferência Óptica (OTF).
4. **Demonstração B — Wiener (Slide 8):** Controle interativo do parâmetro de regularização $K$ (relação sinal-ruído). Demonstra o comportamento de filtro inverso com ruído amplificado ($K$ muito baixo), a restauração ótima equilibrada e a sub-restauração com desfoque residual ($K$ muito alto), além de exibir o espectro do filtro $|W(u,v)|$ e o anelamento de Gibbs no perfil 1D.
5. **Demonstração C — Richardson–Lucy (Slide 11):** Controle e reprodução animada passo a passo das iterações $k \in [1, 80]$. Demonstra a recuperação das fontes pontuais nas primeiras iterações e o dilema da semi-convergência, onde iterações excessivas provocam amplificação de ruído pontual granular.
6. **Demonstração D — Entropia de Shannon (Slide 13):** Calculadora de histograma de 256 níveis e cálculo exato de $H(X) = -\sum p_i \log_2 p_i$ em tempo real. Comprova visualmente que ruído uniforme possui entropia máxima (8.0 bits), desmistificando o mito de que maior entropia significa melhor qualidade de imagem.
7. **Demonstração D (Parte 2) — Máxima Entropia MEM (Slide 15):** Deconvolução com regularização de entropia espacial relativa baseada em Gull & Daniell (Nature, 1978), evidenciando a supressão natural dos anéis de Gibbs e a preservação do fundo uniforme.
8. **Demonstração E — Variação Total ROF (Slide 18):** Controle do peso $\lambda$ na regularização L1 da magnitude do gradiente. Mostra a preservação de bordas descontínuas e o surgimento do efeito de degraus (*staircasing*) sobre gradientes suaves.
9. **Bancada Comparativa Central (Slide 23):** Laboratório comparativo que submete a **mesmíssima imagem de teste degradada** aos quatro métodos em abas selecionáveis, traçando simultaneamente o corte horizontal 1D de intensidade e exibindo as características distintivas de cada algoritmo.

---

## 7. Limitações das Simulações e Rigor Científico

Para viabilizar a execução fluida em tempo real em qualquer dispositivo móvel ou computador sem GPU dedicada, o projeto adota parâmetros de simulação controlados:
- **Resolução de Teste:** As simulações utilizam grade $64 \times 64$, que oferece equilíbrio perfeito entre visualização nítida de estruturas e cálculo matricial instantâneo em JavaScript.
- **Invariância Espacial da PSF:** Modela-se a PSF como invariante no espaço (LSI), assumindo lentes paraxiais ideais. Em câmeras reais de grande campo angular, a PSF varia com a distância focal e a posição radial no sensor.
- **Aproximação de Parâmetros:** Na deconvolução de Wiener, utiliza-se a aproximação clássica por escalar constante $K \approx S_n / S_x$, padrão didático amplamente documentado por Gonzalez & Woods.
- **Diferenciação de Resultados:** Todos os resultados exibidos na aplicação são identificados claramente como computados em tempo real a partir de modelos físicos ou sintetizados como padrões de teste acadêmicos, sem invenção de dados experimentais.

---

## 8. Principais Referências Acadêmicas

- **Gonzalez, R. C., & Woods, R. E. (2018).** *Digital Image Processing* (4th ed.). Pearson.
- **Wiener, N. (1949).** *Extrapolation, Interpolation, and Smoothing of Stationary Time Series*. MIT Press.
- **Richardson, W. H. (1972).** Bayesian-Based Iterative Method of Image Restoration. *J. Opt. Soc. Am.*, 62(1), 55–59.
- **Lucy, L. B. (1974).** An iterative technique for the rectification of observed distributions. *Astron. J.*, 79(6), 745–754.
- **Gull, S. F., & Daniell, G. J. (1978).** Image reconstruction from incomplete and noisy data. *Nature*, 272, 686–690.
- **Rudin, L. I., Osher, S., & Fatemi, E. (1992).** Nonlinear total variation based noise removal algorithms. *Physica D*, 60, 259–268.
- **Chambolle, A. (2004).** An Algorithm for Total Variation Minimization and Applications. *J. Math. Imaging Vis.*, 20, 89–97.
- **Bertero, M., & Boccacci, P. (1998).** *Introduction to Inverse Problems in Imaging*. CRC Press.

*(A lista completa comentada encontra-se em `docs/referencias.md`)*.
