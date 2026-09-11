# Modo escuro ? site, login e painel administrativo

## Objetivo e uso

Tema claro/escuro exclusivo de `/admin`: Dashboard, Clientes, Projetos,
detalhes do projeto, Contratos e editor de contrato (formulário e prévia).
Na sidebar, ao lado de “Painel admin”, clique na lua para ativar o modo
escuro ou no sol para ativar o modo claro. O botão tem nome acessível
dinâmico, foco visível e área de toque de 44 × 44 px.

## Preferência e persistência

- A escolha ? compartilhada entre site, login e admin e fica em `localStorage`,
  na chave `three-devs-admin-theme`, preservada por compatibilidade.
- Sem escolha válida, as p?ginas acompanham `prefers-color-scheme`.
- A escolha manual prevalece sobre o sistema e sincroniza entre abas.
- Valores inválidos são ignorados. Se o armazenamento estiver bloqueado,
  a escolha manual continua válida durante a sessão, mas não após recarregar.
- A troca atualiza o tema no provider compartilhado, sem trocar a árvore de
  conteúdo ou reinicializar formulários e abas do editor.

## Estratégia técnica

`ThemeProvider` usa `useSyncExternalStore` e um snapshot de servidor
neutro, preservando a renderização estática e a primeira hidratação.
O atributo `data-theme` fica somente no contêiner administrativo.
A variante `dark:` do Tailwind CSS 4 responde a esse atributo; componentes
compartilhados continuam com seus estilos claros no portal.
`color-scheme` é definido explicitamente nos dois temas para controles nativos.

Um script inline anterior ao contêiner aplica um fundo escuro temporário
quando necessário, reduzindo o flash durante o carregamento inicial do guard.
Ele não modifica atributos renderizados pelo React. O provider remove o
estilo temporário após resolver a preferência. A ausência de flash e de
avisos de hidratação ainda requer confirmação em navegador autenticado.

Não há dependências novas, cookies de servidor ou renderização dinâmica.
`output: "export"` e `trailingSlash: true` permanecem ativos.

## Arquivos e justificativas

| Arquivo(s) | Alteração |
| --- | --- |
| `src/components/theme/ThemeProvider.tsx` | Estado compartilhado, persistência e eventos de sistema/armazenamento. |
| `src/components/theme/theme-boot.ts` | Fundo inicial antes da hidratação. |
| `src/components/theme/ThemeToggle.tsx` | Botão acessível com SVGs inline. |
| `src/app/admin/layout.tsx` | Provider envolvendo o guard; conteúdo ajustado para telas estreitas. |
| `src/components/admin/AdminSidebar.tsx` | Alternância, cores e largura responsiva. |
| `src/components/admin/AdminGuard.tsx` | Cores do carregamento; regras de autenticação preservadas. |
| `src/app/globals.css` | Variante escura delimitada pelo provider e esquema dos controles nativos. |
| `src/app/page.tsx` e `src/app/login/page.tsx` | Provider; bot?o e cores do login. |
| `src/components/landing/{Header,Hero,Services,HowItWorks,Footer}.tsx` | Bot?o no cabe?alho e variantes de cores das se??es. |
| `src/app/admin/page.tsx` | Dashboard e tabela nos dois temas. |
| `src/app/admin/clients/page.tsx` | Formulários, mensagens, badges e tabela. |
| `src/app/admin/projects/page.tsx` | Formulário e lista de projetos. |
| `src/app/admin/project/page.tsx` | Status, notas, links e campos. |
| `src/app/admin/contracts/page.tsx` | Formulário, tabela e ações, incluindo ações de perigo. |
| `src/app/admin/contract/page.tsx` | Abas, formulário e mensagens do editor. |
| `src/components/contracts/ContractTemplateForm.tsx` | Cores de campos e associação entre labels e controles. |
| `src/components/ui/Button.tsx` | Variantes escuras de Button e LinkButton, restritas ?s p?ginas com tema. |
| `src/lib/labels.ts` | Variantes escuras dos badges compartilhados. |

O design próprio de `ContractDocument.tsx` foi preservado. Em telas pequenas,
a navegação fica acima do conteúdo e as tabelas permitem rolagem horizontal.
As mudanças preexistentes de `package-lock.json` e `.claude/` foram preservadas
e não fazem parte desta implementação. Não houve commit, push ou deploy.

## Validação — 10/09/2026

### Executada

- `npm run lint`: passou.
- `npx tsc --noEmit`: passou.
- `npm run build`: passou, com exportação das 14 páginas estáticas.
  O download de fontes exigiu acesso à rede. Resta um aviso sobre um
  `package-lock.json` fora do repositório, sem impedir o build.
- `git diff --check`: passou.
- Verificações isoladas em Node, sem instalar infraestrutura: preferência
  inicial, valores inválidos, prioridade manual, armazenamento bloqueado,
  sincronização entre abas, remoção de listeners e snapshot estático passaram.
  Cinco cenários do script inicial também passaram. Esses testes usam objetos
  simulados e não substituem testes de interação/hidratação no navegador.
- Login local aberto e inspecionado visualmente: apresentação clara.

### Revisada no código

- Cobertura das seis seções administrativas e das duas abas do contrato.
- Tema delimitado ? inicial, login e admin, incluindo o carregamento do guard.
- Preservação de estados pela árvore estável de componentes.
- SVGs decorativos, nome dinâmico, foco e tamanho do botão.
- Variantes de campos, tabelas, badges, notas, erros e estados vazios.
- Nenhum portal React encontrado no escopo administrativo atual.
- Landing, login, portal, regras de autenticação, dados e Firebase sem
  alterações de lógica para implementar o tema.

### Pendente de sessão autenticada

Foi solicitada uma sessão de desenvolvedor em `http://localhost:3000/login/`.
Não se contornou o AdminGuard nem se criaram dados reais para os testes.
Após autenticar, concluir:

1. Alternar em cada seção e nas abas de formulário/prévia do contrato.
2. Navegar, recarregar e entrar diretamente nas rotas para conferir persistência.
3. Conferir preferência do sistema, prioridade manual e flash inicial.
4. Preencher campos sem salvar e alternar o tema, verificando conteúdo e aba.
5. Conferir contraste, hover, foco, teclado, selects e datas nos dois temas.
6. Conferir desktop e celular, incluindo rolagem das tabelas.
7. Conferir landing, login e portal após sair do admin, nos dois temas do sistema.
8. Inspecionar console e confirmar ausência de erros de hidratação.

A implementação e as verificações estáticas estão concluídas; a aprovação
visual e funcional completa permanece pendente dessa sessão.




