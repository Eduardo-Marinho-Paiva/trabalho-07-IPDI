# Guia Geral do Seminário 7: Deconvolução e Restauração de Imagens

**Disciplina:** Processamento Digital de Imagens (PDI)  
**Curso:** Ciência da Computação  
**Tema:** Problema de Deconvolução e Restauração de Imagens  
**Integrantes (Ordem Alfabética):**
1. Ana Beatriz
2. Cindy Vitoria
3. Eduardo Marinho
4. Luis Jeronimo
5. Paulo Sérgio

---

## 1. Tese Central do Seminário (Leitura na Abertura)

> *"Em muitas áreas da ciência e da engenharia, recebemos imagens degradadas por limitações físicas de lentes e sensores. Nosso objetivo é recuperar a imagem original. Entretanto, diferentes imagens originais podem produzir observações idênticas após a degradação, e a presença inevitável de ruído torna a inversão matemática direta impossível. A restauração de imagens é a arte e a ciência de incorporar hipóteses físicas e estatísticas para tornar esse problema inverso estável e calculável."*

---

## 2. A Pergunta-Condutora da Apresentação

> **"Diante de uma imagem borrada e corrompida por ruído, qual hipótese sobre a cena nos permite recuperar a informação perdida sem gerar artefatos espúrios?"**

Cada um dos quatro métodos obrigatórios responde a essa pergunta com um paradigma diferente:

| Método | Apresentador(a) | Hipótese Central adotada sobre a Imagem | Frase-Chave |
|---|---|---|---|
| **Wiener** | Cindy Vitoria | *"Sinal e ruído são processos estocásticos estacionários conhecidos."* | "Compromisso ótimo entre inversão e ruído no domínio Fourier." |
| **Richardson–Lucy** | Eduardo Marinho | *"A aquisição é um processo de contagem de fótons de Poisson."* | "Atualização multiplicativa iterativa com conservação de fluxo." |
| **Entropia (MEM)** | Luis Jeronimo | *"A melhor solução é a mais uniforme e compatível com as medições."* | "Princípio da Máxima Entropia elimina anéis de ringing." |
| **Variação Total (ROF)** | Paulo Sérgio | *"A cena é composta por regiões homogêneas com bordas limpas."* | "Regularização L1 da norma do gradiente preserva descontinuidades." |

---

## 3. Mapa Completo dos 25 Slides e Responsabilidades

| Slide | Título / Assunto | Responsável | Objetivo Didático | Mensagem Principal |
|---|---|---|---|---|
| **1** | Capa e Teaser Interativo | Grupo (Abertura Ana) | Apresentar o tema e a equipe com animação ao vivo | "Da luz à degradação: restaurar é modelar a física." |
| **2** | O Problema da Restauração | Ana Beatriz | Contrastar referência, degradada e restaurada | "Restauração é objetiva; realce é subjetivo." |
| **3** | Como uma Imagem é Degradada? | Ana Beatriz | Explicar o pipeline óptico e a Demonstração A | "A luz convolui com a PSF antes de somar o ruído." |
| **4** | Modelo Matemático (y = Hx + n) | Ana Beatriz | Formalizar o modelo discreto e convolucional | "A matriz H é Block-Toeplitz diagonalizável por Fourier." |
| **5** | Por que a Inversão Direta Falha? | Ana Beatriz | Demonstrar a explosão de ruído no filtro inverso | "Divisão por quase zero na OTF destrói a imagem." |
| **6** | Visão Geral dos 4 Métodos | Ana Beatriz (Transição) | Introduzir os 4 blocos conceituais do seminário | "Quatro hipóteses matemáticas para o mesmo problema inverso." |
| **7** | Deconvolução de Wiener | Cindy Vitoria | Fundamentar a filtragem MMSE no domínio da frequência | "Minimizar o erro quadrático ponderando as densidades espectrais." |
| **8** | Como o Wiener Funciona? | Cindy Vitoria | Explicar a fórmula, o fator K e a Demonstração B | "K alto borra; K baixo explode o ruído." |
| **9** | Wiener: Vantagens e Limitações | Cindy Vitoria | Analisar o anelamento de Gibbs e valores negativos | "Extrema rapidez O(N log N), mas propensa a ringing." |
| **10** | Deconvolução de Richardson–Lucy | Eduardo Marinho | Introduzir o modelo de contagem de fótons de Poisson | "Abordagem iterativa Bayesiana de máxima verossimilhança." |
| **11** | Como as Iterações Funcionam? | Eduardo Marinho | Explicar a semi-convergência e a Demonstração C | "Mais iterações nem sempre é melhor: surge ruído granular." |
| **12** | Richardson–Lucy: Prós e Contras | Eduardo Marinho | Destacar positividade estrita e uso em astronomia | "Super-resolução pontual com parada heurística necessária." |
| **13** | O que é Entropia em Imagens? | Luis Jeronimo | Desmistificar a entropia de Shannon e a Demonstração D | "Ruído tem entropia máxima: mais entropia ≠ melhor imagem." |
| **14** | Deconvolução por Entropia (MEM) | Luis Jeronimo | Apresentar Gull & Daniell (Nature 1978) e a entropia espacial | "Máxima Entropia como regularizador sem viés preconceituoso." |
| **15** | Entropia: Prós e Contras | Luis Jeronimo | Discutir a supressão de ringing e o teste interativo | "Excelente fundo suave, mas sensível ao peso alpha." |
| **16** | O que é Variação Total (ROF)? | Paulo Sérgio | Apresentar Rudin-Osher-Fatemi (1992) e a norma L1 | "A norma L1 não penaliza a altura de um degrau nítido." |
| **17** | Restauração com Regularização TV | Paulo Sérgio | Formalizar o problema de otimização variacional | "Difusão anisotrópica: suaviza na borda, bloqueia através dela." |
| **18** | Efeito do Parâmetro λ | Paulo Sérgio | Demonstrar o staircasing na Demonstração E | "λ alto transforma rampas suaves em degraus de cartoon." |
| **19** | TV: Vantagens e Limitações | Paulo Sérgio | Resumir prós/contras e citar TGV moderna | "Bordas perfeitas sem ringing, com perda de texturas finas." |
| **20** | Aplicações em Medicina | Paulo Sérgio | Microscopia confocal, TC, RM e OCT | "Recupera detalhe subcelular, mas exige validação diagnóstica." |
| **21** | Aplicações em Engenharia | Paulo Sérgio | Inspeção em esteiras, astronomia e satélites | "Desfaz o motion blur para tomada de decisão em tempo real." |
| **22** | Comparação dos Quatro Métodos | Paulo Sérgio | Apresentar a matriz analítica comparativa | "Nenhum método é universal: a física do sensor decide." |
| **23** | Mesma Imagem, 4 Restaurações | Paulo Sérgio | Conduzir a bancada prática central ao vivo | "O mesmo pixel sob quatro tratamentos matemáticos distintos." |
| **24** | Conclusões e Discussão | Grupo (Coord. Paulo) | Provocar a turma com a árvore de decisão prática | "Qual método você escolheria para o seu projeto final?" |
| **25** | Referências Bibliográficas | Grupo (Fechamento) | Apresentar as fontes primárias e artigos seminais | "Rigor científico comprovado com literatura verificável." |

---

## 4. Roteiro de Transições Faladas entre os Integrantes

Manter uma narrativa fluida e sem interrupções abruptas é essencial para a nota máxima de apresentação em grupo.

### Transição 1: Ana Beatriz → Cindy Vitoria (Final do Slide 6)
> **Ana Beatriz:** *"Vimos que a inversão matemática direta falha catastroficamente porque tenta dividir por coeficientes quase nulos na função de transferência óptica, amplificando o ruído até destruir a imagem. Como podemos contornar isso? A Cindy vai nos mostrar agora como o filtro de Wiener introduz hipóteses estatísticas sobre o sinal e o ruído para calcular um compromisso ótimo no domínio da frequência."*

### Transição 2: Cindy Vitoria → Eduardo Marinho (Final do Slide 9)
> **Cindy Vitoria:** *"O filtro de Wiener é incrivelmente rápido e ótimo sob a métrica do erro médio quadrático, mas ele tem limitações severas: gera anéis de Gibbs ao redor de bordas e pode produzir intensidades negativas irreais. O Eduardo vai apresentar agora uma abordagem completamente diferente: em vez de uma fórmula analítica fechada, um método probabilístico iterativo baseado em contagem de fótons que garante positividade absoluta."*

### Transição 3: Eduardo Marinho → Luis Jeronimo (Final do Slide 12)
> **Eduardo Marinho:** *"O algoritmo de Richardson-Lucy recupera detalhes pontuais com fidelidade impressionante, mas sofre do fenômeno da semi-convergência: se não pararmos no momento exato, o ruído começa a ser amplificado em grumos artificiais. O Luis vai nos apresentar agora como a Teoria da Informação resolve isso através do Princípio da Máxima Entropia, impondo um critério que seleciona a imagem mais homogênea compatível com os dados medidos."*

### Transição 4: Luis Jeronimo → Paulo Sérgio (Final do Slide 15)
> **Luis Jeronimo:** *"A Máxima Entropia elimina os anéis de Gibbs e controla o ruído com elegância teórica, mas sua formulação atua pixel a pixel no espaço de estados. O Paulo Sérgio vai assumir o seminário para apresentar a Variação Total, uma técnica revolucionária que olha diretamente para o gradiente espacial da imagem, além de conduzir as aplicações práticas e a nossa bancada comparativa final."*

---

## 5. Duração Sugerida da Apresentação

- **Tempo Total Alvo:** 25 a 30 minutos.
- **Divisão Temporal:**
  - Ana Beatriz (Slides 1 a 6): 5 a 6 minutos
  - Cindy Vitoria (Slides 7 a 9): 4 a 5 minutos
  - Eduardo Marinho (Slides 10 a 12): 4 a 5 minutos
  - Luis Jeronimo (Slides 13 a 15): 4 a 5 minutos
  - Paulo Sérgio (Slides 16 a 25): 8 a 9 minutos
- **Interação com a Bancada Comparativa (Slide 23):** 2 minutos dedicados a alternar abas e mostrar o perfil 1D.
