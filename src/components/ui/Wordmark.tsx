// Logotipo em texto da Serifa Labs: "Serifa" na serifada, "Labs" na mono.
// O traço laranja-sinal sob o "S" é a marca gráfica da identidade.
type WordmarkProps = {
  className?: string;
  // "dark": sobre o grafite; "accent": sobre fundos de cor;
  // "scene": acompanha a cena de cor da landing (--lp-link).
  tone?: "light" | "dark" | "accent" | "scene";
};

const labsTone = {
  light: "text-signal-deep",
  dark: "text-signal-light",
  accent: "text-white/80",
  scene: "text-[color:var(--lp-link)]",
};

export function Wordmark({ className = "", tone = "light" }: WordmarkProps) {
  const labs = labsTone[tone];
  return (
    <span
      className={`inline-flex items-baseline gap-1 leading-none ${className}`}
    >
      <span className="relative font-serif font-semibold tracking-[-0.02em]">
        Serifa
        <span
          aria-hidden="true"
          className="absolute -bottom-[0.14em] left-0 h-[2px] w-[0.55em] rounded-full bg-proof"
        />
      </span>
      <span
        className={`font-mono text-[0.62em] font-medium tracking-[0.02em] ${labs}`}
      >
        Labs
      </span>
    </span>
  );
}
