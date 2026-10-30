const assert = require("node:assert/strict");
const test = require("node:test");
const {
  buildContractEmailHtml,
  buildReplyToField,
  makeIdempotencyKey,
  normalizeAppUrl,
} = require("./contract-email");

test("inclui reply_to só com um e-mail válido", () => {
  assert.deepEqual(buildReplyToField(" serifa.labs@gmail.com "), {
    reply_to: "serifa.labs@gmail.com",
  });
  assert.deepEqual(buildReplyToField(""), {});
  assert.deepEqual(buildReplyToField(undefined), {});
  assert.deepEqual(buildReplyToField("não é e-mail"), {});
  assert.deepEqual(buildReplyToField("Nome <a@b.com>"), {});
});

test("normaliza a URL pública sem criar barra dupla", () => {
  assert.equal(normalizeAppUrl("https://serifalabs.com///"), "https://serifalabs.com");
});

test("escapa dados do contrato no HTML do e-mail", () => {
  const html = buildContractEmailHtml(
    {
      template: {
        clientName: '<script>alert("x")</script>',
        projectName: "Site & App",
      },
    },
    "https://serifalabs.com/",
  );

  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /Site &amp; App/);
  assert.match(html, /https:\/\/serifalabs\.com\/login\//);
});

test("gera chave de idempotência por tentativa de envio", () => {
  assert.equal(
    makeIdempotencyKey("contract-1", "request_12345678"),
    "contract-email/contract-1/request_12345678",
  );
  assert.equal(makeIdempotencyKey("contract-1", "curta"), null);
});
