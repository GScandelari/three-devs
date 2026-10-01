const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseIsoDate(value) {
  const normalized = String(value ?? "").trim();
  const match = ISO_DATE_PATTERN.exec(normalized);
  if (!match) return null;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return normalized;
}

function getContractValidationProblem(contract) {
  if (!contract) {
    return { code: "not-found", message: "Contrato não encontrado." };
  }

  const template = contract.template || {};
  const requiredFields = [
    ["clientName", "nome do cliente"],
    ["clientEmail", "e-mail do cliente"],
    ["projectName", "nome do projeto"],
    ["servicesDescription", "descrição dos serviços"],
    ["totalValue", "valor total"],
    ["commencementDate", "data de início"],
    ["conclusionDate", "data de conclusão"],
  ];
  const missing = requiredFields
    .filter(([key]) => !String(template[key] ?? "").trim())
    .map(([, label]) => label);

  if (missing.length) {
    return {
      code: "failed-precondition",
      message: `Preencha antes de gerar: ${missing.join(", ")}.`,
    };
  }

  if (!EMAIL_PATTERN.test(String(template.clientEmail).trim())) {
    return { code: "invalid-argument", message: "E-mail do cliente inválido." };
  }

  const commencementDate = parseIsoDate(template.commencementDate);
  if (!commencementDate) {
    return { code: "invalid-argument", message: "Data de início inválida." };
  }

  const conclusionDate = parseIsoDate(template.conclusionDate);
  if (!conclusionDate) {
    return { code: "invalid-argument", message: "Data de conclusão inválida." };
  }

  if (conclusionDate < commencementDate) {
    return {
      code: "invalid-argument",
      message: "A data de conclusão não pode ser anterior à data de início.",
    };
  }

  return null;
}

module.exports = {
  getContractValidationProblem,
  parseIsoDate,
};
