# Configuração da Resend para envio de contratos

Este guia explica como configurar a chave `RESEND_API_KEY`, autenticar o
domínio remetente e publicar as Cloud Functions responsáveis por gerar e enviar
os contratos em PDF.

## Visão geral

O envio funciona da seguinte forma:

1. O administrador preenche o contrato no painel da Three Devs.
2. A Cloud Function gera o PDF no servidor.
3. A função lê `RESEND_API_KEY` do Google Cloud Secret Manager.
4. A Resend envia o PDF anexado ao e-mail do cliente.
5. O Firestore registra o destinatário, a data e o identificador do envio.

A chave da Resend nunca é enviada ao navegador e não deve ser adicionada ao
`.env.local` do frontend.

## Pré-requisitos

Antes de começar, confirme que você tem:

- uma conta na [Resend](https://resend.com/);
- acesso ao DNS do domínio que será usado nos e-mails;
- acesso ao projeto Firebase `three-devs`;
- permissão para publicar Cloud Functions e criar secrets;
- as dependências do projeto instaladas com `npm install`;
- um plano do Firebase compatível com Cloud Functions e Secret Manager.

Todos os comandos deste guia devem ser executados na raiz do repositório:


## 1. Criar ou acessar a conta da Resend

1. Acesse [resend.com](https://resend.com/).
2. Crie uma conta ou entre em uma conta existente.
3. Confirme que está na equipe correta antes de cadastrar o domínio e criar a
   chave.

Evite criar a configuração na conta pessoal errada, pois domínios e chaves
ficam associados à equipe selecionada no painel.

## 2. Adicionar e verificar o domínio

Para enviar contratos a clientes usando um endereço da Three Devs, o domínio
do remetente precisa estar verificado.

1. No painel da Resend, abra **Domains**.
2. Clique em **Add Domain**.
3. Informe o domínio ou subdomínio que será usado nos e-mails.
4. Escolha a região de envio, se essa opção for apresentada.
5. A Resend exibirá os registros DNS necessários.
6. No provedor do domínio, adicione os registros exatamente como apresentados.
7. Volte à Resend e clique para verificar o domínio.
8. Aguarde até o status ficar como **Verified**.

Normalmente, a Resend solicita registros de autenticação como SPF e DKIM. A
propagação do DNS pode levar algum tempo. Consulte a
[documentação de verificação de domínio da Resend](https://resend.com/blog/new-domain-verification-experience)
se algum registro não for reconhecido.

### Remetente recomendado

Depois que o domínio estiver verificado, escolha o endereço que aparecerá como
remetente. Exemplo:

```text
Three Devs <contratos@seudominio.com>
```

O domínio depois de `@` deve ser o mesmo domínio, ou um subdomínio autorizado,
que aparece como verificado na Resend.

## 3. Criar a API key

1. No painel da Resend, abra **API Keys**.
2. Clique em **Create API Key**.
3. Use um nome identificável, como `three-devs-production`.
4. Selecione a permissão **Sending access**.
5. Se possível, restrinja a chave ao domínio cadastrado para a Three Devs.
6. Confirme a criação.
7. Copie imediatamente o valor que começa com `re_`.

Exemplo do formato da chave:

```text
re_xxxxxxxxxxxxxxxxxxxxxxxxx
```

Não copie o exemplo acima. Use o valor real apresentado no painel. A chave
completa só é exibida no momento da criação. A Resend recomenda chaves com
permissão limitada para reduzir o impacto de um possível vazamento. Consulte a
[documentação de permissões de API keys](https://resend.com/changelog/new-api-key-permissions).

## 4. Autenticar a CLI do Firebase

No terminal, execute:

```powershell
npm run firebase -- login
```

O navegador será aberto para autenticação. Use uma conta que tenha acesso ao
projeto Firebase da Three Devs.

Confirme o projeto selecionado:

```powershell
npm run firebase -- use
```

O resultado esperado deve indicar o projeto padrão `three-devs`. O arquivo
`.firebaserc` deste repositório já aponta para esse projeto.

## 5. Salvar `RESEND_API_KEY` com segurança

Execute:

```powershell
npm run firebase -- functions:secrets:set RESEND_API_KEY
```

Quando o terminal pedir o valor:

1. cole a chave real que começa com `re_`;
2. confirme a entrada;
3. aguarde a mensagem indicando que uma nova versão do secret foi criada.

O Firebase armazena esse valor no Google Cloud Secret Manager. O procedimento
oficial está documentado em
[Configurar o ambiente das Cloud Functions](https://firebase.google.com/docs/functions/config-env).

### O que não fazer

Nunca coloque a chave:

- em `.env.local` ou em uma variável `NEXT_PUBLIC_*`;
- diretamente em `functions/index.js`;
- em commits, issues, prints ou documentação;
- em mensagens de chat ou canais públicos;
- em secrets do GitHub que não sejam necessários para o deploy.

Qualquer variável com prefixo `NEXT_PUBLIC_` pode aparecer no JavaScript
entregue ao navegador. Por isso, a chave da Resend deve permanecer somente no
Secret Manager.

## 6. Configurar o remetente e a URL do sistema

Além do secret, as funções usam estes parâmetros:

| Parâmetro | Exemplo | Finalidade |
|-----------|---------|------------|
| `CONTRACT_EMAIL_FROM` | `Three Devs <contratos@seudominio.com>` | Remetente do e-mail |
| `APP_URL` | `https://three-devs.web.app` | Link para o portal incluído no e-mail |

`CONTRACT_EMAIL_FROM` será solicitado no primeiro deploy. Informe o nome e o
endereço completo, incluindo os sinais `<` e `>`:

```text
Three Devs <contratos@seudominio.com>
```

`APP_URL` já possui `https://three-devs.web.app` como valor padrão. Se o site
passar a usar um domínio próprio, atualize esse parâmetro no próximo deploy.

Caso prefira declarar os parâmetros antes do deploy, crie localmente o arquivo
`functions/.env.three-devs` com o conteúdo abaixo:

```dotenv
CONTRACT_EMAIL_FROM="Three Devs <contratos@seudominio.com>"
APP_URL=https://three-devs.web.app
```

Esse arquivo corresponde a uma configuração local do projeto e está coberto
pelas regras de `.gitignore` para arquivos `.env*`. Mesmo assim, confira o
`git status` antes de qualquer commit.

## 7. Publicar as Cloud Functions

Execute:

```powershell
npm run firebase -- deploy --only functions
```

No primeiro deploy, a CLI pode solicitar o valor de
`CONTRACT_EMAIL_FROM`. Confirme também o valor de `APP_URL`, caso seja
perguntado.

O deploy deve publicar ou atualizar estas funções:

- `generateContractPdf`;
- `sendContractEmail`;
- `setClientPassword`;
- `provisionDeveloper`.

Depois de alterar `RESEND_API_KEY`, sempre faça um novo deploy da função que
usa o secret. Para publicar apenas o envio de e-mail:

```powershell
npm run firebase -- deploy --only functions:sendContractEmail
```

## 8. Verificar a configuração

Para conferir os metadados do secret sem exibir seu conteúdo:

```powershell
npm run firebase -- functions:secrets:get RESEND_API_KEY
```

Para listar as funções publicadas:

```powershell
npm run firebase -- functions:list
```

Não use `functions:secrets:access` em gravações de tela, terminais
compartilhados ou logs, pois esse comando pode revelar o valor real do secret.

## 9. Fazer o primeiro teste

### Teste sem entregar a uma caixa postal real

A Resend oferece endereços de teste. Para simular um envio entregue, use
temporariamente um cliente com o e-mail:

```text
delivered@resend.dev
```

Esse endereço registra o evento como entregue sem enviar a mensagem para uma
pessoa real. Consulte a
[lista de endereços de teste da Resend](https://resend.com/changelog/sending-test-emails).

### Teste completo pelo painel

1. Entre no painel administrativo da Three Devs.
2. Abra **Contratos**.
3. Crie ou selecione um contrato de teste.
4. Preencha os campos obrigatórios:
   - nome e e-mail do cliente;
   - nome do projeto;
   - descrição dos serviços;
   - valor total;
   - data de início;
   - data de conclusão.
5. Use **Baixar PDF** e revise o arquivo gerado.
6. Use **Enviar por e-mail**.
7. Confirme a mensagem de sucesso no painel.
8. Verifique se o contrato passou para o status **Enviado**.
9. Confira a data e o destinatário exibidos em **Último envio**.
10. Abra **Logs** no painel da Resend e confirme que o envio aparece na lista.

Somente depois desse teste substitua o destinatário pelo e-mail de um cliente
real.

## 10. Consultar logs em caso de erro

Para consultar os logs das funções:

```powershell
npm run firebase -- functions:log --only sendContractEmail
```

Também é possível consultar:

- o painel **Logs** da Resend, para erros de entrega ou rejeição;
- o **Cloud Logging** no Google Cloud Console;
- os detalhes da função no Firebase Console.

Evite copiar logs completos para locais públicos. Eles podem conter endereços
de e-mail, identificadores de mensagem e informações do contrato.

## 11. Problemas comuns

### A chave foi criada, mas a função informa erro interno

Possíveis causas:

- o secret foi criado depois do último deploy;
- a chave foi revogada na Resend;
- o nome foi cadastrado como `RESEN_API_KEY`, sem a letra `D`;
- a função não recebeu permissão para acessar a versão atual do secret.

Solução:

```powershell
npm run firebase -- functions:secrets:set RESEND_API_KEY
npm run firebase -- deploy --only functions:sendContractEmail
```

### Erro de remetente ou domínio não verificado

Confirme que:

- o domínio está com status **Verified** na Resend;
- `CONTRACT_EMAIL_FROM` usa esse mesmo domínio;
- o endereço está no formato `Nome <email@dominio.com>`;
- os registros SPF e DKIM continuam publicados no DNS.

### Erro de autenticação da Resend

Uma resposta `401` normalmente indica chave ausente, inválida ou revogada.
Crie uma nova chave com **Sending access**, atualize o secret e publique a
função novamente.

### Erro de permissão no painel da Three Devs

O envio só pode ser executado por um usuário autenticado que possua documento
em `developers/{uid}` no Firestore. Confirme que o usuário está cadastrado como
desenvolvedor.

### A função não foi encontrada

Confirme o deploy e a região configurada:

```powershell
npm run firebase -- functions:list
```

O frontend e as funções deste projeto usam a região `us-central1`.

### O Firebase solicita faturamento

Cloud Functions e Secret Manager podem exigir um projeto com faturamento
habilitado. Verifique o plano do projeto e os limites gratuitos antes de
prosseguir. O Secret Manager é um serviço pago com nível gratuito, conforme a
[documentação do Firebase](https://firebase.google.com/docs/functions/config-env).

## 12. Rotacionar a chave

Faça a rotação quando houver suspeita de vazamento, mudança de equipe ou como
parte de uma rotina periódica de segurança.

1. Crie uma nova API key na Resend com **Sending access**.
2. Atualize o secret:

   ```powershell
   npm run firebase -- functions:secrets:set RESEND_API_KEY
   ```

3. Publique novamente a função:

   ```powershell
   npm run firebase -- deploy --only functions:sendContractEmail
   ```

4. Envie um contrato de teste.
5. Confirme o sucesso nos logs da Resend.
6. Revogue a chave antiga no painel da Resend.

Não revogue a chave antiga antes de concluir o deploy e o teste da nova versão,
a menos que exista um vazamento ativo. Em uma emergência, revogue primeiro para
interromper os envios e depois configure uma nova chave.

## Checklist final

- [ ] Conta e equipe corretas selecionadas na Resend.
- [ ] Domínio com status **Verified**.
- [ ] API key criada com **Sending access**.
- [ ] Chave salva como `RESEND_API_KEY` no Secret Manager.
- [ ] `CONTRACT_EMAIL_FROM` usa o domínio verificado.
- [ ] `APP_URL` aponta para o portal correto.
- [ ] Cloud Functions publicadas com sucesso.
- [ ] PDF baixado e revisado.
- [ ] Envio simulado com `delivered@resend.dev`.
- [ ] Envio real testado com um endereço controlado.
- [ ] Logs da Resend e do Firebase verificados.
- [ ] Nenhuma chave presente no Git ou em arquivos públicos.

## Referências

- [Resend - API Keys](https://resend.com/api-keys)
- [Resend - Permissões de API keys](https://resend.com/changelog/new-api-key-permissions)
- [Resend - Verificação de domínio](https://resend.com/blog/new-domain-verification-experience)
- [Resend - E-mails de teste](https://resend.com/changelog/sending-test-emails)
- [Firebase - Configuração e secrets](https://firebase.google.com/docs/functions/config-env)
- [Firebase CLI](https://firebase.google.com/docs/cli)
