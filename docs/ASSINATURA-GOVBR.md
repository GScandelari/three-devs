# Assinatura de contratos pelo gov.br (fluxo assistido)

**Status:** Fase 0 concluída (02/11/2026); Fase 1 implementada, aguardando teste de ponta a ponta. **Decidido em:** 31/10/2026.

Este documento descreve como os contratos serão assinados pelo gov.br e o que
precisa ser construído. Ele é a referência para implementar o item: siga as
fases na ordem e marque os checklists conforme avançar.

## Resumo

O cliente assina o PDF do contrato no **assinador do gov.br**, com a própria
conta gov.br, e envia o arquivo assinado pelo **portal**. A equipe confere a
assinatura no **validador oficial do ITI**, a Serifa Labs **contra-assina o
mesmo arquivo** e o contrato é marcado como **assinado**. A partir daí o
projeto é liberado no portal, como já acontece hoje.

É um fluxo **assistido**: a assinatura acontece no site do governo, e a
conferência é feita por uma pessoa da equipe. Não há integração automática.

## Por que assim

| Opção | Situação | Decisão |
|---|---|---|
| API de assinatura gov.br | As credenciais só são liberadas a **órgãos públicos**: exige pedido de um gestor público, integração com o Login Único e site em domínio oficial do governo (`gov.br`, `jus.br` etc.). Empresas privadas não têm acesso. | Inviável |
| DocuSign | Tem API completa e fluxo automático, mas cobra plano de produção em dólar. | Adiado: pode substituir este fluxo se o volume crescer |
| **gov.br assistido** | Gratuito, sem conta em plataforma terceira e aproveita o que já existe (PDF, "Marcar assinado", liberação do projeto, sininho). | **Escolhido** |

## Critérios

### Quem assina (cliente e representante da Serifa Labs)

- Ter **conta gov.br nível prata ou ouro**. Conta bronze não assina.
  - Prata: reconhecimento facial com a CNH ou validação por banco credenciado.
  - Ouro: biometria da Justiça Eleitoral, QR Code da Carteira de Identidade
    Nacional ou certificado ICP-Brasil.
- Assinar pelo portal de assinatura do gov.br ou pelo app gov.br.

### O documento

- O arquivo assinado é **o PDF exatamente como foi enviado** pelo sistema.
  Qualquer alteração depois da assinatura a invalida.
- **Nada de imprimir e escanear.** A assinatura é digital e só existe dentro do
  arquivo PDF devolvido pelo assinador.
- Se o conteúdo do contrato mudar, gera-se **um PDF novo**, e todas as partes
  assinam de novo. Um arquivo assinado nunca é reaproveitado para outra versão.

### A conferência

- Todo arquivo recebido passa pelo **validador do ITI** (`validar.iti.gov.br`
  ou app VALIDAR) antes de o contrato ser marcado como assinado.
- O validador precisa mostrar:
  - assinatura **válida**;
  - **documento não modificado** depois da assinatura;
  - signatário com **nome e CPF do cliente** do contrato (o mesmo do cadastro em
    "Meus dados").
- Se qualquer item falhar, o arquivo é **recusado com um motivo**, e o cliente
  envia de novo (veja [Recusa](#recusa-arquivo-inválido)).

### Pontos jurídicos (antes de usar com contratos reais)

- [ ] Confirmar com um advogado que a **assinatura avançada gov.br** atende aos
      contratos da Serifa Labs. Alguns usos exigem assinatura qualificada (ICP-Brasil).
- [ ] Definir **quem assina pela prestadora** e em nome de quem a Serifa Labs
      contrata. A assinatura gov.br é sempre de uma pessoa (CPF), e o CNPJ ainda
      não existe (veja a pendência 7 em `PENDENCIAS-TECNICAS.md`).

## O fluxo

```
 Equipe (admin)                 Cliente (portal)               gov.br / ITI
 ──────────────                 ────────────────               ────────────
 1. Cria e envia o contrato ──▶ 2. Recebe o aviso e baixa
    (status: Enviado)              o PDF no portal
                                3. Assina o PDF ───────────────▶ Assinador gov.br
                                   ◀── PDF assinado ────────────
                                4. Envia o PDF assinado
                                   (assinatura: Recebida)
 5. Baixa o arquivo e confere ─────────────────────────────────▶ Validador ITI
      │
      ├─ inválido ─▶ 6a. Recusa com motivo ─▶ cliente vê o motivo
      │                  (assinatura: Recusada)  e volta ao passo 3
      │
      └─ válido ──▶ 6b. Representante da Serifa contra-assina ─▶ Assinador gov.br
                        o mesmo arquivo
                    7. Confere de novo as duas assinaturas ────▶ Validador ITI
                    8. Envia o arquivo final e "Marcar assinado"
                       (status: Assinado)
                          │
                          ▼
                    Projeto liberado + aviso no sininho
                    + PDF final disponível no portal
```

### Passo a passo

| # | Quem | O quê | Resultado no sistema |
|---|---|---|---|
| 1 | Equipe | Cria o contrato e clica em **Enviar por e-mail** (já existe). | Status **Enviado**; o contrato aparece no portal como "Aguardando assinatura". |
| 2 | Cliente | Abre **Portal → Contrato**, lê as instruções e clica em **Baixar PDF para assinar**. | Nenhuma mudança. |
| 3 | Cliente | Assina o PDF no assinador gov.br e baixa o arquivo assinado. | Fora do sistema. |
| 4 | Cliente | Volta ao contrato e clica em **Enviar PDF assinado**. | Arquivo guardado; assinatura **Recebida**; selo "Assinatura recebida" no admin. |
| 5 | Equipe | Em **Admin → Contrato**, baixa o arquivo e confere no validador do ITI pelo link da tela. | Nenhuma mudança. |
| 6a | Equipe | Se inválido: **Recusar assinatura**, com o motivo. | Assinatura **Recusada**; o cliente vê o motivo no contrato e recebe um aviso no sininho. |
| 6b | Equipe | Se válido: o representante da Serifa contra-assina **o mesmo arquivo** no gov.br. | Fora do sistema. |
| 7 | Equipe | Confere no validador que as **duas** assinaturas aparecem válidas. | Nenhuma mudança. |
| 8 | Equipe | Envia o arquivo final e clica em **Marcar assinado**, que só fica habilitado depois disso. | Status **Assinado**; projeto liberado; aviso "Contrato assinado" no sininho (já existe); PDF final disponível no portal. |

### Recusa (arquivo inválido)

Motivos mais comuns, que a tela de recusa deve oferecer como opções, além de
texto livre:

- o arquivo não tem assinatura gov.br (por exemplo, foi impresso e escaneado);
- o documento foi alterado depois de assinado;
- o signatário não é o cliente do contrato;
- o arquivo não corresponde à versão atual do contrato.

Depois de uma recusa, o cliente pode enviar um novo arquivo, que substitui o
anterior. O histórico guarda a data e o motivo de cada recusa.

### Se o contrato mudar no meio do caminho

Editar o contrato depois do envio **descarta** a assinatura recebida. O
arquivo antigo fica no histórico, a assinatura volta a **Aguardando** e o
cliente precisa baixar e assinar o PDF novo. A tela de edição deve avisar isso
antes de salvar.

## O que construir

### Dados (`contracts/{contractId}`)

Campos novos, sem mudar os status atuais (`draft`, `sent`, `signed`, `cancelled`):

```ts
signature?: {
  status: "awaiting" | "received" | "rejected";
  clientFile?: { path: string; uploadedAt: string; size: number };
  rejection?: { reason: string; rejectedAt: string; rejectedBy: string };
  finalFile?: { path: string; uploadedAt: string };
  history: Array<{ event: "received" | "rejected" | "reset"; at: string; detail?: string }>;
};
```

- Sem `signature`, a assinatura está **aguardando**. **Marcar assinado** grava
  o status `signed`, como antes, e exige `finalFile`.
- O cliente **não grava** em `contracts` diretamente (regra do Firestore, com
  teste). O envio e o registro acontecem juntos na function
  `submitClientSignature`.

### Arquivos (Firebase Storage)

| Caminho | Gravado por | Baixado por |
|---|---|---|
| `contracts/{contractId}/cliente-assinado.pdf` | Cliente dono do contrato, via `submitClientSignature`, só com o status **Enviado** e sem arquivo final | Equipe e o próprio cliente |
| `contracts/{contractId}/final.pdf` | Equipe, via `uploadFinalSignedContract`, depois de uma assinatura **Recebida** | Equipe sempre; o cliente, depois de **Assinado** |

**Ajuste em relação ao planejamento:** os arquivos passam pelas **Cloud
Functions** (`functions/contract-signature.js` e `functions/index.js`), não
por upload direto do navegador. O Storage fica fechado ao navegador
(`storage.rules` nega tudo), e a checagem de dono do contrato fica num lugar
só, a mesma das regras do Firestore (e-mail do login igual ao do cadastro do
cliente). Assim as regras do Storage não precisam consultar o Firestore, o que
exigiria uma permissão a mais no projeto. Consequências:

- limite de **10 MB** por arquivo (corpo da requisição das functions), e não
  20 MB; um PDF de contrato assinado tem poucos KB;
- o servidor confere se o arquivo começa com `%PDF-`;
- reenviar substitui o arquivo anterior, e o `history` registra cada envio e
  cada recusa.

O `storage.rules` entra no deploy do CI (`--only firestore,storage,functions`).
O bucket (`three-devs.firebasestorage.app`, região `us-central1`) está fixo no
`firebase.json`: com ele explícito, a CLI não consulta o "bucket padrão" do
projeto, consulta que devolve 404 para a conta de serviço do CI mesmo com o
papel Cloud Storage for Firebase Admin. As functions usam o mesmo bucket (é o
`storageBucket` da configuração do Admin SDK do projeto).

### Telas

**Portal → Contrato** (`/portal/contract`):

- Bloco **"Como assinar com gov.br"** com os critérios para o cliente: conta
  prata ou ouro, assinar o PDF baixado daqui, não imprimir nem escanear, enviar
  o arquivo que o assinador devolve. Inclui link para o assinador gov.br.
- **Baixar PDF para assinar**.
- **Enviar PDF assinado**: aceita só PDF de até 10 MB e mostra o progresso.
- Situação da assinatura: *Aguardando seu envio*, *Recebida, em conferência*
  ou *Recusada*, com o motivo e a opção de reenviar.
- Depois de **Assinado**: **Baixar contrato assinado** (arquivo final).

**Admin → Contratos** (lista): selo **"Assinatura recebida"** nos contratos com
arquivo para conferir.

**Admin → Contrato** (`/admin/contract`):

- Seção **Assinatura** com: baixar o arquivo do cliente, link para o validador
  do ITI, checklist de conferência (assinatura válida, documento não
  modificado, signatário é o cliente), **Recusar assinatura** (com motivo),
  **Enviar arquivo final** (já contra-assinado) e **Marcar assinado**,
  habilitado só com o arquivo final.

### Avisos no sininho do cliente

| Evento | Aviso |
|---|---|
| Assinatura recusada | "Assinatura do contrato recusada: veja o motivo" (tipo novo, `contract_signature_rejected`) |
| Contrato assinado | Já existe (`contract_signed`) |

O tipo novo precisa entrar na lista permitida das regras de `notifications`.

### Cloud Functions

- `submitClientSignature({ contractId, pdfBase64 })`: o cliente envia o PDF
  assinado. Confere o dono, o status **Enviado**, a ausência de arquivo final e
  o PDF; grava o arquivo e `signature.status = "received"`.
- `uploadFinalSignedContract({ contractId, pdfBase64 })`: só equipe; exige
  assinatura **Recebida**; grava `final.pdf` e `signature.finalFile`.
- `downloadSignedContract({ contractId, kind })`: devolve o PDF do cliente ou
  o final, conforme as permissões da tabela acima.
- `generateContractPdf` passou a atender também o cliente dono do contrato
  (status Enviado ou Assinado), para o botão "Baixar PDF para assinar".
- A **recusa** é feita pelo app (`rejectClientSignature` em
  `src/lib/firebase/firestore.ts`), numa transação com o aviso ao cliente.
- **"Marcar assinado"** (`updateContractStatus`) recusa a transição para
  Assinado sem `signature.finalFile`.

## Fases

### Fase 0: piloto manual (sem código)

Responde à única dúvida técnica que pode mudar o desenho: o assinador gov.br
aceita uma **segunda assinatura** num PDF já assinado?

- [x] Gerar o PDF de um contrato de teste (Admin → Contrato → Baixar PDF).
- [x] Pessoa A assina no gov.br e baixa o arquivo.
- [x] Pessoa B assina **o arquivo já assinado** por A.
- [x] Conferir no validador do ITI se as duas assinaturas aparecem válidas.
- [x] Registrar o resultado aqui.

**Resultado (02/11/2026):** o validador do ITI aceitou o PDF com as duas
assinaturas. O fluxo segue como planejado: um único arquivo, assinado pelo
cliente e contra-assinado pela Serifa Labs.

Se a segunda assinatura **não** funcionar, os passos 6b a 8 mudam: cada parte
assina a própria via, e o sistema guarda dois arquivos finais.

### Fase 1: fluxo principal

- [x] `storage.rules` (nega tudo ao navegador) no `firebase.json` e no deploy do CI.
- [ ] Firebase Storage ativo no projeto (confirmado pela validação do CI).
- [x] Campos `signature` em `contracts` (tipos em `src/lib/types`).
- [x] Functions `submitClientSignature`, `uploadFinalSignedContract` e
      `downloadSignedContract`, com testes das regras em `contract-signature.test.js`.
- [x] Portal: instruções, baixar PDF, enviar PDF assinado e situação da assinatura.
- [x] Admin: selo na lista, seção Assinatura com checklist de conferência, recusa
      com motivo, arquivo final e "Marcar assinado" exigindo o arquivo final.
- [x] Aviso de recusa no sininho (tipo novo nas regras de `notifications`, com teste).
- [x] Edição do contrato depois do envio descarta a assinatura, com confirmação
      antes; "Baixar PDF" e "Enviar por e-mail" sem mudança de conteúdo não descartam.
- [x] E-mail do contrato explica como assinar pelo portal.
- [x] Atualizar `docs/FLUXO.md` (estados do contrato e avisos).
- [ ] Teste de ponta a ponta em produção (critério abaixo).

**Pronto quando:** um contrato de teste percorre os passos 1 a 8, inclusive uma
recusa e um reenvio, e termina com o projeto liberado e o PDF final baixável no
portal.

### Fase 2: melhorias

- [ ] Avisar a equipe por e-mail quando chegar uma assinatura (depende da
      pendência 1, do remetente dos e-mails).
- [ ] Lembrete ao cliente quando o contrato estiver há vários dias sem assinatura.

## Fora do escopo

- Validação automática da assinatura: não há API oficial do ITI para isso, e a
  conferência fica com a equipe.
- Assinatura dentro do portal: só seria possível com uma plataforma como o
  DocuSign.
- Assinatura qualificada (certificado ICP-Brasil): o assinador gov.br gera
  assinatura **avançada**.

## Referências

- [Roteiro de integração da API de assinatura gov.br](https://manual-integracao-assinatura-eletronica.servicos.gov.br/pt-br/latest/) (por que a API não serve)
- [Manual de assinatura eletrônica — Governo do RS](https://www.rs.gov.br/upload/arquivos/202305/02160320-manual-de-assinatura-eletronica.pdf) (formatos e limite de 100 MB)
- [UFPB — tipos de conta gov.br](https://conhecimento.sti.ufpb.br/index.php/books/assinatura-digital-govbr/page/tipos-de-conta/export/pdf) (prata e ouro)
- [Cartilha de uso do Validar ITI](https://h-validar.iti.gov.br/Docs/cartilha-de-uso.pdf) (conferência)
- Lei 14.063/2020 e MP 2.200-2/2001: tipos de assinatura eletrônica (confirmar com o advogado)
