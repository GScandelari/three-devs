"use client";

import type { ContractTemplateData } from "@/lib/types";

type FieldKey = keyof ContractTemplateData;

const fields: Array<{
  key: FieldKey;
  label: string;
  placeholder?: string;
  type?: "text" | "date" | "textarea";
  section: string;
}> = [
  { key: "agencyName", label: "Nome da prestadora", section: "Partes" },
  { key: "agencyDocument", label: "Documento da prestadora (CNPJ)", section: "Partes" },
  { key: "agencyEmail", label: "E-mail da prestadora", section: "Partes" },
  { key: "clientName", label: "Nome do cliente", section: "Partes" },
  { key: "clientDocument", label: "Documento do cliente (CPF/CNPJ)", section: "Partes" },
  { key: "clientEmail", label: "E-mail do cliente", section: "Partes" },
  { key: "clientCompany", label: "Empresa do cliente", section: "Partes" },
  { key: "leadDeveloperName", label: "Desenvolvedor responsável", section: "Partes" },
  { key: "commencementDate", label: "Data de início", type: "date", section: "Vigência" },
  { key: "conclusionDate", label: "Data de conclusão", type: "date", section: "Vigência" },
  { key: "termMonths", label: "Prazo (meses)", section: "Vigência" },
  { key: "noticeDays", label: "Aviso prévio (dias)", section: "Vigência" },
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

interface ContractTemplateFormProps {
  value: ContractTemplateData;
  onChange: (value: ContractTemplateData) => void;
}

export function ContractTemplateForm({
  value,
  onChange,
}: ContractTemplateFormProps) {
  const sections = [...new Set(fields.map((f) => f.section))];

  function update(key: FieldKey, next: string) {
    onChange({ ...value, [key]: next });
  }

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
                  className={field.type === "textarea" ? "sm:col-span-2" : ""}
                >
                  <label htmlFor={`contract-${field.key}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {field.label}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      id={`contract-${field.key}`}
                      rows={3}
                      value={value[field.key]}
                      placeholder={field.placeholder}
                      onChange={(e) => update(field.key, e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-indigo-400"
                    />
                  ) : (
                    <input
                      id={`contract-${field.key}`}
                      type={field.type ?? "text"}
                      value={value[field.key]}
                      placeholder={field.placeholder}
                      onChange={(e) => update(field.key, e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-indigo-400"
                    />
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
