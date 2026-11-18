import { CONTRACT_STEPS, getContractStepIndex } from "@/lib/contracts/signature";
import type { Contract } from "@/lib/types";

export function ContractStepper({
  contract,
}: Readonly<{ contract: Contract }>) {
  const current = getContractStepIndex(contract);
  if (current < 0) return null;

  return (
    <ol
      aria-label="Etapas do contrato"
      className="mb-6 flex items-start rounded-xl border border-slate-200 bg-white p-4"
    >
      {CONTRACT_STEPS.map((label, index) => {
        const done = index < current || current === CONTRACT_STEPS.length - 1;
        const active = index === current && !done;
        let circleStyle = "bg-slate-100 text-slate-500";
        if (done) circleStyle = "bg-emerald-600 text-white";
        else if (active) circleStyle = "bg-indigo-600 text-white ring-4 ring-indigo-100";
        return (
          <li
            key={label}
            aria-current={active ? "step" : undefined}
            className="flex flex-1 flex-col items-center text-center"
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${circleStyle}`}
            >
              {done ? "✓" : index + 1}
            </span>
            <span
              className={`mt-2 text-xs ${
                active ? "font-medium text-slate-900" : "text-slate-600"
              }`}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
