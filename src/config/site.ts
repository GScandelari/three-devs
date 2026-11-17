// Dados da Serifa Labs usados pela landing, pelo SEO e pelo JSON-LD.
// Regra: só dado confirmado. O que falta fica `null` e a interface omite o
// bloco (veja docs/PENDENCIAS-VALIDACAO.md).

export const site = {
  name: "Serifa Labs",
  url: "https://serifalabs.com",
  title: "Serifa Labs — Software sob medida, do rascunho ao acabamento",
  description:
    "Estúdio de três desenvolvedores que constrói aplicações web, integrações e MVPs sob medida. Contrato digital e portal do cliente para acompanhar cada etapa do projeto.",
  locale: "pt_BR",

  contact: {
    // Confirmado pelo time em 17/11/2026. A caixa precisa existir antes do merge.
    email: "contato@serifalabs.com",
    // DDI 55 + DDD + telefone, só dígitos. Confirmado pelo time em 17/11/2026.
    whatsapp: "5513996649260" as string | null,
    // Mesmo número, para exibir e para o JSON-LD.
    phoneDisplay: "(13) 99664-9260",
    phoneE164: "+55-13-99664-9260",
  },
} as const;

export type Service = {
  id: string;
  title: string;
  description: string;
  // Assunto do e-mail aberto pelo CTA contextual do serviço.
  subject: string;
};

export const services: Service[] = [
  {
    id: "web",
    title: "Aplicações web",
    description:
      "Sistemas, painéis e plataformas feitos para o jeito que a sua operação funciona, com foco em desempenho e usabilidade.",
    subject: "Quero conversar sobre uma aplicação web",
  },
  {
    id: "integracoes",
    title: "Integrações e APIs",
    description:
      "Conectamos o seu produto a serviços externos, automatizamos fluxos repetitivos e preparamos a operação para crescer.",
    subject: "Quero conversar sobre integrações e APIs",
  },
  {
    id: "mvp",
    title: "MVPs e produtos digitais",
    description:
      "Tiramos a ideia do papel com entregas em partes, para você validar cedo e ajustar o rumo com o que aprendeu.",
    subject: "Quero conversar sobre um MVP",
  },
];

export const steps = [
  {
    title: "Proposta",
    description:
      "Você conta a ideia. Um de nós conduz a conversa, alinha o escopo com o time e apresenta a proposta.",
  },
  {
    title: "Contrato",
    description:
      "Com a proposta aceita, enviamos o contrato. Sem a assinatura, o projeto não começa: isso protege você e a gente.",
  },
  {
    title: "Portal do cliente",
    description:
      "Depois da assinatura, você entra no portal e acompanha status, links, notas e documentos do projeto.",
  },
  {
    title: "Entrega",
    description:
      "Seguimos etapa por etapa, com cada mudança registrada no portal, até a entrega e a evolução do produto.",
  },
];

export const faq = [
  {
    q: "Como um projeto começa?",
    a: "Você nos escreve contando a ideia. Um dos desenvolvedores conduz a conversa, alinha o escopo com o time e apresenta uma proposta. Com a proposta aceita, enviamos o contrato.",
  },
  {
    q: "Quanto custa um projeto?",
    a: "O valor depende do escopo. Ele é apresentado na proposta, antes de qualquer contrato, depois que entendemos o que precisa ser construído.",
  },
  {
    q: "Por que preciso assinar um contrato antes de começar?",
    a: "O contrato define escopo, prazos e responsabilidades das duas partes. Enquanto ele não é assinado, o projeto fica bloqueado no portal e o onboarding não começa.",
  },
  {
    q: "Como é feita a assinatura do contrato?",
    a: "Você assina o PDF no assinador do gov.br, com a sua própria conta gov.br, e envia o arquivo pelo portal. A equipe confere a assinatura no validador oficial do ITI e a Serifa Labs contra-assina o mesmo documento.",
  },
  {
    q: "Como acompanho o andamento do projeto?",
    a: "Pelo portal do cliente, com login próprio. Lá ficam o status do projeto, os links (como repositório e ambientes), as notas da equipe, os contratos e os avisos de cada mudança.",
  },
];

export function mailtoHref(subject?: string) {
  const email = site.contact.email;
  if (!email) return null;
  return subject
    ? `mailto:${email}?subject=${encodeURIComponent(subject)}`
    : `mailto:${email}`;
}

export function whatsappHref(message: string) {
  const phone = site.contact.whatsapp;
  if (!phone) return null;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
