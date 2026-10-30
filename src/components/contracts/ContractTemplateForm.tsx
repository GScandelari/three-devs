"use client";

import { calculateConclusionDate } from "@/lib/contracts/template";
import { formatCpfCnpj } from "@/lib/documents";
import type { Client, ContractTemplateData } from "@/lib/types";
import { ClientCombobox } from "./ClientCombobox";

type FieldKey = keyof ContractTemplateData;

const fields: Array<{
  key: FieldKey;
  label: string;
  placeholder?: string;
  type?: "text" | "date" | "number" | "textarea" | "client";
  // Preenchido pelo sistema: exibido, mas não editável.
  readOnly?: boolean;
  hint?: string;
  section: string;
}> = [
  { key: "agencyName", label: "Nome da prestadora", section: "Partes" },
  {
    key: "agencyDocument",
    label: "Documento da prestadora (CNPJ)",
    readOnly: true,
    hint: "Definido pelo sistema para todos os contratos.",
    section: "Partes",
  },
  { key: "agencyEmail", label: "E-mail da prestadora", section: "Partes" },
  { key: "clientName", label: "Nome do cliente", type: "client", section: "Partes" },
  {
    key: "clientDocument",
    label: "Documento do cliente (CPF/CNPJ)",
    placeholder: "000.000.000-00",
    section: "Partes",
  },
  { key: "clientEmail", label: "E-mail do cliente", section: "Partes" },
  { key: "clientCompany", label: "Empresa do cliente", section: "Partes" },
  {
    key: "leadDeveloperName",
    label: "Desenvolvedor responsável",
    readOnly: true,
    hint: "Quem criou o contrato.",
    section: "Partes",
  },
  { key: "commencementDate", label: "Data de início", type: "date", section: "Vigência" },
  { key: "termMonths", label: "Prazo (meses)", type: "number", section: "Vigência" },
  {
    key: "conclusionDate",
    label: "Data de conclusão",
    type: "date",
    readOnly: true,
    hint: "Calculada: data de início + prazo, menos um dia. Ex.: 01/11 + 3 meses = 31/01.",
    section: "Vigência",
  },
  {
    key: "noticeDays",
    label: "Aviso prévio (dias)",
    type: "number",
    hint: "Antecedência mínima, em dias, com que qualquer uma das partes deve avisar por escrito que quer encerrar o contrato antes do fim da vigência. Durante esse período os serviços e pagamentos continuam normalmente, e o cliente paga o que foi executado até a data efetiva do término.",
    section: "Vigência",
  },
  { key: "jurisdiction", label: "Foro / jurisdição", section: "Vigência" },
  { key: "projectName", label: "Nome do projeto", section: "Escopo" },
  {
    key: "servicesDescription",
    label: "Descrição dos serviços",
    type: "textarea",
    section: "Escopo",
  },
  { key: "packageName", label: "Pacote contratado", section: "Escopo" },
  { key: "deliverable1", label: "Entrega 1", section: "Escopo" },
  { key: "deliverable2", label: "Entrega 2", section: "Escopo" },
  { key: "deliverable3", label: "Entrega 3", section: "Escopo" },
  { key: "monthlyHours", label: "Horas por mês", section: "Escopo" },
  { key: "revisionRounds", label: "Rodadas de revisão", section: "Escopo" },
  { key: "totalValue", label: "Valor total (R$)", placeholder: "15000,00", section: "Pagamento" },
  { key: "retainerValue", label: "Retainer / parcela fixa (R$)", section: "Pagamento" },
  { key: "paymentInstallments", label: "Forma de parcelamento", placeholder: "mensal", section: "Pagamento" },
  { key: "paymentMethod", label: "Método de pagamento", section: "Pagamento" },
];

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500";
const readOnlyClass =
  "mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 outline-none";

interface ContractTemplateFormProps {
  value: ContractTemplateData;
  onChange: (value: ContractTemplateData) => void;
  clients: Client[];
  // Cliente ao qual o contrato está vinculado (portal, avisos).
  linkedClient?: Client;
}

export function ContractTemplateForm({
  value,
  onChange,
  clients,
  linkedClient,
}: ContractTemplateFormProps) {
  const sections = [...new Set(fields.map((f) => f.section))];

  function update(key: FieldKey, next: string) {
    const updated = {
      ...value,
      [key]: key === "clientDocument" ? formatCpfCnpj(next) : next,
    };
    // A conclusão sempre segue a data de início e o prazo.
    if (key === "commencementDate" || key === "termMonths") {
      updated.conclusionDate = calculateConclusionDate(
        updated.commencementDate,
        updated.termMonths,
      );
    }
    onChange(updated);
  }

  function selectClient(client: Client) {
    onChange({
      ...value,
      clientName: client.name,
      clientDocument: client.document ?? "",
      clientEmail: client.email,
      clientCompany: client.company ?? "",
    });
  }

  // O template pode citar outro cliente; o portal e os avisos seguem o vínculo.
  const differsFromLinked =
    linkedClient &&
    value.clientEmail.trim() &&
    value.clientEmail.trim().toLowerCase() !== linkedClient.email.toLowerCase();

  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <div key={section}>
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-400">
            {section}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields
              .filter((f) => f.section === section)
              .map((field) => (
                <div
                  key={field.key}
                  className={
                    field.type === "textarea" || field.key === "noticeDays"
                      ? "sm:col-span-2"
                      : ""
                  }
                >
                  <label className="block text-sm font-medium text-slate-700">
                    {field.label}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      rows={3}
                      value={value[field.key]}
                      placeholder={field.placeholder}
                      onChange={(e) => update(field.key, e.target.value)}
                      className={inputClass}
                    />
                  ) : field.type === "client" ? (
                    <ClientCombobox
                      value={value[field.key]}
                      clients={clients}
                      onChange={(text) => update(field.key, text)}
                      onSelect={selectClient}
                      className={inputClass}
                    />
                  ) : (
                    <input
                      type={field.type ?? "text"}
                      min={field.type === "number" ? 1 : undefined}
                      readOnly={field.readOnly}
                      aria-readonly={field.readOnly}
                      value={value[field.key]}
                      placeholder={field.placeholder}
                      onChange={(e) => update(field.key, e.target.value)}
                      className={field.readOnly ? readOnlyClass : inputClass}
                    />
                  )}
                  {field.hint && (
                    <p className="mt-1 text-xs text-slate-500">{field.hint}</p>
                  )}
                  {field.key === "clientName" && differsFromLinked && (
                    <p className="mt-1 text-xs text-amber-700">
                      Este contrato está vinculado a {linkedClient.name} (
                      {linkedClient.email}). O portal e os avisos seguem esse
                      vínculo, não os dados digitados aqui.
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
