# Segurança — Three Devs

## Auditoria do repositório Git

| Item | Status |
|------|--------|
| `.env.local` / credenciais locais | Ignorados pelo `.gitignore` — **não commitados** |
| `.env.example` | Apenas placeholders vazios |
| Service Account JSON | **Não presente** no repositório |
| Chaves hardcoded no código | **Nenhuma** — uso via `process.env.NEXT_PUBLIC_*` |
| Histórico Git (`main`) | **Sem** API keys, senhas ou e-mails reais |

## Variáveis de ambiente

| Arquivo | Commitar? |
|---------|-----------|
| `.env.example` | Sim (vazio) |
| `.env.local` | **Nunca** |
| `.env.production` | **Nunca** |
| Service Account JSON | **Nunca** — usar GitHub Secrets no CI |

Secrets do GitHub Actions (não vão para o código):

- `FIREBASE_SERVICE_ACCOUNT`
- `FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_*`

## Firebase API Key (`NEXT_PUBLIC_*`)

A API Key do Firebase **aparece no bundle JavaScript** do site — isso é esperado em apps web Firebase. Proteja no [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

1. **Application restrictions** → HTTP referrers:
   - `https://three-devs.web.app/*`
   - `https://three-devs.firebaseapp.com/*`
   - `http://localhost:3000/*` (dev)
2. **API restrictions** → limitar a: Identity Toolkit, Firebase Installations, Cloud Firestore

## Operações sensíveis

| Operação | Como funciona |
|----------|---------------|
| Alterar senha de cliente | Cloud Function `setClientPassword` (Admin SDK) — só desenvolvedores autenticados |
| CRUD Firestore | Regras limitam escrita a desenvolvedores |
| Portal do cliente | Bloqueado sem contrato assinado |

## Checklist para novos devs

- [ ] Nunca commitar `.env.local` ou JSON de service account
- [ ] Não colocar senhas reais em docs ou issues do GitHub
- [ ] Configurar restrictions da API Key no Google Cloud
- [ ] Adicionar colaboradores no GitHub com permissão mínima necessária
