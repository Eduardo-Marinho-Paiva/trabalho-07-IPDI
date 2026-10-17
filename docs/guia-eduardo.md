# Guia Individual do Apresentador — Eduardo Marinho

**Bloco:** Deconvolução de Richardson–Lucy (Iterativo Probabilístico)  
**Slides:** 10 a 12  
**Tempo Sugerido:** 4 a 5 minutos  

---

## 1. Tese da Sua Parte (Leia com Firmeza no Início do Slide 10)

> *"A deconvolução de Wiener resolve o problema invertendo frequências de uma só vez sob suposição gaussiana. Richardson–Lucy muda completamente o jogo: trata a luz como pacotes discretos de fótons regidos pela estatística de Poisson. Em vez de uma fórmula direta, utiliza um processo iterativo multiplicativo de Expectation-Maximization que garante positividade absoluta e conservação de energia, permitindo uma super-resolução espetacular de fontes pontuais, mas exigindo um critério rigoroso de parada para conter a amplificação de ruído."*

---

## 2. Roteiro Slide a Slide e Explicações Técnicas

### Slide 10 — Richardson–Lucy: O Modelo Probabilístico
- **Objetivo:** Apresentar a origem histórica e a derivação por Máxima Verossimilhança de Poisson.
- **Histórico e Fundamentação:**
  - Descoberto independentemente por **William H. Richardson (1972)** (estudo óptico na Universidade da Califórnia) e **Leon B. Lucy (1974)** (astrônomo trabalhando com espectros de galáxias).
  - Mais tarde, Shepp & Vardi (1982) provaram formalmente que o algoritmo é uma aplicação exata do método **Expectation-Maximization (EM)** para emissão de Poisson.
  - **Distribuição de Poisson:**
    Em sensores científicos (CCD/CMOS de telescópios ou microscópios de fluorescência), o número de elétrons gerados por pixel é proporcional à contagem de fótons incidentes. A probabilidade de observar $y_i$ fótons quando a média esperada é $\mu_i = (h * x)_i$ é:
    $P(y_i | x) = \frac{\mu_i^{y_i} \cdot e^{-\mu_i}}{y_i !}$
  - Ao maximizar a log-verossimilhança $\ln L(x) = \sum [ y_i \ln(h * x)_i - (h * x)_i ]$, a condição de ponto estacionário $\nabla \ln L(x) = 0$ resulta na regra iterativa de Richardson-Lucy!
- **Roteiro de Fala Sugerido:**
  > *"Obrigado, Cindy. A Cindy mostrou que o filtro de Wiener sofre com valores negativos espúrios e anéis de Gibbs. O método de Richardson-Lucy surge exatamente para superar isso. Em astronomia e microscopia biológica, a luz é contada fóton por fóton, o que obedece à distribuição de Poisson. William Richardson e Leon Lucy formularam o problema não por erro quadrático, mas por Máxima Verossimilhança. A estimativa atual gera uma imagem borrada prevista; comparamos essa previsão com a imagem real através de uma divisão pixel a pixel; e o fator de correção é retroprojetado pela PSF adjunta para atualizar multiplicativamente a estimativa."*

---

### Slide 11 — Como as Iterações Funcionam? (Demonstração C)
- **Objetivo:** Demonstrar o ciclo algorítmico, o dilema da semi-convergência e manipular a Demonstração C.
- **As 4 Etapas de Cada Iteração:**
  1. **Projeção Direta:** $\text{reblur} = h * \hat{x}^{(k)}$ (simula como a estimativa atual seria vista através da lente).
  2. **Comparação por Razão:** $\text{ratio} = \frac{y}{\text{reblur} + \epsilon}$ (se for > 1, a estimativa subestimou a luz; se < 1, superestimou).
  3. **Retroprojeção pela PSF Adjunta:** $\text{correction} = h^* * \text{ratio}$ (redistribui o erro pelo formato invertido da PSF).
  4. **Atualização Multiplicativa:** $\hat{x}^{(k+1)} = \hat{x}^{(k)} \cdot \text{correction}$.
- **Propriedades Notáveis:**
  - **Positividade Estrita:** Como todos os termos da multiplicação são positivos, $\hat{x}^{(k)}$ **nunca** se torna negativo.
  - **Conservação Estrita de Fluxo:** A soma de intensidades de todos os pixels da imagem permanece perfeitamente constante ao longo de todas as iterações ($\sum \hat{x}^{(k+1)} = \sum y$).
- **O Fenômeno da Semi-Convergência:**
  - Richardson-Lucy **não** possui um regularizador embutido.
  - O erro em relação à verdade terrestre (Ground Truth) tem formato de curva em U: ele cai até atingir um ponto ideal (ex.: $k \approx 15$) e depois **começa a subir**, porque o algoritmo começa a ajustar os fótons de ruído individualmente!
- **Como Conduzir a Demonstração Interativa C:**
  1. Clique em **"k = 1"**: aponte que a imagem quase não mudou; ainda está borrada.
  2. Clique em **"k = 15 (Ótimo)"**: aponte que as fontes pontuais (estrelas) se contraíram em pontos ultra-nítidos e as bordas ficaram verticais no corte 1D.
  3. Clique em **"k = 60 (Ruído)"**: mostre que o fundo escuro e as áreas planas começaram a se fragmentar em pontinhos granulares (ruído amplificado).
  4. Clique em **"▶ Reproduzir Evolução"**: deixe a turma assistir à transição gradual de $k=1$ até $k=60$, narrando a evolução em tempo real.
- **Roteiro de Fala Sugerido:**
  > *"Vamos observar isso ao vivo no nosso simulador no slide 11. Com k=1, a imagem ainda está muito borrada. Quando coloco em 15 iterações, vejam que resultado fantástico: as estrelas astronômicas no canto superior e os discos contraem-se para sua dimensão real, sem nenhum anelamento de Gibbs no fundo! Mas atenção para a armadilha clássica: muitos alunos acreditam que quanto mais iterações rodarmos, melhor fica. Vou colocar em 60 iterações. Olhem o que aconteceu no fundo e no perfil 1D: surgiram grumos e pontuações espúrias. Isso é a semi-convergência. O algoritmo é tão bom em achar fontes pontuais que ele começa a tratar cada flutuação de ruído como se fosse uma estrela minúscula."*

---

### Slide 12 — Vantagens, Limitações e Transição
- **Objetivo:** Consolidar as características práticas, citar o caso histórico do Telescópio Espacial Hubble e passar a palavra para Luis Jeronimo.
- **O Caso Histórico do Hubble (1990):**
  - Quando o Hubble foi lançado em 1990 com aberração esférica em seu espelho primário de 2.4 metros, a NASA usou Richardson-Lucy para recuperar imagens estelares nítidas até a instalação ótica corretiva COSTAR em 1993!
- **Roteiro de Fala Sugerido:**
  > *"Em síntese: Richardson-Lucy é o padrão absoluto em astronomia e microscopia biológica porque respeita a física de fótons e garante não-negatividade. Mas ele exige um critério de parada heurístico cuidadoso. Se você não souber a hora exata de parar, a imagem é arruinada pela amplificação de ruído. Como poderíamos impor um critério matemático formal que impeça a imagem de criar esses grânulos sem precisar adivinhar o número de iterações? O Luis Jeronimo vai nos mostrar agora como a Teoria da Informação e a Entropia resolvem essa questão."*

---

## 3. Perguntas Prováveis do Professor e Respostas Sugeridas

1. **Pergunta:** *"Por que Richardson-Lucy preserva estritamente a energia total (fluxo) da imagem?"*  
   - **Resposta:** *"A conservação de energia decorre da normalização da PSF ($\sum h = 1$) e das propriedades do algoritmo EM. Se somarmos todos os pixels da equação de atualização, temos $\sum \hat{x}^{(k+1)} = \sum \hat{x}^{(k)} [ h^* * (y / (h * \hat{x}^{(k)})) ]$. Como a PSF preserva a soma sob convolução adjunta, a soma da imagem estimada permanece invariante e igual à soma dos fótons observados $\sum y$."*

2. **Pergunta:** *"Quais critérios matemáticos de parada são utilizados na prática para interromper o Richardson-Lucy?"*  
   - **Resposta:** *"O critério mais rigoroso é o Princípio da Discrepância de Morozov, que interrompe as iterações quando o resíduo $\|h * \hat{x}^{(k)} - y\|^2$ se iguala à variância esperada do ruído do sensor. Outra abordagem comum é a Validação Cruzada Generalizada (GCV) ou adicionar termos de regularização total (Richardson-Lucy Total Variation)."*

3. **Pergunta:** *"Qual é a complexidade computacional por iteração de Richardson-Lucy?"*  
   - **Resposta:** *"Cada iteração requer 2 convoluções bidimensionais completas: uma direta para projetar $h * \hat{x}$ e uma retroprojetada para convoluir com $h^*$. Se implementadas no domínio espacial com kernel $M \times M$, o custo é $O(N^2 M^2)$. Se implementadas via FFT 2D, o custo por iteração é $O(N^2 \log N)$."*

---

## 4. Erros Conceituais a Evitar

- **NUNCA diga** que mais iterações sempre significam melhor resultado. Richardson-Lucy não converge para a imagem limpa, converge para o estimador irrestrito de máxima verossimilhança ruidoso.
- **NÃO confunda** o modelo de ruído: Wiener assume ruído gaussiano aditivo; Richardson-Lucy assume ruído de contagem de Poisson.
- **NUNCA diga** que Richardson-Lucy gera anéis de Gibbs. Os anéis são típicos de truncamento espectral de Fourier (Wiener), enquanto R-L gera ruído pontual granular.
