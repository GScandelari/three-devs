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

## Avisos ao cliente (portal)

O cliente é avisado **dentro do portal**: um sininho no cabeçalho mostra a
quantidade de avisos novos e abre a lista dos 20 mais recentes. Não há envio de
e-mail nem de mensagens externas. Os avisos são temporários: somem ao serem
visualizados ou, se não forem, 3 dias após a criação.

| Acontecimento | Onde é gerado | Quando avisa |
|---------------|---------------|--------------|
| Mudança de status do projeto | Admin → Projeto | Se "Avisar o cliente" estiver marcado (padrão: marcado) |
| Nova nota | Admin → Projeto | Se "Avisar o cliente" estiver marcado (padrão: marcado) |
| Novo link | Admin → Projeto | Se "Avisar o cliente" estiver marcado (padrão: marcado) |
| Contrato assinado | Admin → Contratos | Sempre |

Regras de funcionamento:

- O aviso é gravado na mesma transação da alteração que o originou: ou os dois
  são salvos, ou nenhum. A transação relê o documento antes de gravar, então
  clique duplo ou dois devs salvando ao mesmo tempo não geram aviso repetido.
- Clicar no status que já está ativo não grava nem avisa.
- **Visualizado = clicado:** clicar num aviso leva ao projeto (ou ao contrato) e
  exclui o aviso. "Limpar avisos" exclui todos de uma vez. Só abrir o sininho
  não exclui nada.
- **Não visualizado = apagado após 3 dias:** cada aviso tem uma validade
  (`expiresAt`, criação + 3 dias). A política de TTL do Firestore apaga os
  vencidos (a exclusão pode levar algumas horas depois do vencimento); o portal
  já esconde o aviso assim que ele vence. Veja a configuração do TTL no README.
- A lista é recarregada ao entrar no portal, ao trocar de página e ao abrir o
  sininho (não é em tempo real).
- Não há histórico: depois de excluído, o aviso não existe mais para ninguém.

Cada aviso é um documento em `notifications/{notificationId}`:

```json
{
  "clientId": "<clientId>",
  "type": "project_status",
  "title": "App XYZ: status alterado para Em revisão",
  "projectId": "<projectId>",
  "createdAt": "2026-09-30T00:00:00.000Z",
  "expiresAt": "<Timestamp: 2026-10-03T00:00:00.000Z>"
}
```

`type` é um de `project_status`, `project_note`, `project_link` ou
`contract_signed` (este usa `contractId` no lugar de `projectId`). `expiresAt`
é um campo do tipo Timestamp (exigido pelo TTL do Firestore).

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
