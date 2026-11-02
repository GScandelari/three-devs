const assert = require("node:assert/strict");
const test = require("node:test");
const {
  MAX_SIGNED_PDF_BYTES,
  decodeSignedPdf,
  getClientSubmitProblem,
  getDownloadProblem,
  getFinalUploadProblem,
  signatureFilePath,
} = require("./contract-signature");

const pdfBase64 = Buffer.from("%PDF-1.7\nconteúdo assinado").toString("base64");

test("caminhos dos arquivos de assinatura por contrato", () => {
  assert.equal(signatureFilePath("k1", "client"), "contracts/k1/cliente-assinado.pdf");
  assert.equal(signatureFilePath("k1", "final"), "contracts/k1/final.pdf");
  assert.throws(() => signatureFilePath("k1", "outro"));
});

test("aceita PDF em base64", () => {
  const { pdf, problem } = decodeSignedPdf(pdfBase64);
  assert.equal(problem, undefined);
  assert.equal(pdf.subarray(0, 5).toString("latin1"), "%PDF-");
});

test("recusa arquivo vazio, base64 inválido e o que não é PDF", () => {
  assert.ok(decodeSignedPdf("").problem);
  assert.ok(decodeSignedPdf(undefined).problem);
  assert.ok(decodeSignedPdf("não é base64!").problem);
  const png = Buffer.from("\x89PNG\r\n\x1a\n...", "latin1").toString("base64");
  assert.match(decodeSignedPdf(png).problem, /não é um PDF/);
});

test("recusa arquivo acima de 10 MB sem decodificar", () => {
  const tooBig = "A".repeat(Math.ceil(((MAX_SIGNED_PDF_BYTES + 3) * 4) / 3));
  assert.match(decodeSignedPdf(tooBig).problem, /10 MB/);
});

test("cliente só envia com o contrato Enviado e sem arquivo final", () => {
  assert.equal(getClientSubmitProblem({ status: "sent" }), null);
  assert.equal(
    getClientSubmitProblem({ status: "sent", signature: { status: "rejected" } }),
    null,
  );
  assert.ok(getClientSubmitProblem({ status: "draft" }));
  assert.ok(getClientSubmitProblem({ status: "signed" }));
  assert.ok(
    getClientSubmitProblem({
      status: "sent",
      signature: { status: "received", finalFile: { path: "x" } },
    }),
  );
});

test("arquivo final exige assinatura do cliente recebida", () => {
  assert.equal(
    getFinalUploadProblem({ status: "sent", signature: { status: "received" } }),
    null,
  );
  assert.ok(getFinalUploadProblem({ status: "sent" }));
  assert.ok(getFinalUploadProblem({ status: "sent", signature: { status: "rejected" } }));
  assert.ok(getFinalUploadProblem({ status: "signed", signature: { status: "received" } }));
});

test("cliente só baixa o arquivo final depois de assinado; equipe baixa sempre", () => {
  const sent = {
    status: "sent",
    signature: { clientFile: { path: "a" }, finalFile: { path: "b" } },
  };
  assert.equal(getDownloadProblem(sent, "client", false), null);
  assert.ok(getDownloadProblem(sent, "final", false));
  assert.equal(getDownloadProblem(sent, "final", true), null);
  assert.equal(getDownloadProblem({ ...sent, status: "signed" }, "final", false), null);
  assert.ok(getDownloadProblem({ status: "sent" }, "client", true));
});
