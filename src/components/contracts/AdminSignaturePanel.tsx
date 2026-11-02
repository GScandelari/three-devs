"use client";

import { useRef, useState } from "react";
import {
  downloadSignedContract,
  uploadFinalSignedContract,
} from "@/lib/firebase/admin-api";
import { rejectClientSignature } from "@/lib/firebase/firestore";
import {
  ITI_VALIDATOR_URL,
  MAX_SIGNED_PDF_BYTES,
  REJECTION_REASONS,
  getSignatureStatus,
} from "@/lib/contracts/signature";
import { downloadBase64Pdf, getErrorMessage, readFileAsBase64 } from "@/lib/files";
import { Button } from "@/components/ui/Button";
import type { Contract } from "@/lib/types";

const CHECKLIST = [
  "O validador do ITI mostra a assinatura como válida.",
  "O validador indica que o documento não foi modificado.",
  "O signatário (nome e CPF) é o cliente deste contrato.",
];

const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
    new Date(iso),
  );

// Assinatura gov.br assistida, do lado da equipe: conferir o PDF do cliente,
// recusar com motivo ou anexar o PDF final contra-assinado.
// Veja docs/ASSINATURA-GOVBR.md.
export function AdminSignaturePanel({
  contract,
  developerName,
  onChanged,
}: {
  contract: Contract;
  developerName: string;
  onChanged: () => Promise<void>;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [checked, setChecked] = useState<boolean[]>(CHECKLIST.map(() => false));
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState(REJECTION_REASONS[0]);
  const [detail, setDetail] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (contract.status !== "sent" && !contract.signature) return null;

  const signature = contract.signature;
  const status = getSignatureStatus(contract);
  const canReview = contract.status === "sent" && status === "received" && !signature?.finalFile;
  const allChecked = checked.every(Boolean);

  async function run(kind: string, action: () => Promise<void>) {
    setError("");
    setSuccess("");
    setBusy(kind);
    try {
      await action();
    } catch (caught) {
      setError(getErrorMessage(caught, "Não foi possível concluir."));
    } finally {
      setBusy("");
    }
  }

  function download(kind: "client" | "final") {
    return run(`download-${kind}`, async () => {
      const { filename, pdfBase64 } = await downloadSignedContract(contract.id, kind);
      downloadBase64Pdf(pdfBase64, filename);
    });
  }

  function handleReject(e: React.FormEvent) {
    e.preventDefault();
    const fullReason = [reason, detail.trim()].filter(Boolean).join(" ");
    return run("reject", async () => {
      await rejectClientSignature(contract.id, fullReason, developerName);
      await onChanged();
      setRejecting(false);
      setDetail("");
      setSuccess("Assinatura recusada. O cliente foi avisado no portal.");
    });
  }

  async function handleFinalChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_SIGNED_PDF_BYTES) {
      setError("O arquivo passa de 10 MB.");
      return;
    }
    await run("final", async () => {
      await uploadFinalSignedContract(contract.id, await readFileAsBase64(file));
      await onChanged();
      setSuccess('Arquivo final anexado. Agora clique em "Marcar assinado".');
    });
  }

  const statusText = signature?.finalFile
    ? contract.status === "signed"
      ? "Contrato assinado. O arquivo final está disponível ao cliente no portal."
      : 'Arquivo final anexado. Falta clicar em "Marcar assinado".'
    : {
        awaiting: "Aguardando o cliente enviar o PDF assinado pelo portal.",
        received: "O cliente enviou o PDF assinado. Confira antes de seguir.",
        rejected: `Assinatura recusada: ${signature?.rejection?.reason ?? ""} Aguardando um novo envio.`,
      }[status];

  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-sm font-medium uppercase tracking-wider text-slate-400">
        Assinatura (gov.br)
      </h2>
      <p className="mt-2 text-sm text-slate-700">{statusText}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {signature?.clientFile && (
          <Button
            type="button"
            variant="secondary"
            disabled={busy !== ""}
            onClick={() => download("client")}
          >
            {busy === "download-client" ? "Baixando..." : "Baixar PDF do cliente"}
          </Button>
        )}
        {signature?.finalFile && (
          <Button
            type="button"
            variant="secondary"
            disabled={busy !== ""}
            onClick={() => download("final")}
          >
            {busy === "download-final" ? "Baixando..." : "Baixar PDF final"}
          </Button>
        )}
        {signature?.clientFile && (
          <a
            href={ITI_VALIDATOR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
          >
            Abrir validador do ITI ↗
          </a>
        )}
      </div>

      {canReview && (
        <div className="mt-6 border-t border-slate-100 pt-4">
          <h3 className="text-sm font-medium text-slate-900">Conferência</h3>
          <p className="mt-1 text-sm text-slate-500">
            Baixe o PDF do cliente e envie-o ao validador do ITI.
          </p>
          <div className="mt-3 space-y-2">
            {CHECKLIST.map((item, index) => (
              <label key={item} className="flex items-start gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={checked[index]}
                  onChange={(e) =>
                    setChecked(checked.map((v, i) => (i === index ? e.target.checked : v)))
                  }
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600"
                />
                {item}
              </label>
            ))}
          </div>

          <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
            <strong>Tudo certo?</strong> O representante da Serifa Labs assina{" "}
            <strong>o mesmo PDF do cliente</strong> no gov.br, confere de novo no
            validador (as duas assinaturas devem aparecer válidas) e anexa o
            arquivo final aqui.
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={!allChecked || busy !== ""}
              title={allChecked ? undefined : "Marque os três itens da conferência."}
              onClick={() => fileInput.current?.click()}
            >
              {busy === "final" ? "Enviando..." : "Anexar PDF final (contra-assinado)"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={busy !== ""}
              onClick={() => setRejecting(!rejecting)}
            >
              Recusar assinatura
            </Button>
            <input
              ref={fileInput}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={handleFinalChosen}
            />
          </div>

          {rejecting && (
            <form
              onSubmit={handleReject}
              className="mt-4 rounded-lg border border-red-200 bg-red-50/50 p-4"
            >
              <label className="block text-sm font-medium text-slate-700">
                Motivo (o cliente verá este texto)
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                {REJECTION_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <label className="mt-3 block text-sm font-medium text-slate-700">
                Detalhe (opcional)
              </label>
              <input
                value={detail}
                maxLength={200}
                onChange={(e) => setDetail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              />
              <Button type="submit" className="mt-3" disabled={busy !== ""}>
                {busy === "reject" ? "Recusando..." : "Confirmar recusa"}
              </Button>
            </form>
          )}
        </div>
      )}

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

      {signature?.history && signature.history.length > 0 && (
        <details className="mt-6 border-t border-slate-100 pt-4 text-sm text-slate-600">
          <summary className="cursor-pointer font-medium text-slate-700">Histórico</summary>
          <ul className="mt-2 space-y-1">
            {signature.history.map((entry) => (
              <li key={`${entry.event}-${entry.at}`}>
                {formatDateTime(entry.at)} —{" "}
                {{ received: "Arquivo recebido do cliente", rejected: "Recusada", reset: "Descartada" }[
                  entry.event
                ]}
                {entry.detail ? `: ${entry.detail}` : ""}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
