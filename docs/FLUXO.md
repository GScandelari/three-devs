# Fluxo de negócio — Three Devs

## Papéis

### Desenvolvedor (×3)
- Identifica leads
- Apresenta proposta alinhada com o time
- Conduz comunicação com o cliente
- Gerencia projetos no portal (futuro painel admin)

### Cliente
- Recebe proposta e contrato
- Assina contrato
- Acessa portal para acompanhar projeto(s)

## Estados do contrato

| Status | Descrição | Portal |
|--------|-----------|--------|
| `draft` | Rascunho interno | Bloqueado |
| `sent` | Enviado ao cliente | Bloqueado |
| `signed` | Assinado | **Liberado** |
| `cancelled` | Cancelado | Bloqueado |

## Estados do projeto

| Status | Descrição |
|--------|-----------|
| `pending_contract` | Aguardando contrato |
| `onboarding` | Contrato assinado, setup inicial |
| `in_progress` | Desenvolvimento ativo |
| `review` | Em revisão com cliente |
| `delivered` | Entregue |
| `paused` | Pausado |

## Diagrama do fluxo

```
Lead → Proposta (time) → Cliente aceita?
                              │
                    Não ──────┴────── Sim
                              │
                         Gera contrato
                              │
                         Envia (sent)
                              │
                         Cliente assina?
                              │
                    Não ──────┴────── Sim (signed)
                              │
                         Onboarding
                              │
                         Portal liberado
                              │
                    Projetos, links, notas
```

## Dados de exemplo (Firestore)

Para testar o portal, crie manualmente no Firebase Console:

**clients/{clientId}**
```json
{
  "email": "cliente@empresa.com",
  "name": "João Silva",
  "company": "Empresa XYZ",
  "createdAt": "2026-08-27T00:00:00.000Z",
  "onboardingComplete": true
}
```

**contracts/{contractId}**
```json
{
  "clientId": "<clientId>",
  "projectId": "<projectId>",
  "status": "signed",
  "title": "Contrato de desenvolvimento — App XYZ",
  "signedAt": "2026-08-27T00:00:00.000Z",
  "createdAt": "2026-08-20T00:00:00.000Z"
}
```

**projects/{projectId}**
```json
{
  "clientId": "<clientId>",
  "name": "App XYZ",
  "description": "Plataforma web para gestão de pedidos",
  "status": "in_progress",
  "leadDeveloperId": "dev1",
  "leadDeveloperName": "Gabriel",
  "teamDeveloperIds": ["dev1", "dev2"],
  "links": [
    { "id": "1", "label": "Staging", "url": "https://staging.example.com" }
  ],
  "notes": [
    {
      "id": "1",
      "content": "Sprint 1 concluída — módulo de login entregue.",
      "authorId": "dev1",
      "authorName": "Gabriel",
      "createdAt": "2026-08-26T00:00:00.000Z",
      "important": false
    }
  ],
  "createdAt": "2026-08-27T00:00:00.000Z",
  "updatedAt": "2026-08-27T00:00:00.000Z"
}
```

Crie também o usuário em **Authentication** com o mesmo e-mail do cliente.
