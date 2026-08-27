import { renderContractHtml } from "@/lib/contracts/template";
import type { ContractTemplateData } from "@/lib/types";

interface ContractDocumentProps {
  data: ContractTemplateData;
}

export function ContractDocument({ data }: ContractDocumentProps) {
  const html = renderContractHtml(data);

  return (
    <article className="contract-document overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-slate-100 shadow-xl">
      <div
        className="contract-body space-y-4 px-6 py-8 text-sm leading-relaxed sm:px-10 sm:py-10 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:text-white [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-white [&_li]:ml-5 [&_li]:list-disc [&_p.intro]:mb-6 [&_p.intro]:text-slate-400 [&_.meta]:mb-8 [&_.meta]:space-y-1 [&_.meta]:border-b [&_.meta]:border-slate-800 [&_.meta]:pb-6 [&_.signatures]:mt-10 [&_.signatures]:grid [&_.signatures]:gap-8 [&_.signatures]:sm:grid-cols-2 [&_.sign-block]:space-y-2 [&_.line]:mt-6"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
