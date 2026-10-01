const assert = require("node:assert/strict");
const test = require("node:test");
const {
  buildContractEmailHtml,
  makeIdempotencyKey,
  normalizeAppUrl,
} = require("./contract-email");

test("normaliza a URL pública sem criar barra dupla", () => {
  assert.equal(normalizeAppUrl("https://three-devs.web.app///"), "https://three-devs.web.app");
});

test("escapa dados do contrato no HTML do e-mail", () => {
  const html = buildContractEmailHtml(
    {
      template: {
        clientName: '<script>alert("x")</script>',
        projectName: "Site & App",
      },
    },
    "https://three-devs.web.app/",
  );

  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /Site &amp; App/);
  assert.match(html, /https:\/\/three-devs\.web\.app\/login\//);
});

test("gera chave de idempotência por tentativa de envio", () => {
  assert.equal(
    makeIdempotencyKey("contract-1", "request_12345678"),
    "contract-email/contract-1/request_12345678",
  );
  assert.equal(makeIdempotencyKey("contract-1", "curta"), null);
});
