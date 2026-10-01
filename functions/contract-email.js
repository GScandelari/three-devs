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
      <p>Revise o documento e responda este e-mail caso tenha alguma dúvida. O acesso ao portal será liberado depois que a assinatura for confirmada.</p>
      <p style="margin:28px 0"><a href="${escapeHtml(loginUrl)}" style="background:#4f46e5;color:#fff;text-decoration:none;border-radius:8px;padding:12px 18px;display:inline-block">Acessar a Three Devs</a></p>
      <p style="color:#64748b;font-size:13px">Atenciosamente,<br>Equipe Three Devs</p>
    </div>
  `;
}

module.exports = {
  buildContractEmailHtml,
  escapeHtml,
  makeIdempotencyKey,
  normalizeAppUrl,
};
