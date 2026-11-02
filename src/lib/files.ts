// Baixa no navegador um PDF recebido em base64 das Cloud Functions.
export function downloadBase64Pdf(pdfBase64: string, filename: string) {
  const binary = window.atob(pdfBase64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// Lê um arquivo escolhido pelo usuário como base64 (sem o prefixo data:).
export function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Falha ao ler o arquivo."));
    reader.readAsDataURL(file);
  });
}

// Mensagem de erro das Cloud Functions sem o prefixo técnico do Firebase.
export function getErrorMessage(caught: unknown, fallback: string) {
  if (!(caught instanceof Error) || !caught.message) return fallback;
  return caught.message.replace(/^Firebase:\s*/i, "").replace(/\s*\([^)]*\)\.?$/, "");
}
