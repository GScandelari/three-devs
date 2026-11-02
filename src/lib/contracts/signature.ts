import type { Contract, ContractSignatureStatus } from "@/lib/types";

// Fluxo de assinatura gov.br assistida: veja docs/ASSINATURA-GOVBR.md.

// Mesmo limite das Cloud Functions (functions/contract-signature.js).
export const MAX_SIGNED_PDF_BYTES = 10 * 1024 * 1024;

// Assinador do ITI (pede o login gov.br) e página de ajuda do governo.
export const GOVBR_SIGNER_URL = "https://assinador.iti.br/";
export const GOVBR_HELP_URL =
  "https://www.gov.br/governodigital/pt-br/identidade/assinatura-eletronica";
export const ITI_VALIDATOR_URL = "https://validar.iti.gov.br/";

// Motivos de recusa oferecidos à equipe; o texto escolhido aparece ao cliente.
export const REJECTION_REASONS = [
  "O arquivo não tem assinatura gov.br (por exemplo, foi impresso e escaneado).",
  "O documento foi alterado depois de assinado.",
  "O signatário não é o cliente do contrato.",
  "O arquivo não corresponde à versão atual do contrato.",
];

export function getSignatureStatus(contract: Contract): ContractSignatureStatus {
  return contract.signature?.status ?? "awaiting";
}

export function hasSignatureToReview(contract: Contract): boolean {
  return (
    contract.status === "sent" &&
    contract.signature?.status === "received" &&
    !contract.signature.finalFile
  );
}

// "Marcar assinado" só com o PDF final (contra-assinado) anexado.
export function canMarkSigned(contract: Contract): boolean {
  return contract.status === "sent" && Boolean(contract.signature?.finalFile);
}
