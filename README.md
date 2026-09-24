# Three Devs

Startup de desenvolvimento de software — landing page, portal do cliente e painel admin.

**Repositório:** [github.com/GScandelari/three-devs](https://github.com/GScandelari/three-devs)

**Site:** https://three-devs.web.app

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
| `/portal` | Clientes | Portal do cliente (requer contrato assinado) |

## Fluxo comercial

1. **Lead** — Dev identifica oportunidade e traz para o time
2. **Proposta** — Time alinha escopo; dev responsável apresenta ao cliente
3. **Contrato** — No admin: criar contrato → enviar → marcar assinado
4. **Portal** — Cliente acessa projetos, status, links e notas

> Sem contrato assinado, o portal bloqueia o acesso.

## Setup local

```bash
git clone https://github.com/GScandelari/three-devs.git
cd three-devs
npm install
cp .env.example .env.local   # preencher variáveis Firebase
npm run dev
```

## Deploy

A CLI do Firebase está nas dependências de desenvolvimento do projeto.
Execute `npm install` após clonar ou atualizar o repositório. Os scripts abaixo
usam a instalação local, sem depender do PATH global do Windows.

Antes da primeira publicação, autentique-se:

```bash
npm run firebase -- login
```

```bash
npm run deploy              # build + hosting + firestore rules
npm run deploy:hosting      # apenas hosting
```

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

## Roadmap

- [x] Landing page
- [x] Portal do cliente
- [x] Painel admin
- [x] Geração de contrato (PDF + e-mail)
- [ ] Assinatura digital (DocuSign, Clicksign)
- [ ] Notificações ao cliente
- [ ] Domínio customizado

## Segurança

Consulte [docs/SEGURANCA.md](docs/SEGURANCA.md) para práticas de secrets, `.env` e restrições da API Key Firebase.
