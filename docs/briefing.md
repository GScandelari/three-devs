# Briefing — landing page Serifa Labs

Registro da reformulação feita com a skill `landing-page-architect` em 17/11/2026.

## Negócio

- **Marca:** Serifa Labs (antes "Three Devs"). O nome aparece em tudo o que o
  cliente vê. Identificadores de infraestrutura continuam `three-devs`
  (projeto Firebase, bucket, `three-devs.web.app`, repositório), porque
  mudá-los exige migração.
- **Oferta:** desenvolvimento de software sob medida — aplicações web,
  integrações e APIs, MVPs e produtos digitais.
- **Quem faz:** três desenvolvedores; cada um traz projetos e conduz a relação
  com o cliente.
- **Diferenciais verificáveis:** contrato antes do código, assinatura pelo
  gov.br (fluxo assistido, `docs/ASSINATURA-GOVBR.md`) e portal do cliente com
  status, links, notas, contratos e avisos.
- **Público:** empresas e fundadores que precisam de software sob medida.
- **Objetivo da página:** iniciar conversas de projeto (captação B2B) e dar
  acesso ao portal para quem já é cliente.
- **Canal de conversão:** e-mail `contato@serifalabs.com` (confirmado pelo time;
  a caixa precisa existir). WhatsApp aprovado, número pendente.
- **Nicho:** não regulado. Valem CDC (publicidade honesta) e LGPD (a página não
  coleta dados; o contato é por `mailto:`).

## Modo e nível

- **Modo:** reformulação (Next.js 16 existente, exportação estática no
  Firebase Hosting). URLs preservadas: `/`, `/login` e demais rotas.
- **Nível de ambição:** Elevado (escolhido pelo time).
- **Movimento:** M2 Expressivo.

## Estratégia

Ordem das seções (captação B2B): Hero → O que construímos → Processo →
Portal do cliente → Perguntas frequentes → Contato.

- **Posicionamento:** para empresas e fundadores que precisam de software sob
  medida, a Serifa Labs entrega aplicações web, integrações e MVPs com contrato
  assinado pelo gov.br e um portal para acompanhar cada etapa.
- **CTA principal:** "Iniciar um projeto" (hero, depois do processo, header).
  CTAs contextuais por serviço ("Conversar sobre isso", e-mail com assunto).
  CTA secundário: "Acessar o portal do cliente".
- Headlines avaliadas: "Software sob medida, do rascunho ao acabamento" (escolhida:
  liga o nome à promessa de cuidado sem prometer resultado) e "Três
  desenvolvedores, um time completo para o seu projeto" (anterior).

## Direção de arte (aprovada pelo time)

- **Leitura de design:** estúdio de software de três desenvolvedores para
  empresas e fundadores, com linguagem direta e técnica, editorial, em Next.js
  com o motion kit portado para React.
- **Paleta:** papel-lavanda `#F7F6FD`, tinta-índigo `#17133B`, índigo-sinal
  `#4F3DF0`, vermelho-revisão `#E5484D` (só traços), grafite-texto `#2A2840`.
- **Cenas de cor (arco):** papel (hero) → tinta (serviços) → papel (processo,
  portal, perguntas) → índigo (contato e rodapé).
- **Tipografia:** Newsreader (títulos, itálico para ênfase), Geist (texto),
  Geist Mono (rótulos e dados).
- **Assinatura:** no hero, a palavra "acabamento" nasce em fonte mono (o
  rascunho, o código) e um traço vermelho-revisão a atravessa e a converte na
  serifada. Só faz sentido para uma marca chamada Serifa.
- **3D:** não. Nada no negócio pede um objeto 3D; a assinatura é tipográfica.

## Impressão digital e roteiro de movimento

- **Orçamento (Elevado: 4–6 + assinatura):** L1, R2, U1, S6, S1 + SIG.
- **Tokens:** `--mk-ease-out (.2,1,.32,1)`, `--mk-ease-inout (.7,0,.24,1)`,
  `--mk-ease-sig (.76,0,.24,1)`; durações .22 s / .8 s / 1.2 s;
  distância 32 px; stagger 60 ms.
- **Roteiro:**
  - Hero: L1 (título palavra a palavra, subtítulo +.15 s, CTA +.25 s; CTA
    inteiro em ~1 s) + SIG (passada de revisão a partir de 1 s).
  - Serviços: R2 em cascata; U1 nos links contextuais.
  - Processo: S6, fio vermelho-revisão desenhado pela rolagem ligando as 4
    etapas (vertical no celular, horizontal no desktop).
  - Portal: S1, ilustração fixa no desktop; o recurso no centro da tela acende
    a área correspondente.
  - Perguntas e contato: R2.
- **Stack:** o projeto já é Next.js (área logada, Firebase), então a matriz só
  decide o que acrescentar. Elevado pede dois momentos guiados pela rolagem e
  cenas de cor; o motion kit portado para um componente React (`MotionLayer`)
  entrega isso com ~2 KB, sem GSAP nem Lenis. Não há timeline longa que
  justifique o GSAP.
- **Redução de movimento / sem JS:** tudo aparece no estado final; as cenas de
  cor continuam (cor não é deslocamento); sem JS cada seção pinta a própria
  cena.

## Login e painel admin

- Login e telas de senha com moldura dividida (`AuthShell`): painel em
  tinta-índigo com a frase da marca e o formulário no papel-lavanda.
- Painel admin com sidebar em tinta-índigo, ícones, menu no celular, saudação
  com a data, cards com ícones e destaque para contratos pendentes, tabela de
  projetos com cliente e responsável, e lista de contratos que precisam de
  ação (inclui "Conferir assinatura").
