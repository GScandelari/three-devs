// Assinatura de contratos pelo gov.br (fluxo assistido). Veja
// docs/ASSINATURA-GOVBR.md. Regras puras, sem Firebase, para poder testar.

// Os arquivos passam pelas Cloud Functions (base64), cujo corpo da requisição
// tem limite; um PDF de contrato assinado tem poucos KB.
const MAX_SIGNED_PDF_BYTES = 10 * 1024 * 1024;

const SIGNATURE_FILE_NAMES = {
  client: "cliente-assinado.pdf",
  final: "final.pdf",
};

function signatureFilePath(contractId, kind) {
  const name = SIGNATURE_FILE_NAMES[kind];
  if (!name) throw new Error(`Tipo de arquivo desconhecido: ${kind}`);
  return `contracts/${contractId}/${name}`;
}

// Converte o base64 recebido do navegador e confere se é um PDF dentro do
// limite. Retorna { pdf } ou { problem } com a mensagem para o usuário.
function decodeSignedPdf(base64) {
  const text = String(base64 ?? "").trim();
  if (!text || !/^[A-Za-z0-9+/]+={0,2}$/.test(text)) {
    return { problem: "Arquivo inválido. Envie o PDF assinado." };
  }

  // Tamanho decodificado sem decodificar: 3 bytes a cada 4 caracteres.
  const approximateBytes = Math.floor((text.length * 3) / 4);
  if (approximateBytes > MAX_SIGNED_PDF_BYTES) {
    return { problem: "O arquivo passa de 10 MB." };
  }

  const pdf = Buffer.from(text, "base64");
  if (pdf.length === 0 || pdf.subarray(0, 5).toString("latin1") !== "%PDF-") {
    return { problem: "O arquivo não é um PDF." };
  }
  return { pdf };
}

// O cliente envia (ou reenvia) o PDF assinado enquanto o contrato está
// Enviado e a equipe ainda não anexou o arquivo final.
function getClientSubmitProblem(contract) {
  if (contract.status !== "sent") {
    return "Este contrato não está aguardando assinatura.";
  }
  if (contract.signature?.finalFile) {
    return "A assinatura deste contrato já está sendo finalizada pela equipe.";
  }
  return null;
}

// A equipe anexa o arquivo final (contra-assinado) depois de receber e
// conferir o arquivo do cliente.
function getFinalUploadProblem(contract) {
  if (contract.status !== "sent") {
    return "O contrato precisa estar com status Enviado.";
  }
  if (contract.signature?.status !== "received") {
    return "Ainda não há assinatura do cliente recebida para este contrato.";
  }
  return null;
}

// Cliente baixa o próprio arquivo e, depois de assinado, o final; a equipe,
// qualquer um que exista.
function getDownloadProblem(contract, kind, isDeveloper) {
  const file =
    kind === "client" ? contract.signature?.clientFile : contract.signature?.finalFile;
  if (!file) return "Arquivo não encontrado.";
  if (!isDeveloper && kind === "final" && contract.status !== "signed") {
    return "O contrato final fica disponível depois da assinatura.";
  }
  return null;
}

module.exports = {
  MAX_SIGNED_PDF_BYTES,
  decodeSignedPdf,
  getClientSubmitProblem,
  getDownloadProblem,
  getFinalUploadProblem,
  signatureFilePath,
};
