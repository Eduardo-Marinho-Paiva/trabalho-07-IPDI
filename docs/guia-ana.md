# Guia Individual do Apresentador — Ana Beatriz

**Bloco:** Introdução, Degradação Óptica, Modelo Matemático e Problema Inverso  
**Slides:** 1 a 6  
**Tempo Sugerido:** 5 a 6 minutos  

---

## 1. Tese da Sua Parte (Leia com Firmeza no Slide 1 e 2)

> *"Restauração de imagens não é embelezamento ou realce subjetivo: é a tentativa fundamentada na física de inverter o processo de degradação introduzido pela ótica e pelos sensores. Como a ótica atenua irreversivelmente altas frequências e o sensor adiciona ruído, a inversão direta pura é um problema inverso mal-posto que explode numericamente. Nosso desafio é encontrar formulações que recuperem a cena de forma estável."*

---

## 2. Roteiro Slide a Slide e Explicações Técnicas

### Slide 1 — Capa do Seminário
- **Objetivo:** Abrir a apresentação com postura acadêmica e introduzir a identidade visual interativa.
- **Como Explicar o Canvas da Capa:**
  - Aponte para o canvas à direita.
  - Explique que o sistema roda um ciclo contínuo em 4 fases: (1) Cena sintética nítida de teste; (2) Simulação da passagem pela lente com difração e adição de ruído; (3) Imagem degradada observada; (4) Estimativa restaurada por deconvolução.
- **Roteiro de Fala Sugerido:**
  > *"Bom dia a todos, professor e colegas. Hoje nosso grupo apresentará o seminário sobre Deconvolução e Restauração de Imagens na disciplina de Processamento Digital de Imagens. O que vocês observam aqui no painel direito é uma demonstração em tempo real do nosso desafio: a luz que sai de um objeto do mundo real sofre desfoque pelo sistema óptico, recebe contaminação por ruído e chega ao computador como uma imagem imperfeita. Nosso objetivo ao longo dos próximos 25 slides é desvendar a matemática e os algoritmos capazes de reverter essa degradação."*

---

### Slide 2 — O Problema da Restauração
- **Objetivo:** Estabelecer a trindade visual (Referência, Degradada, Restaurada) e delimitar a fronteira teórica entre *Restauração* e *Realce*.
- **Conceitos Essenciais:**
  - **Imagem de Referência (Ground Truth):** Em laboratório ou simulações, conhecemos x. Na vida real (uma foto tirada pelo telescópio James Webb ou um exame médico), x **nunca está disponível**.
  - **Diferença entre Restauração e Realce:**
    - *Realce (Enhancement):* Processo heurístico, estético e subjetivo voltado à percepção humana (ex.: equalização de histograma, filtros passa-alta não modelados).
    - *Restauração (Restoration):* Processo objetivo fundamentado em um modelo físico explícito de degradação e num critério matemático de otimização.
- **Roteiro de Fala Sugerido:**
  > *"Neste slide 2 vemos os três estados fundamentais. À esquerda, a imagem original ideal. É importante destacar: em uma aplicação real da medicina ou da indústria, nós NÃO temos acesso à imagem de referência — se tivéssemos, não precisaríamos de restauração! O que o computador recebe é o quadro central: bordas espalhadas, contraste atenuado e grânulos de ruído. À direita, a nossa meta: produzir uma estimativa matemática que se aproxime da verdade física. Ao contrário do realce, que busca apenas agradar ao olho humano sem compromisso físico, a restauração é uma tentativa rigorosa de modelar o que a lente e o sensor fizeram com a luz."*

---

### Slide 3 — Como uma Imagem é Degradada? (Demonstração A)
- **Objetivo:** Explicar o pipeline de degradação e manipular ao vivo os controles interativos da Demonstração A.
- **Conceitos Matemáticos:**
  - **PSF (Point Spread Function - Função de Espalhamento Pontual):** Resposta impulsiva bidimensional do sistema óptico. Se você colocar um ponto luminoso infinitesimal no escuro, a imagem formada na câmera não será um ponto, mas uma mancha difusa h(x,y).
  - **Tipos de PSF:**
    - *Gaussiana:* Modela desfoque térmico, astigmatismo leve e difração em lentes circulares.
    - *Movimento Linear (Motion Blur):* Modela o deslocamento relativo entre a câmera e a cena durante o tempo de exposição (shutter speed).
- **Como Conduzir a Demonstração Interativa:**
  1. No seletor, mantenha "Desfoque Gaussiano".
  2. Mova o slider de Raio (σ) de 0.5 para 3.5: mostre no canvas 2 a PSF se alargando e, no canvas 3, os círculos e barras se fundindo.
  3. Mova o slider de Ruído para 8%: mostre que o fundo escuro passa a ter pontilhados aleatórios e aponte para o corte 1D (canvas 4), mostrando as oscilações ruidosas.
  4. Mude o seletor para "Movimento Linear": aponte que a PSF agora é um traço inclinado a 45° e o desfoque torna-se unidirecional!
- **Roteiro de Fala Sugerido:**
  > *"Vejam como o fenômeno ocorre fisicamente. A luz que atinge a lente sofre espalhamento caracterizado pela PSF. Aqui no nosso simulador, quando aumento o desvio padrão da PSF gaussiana, observamos que detalhes finos desaparecem. Ao injetar ruído gaussiano simulando o ruído térmico do sensor CMOS, as pequenas variações de intensidade são mascaradas. Vejam no perfil 1D: a transição limpa da borda transforma-se em uma rampa inclinada com flutuações estocásticas."*

---

### Slide 4 — Modelo Matemático
- **Objetivo:** Formalizar as equações $y = h * x + n$ e $y = Hx + n$.
- **Conceitos e Fórmulas:**
  - **Forma Convolucional:** $y(s,t) = \iint h(s-\alpha, t-\beta) x(\alpha,\beta) d\alpha d\beta + n(s,t)$.
    - Assume-se que o sistema é Linear e Espacialmente Invariante (LSI).
  - **Forma Matricial:** $y = Hx + n$.
    - Se a imagem tem dimensão $N \times N$, $x$ e $y$ são vetores de dimensão $N^2 \times 1$ ordenados lexicograficamente.
    - $H$ é uma matriz gigante de dimensão $N^2 \times N^2$, com estrutura Block-Toeplitz ou Block-Circulante (sob condições periódicas de contorno).
    - Propriedade áurea: matrizes circulantes são diagonalizadas pela matriz de Fourier 2D!
- **Roteiro de Fala Sugerido:**
  > *"Matematicamente, modelamos essa física por meio da equação y = Hx + n. No caso contínuo, trata-se de uma convolução bidimensional entre a imagem verdadeira x e a função de espalhamento pontual h, acrescida do ruído aditivo n. Quando discretizamos a imagem para uma matriz de pixels, podemos reescrever essa convolução na forma matricial y = Hx + n. A matriz H possui estrutura de blocos circulantes, o que significa que o cálculo pode ser acelerado enormemente no domínio da frequência."*

---

### Slide 5 — Por que a Inversão Direta Falha?
- **Objetivo:** Explicar a instabilidade do filtro inverso ingênuo e conduzir a demonstração de explosão de ruído.
- **Conceitos e Fórmulas:**
  - **Pelo Teorema da Convolução:** $Y(u,v) = H(u,v) \cdot X(u,v) + N(u,v)$.
  - **Tentativa de Inversão Ingênua:** $\hat{X}(u,v) = \frac{Y(u,v)}{H(u,v)} = X(u,v) + \frac{N(u,v)}{H(u,v)}$.
  - **OTF (Optical Transfer Function):** $H(u,v)$ tende a zero nas frequências médias e altas.
  - Quando $H(u,v) \to 0$, o termo de ruído $\frac{N(u,v)}{H(u,v)}$ diverge violentamente para o infinito!
  - **Problema Mal-Posto no Sentido de Hadamard:** O problema não possui dependência contínua dos dados: uma variação infinitesimal de 0.001 no ruído de entrada causa erro de magnitude ilimitada na estimativa.
- **Como Explicar o Canvas do Slide 5:**
  - Aponte para a imagem da esquerda: ela parece perfeitamente nítida, com apenas 0.8% de ruído quase invisível.
  - Aponte para a imagem da direita: a divisão pura por $H(u,v)$ gerou uma nuvem caótica sem nenhum sentido.
  - Aponte para o perfil 1D: oscilações descontroladas que cobrem toda a escala.
- **Roteiro de Fala Sugerido:**
  > *"A primeira ideia intuitiva de qualquer estudante seria: se no domínio de Fourier a convolução vira multiplicação, basta dividir Y por H! Esse é o Filtro Inverso Ingênuo. Mas olhem o que acontece na nossa demonstração ao vivo: com um ruído mínimo de menos de 1%, a imagem resultante vira puro estático caótico. Por que isso acontece? Porque a função de transferência H(u,v) cai para zero nas frequências altas. Dividir o ruído de alta frequência por números da ordem de 10⁻⁴ ou 10⁻⁶ multiplica o ruído por milhares de vezes. Esse é o clássico problema mal-posto de Hadamard: pequenas perturbações no dado provocam explosão catastrófica da resposta."*

---

### Slide 6 — Visão Geral dos Quatro Métodos e Transição
- **Objetivo:** Apresentar a taxonomia dos métodos e passar a palavra com precisão para Cindy Vitoria.
- **Roteiro de Fala Sugerido:**
  > *"Como a inversão direta é inviável, a comunidade de Ciência da Computação e Engenharia desenvolveu quatro grandes formulações para contornar o problema: o filtro estatístico de Wiener, a atualização iterativa de Richardson-Lucy, a regularização por Entropia e a Variação Total espacial. Para explicar como a estatística clássica permite encontrar uma solução ótima no domínio de Fourier, passo a palavra agora para a Cindy Vitoria."*

---

## 3. Perguntas Prováveis do Professor e Respostas Sugeridas

1. **Pergunta:** *"Por que a convolução espacial assume invariância no espaço, e quando isso falha na prática?"*  
   - **Resposta:** *"Assumimos invariância espacial (LSI) porque isso simplifica o modelo matemático para uma convolução tradicional, permitindo o uso da FFT com complexidade O(N log N). Na prática, essa hipótese falha quando usamos lentes com distorção geométrica periférica intensa (como lentes olho-de-peixe), quando há movimento de rotação da câmera (onde as bordas se movem mais rápido que o centro) ou em meios com turbulência atmosférica heterogênea."*

2. **Pergunta:** *"O que diferencia formalmente o critério de Hadamard para um problema bem-posto de um mal-posto?"*  
   - **Resposta:** *"Segundo Jacques Hadamard (1902), um problema é bem-posto se a solução existe, é única e depende continuamente dos dados de entrada. Na deconvolução, a terceira condição é violada: pequenas flutuações de ruído no dado y são amplificadas arbitrariamente na solução x̂ devido aos valores quase nulos dos autovalores do operador H."*

3. **Pergunta:** *"O que aconteceria se aplicássemos o filtro inverso ingênuo em uma imagem com absolutamente zero ruído (n = 0)?"*  
   - **Resposta:** *"Em aritmética analítica perfeita, recuperaríamos x exatamente onde H(u,v) ≠ 0. Contudo, em computadores digitais com aritmética de ponto flutuante IEEE 754, o erro de arredondamento e a precisão finita da máquina atuam como ruído numérico, e a divisão por números da ordem de 10⁻¹⁶ ainda provocaria instabilidade severa."*

---

## 4. Erros Conceituais a Evitar

- **NUNCA diga** que a deconvolução recupera 100% da imagem original como se nada tivesse acontecido. Explique que frequências onde $H(u,v) = 0$ perderam informação de forma irreversível.
- **NUNCA confunda** restauração com realce. Realce melhora a aparência visual subjetiva; restauração tenta aproximar a imagem da verdade física através de um modelo da degradação.
- **NÃO chame** a PSF de "filtro blur qualquer". A PSF é a resposta impulsiva física do sistema óptico.
