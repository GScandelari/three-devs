# Pendências técnicas

Itens conhecidos que ainda precisam de verificação ou correção. Cada item traz
contexto, como verificar e quando considerá-lo resolvido. Ao concluir um item,
remova-o deste arquivo na mesma PR da correção e registre-o em
[Concluídas](#concluídas). Os números não são reaproveitados.

| # | Pendência | Prioridade | Status |
|---|-----------|------------|--------|
| 1 | [Remetente dos e-mails não entrega aos clientes](#1-remetente-dos-e-mails-não-entrega-aos-clientes) | **Alta** | Aberta |
| 2 | [Respostas dos clientes para `serifa.labs@gmail.com` (`reply_to`)](#2-respostas-dos-clientes-para-serifalabsgmailcom-reply_to) | Média | Aberta, depende da #1 |
| 7 | [CNPJ da prestadora zerado nos contratos](#7-cnpj-da-prestadora-zerado-nos-contratos) | **Alta** antes de enviar contratos reais | Aberta |
| 9 | [Clientes sem CPF/CNPJ no cadastro](#9-clientes-sem-cpfcnpj-no-cadastro) | Média | Aberta |
| 10 | [Bloqueio do projeto sem contrato só na interface](#10-bloqueio-do-projeto-sem-contrato-só-na-interface) | Baixa | Aberta |
| 11 | [Expiração por inatividade só no navegador](#11-expiração-por-inatividade-só-no-navegador) | Baixa | Aberta |
| 12 | [`three-devs.web.app` não redireciona para `serifalabs.com`](#12-three-devswebapp-não-redireciona-para-serifalabscom) | Baixa | Aberta, não investigada |

---

## 1. Remetente dos e-mails não entrega aos clientes

**Prioridade:** alta. Afeta contratos, boas-vindas e redefinição de senha.
**Registrado em:** 29/10/2026.

### Contexto

Em produção, todas as Cloud Functions que enviam e-mail (`sendContractEmail`,
`sendClientWelcome` e `requestPasswordReset`) usam:

```text
CONTRACT_EMAIL_FROM="Three Devs <onboarding@resend.dev>"
APP_URL=https://serifalabs.com
```

`onboarding@resend.dev` é o **remetente de teste** da Resend. Ele só entrega ao
e-mail do dono da conta Resend. Para qualquer outro destinatário, a Resend
recusa o envio e o painel admin mostra "Não foi possível enviar...".

Consequências:

- clientes novos não recebem o link para definir a senha, e sem ele não
  conseguem entrar no portal;
- o "Esqueci minha senha" não entrega o link;
- contratos não chegam por e-mail.

O endereço desejado para contato é `serifa.labs@gmail.com`, mas ele **não pode
ser o remetente**. A Resend só envia de domínios verificados por DNS
(SPF/DKIM), e não é possível verificar `gmail.com`. Veja a pendência
[#2](#2-respostas-dos-clientes-para-serifalabsgmailcom-reply_to) para receber
as respostas nesse endereço.

### Como verificar

1. No painel admin, cadastre um cliente de teste com um e-mail que **não** seja
   o do dono da conta Resend.
2. Confira se a mensagem de sucesso aparece e se o e-mail chega.
3. Consulte **Logs** no painel da Resend e
   `npm run firebase -- functions:log --only sendClientWelcome`.

O valor publicado aparece no Google Cloud Console → **Cloud Run functions** →
*sendContractEmail* → **Variáveis e secrets**.

### Como resolver

1. Verificar o domínio `serifalabs.com` (já usado pelo site) na Resend. O passo
   a passo está em
   [CONFIGURACAO-RESEND.md, seção 2](CONFIGURACAO-RESEND.md#2-adicionar-e-verificar-o-domínio).
2. Escolher um remetente desse domínio, por exemplo
   `Serifa Labs <contato@serifalabs.com>`.
3. No GitHub, em **Settings → Secrets and variables → Actions → Variables**,
   alterar `CONTRACT_EMAIL_FROM` para o remetente escolhido.
4. Publicar: **Actions → Deploy to Firebase → Run workflow** na `main`, ou
   esperar o próximo merge. O CI gera o `.env` das functions a partir da
   variável e publica (veja "Deploy automático" no `README.md`).

### Critério de conclusão

- [ ] Domínio com status **Verified** na Resend.
- [ ] E-mail de boas-vindas recebido por um endereço que não é o dono da conta Resend.
- [ ] "Esqueci minha senha" recebido e link funcionando.
- [ ] Contrato de teste recebido com o PDF anexado.
- [ ] Item removido do roadmap no `README.md`.

---

## 2. Respostas dos clientes para `serifa.labs@gmail.com` (`reply_to`)

**Prioridade:** média. Depende da [#1](#1-remetente-dos-e-mails-não-entrega-aos-clientes).

### Contexto

Com um remetente como `contato@serifalabs.com`, as respostas dos clientes vão
para esse endereço. Se a equipe quiser recebê-las em `serifa.labs@gmail.com`,
os e-mails precisam do campo `reply_to` da Resend. **Isso ainda não está
implementado.**

### Como resolver

- Em `functions/index.js`, incluir `reply_to` no corpo enviado à Resend, tanto
  em `sendEmail` (boas-vindas e redefinição) quanto em `sendContractEmail`.
- Preferir um parâmetro novo (por exemplo `EMAIL_REPLY_TO`, com `defineString`)
  a deixar o endereço fixo no código.
- Atualizar `CONFIGURACAO-RESEND.md` (seção 6) com o parâmetro novo.

### Critério de conclusão

- [ ] Responder a um e-mail de teste envia a resposta para `serifa.labs@gmail.com`.

---

## 7. CNPJ da prestadora zerado nos contratos

**Prioridade:** alta antes de enviar contratos reais.

### Contexto

O campo "Documento da prestadora (CNPJ)" é preenchido pelo sistema em todos os
contratos e não pode ser editado no formulário. Como a empresa ainda não tem
CNPJ, o valor é `00.000.000/0000-00`, e ele aparece **impresso no PDF** enviado
ao cliente.

### Como resolver

1. Atualizar a constante `AGENCY_DOCUMENT` em `src/lib/contracts/template.ts`.
2. Publicar o frontend (merge na `main`).
3. Abrir e salvar os contratos ainda não assinados: ao abrir, o editor aplica
   o valor novo. Contratos já salvos guardam o valor antigo até serem salvos de novo.

### Critério de conclusão

- [ ] `AGENCY_DOCUMENT` com o CNPJ real.
- [ ] Contratos pendentes salvos novamente com o CNPJ correto.

---

## 9. Clientes sem CPF/CNPJ no cadastro

**Prioridade:** média. Afeta os contratos gerados.

### Contexto

O campo **CPF/CNPJ** foi adicionado ao cadastro de clientes na PR #13. Ao
escolher o cliente no editor de contrato, o documento é preenchido a partir do
cadastro. Clientes cadastrados antes disso não têm documento, e o contrato sai
com esse campo vazio, a menos que seja digitado à mão.

### Como resolver

Admin → Clientes → **Editar** em cada cliente sem documento → preencher
**CPF/CNPJ**. Contratos já criados para esses clientes precisam ser abertos e o
documento preenchido no formulário.

### Critério de conclusão

- [ ] Todos os clientes com contrato ativo ou pendente têm CPF/CNPJ cadastrado.

---

## 10. Bloqueio do projeto sem contrato só na interface

**Prioridade:** baixa.

### Contexto

Desde a PR #10, o portal mostra como **Bloqueado** o projeto que não tem
contrato assinado vinculado. Esse bloqueio é feito só na interface: as regras
do Firestore continuam permitindo que o cliente leia todos os dados dos
próprios projetos (status, notas e links). Quem consultar o Firestore
diretamente, com as credenciais do próprio cliente, consegue ler esses dados.
Os dados são do próprio cliente, por isso a prioridade é baixa.

### Como resolver

As regras não fazem consultas, então não conseguem verificar "existe contrato
assinado". Uma saída é gravar no projeto um campo como `contractSigned: true`
na mesma transação de "Marcar assinado", e a regra de leitura de `projects`
passa a exigir esse campo para o cliente. A listagem do portal precisaria então
de outra fonte para mostrar os projetos bloqueados, porque uma consulta é negada
inteira se um único resultado não puder ser lido.

### Critério de conclusão

- [ ] O cliente não lê status, notas e links de projeto sem contrato assinado,
      nem acessando o Firestore diretamente.

---

## 11. Expiração por inatividade só no navegador

**Prioridade:** baixa.

### Contexto

A sessão é encerrada após 15 minutos sem atividade (`src/lib/firebase/session.ts`
e `src/contexts/AuthContext.tsx`). O controle roda no navegador: ele apaga as
credenciais locais, o que impede o uso normal do sistema. Mas um token de
acesso já emitido continua válido no Firebase até expirar sozinho, em até 1
hora.

### Como resolver

Se houver exigência de segurança ou compliance:

- revogar os tokens no servidor (`revokeRefreshTokens`) ao detectar a
  inatividade, chamando uma Cloud Function; ou
- usar cookies de sessão do Firebase com validade curta, verificados no
  servidor.

### Critério de conclusão

- [ ] Decidido se a limitação é aceita (e documentado) ou implementada a
      revogação no servidor.

---

## 12. `three-devs.web.app` não redireciona para `serifalabs.com`

**Prioridade:** baixa. **Não investigada:** a forma de configurar ainda precisa
ser levantada.

### Contexto

O domínio oficial é `https://serifalabs.com`, e `www.serifalabs.com` já
redireciona para ele. Os endereços padrão do Firebase, `three-devs.web.app` e
`three-devs.firebaseapp.com`, continuam servindo o mesmo site, sem
redirecionar. Como o login fica guardado por domínio, quem entra por esses
endereços não fica logado em `serifalabs.com`, e o controle de inatividade
também é separado.

Desde a PR #14, os links dos e-mails usam `serifalabs.com`, o que reduz o
problema. Ele continua para links antigos e acessos diretos.

### Critério de conclusão

- [ ] Acessos a `three-devs.web.app` e `three-devs.firebaseapp.com` terminam em
      `serifalabs.com`, ou fica decidido e documentado que os dois endereços
      continuam ativos.

---

## Concluídas

| # | Pendência | Resolvida em |
|---|-----------|--------------|
| 3 | Functions e regras do Firestore fora do deploy automático: o CI passou a publicar regras, índices, functions e site, nessa ordem, com validação `--dry-run` nas PRs; parâmetros das functions vêm das variáveis do GitHub | 30/10/2026 |
| 4 | Índices do Firestore fora do `firestore.indexes.json`: TTL de `notifications` declarado no arquivo; índice sem uso de `projects` removido | 30/10/2026 |
| 5 | Política de TTL para `passwordTokens` (declarada em `firestore.indexes.json`) | 30/10/2026 |
| 6 | Clientes antigos com e-mail em maiúsculas: verificação só de leitura em produção encontrou 0 de 5 clientes fora do padrão; nada a corrigir. Cadastros novos já gravam em minúsculas desde a PR #7 | 30/10/2026 |
| 8 | CI usa Node.js 20: workflows passaram para Node.js 24 | 30/10/2026 |
