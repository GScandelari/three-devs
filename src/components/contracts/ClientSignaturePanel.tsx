"use client";

import { useRef, useState } from "react";
import {
  downloadSignedContract,
  generateContractPdf,
  submitClientSignature,
} from "@/lib/firebase/admin-api";
import {
  GOVBR_HELP_URL,
  GOVBR_SIGNER_URL,
  MAX_SIGNED_PDF_BYTES,
  getSignatureStatus,
} from "@/lib/contracts/signature";
import { downloadBase64Pdf, getErrorMessage, readFileAsBase64 } from "@/lib/files";
import { Button } from "@/components/ui/Button";
import type { Contract } from "@/lib/types";

// Assinatura gov.br assistida, do lado do cliente: baixar o PDF, assinar no
// gov.br e enviar o arquivo assinado. Veja docs/ASSINATURA-GOVBR.md.
export function ClientSignaturePanel({
  contract,
  onChanged,
}: {
  contract: Contract;
  onChanged: () => Promise<void>;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"" | "download" | "upload" | "final">("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function run(kind: typeof busy, action: () => Promise<void>) {
    setError("");
    setSuccess("");
    setBusy(kind);
    try {
      await action();
    } catch (caught) {
      setError(getErrorMessage(caught, "Não foi possível concluir. Tente novamente."));
    } finally {
      setBusy("");
    }
  }

  function handleDownloadToSign() {
    return run("download", async () => {
      const { filename, pdfBase64 } = await generateContractPdf(contract.id);
      downloadBase64Pdf(pdfBase64, filename);
    });
  }

  function handleDownloadFinal() {
    return run("final", async () => {
      const { filename, pdfBase64 } = await downloadSignedContract(contract.id, "final");
      downloadBase64Pdf(pdfBase64, filename);
    });
  }

  async function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Envie o arquivo PDF que o assinador gov.br devolveu.");
      return;
    }
    if (file.size > MAX_SIGNED_PDF_BYTES) {
      setError("O arquivo passa de 10 MB.");
      return;
    }

    await run("upload", async () => {
      await submitClientSignature(contract.id, await readFileAsBase64(file));
      await onChanged();
      setSuccess("Arquivo enviado. A equipe vai conferir a assinatura.");
    });
  }

  // Contrato assinado: só o download do arquivo final.
  if (contract.status === "signed") {
    return (
      <section className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
        <h2 className="font-medium text-slate-900">Contrato assinado</h2>
        {contract.signature?.finalFile ? (
          <>
            <p className="mt-1 text-sm text-slate-600">
              Baixe a via final, com as assinaturas das duas partes.
            </p>
            <Button
              type="button"
              className="mt-4"
              disabled={busy !== ""}
              onClick={handleDownloadFinal}
            >
              {busy === "final" ? "Baixando..." : "Baixar contrato assinado"}
            </Button>
          </>
        ) : (
          <p className="mt-1 text-sm text-slate-600">
            Fale com a equipe se precisar de uma cópia do contrato assinado.
          </p>
        )}
        {error && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}
      </section>
    );
  }

  if (contract.status !== "sent") return null;

  const status = getSignatureStatus(contract);
  const finalizing = Boolean(contract.signature?.finalFile);

  return (
    <section className="mb-6 rounded-xl border border-indigo-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="font-medium text-slate-900">Assinar com gov.br</h2>
        <SignatureStatusBadge status={status} finalizing={finalizing} />
      </div>

      {status === "rejected" && contract.signature?.rejection && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <strong>A assinatura enviada foi recusada.</strong>{" "}
          {contract.signature.rejection.reason} Assine novamente e envie o novo arquivo.
        </div>
      )}

      {status === "received" && (
        <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          {finalizing
            ? "Sua assinatura foi conferida. A equipe está finalizando o contrato."
            : "Recebemos o arquivo assinado. A equipe vai conferir a assinatura e avisar você."}
        </p>
      )}

      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-700">
        <li>
          Tenha uma conta gov.br nível <strong>prata ou ouro</strong>.{" "}
          <a
            href={GOVBR_HELP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Saiba mais
          </a>
        </li>
        <li>
          Baixe o PDF do contrato aqui.{" "}
          <strong>Não imprima nem escaneie</strong>: a assinatura é digital e
          vale só no arquivo.
        </li>
        <li>
          Abra o{" "}
          <a
            href={GOVBR_SIGNER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-500"
          >
            assinador gov.br
          </a>
          , entre com sua conta, assine o PDF e baixe o arquivo assinado.
        </li>
        <li>Envie aqui o arquivo que o assinador devolveu, sem alterá-lo.</li>
      </ol>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={busy !== ""}
          onClick={handleDownloadToSign}
        >
          {busy === "download" ? "Gerando PDF..." : "Baixar PDF para assinar"}
        </Button>
        {!finalizing && (
          <Button
            type="button"
            disabled={busy !== ""}
            onClick={() => fileInput.current?.click()}
          >
            {busy === "upload"
              ? "Enviando..."
              : status === "awaiting"
                ? "Enviar PDF assinado"
                : "Enviar novo arquivo"}
          </Button>
        )}
        <input
          ref={fileInput}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={handleFileChosen}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500">Apenas PDF, até 10 MB.</p>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="mt-3 text-sm text-emerald-600">
          {success}
        </p>
      )}
    </section>
  );
}

function SignatureStatusBadge({
  status,
  finalizing,
}: {
  status: "awaiting" | "received" | "rejected";
  finalizing: boolean;
}) {
  const { label, className } = finalizing
    ? { label: "Em finalização", className: "bg-indigo-100 text-indigo-800" }
    : {
        awaiting: { label: "Aguardando seu envio", className: "bg-amber-100 text-amber-800" },
        received: { label: "Recebida, em conferência", className: "bg-slate-100 text-slate-700" },
        rejected: { label: "Recusada", className: "bg-red-100 text-red-800" },
      }[status];

  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
