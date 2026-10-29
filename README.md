# Three Devs

Startup de desenvolvimento de software — landing page, portal do cliente e painel admin.

**Repositório:** [github.com/GScandelari/three-devs](https://github.com/GScandelari/three-devs)

**Site:** https://serifalabs.com (endereço Firebase secundário: https://three-devs.web.app)

## Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Auth & DB | Firebase Auth, Firestore |
| Hosting | Firebase Hosting |
| CI/CD | GitHub Actions |

## Áreas do sistema

| Rota | Acesso | Descrição |
|------|--------|-----------|
| `/` | Público | Landing page |
| `/login` | Público | Login (redireciona para admin ou portal) |
| `/admin` | Desenvolvedores | Painel admin — clientes, projetos, contratos |
| `/portal` | Clientes | Portal do cliente (projetos liberados após contrato assinado) |

## Fluxo comercial

1. **Lead** — Dev identifica oportunidade e traz para o time
2. **Proposta** — Time alinha escopo; dev responsável apresenta ao cliente
3. **Contrato** — No admin: criar contrato → enviar → marcar assinado
4. **Portal** — Cliente acessa projetos, status, links e notas

> Todo cliente cadastrado acessa o portal, mesmo sem projeto. Cada projeto só é
> liberado depois que o contrato vinculado a ele é marcado como assinado.

## Setup local

```bash
git clone https://github.com/GScandelari/three-devs.git
cd three-devs
npm install
cp .env.example .env.local   # preencher variáveis Firebase
npm run dev
```

## Deploy

```bash
npm run deploy              # build + hosting + firestore rules
npm run deploy:hosting      # apenas hosting
npm run deploy:firestore    # apenas regras e índices do Firestore
```

A CLI do Firebase (`firebase-tools`) está nas dependências de desenvolvimento, então
os scripts acima funcionam após `npm install`, sem instalação global. Na primeira
vez, autentique-se com `npx firebase login`.

> O deploy automático (GitHub Actions) publica **apenas o hosting**. Mudanças em
> `firestore.rules` precisam de `npm run deploy:firestore`. Os avisos ao cliente
> dependem das regras da coleção `notifications`: publique as regras **antes**
> do merge na `main`. Sem elas, o sininho do portal não carrega, "Marcar
> assinado" falha sempre e salvar no admin com "Avisar o cliente" marcado falha.

### Expiração automática dos avisos (TTL) — configurar uma vez

Os avisos não visualizados são apagados 3 dias após a criação por uma política de
TTL do Firestore no campo `expiresAt`. Sem essa política, o portal continua
escondendo os avisos vencidos, mas eles ficam guardados no banco. Para ativar:

1. Abra o [Console do Google Cloud](https://console.cloud.google.com/firestore)
   no projeto `three-devs` → **Firestore** → **Time-to-live (TTL)**.
2. Clique em **Create policy**.
3. Em **Collection group**, informe `notifications`; em **Timestamp field**,
   informe `expiresAt`.
4. Salve e aguarde o status da política ficar como ativo.

Segundo a documentação do Firestore, a exclusão pelo TTL acontece normalmente em
até 24 horas depois do vencimento, e até lá o documento continua aparecendo nas
consultas (o portal já filtra os vencidos). Cada exclusão conta como uma operação
de exclusão normal do Firestore.

## Testes das regras do Firestore

```bash
npm run test:rules
```

Roda `tests/firestore.rules.test.mjs` contra o emulador local do Firestore, com
um projeto `demo-*` que só existe no emulador (nenhum dado real é usado). Requer
**Java 21 ou superior** instalado. O workflow `Testar regras do Firestore` roda os
mesmos testes em todo pull request e em push na `main`.

### PDF e envio de contratos

Os PDFs são gerados pelas Cloud Functions e enviados como anexo pela Resend.
Antes do primeiro deploy dessa funcionalidade:

```bash
npm run firebase -- functions:secrets:set RESEND_API_KEY
npm run firebase -- deploy --only functions
```

Durante o deploy, informe `CONTRACT_EMAIL_FROM` no formato
`Three Devs <contratos@seudominio.com>` e, se necessário, ajuste `APP_URL`.
O domínio do remetente precisa estar verificado na Resend. Para publicar apenas
o site depois disso, continue usando `npm run deploy:hosting`.

Consulte o passo a passo completo em
[docs/CONFIGURACAO-RESEND.md](docs/CONFIGURACAO-RESEND.md).

## Adicionar desenvolvedores

1. Crie o usuário em **Firebase Auth** (Authentication → Add user)
2. Crie documento em Firestore `developers/{uid}`:
   ```json
   {
     "email": "dev@email.com",
     "name": "Nome do Dev",
     "role": "developer"
   }
   ```
3. Adicione como colaborador no GitHub: **Settings → Collaborators**

## Deploy automático (GitHub Actions)

Secrets necessários em **Settings → Secrets**:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_SERVICE_ACCOUNT`
- `NEXT_PUBLIC_FIREBASE_*` (6 variáveis)

O workflow publica **apenas o hosting**: em produção a cada push na `main` e
num canal de preview (válido por 3 dias) em cada PR. Assim, erros de build ou
de permissão aparecem na PR, antes do merge.

### Versões fixadas

- A versão da CLI usada no CI é a de `firebase-tools` em `devDependencies` do
  `package.json` (sem `^`). Para atualizar, rode
  `npm install -D --save-exact firebase-tools@<versão>` e abra uma PR: o deploy
  de preview valida a versão nova antes de ela chegar à produção.
- A action `FirebaseExtended/action-hosting-deploy` está fixada por SHA de commit.

### Papéis da conta de serviço (`FIREBASE_SERVICE_ACCOUNT`)

No Google Cloud Console → **IAM**, a conta de serviço do deploy precisa de:

- **Firebase Hosting Admin** (`roles/firebasehosting.admin`);
- **Service Usage Consumer** (`roles/serviceusage.serviceUsageConsumer`):
  exigido a partir do `firebase-tools` 15.34, que confere se a API do Hosting
  está habilitada. Sem ele o deploy falha com
  `403 Permission denied to get service [firebasehosting.googleapis.com]`.

Mantenha também os papéis criados pelo `firebase init hosting:github`.

### Functions e regras do Firestore (deploy manual)

Cloud Functions e `firestore.rules` **não** são publicadas pelo CI. Quando uma
mudança depender delas, publique-as **antes** do merge que leva o frontend ao ar:

```powershell
npm run firebase -- login
npm ci --prefix functions
npm run firebase -- deploy --only functions,firestore
```

## Roadmap

- [x] Landing page
- [x] Portal do cliente
- [x] Painel admin
- [x] Geração de contrato (PDF + e-mail)
- [ ] Assinatura digital (DocuSign, Clicksign)
- [x] Notificações ao cliente
- [x] Domínio customizado (serifalabs.com)
- [ ] Remetente de e-mail com domínio verificado: hoje é o de teste da Resend e
  não entrega aos clientes. Veja [PENDENCIAS-TECNICAS.md](docs/PENDENCIAS-TECNICAS.md)

## Pendências técnicas

Itens conhecidos que precisam de verificação ou correção, com contexto e critério de conclusão: [docs/PENDENCIAS-TECNICAS.md](docs/PENDENCIAS-TECNICAS.md).

## Segurança

Consulte [docs/SEGURANCA.md](docs/SEGURANCA.md) para práticas de secrets, `.env` e restrições da API Key Firebase.
