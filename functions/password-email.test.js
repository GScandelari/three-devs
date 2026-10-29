const assert = require("node:assert/strict");
const test = require("node:test");
const {
  PASSWORD_TOKEN_TTL_MS,
  buildPasswordLink,
  buildResetEmailHtml,
  buildWelcomeEmailHtml,
  createPasswordToken,
  hashPasswordToken,
  isValidTokenFormat,
} = require("./password-email");

test("validade: boas-vindas 72 horas, redefinição 30 minutos", () => {
  assert.equal(PASSWORD_TOKEN_TTL_MS.welcome, 72 * 60 * 60 * 1000);
  assert.equal(PASSWORD_TOKEN_TTL_MS.reset, 30 * 60 * 1000);
});

test("gera tokens únicos e guarda apenas o hash", () => {
  const a = createPasswordToken();
  const b = createPasswordToken();

  assert.notEqual(a.token, b.token);
  assert.ok(isValidTokenFormat(a.token));
  assert.equal(a.tokenHash, hashPasswordToken(a.token));
  assert.notEqual(a.tokenHash, a.token);
  assert.match(a.tokenHash, /^[0-9a-f]{64}$/);
});

test("rejeita tokens em formato inesperado", () => {
  assert.equal(isValidTokenFormat(""), false);
  assert.equal(isValidTokenFormat(undefined), false);
  assert.equal(isValidTokenFormat("abc"), false);
  assert.equal(isValidTokenFormat(`${"a".repeat(42)}$`), false);
});

test("monta o link de definição de senha sem barra dupla", () => {
  assert.equal(
    buildPasswordLink("https://three-devs.web.app/", "tok_en-1"),
    "https://three-devs.web.app/reset-password/?token=tok_en-1",
  );
});

test("e-mail de boas-vindas traz o link, a validade de 72h e a nota do 'Esqueci minha senha'", () => {
  const html = buildWelcomeEmailHtml({
    name: '<b>Ana</b>',
    link: "https://three-devs.web.app/reset-password/?token=x",
    appUrl: "https://three-devs.web.app",
  });

  assert.doesNotMatch(html, /<b>Ana<\/b>/);
  assert.match(html, /&lt;b&gt;Ana/);
  assert.match(html, /reset-password\/\?token=x/);
  assert.match(html, /72 horas/);
  assert.match(html, /Esqueci minha senha/);
  assert.match(html, /substitui automaticamente/);
  assert.match(html, /three-devs\.web\.app\/login\//);
});

test("e-mail de redefinição traz o link e a validade de 30 minutos", () => {
  const html = buildResetEmailHtml({
    name: "Ana",
    link: "https://three-devs.web.app/reset-password/?token=y",
  });

  assert.match(html, /reset-password\/\?token=y/);
  assert.match(html, /30 minutos/);
});
