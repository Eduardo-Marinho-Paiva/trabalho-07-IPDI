# Referências Bibliográficas e Acadêmicas

**Seminário 7: Deconvolução e Restauração de Imagens**  
**Disciplina:** Processamento Digital de Imagens (PDI)  
**Curso:** Ciência da Computação  

Este documento reúne a fundamentação teórica e as fontes primárias verificáveis utilizadas na concepção matemática e algorítmica deste projeto. Todas as publicações citadas são referências consagradas na literatura científica internacional com identificadores de objeto digital (DOI) ou registros editoriais válidos.

---

## 1. Fundamentos de Processamento de Imagens e Problemas Inversos

1. **Gonzalez, R. C., & Woods, R. E. (2018).**  
   *Digital Image Processing* (4th ed.). Pearson Education.  
   - **Capítulo 5:** "Image Restoration and Reconstruction" (pp. 311–402). Trata o modelo de degradação linear invariante no espaço, filtros inversos, filtros de Wiener e restauração com restrições.  
   - **ISBN:** 978-0133356724.

2. **Bertero, M., & Boccacci, P. (1998).**  
   *Introduction to Inverse Problems in Imaging*. Institute of Physics Publishing (CRC Press).  
   - Apresenta a teoria de operadores integrais de Fredholm de primeiro tipo, o conceito de mal-condicionamento de Hadamard e a necessidade de métodos de regularização.  
   - **ISBN:** 978-0750304351.

3. **Hadamard, J. (1902).**  
   *Sur les problèmes aux dérivées partielles et leur signification physique*. Princeton University Bulletin, 13, 49–52.  
   - Artigo seminal definindo as três condições de um problema bem-posto: existência, unicidade e dependência contínua da solução em relação aos dados iniciais.

---

## 2. Degradação Óptica e Função de Espalhamento Pontual (PSF)

1. **Goodman, J. W. (2005).**  
   *Introduction to Fourier Optics* (3rd ed.). Roberts & Company Publishers.  
   - Fundamenta a formação de imagens como sistemas lineares, a Função de Transferência Óptica (OTF), a Função de Transferência de Modulação (MTF) e a derivação da PSF sob difração.  
   - **ISBN:** 978-0974707723.

2. **Kundur, D., & Hatzinakos, D. (1996).**  
   Blind image deconvolution. *IEEE Signal Processing Magazine*, 13(3), 43–64.  
   - **DOI:** [10.1109/79.489270](https://doi.org/10.1109/79.489270)  
   - Trata a modelagem da degradação quando a PSF não é previamente conhecida e necessita ser estimada simultaneamente à imagem.

---

## 3. Deconvolução de Wiener (Filtragem Estatística MMSE)

1. **Wiener, N. (1949).**  
   *Extrapolation, Interpolation, and Smoothing of Stationary Time Series*. The MIT Press.  
   - Obra fundacional da teoria estatística de filtragem linear ótima para processos estocásticos estacionários.  
   - **ISBN:** 978-0262730051.

2. **Helstrom, C. W. (1967).**  
   Image restoration by the method of least squares. *Journal of the Optical Society of America*, 57(3), 297–303.  
   - **DOI:** [10.1364/JOSA.57.000297](https://doi.org/10.1364/JOSA.57.000297)  
   - Primeira generalização rigorosa do filtro de Wiener para o domínio bidimensional em processamento digital de imagens.

---

## 4. Deconvolução de Richardson–Lucy (Abordagem Iterativa Bayesiana)

1. **Richardson, W. H. (1972).**  
   Bayesian-Based Iterative Method of Image Restoration. *Journal of the Optical Society of America*, 62(1), 55–59.  
   - **DOI:** [10.1364/JOSA.62.000055](https://doi.org/10.1364/JOSA.62.000055)  
   - Derivação da técnica iterativa fundamentada no Teorema de Bayes para recuperação de distribuições probabilísticas em sistemas ópticos.

2. **Lucy, L. B. (1974).**  
   An iterative technique for the rectification of observed distributions. *The Astronomical Journal*, 79(6), 745–754.  
   - **DOI:** [10.1086/111605](https://doi.org/10.1086/111605)  
   - Formulação do algoritmo no contexto astronômico, comprovando a conservação estrita de energia luminosa e a preservação de não-negatividade.

3. **Shepp, L. A., & Vardi, Y. (1982).**  
   Maximum likelihood reconstruction for emission tomography. *IEEE Transactions on Medical Imaging*, 1(2), 113–122.  
   - **DOI:** [10.1109/TMI.1982.4307558](https://doi.org/10.1109/TMI.1982.4307558)  
   - Demonstração de que o algoritmo de Richardson-Lucy é uma instância exata do algoritmo Expectation-Maximization (EM) para processos pontuais de Poisson.

---

## 5. Métodos Baseados em Entropia e Máxima Entropia (MEM)

1. **Shannon, C. E. (1948).**  
   A Mathematical Theory of Communication. *Bell System Technical Journal*, 27(3), 379–423.  
   - **DOI:** [10.1002/j.1538-7305.1948.tb01338.x](https://doi.org/10.1002/j.1538-7305.1948.tb01338.x)  
   - Definição formal da medida de incerteza da teoria da informação: H = -∑ p log p.

2. **Jaynes, E. T. (1957).**  
   Information Theory and Statistical Mechanics. *Physical Review*, 106(4), 620–630.  
   - **DOI:** [10.1103/PhysRev.106.620](https://doi.org/10.1103/PhysRev.106.620)  
   - Princípio da Máxima Entropia como inferência estatística racional sob restrições parciais de dados.

3. **Gull, S. F., & Daniell, G. J. (1978).**  
   Image reconstruction from incomplete and noisy data. *Nature*, 272(5655), 686–690.  
   - **DOI:** [10.1038/272686a0](https://doi.org/10.1038/272686a0)  
   - Artigo pioneiro mundial na aplicação da máxima entropia na restauração e deconvolução de imagens astronômicas de rádio-interferometria.

4. **Skilling, J. (1989).**  
   Classic Maximum Entropy. Em *Maximum Entropy and Bayesian Methods* (pp. 45–52). Springer Netherlands.  
   - **DOI:** [10.1007/978-94-015-7860-8_4](https://doi.org/10.1007/978-94-015-7860-8_4)  
   - Sistematização do algoritmo MEM com entropia relativa S(x) = -∑ x_i ln(x_i / m_i) em relação a um modelo de referência *m*.

---

## 6. Restauração por Variação Total (ROF e Otimização Convexa)

1. **Rudin, L. I., Osher, S., & Fatemi, E. (1992).**  
   Nonlinear total variation based noise removal algorithms. *Physica D: Nonlinear Phenomena*, 60(1-4), 259–268.  
   - **DOI:** [10.1016/0167-2789(92)90242-F](https://doi.org/10.1016/0167-2789(92)90242-F)  
   - O célebre modelo ROF: introdução da regularização pela norma L1 da magnitude do gradiente para redução de ruído e deconvolução preservando bordas descontínuas.

2. **Chambolle, A. (2004).**  
   An Algorithm for Total Variation Minimization and Applications. *Journal of Mathematical Imaging and Vision*, 20(1), 89–97.  
   - **DOI:** [10.1023/B:JMIV.0000011321.19549.88](https://doi.org/10.1023/B:JMIV.0000011321.19549.88)  
   - Formulação dual e algoritmo de projeção não-linear rápido para minimização do funcional ROF.

3. **Bredies, K., Kunisch, K., & Pock, T. (2010).**  
   Total Generalized Variation. *SIAM Journal on Imaging Sciences*, 3(3), 492–526.  
   - **DOI:** [10.1137/090769521](https://doi.org/10.1137/090769521)  
   - Generalização contemporânea da Variação Total para ordens superiores que soluciona o efeito de *staircasing* em gradientes suaves.

---

## 7. Aplicações em Imagens Médicas

1. **Sibarita, J. B. (2005).**  
   Deconvolution Microscopy. *Advances in Biochemical Engineering/Biotechnology*, 95, 201–243.  
   - **DOI:** [10.1007/b102212](https://doi.org/10.1007/b102212)  
   - Estudo completo sobre deconvolução 3D em microscopia de fluorescência e confocal com algoritmos de Richardson-Lucy e máxima verossimilhança.

2. **Lustig, M., Donoho, D., & Pauly, J. M. (2007).**  
   Sparse MRI: The application of compressed sensing for rapid MR imaging. *Magnetic Resonance in Medicine*, 58(6), 1182–1195.  
   - **DOI:** [10.1002/mrm.21391](https://doi.org/10.1002/mrm.21391)  
   - Integração da regularização por Variação Total na reconstrução e restauração de exames clínicos de Ressonância Magnética.

---

## 8. Aplicações em Engenharia, Sensoriamento Remoto e Astronomia

1. **Starck, J. L., & Murtagh, F. (2006).**  
   *Astronomical Image and Data Analysis* (2nd ed.). Springer-Verlag.  
   - **DOI:** [10.1007/978-3-540-33225-1](https://doi.org/10.1007/978-3-540-33225-1)  
   - Deconvolução em telescópios espaciais, calibração de PSF por ótica adaptativa e restauração sob baixa relação sinal-ruído.

2. **Campisi, P., & Egiazarian, K. (Eds.). (2007).**  
   *Blind Image Deconvolution: Theory and Applications*. CRC Press.  
   - Aplicações em inspeção industrial, visão robótica para controle de qualidade e remoção de desfoque por movimento em imagens aéreas de satélite.
