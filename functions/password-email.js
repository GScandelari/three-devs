const crypto = require("node:crypto");
const { escapeHtml, normalizeAppUrl } = require("./contract-email");

// Validade de cada tipo de link. Há no máximo um link ativo por usuário
// (passwordTokens/{uid}): gerar um novo substitui o anterior.
const PASSWORD_TOKEN_TTL_MS = {
  welcome: 72 * 60 * 60 * 1000,
  reset: 30 * 60 * 1000,
};

const MIN_PASSWORD_LENGTH = 6;

function createPasswordToken() {
  const token = crypto.randomBytes(32).toString("base64url");
  return { token, tokenHash: hashPasswordToken(token) };
}

// Só o hash fica no Firestore: quem lê o banco não consegue montar o link.
function hashPasswordToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

function isValidTokenFormat(token) {
  return /^[A-Za-z0-9_-]{43}$/.test(String(token ?? ""));
}

function buildPasswordLink(configuredAppUrl, token) {
  return `${normalizeAppUrl(configuredAppUrl)}/reset-password/?token=${encodeURIComponent(token)}`;
}

function emailLayout(content) {
  return `
    <div style="font-family:Arial,sans-serif;color:#172033;line-height:1.6;max-width:620px;margin:0 auto">
      <p style="color:#4f46e5;font-size:12px;font-weight:700;letter-spacing:1.4px">THREE DEVS</p>
      ${content}
      <p style="color:#64748b;font-size:13px">Atenciosamente,<br>Equipe Three Devs</p>
    </div>
  `;
}

function actionButton(url, label) {
  return `<p style="margin:28px 0"><a href="${escapeHtml(url)}" style="background:#4f46e5;color:#fff;text-decoration:none;border-radius:8px;padding:12px 18px;display:inline-block">${escapeHtml(label)}</a></p>
      <p style="color:#64748b;font-size:13px">Se o botão não funcionar, copie e cole este endereço no navegador:<br><span style="word-break:break-all">${escapeHtml(url)}</span></p>`;
}

function buildWelcomeEmailHtml({ name, link, appUrl }) {
  const loginUrl = `${normalizeAppUrl(appUrl)}/login/`;

  return emailLayout(`
      <h1 style="font-size:24px;line-height:1.25;margin:12px 0">Boas-vindas à Three Devs</h1>
      <p>Olá, ${escapeHtml(name)}.</p>
      <p>Sua conta de acesso à Three Devs foi criada. Para entrar pela primeira vez, defina sua senha no link abaixo.</p>
      ${actionButton(link, "Definir minha senha")}
      <p style="border-left:3px solid #f59e0b;background:#fffbeb;padding:12px 14px;font-size:14px">
        <strong>Importante:</strong> este link é válido por 72 horas. Depois desse prazo ele deixa de funcionar
        e você poderá usar a opção <strong>"Esqueci minha senha"</strong> na <a href="${escapeHtml(loginUrl)}" style="color:#4f46e5">tela de login</a>.
        Cada novo link solicitado substitui automaticamente qualquer link anterior que ainda esteja válido.
      </p>
  `);
}

function buildResetEmailHtml({ name, link }) {
  return emailLayout(`
      <h1 style="font-size:24px;line-height:1.25;margin:12px 0">Redefinição de senha</h1>
      <p>Olá${name ? `, ${escapeHtml(name)}` : ""}.</p>
      <p>Recebemos um pedido para redefinir a senha da sua conta na Three Devs. Use o link abaixo para escolher uma nova senha.</p>
      ${actionButton(link, "Redefinir minha senha")}
      <p style="font-size:14px">Este link é válido por 30 minutos e substitui qualquer link enviado anteriormente.
        Se você não fez este pedido, ignore este e-mail: sua senha atual continua a mesma.</p>
  `);
}

module.exports = {
  MIN_PASSWORD_LENGTH,
  PASSWORD_TOKEN_TTL_MS,
  buildPasswordLink,
  buildResetEmailHtml,
  buildWelcomeEmailHtml,
  createPasswordToken,
  hashPasswordToken,
  isValidTokenFormat,
};
