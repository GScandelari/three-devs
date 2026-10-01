const assert = require("node:assert/strict");
const test = require("node:test");
const {
  getContractValidationProblem,
  parseIsoDate,
} = require("./contract-validation");

const validContract = {
  template: {
    clientName: "Marina Oliveira",
    clientEmail: "marina@example.com",
    projectName: "Plataforma Aurora",
    servicesDescription: "Desenvolvimento de software sob medida",
    totalValue: "48.000,00",
    commencementDate: "2026-10-01",
    conclusionDate: "2027-01-31",
  },
};

test("aceita datas ISO reais, inclusive ano bissexto", () => {
  assert.equal(parseIsoDate("2028-02-29"), "2028-02-29");
  assert.equal(parseIsoDate("2027-02-29"), null);
  assert.equal(parseIsoDate("2026-13-01"), null);
});

test("aceita um contrato válido", () => {
  assert.equal(getContractValidationProblem(validContract), null);
});

test("lista campos obrigatórios ausentes", () => {
  const problem = getContractValidationProblem({ template: {} });
  assert.equal(problem.code, "failed-precondition");
  assert.match(problem.message, /nome do cliente/);
  assert.match(problem.message, /data de conclusão/);
});

test("rejeita e-mail inválido", () => {
  const problem = getContractValidationProblem({
    template: { ...validContract.template, clientEmail: "marina@localhost" },
  });
  assert.deepEqual(problem, {
    code: "invalid-argument",
    message: "E-mail do cliente inválido.",
  });
});

test("rejeita conclusão anterior ao início", () => {
  const problem = getContractValidationProblem({
    template: {
      ...validContract.template,
      commencementDate: "2026-10-02",
      conclusionDate: "2026-10-01",
    },
  });
  assert.deepEqual(problem, {
    code: "invalid-argument",
    message: "A data de conclusão não pode ser anterior à data de início.",
  });
});
