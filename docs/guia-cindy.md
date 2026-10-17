# Guia Individual da Apresentadora — Cindy Vitoria

**Bloco:** Deconvolução de Wiener (Filtragem Estatística MMSE)  
**Slides:** 7 a 9  
**Tempo Sugerido:** 4 a 5 minutos  

---

## 1. Tese da Sua Parte (Leia com Firmeza no Início do Slide 7)

> *"Como a inversão direta pura explode o ruído nas altas frequências, o filtro de Wiener formula a restauração como um problema estatístico de otimização: qual operador linear minimiza o Erro Quadrático Médio entre a imagem verdadeira e a imagem estimada? O resultado é uma fórmula elegante no domínio de Fourier que atenua automaticamente as frequências onde o ruído domina o sinal."*

---

## 2. Roteiro Slide a Slide e Explicações Técnicas

### Slide 7 — Deconvolução de Wiener: Fundamentos
- **Objetivo:** Estabelecer a fundamentação estatística de Norbert Wiener (1949) e Helstrom (1967).
- **Conceitos Essenciais:**
  - **Critério MMSE (Minimum Mean Square Error):**
    $e^2 = E\{ [x(i,j) - \hat{x}(i,j)]^2 \}$
    onde $E\{\cdot\}$ representa o operador de esperança matemática estatística sobre a distribuição de possíveis imagens e ruídos.
  - **Hipóteses Adotadas:**
    1. A imagem ideal $x$ e o ruído $n$ são processos estocásticos estacionários de média zero (ou média subtraída).
    2. O sinal $x$ e o ruído $n$ são estatisticamente descorrelacionados ($E\{x \cdot n\} = 0$).
  - **Por que no Domínio da Frequência?**
    Sob condições de fronteira periódicas, matrizes circulantes tornam-se diagonais na base de Fourier. Isso desacopla as equações matriciais gigantes $N^2 \times N^2$ em $N^2$ equações escalares independentes para cada par de frequências $(u, v)$!
- **Roteiro de Fala Sugerido:**
  > *"Obrigada, Ana. Como a Ana acabou de demonstrar, tentar forçar a reconstrução cega de frequências altas onde a lente bloqueou a luz é suicídio numérico. O matemático Norbert Wiener propôs uma abordagem probabilística: em vez de exigir que o erro seja zero em todas as frequências, buscamos um filtro W que minimize o Erro Quadrático Médio estatístico. No domínio da frequência, o problema se desacopla: para cada frequência (u,v), o filtro calcula exatamente quanto sinal há em relação ao ruído. Se o sinal for forte, o filtro age como inversor; se o ruído predominar, o filtro atenua a frequência a quase zero."*

---

### Slide 8 — Como o Wiener Funciona? (Demonstração B)
- **Objetivo:** Explicar a equação analítica, a aproximação pelo parâmetro $K$ e operar a Demonstração B ao vivo.
- **Conceitos e Fórmulas:**
  - **Fórmula Geral:**
    $W(u, v) = \frac{H^*(u, v)}{|H(u, v)|^2 + \frac{S_n(u,v)}{S_x(u,v)}}$
    - $H(u, v)$: Função de Transferência Óptica (OTF, FFT da PSF).
    - $H^*(u, v)$: Complexo conjugado de $H$ (faz a correção de fase da PSF).
    - $|H(u, v)|^2 = H(u,v) \cdot H^*(u,v)$: Ganho de potência do sistema óptico.
    - $S_n(u, v)$: Densidade Espectral de Potência do Ruído.
    - $S_x(u, v)$: Densidade Espectral de Potência do Sinal original.
  - **Aproximação Paramétrica por Constante K:**
    Como as densidades espectrais exatas raramente são conhecidas em exames práticos, aproxima-se a razão por um número escalar constante $K \approx \frac{1}{\text{SNR}}$:
    $W(u, v) \approx \frac{H^*(u, v)}{|H(u, v)|^2 + K}$
- **Como Conduzir a Demonstração Interativa B:**
  1. Mostre os botões de pré-configuração:
     - Clique em **"K Muito Baixo"** (log K = -4.5): Aponte que a imagem restaurada fica cheia de pontinhos e o perfil 1D oscila loucamente (comportando-se como o filtro inverso que Ana mostrou).
     - Clique em **"K Muito Alto"** (log K = -0.7): Aponte que a imagem fica suave, sem ruído, mas as bordas continuam borradas (sub-restauração).
     - Clique em **"K Equilibrado"** (log K = -2.3, K = 0.005): Aponte a recuperação das estrelas e do círculo, com ruído contido.
  2. Aponte para o canvas 2: **"Espectro do Filtro |W(u,v)|"**:
     - Explique que o centro é a frequência zero (DC) e as bordas são as altas frequências.
     - Note que o filtro possui ganho alto nas frequências intermediárias e é suavemente atenuado nas bordas para não amplificar o ruído!
  3. Aponte para o canvas 4: **"Perfil 1D"**:
     - Mostre as ondulações logo após a borda do degrau: são os **anéis de Gibbs (ringing)**!
- **Roteiro de Fala Sugerido:**
  > *"Vamos observar a fórmula e a demonstração interativa. Notem que no denominador somamos a constante K ao quadrado da magnitude da OTF. Essa constante é o fator de amortecimento: quando |H| se aproxima de zero, o denominador não zera, mas fica limitado por K! Na demonstração, ao mover o slider: se escolho K muito pequeno (como 10⁻⁵), o amortecimento é nulo e o ruído ressurge agressivo. Se escolho K excessivamente grande (como 0.1), o filtro tem medo do ruído e prefere deixar a imagem borrada. No ponto equilibrado, recuperamos detalhes finos. Mas observem com atenção o gráfico do corte 1D: ao lado da descida abrupta do degrau, surgem pequenas ondulações. Esse é o célebre efeito de anelamento de Gibbs."*

---

### Slide 9 — Vantagens, Limitações e Transição
- **Objetivo:** Avaliar criticamente os prós e contras do método de Wiener e fazer a transição para Eduardo Marinho.
- **Conceitos Essenciais:**
  - **Anelamento de Gibbs (Ringing):** Ocorre porque o filtro de Wiener corta de forma suave, mas acentuada, frequências além da banda passante. Pelo princípio da transformada de Fourier, multiplicação por uma função de corte no domínio espectral equivale a convolução com uma função tipo $\text{sinc}$ no domínio espacial, que tem lóbulos oscilatórios!
  - **Valores Negativos Espúrios:** O filtro não tem mecanismo para forçar $\hat{x} \ge 0$. Em regiões escuras ao lado de fontes brilhantes, os lóbulos negativos do ringing produzem pixels com intensidade negativa, fisicamente impossíveis.
- **Roteiro de Fala Sugerido:**
  > *"Concluindo o bloco de Wiener: a grande vantagem é a velocidade vertiginosa. Em uma única passagem de FFT bidimensional, calculamos a restauração em milissegundos. Por isso ele é utilizado em radares, streams de vídeo e satélites. Contudo, suas limitações são severas: ele gera anéis de Gibbs ao redor de contrastes e não respeita a física da não-negatividade da luz, podendo gerar intensidades negativas. O Eduardo Marinho vai nos apresentar agora um algoritmo que resolve exatamente essas duas falhas através de um modelo probabilístico iterativo."*

---

## 3. Perguntas Prováveis do Professor e Respostas Sugeridas

1. **Pergunta:** *"Por que o filtro de Wiener se reduz ao filtro inverso quando não há ruído (Sn = 0)?"*  
   - **Resposta:** *"Quando não há ruído, Sn(u,v) = 0. A fórmula fica W = H* / |H|² = H* / (H · H*) = 1 / H. Ou seja, na ausência de ruído estocástico, a estimativa de erro quadrático mínimo converge exatamente para a inversão analítica pura."*

2. **Pergunta:** *"O que causa os anéis de Gibbs e como poderíamos atenuá-los no domínio de Fourier?"*  
   - **Resposta:** *"O efeito de Gibbs surge devido à descontinuidade ou queda abrupta na resposta em frequência do filtro restaurador. Para atenuar o ringing em Wiener, costuma-se aplicar janelas de apodização (como janelas de Hanning ou Tukey) nas bordas do espectro ou utilizar filtros de Wiener restritos com termos de suavidade adicional (como o operador Laplaciano ponderado)."*

3. **Pergunta:** *"Como se estima a razão Sn/Sx em uma aplicação prática onde não conhecemos a imagem original?"*  
   - **Resposta:** *"Costuma-se medir a variância do ruído Sn em uma região homogênea e sem texturas da própria imagem (como uma área de céu ou fundo preto). Para Sx, utiliza-se modelos paramétricos da densidade espectral de imagens naturais, que historicamente seguem uma lei de potência empírica do tipo 1/f^α, onde α varia entre 1.5 e 2.0."*

---

## 4. Erros Conceituais a Evitar

- **NUNCA diga** que o filtro de Wiener é um método iterativo. O filtro de Wiener é **estritamente analítico e em forma fechada** (one-shot).
- **NÃO confunda** o parâmetro $K$ com o ganho do filtro. $K$ está no denominador somado a $|H|^2$, funcionando como uma regularização de Tikhonov espectral.
- **EVITE dizer** que $K$ deve ser zero para ter "a melhor restauração". K = 0 é a inversão direta pura e produz ruído infinito.
