import type { Client } from "@/lib/types";

// Dados do cliente exigidos para a confecção do contrato. A empresa é opcional
// (pessoa física) e o e-mail sempre existe, porque é o login.
export function getMissingClientFields(client: Client): string[] {
  const missing: string[] = [];
  if (!client.name?.trim()) missing.push("nome");
  if (!client.document?.trim()) missing.push("CPF/CNPJ");
  return missing;
}
