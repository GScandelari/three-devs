const assert = require("node:assert/strict");
const test = require("node:test");
const { buildContractPdf, formatDate, safeFilename } = require("./contract-pdf");

const template = {
  agencyName: "Three Devs",
  agencyDocument: "12.345.678/0001-90",
  agencyEmail: "contato@three-devs.com",
  clientName: "Marina Oliveira",
  clientDocument: "123.456.789-00",
  clientEmail: "marina@example.com",
  clientCompany: "Aurora Tecnologia Ltda.",
  commencementDate: "2026-10-01",
  conclusionDate: "2027-01-31",
  projectName: "Plataforma Aurora",
  servicesDescription: "desenvolvimento de software sob medida",
  packageName: "Desenvolvimento Sob Medida",
  deliverable1: "Planejamento e escopo técnico",
  deliverable2: "Desenvolvimento e testes",
  deliverable3: "Acompanhamento pelo portal",
  monthlyHours: "80",
  revisionRounds: "2",
  totalValue: "48.000,00",
  paymentMethod: "PIX",
  paymentInstallments: "4 parcelas mensais",
  retainerValue: "12.000,00",
  termMonths: "4",
  noticeDays: "15",
  jurisdiction: "São Paulo - SP",
  leadDeveloperName: "Giovanni Scandelari",
};

test("formata datas brasileiras sem deslocamento de fuso", () => {
  assert.equal(formatDate("2026-10-01"), "01/10/2026");
  assert.equal(formatDate("data livre"), "data livre");
});

test("cria um nome de arquivo seguro e estável", () => {
  assert.equal(
    safeFilename("Contrato de Prestação de Serviços - Aurora"),
    "contrato-de-prestacao-de-servicos-aurora.pdf",
  );
});

test("gera um PDF A4 válido com o contrato", async () => {
  const pdf = await buildContractPdf({
    title: "Contrato de Prestação de Serviços - Plataforma Aurora",
    template,
  });

  assert.ok(Buffer.isBuffer(pdf));
  assert.equal(pdf.subarray(0, 5).toString("ascii"), "%PDF-");
  assert.ok(pdf.length > 5_000);
});
