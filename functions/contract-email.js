function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeAppUrl(value) {
  return String(value ?? "").trim().replace(/\/+$/, "");
}

// Campo reply_to da Resend: as respostas do cliente vão para este endereço em
// vez do remetente. Vazio ou inválido: o campo é omitido e as respostas vão
// para o remetente.
function buildReplyToField(value) {
  const replyTo = String(value ?? "").trim();
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(replyTo)) return {};
  return { reply_to: replyTo };
}

function makeIdempotencyKey(contractId, requestId) {
  const normalizedRequestId = String(requestId ?? "").trim();
  if (!/^[a-zA-Z0-9_-]{8,128}$/.test(normalizedRequestId)) return null;
  return `contract-email/${contractId}/${normalizedRequestId}`;
}

function buildContractEmailHtml(contract, configuredAppUrl) {
  const template = contract.template || {};
  const loginUrl = `${normalizeAppUrl(configuredAppUrl)}/login/`;

  return `
    <div style="font-family:Arial,sans-serif;color:#172033;line-height:1.6;max-width:620px;margin:0 auto">
      <p style="color:#4f46e5;font-size:12px;font-weight:700;letter-spacing:1.4px">THREE DEVS</p>
      <h1 style="font-size:24px;line-height:1.25;margin:12px 0">Seu contrato está pronto</h1>
      <p>Olá, ${escapeHtml(template.clientName)}.</p>
      <p>Segue em anexo o contrato de prestação de serviços referente ao projeto <strong>${escapeHtml(template.projectName)}</strong>.</p>
      <p>Revise o documento e responda este e-mail caso tenha alguma dúvida.</p>
      <p><strong>Para assinar:</strong> entre no portal, abra o contrato e siga as instruções de <strong>Assinar com gov.br</strong>. Você vai precisar de uma conta gov.br nível prata ou ouro. Assine o PDF baixado do portal (não imprima nem escaneie) e envie o arquivo assinado pelo próprio portal. O projeto é liberado depois que a equipe conferir a assinatura.</p>
      <p style="margin:28px 0"><a href="${escapeHtml(loginUrl)}" style="background:#4f46e5;color:#fff;text-decoration:none;border-radius:8px;padding:12px 18px;display:inline-block">Acessar o portal</a></p>
      <p style="color:#64748b;font-size:13px">Atenciosamente,<br>Equipe Three Devs</p>
    </div>
  `;
}

module.exports = {
  buildContractEmailHtml,
  buildReplyToField,
  escapeHtml,
  makeIdempotencyKey,
  normalizeAppUrl,
};
