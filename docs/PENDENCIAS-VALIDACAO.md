# Pendências de validação — landing Serifa Labs

O que o time precisa confirmar ou providenciar. Nada aqui foi inventado: dado
ausente fica `null` em `src/config/site.ts` e a página omite o bloco.

## Antes do merge

- [ ] **Criar a caixa `contato@serifalabs.com`** (ou um redirecionamento) na
  Hostinger. Hoje `serifalabs.com` não tem registro MX; sem isso, todos os
  botões de contato da página levam a um endereço que não recebe e-mail.
  (O endereço antigo, `contato@three-devs.com`, usava um domínio que não
  existe.) Passo a passo: hPanel da Hostinger → E-mails → criar a conta
  `contato` no domínio `serifalabs.com`. Como o DNS do domínio já está na
  Hostinger, ela costuma adicionar os registros MX sozinha; confira em
  Domínios → DNS se aparecem os MX indicados pela própria Hostinger. Enquanto a
  caixa não existe, o WhatsApp é o canal principal da página.
- [x] **WhatsApp:** (13) 99664-9260, confirmado em 17/11/2026. É o canal
  principal da página enquanto o e-mail não existe.
- [ ] **Assinatura pelo gov.br:** a página e o login citam a assinatura do
  contrato pelo gov.br. `docs/ASSINATURA-GOVBR.md` diz que a Fase 1 aguarda
  teste de ponta a ponta. Confirme que o fluxo está pronto para ser anunciado.
- [ ] **Nome nos contratos:** o modelo de contrato e o PDF agora usam "Serifa
  Labs" como prestadora. Confirme que esse é o nome que deve constar (razão
  social ou nome fantasia) e preencha o CNPJ quando existir
  (`AGENCY_DOCUMENT` em `src/lib/contracts/template.ts`).

## Depois, para melhorar a página

- [ ] Imagem de compartilhamento (Open Graph, 1200×630) com a marca.
- [ ] Prova real, se houver e com autorização: projetos entregues, logos de
  clientes, depoimentos. Sem isso, a página não tem seção de prova (por regra).
- [ ] Fotos reais da equipe, se quiserem uma seção "quem faz".
- [ ] Remetente dos e-mails transacionais: a variável `CONTRACT_EMAIL_FROM` do
  repositório ainda pode estar como "Three Devs <...>"; atualize para
  "Serifa Labs <...>" em Settings → Secrets and variables → Actions.

## Mantido de propósito com o nome antigo

Identificadores de infraestrutura que não aparecem para o cliente: projeto
Firebase `three-devs`, bucket `three-devs.firebasestorage.app`, domínios
`three-devs.web.app`/`.firebaseapp.com`, repositório `GScandelari/three-devs`,
projeto de testes `demo-three-devs` e as chaves internas de sessão
`threeDevs:*` no navegador. Renomeá-los exige migração e não muda nada na tela.
