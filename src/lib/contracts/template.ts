import type { ContractTemplateData } from "@/lib/types";

export type { ContractTemplateData };

export const EMPTY_CONTRACT_TEMPLATE: ContractTemplateData = {
  agencyName: "Three Devs",
  agencyDocument: "",
  agencyEmail: "contato@three-devs.com",
  clientName: "",
  clientDocument: "",
  clientEmail: "",
  clientCompany: "",
  commencementDate: "",
  conclusionDate: "",
  projectName: "",
  servicesDescription:
    "desenvolvimento de software sob medida, incluindo análise, implementação, testes e acompanhamento do produto digital",
  packageName: "Desenvolvimento Sob Medida",
  deliverable1: "Planejamento, escopo técnico e definição de entregas",
  deliverable2: "Desenvolvimento e evolução do produto conforme backlog acordado",
  deliverable3: "Acesso ao portal do cliente com status, links e atualizações",
  monthlyHours: "40",
  revisionRounds: "2",
  totalValue: "",
  paymentMethod: "PIX / transferência bancária",
  paymentInstallments: "mensal",
  retainerValue: "",
  termMonths: "3",
  noticeDays: "15",
  jurisdiction: "Brasil",
  leadDeveloperName: "",
};

export function buildContractTitle(data: ContractTemplateData): string {
  const project = data.projectName || "projeto";
  return `Contrato de Prestação de Serviços — ${project}`;
}

export function renderContractHtml(data: ContractTemplateData): string {
  const escapeHtml = (input: string) =>
    input
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  const v = (value: string, fallback = "________") => {
    const normalized = value.trim() || fallback;
    return escapeHtml(normalized);
  };

  return `
<p class="intro">Nada avança sem o contrato assinado. Este documento protege a Three Devs e o cliente.</p>

<h1>Contrato de Prestação de Serviços</h1>

<div class="meta">
  <p><strong>Cliente:</strong> ${v(data.clientName)}</p>
  <p><strong>Data de início:</strong> ${v(data.commencementDate)}</p>
  <p><strong>Data de conclusão:</strong> ${v(data.conclusionDate)}</p>
</div>

<h2>1. Acordo Integral</h2>
<p>
  Este documento constitui o entendimento integral e completo entre
  <strong>${v(data.agencyName)}</strong> ("Prestadora") e
  <strong>${v(data.clientName)}</strong> ("Cliente"),
  ${data.clientCompany ? `representando <strong>${v(data.clientCompany)}</strong>, ` : ""}
  e substitui quaisquer acordos anteriores, verbais ou escritos, relativos ao objeto deste contrato.
  Alterações só terão validade se feitas por escrito e assinadas por ambas as partes.
  Se qualquer cláusula for considerada inválida, as demais permanecerão em vigor.
  A renúncia a qualquer disposição deste contrato deverá ser expressa e por escrito.
</p>
<p>
  Prestadora: ${v(data.agencyName)}${data.agencyDocument ? `, documento ${v(data.agencyDocument)}` : ""}${data.agencyEmail ? `, e-mail ${v(data.agencyEmail)}` : ""}.
  Cliente: ${v(data.clientName)}${data.clientDocument ? `, documento ${v(data.clientDocument)}` : ""}${data.clientEmail ? `, e-mail ${v(data.clientEmail)}` : ""}.
</p>

<h2>2. Objeto e Escopo dos Serviços</h2>
<p>
  A Prestadora compromete-se a prestar ao Cliente serviços de
  <strong>${v(data.servicesDescription)}</strong>
  durante a vigência deste contrato, relacionados ao projeto
  <strong>${v(data.projectName)}</strong>.
</p>
<p>
  A fase inicial será dedicada a alinhamento de escopo, planejamento técnico
  e definição das primeiras entregas. O Cliente contratou o pacote
  <strong>${v(data.packageName)}</strong>, que inclui:
</p>
<ul>
  <li>${v(data.deliverable1)}</li>
  <li>${v(data.deliverable2)}</li>
  <li>${v(data.deliverable3)}</li>
</ul>
<p>
  Salvo acordo escrito em contrário, o escopo contempla até
  <strong>${v(data.monthlyHours)} horas/mês</strong> de dedicação e até
  <strong>${v(data.revisionRounds)} rodadas de revisão</strong> por entrega principal.
  Demandas adicionais, mudanças de escopo relevantes ou horas excedentes
  estão sujeitas à disponibilidade da equipe e a cobrança complementar.
  Upgrade de pacote ou mudança substancial de escopo exige aditivo ou novo contrato.
</p>
<p>
  O desenvolvedor responsável pelo acompanhamento deste projeto é
  <strong>${v(data.leadDeveloperName)}</strong>.
</p>

<h2>3. Condições Comerciais e Pagamento</h2>
<p>
  As partes acordam o valor total estimado de
  <strong>R$ ${v(data.totalValue)}</strong>,
  a ser pago de forma <strong>${v(data.paymentInstallments)}</strong>,
  pelo prazo de <strong>${v(data.termMonths)} meses</strong>,
  salvo rescisão nos termos da Cláusula 8.
</p>
<p>
  Os pagamentos serão realizados via <strong>${v(data.paymentMethod)}</strong>,
  mediante envio de cobrança/fatura pela Prestadora. Serviços fora do escopo
  contratado poderão gerar valores adicionais, previamente alinhados por escrito.
</p>
<ul>
  <li><strong>Retainer / parcela fixa:</strong> R$ ${v(data.retainerValue)}</li>
  <li><strong>Valor total do contrato:</strong> R$ ${v(data.totalValue)}</li>
</ul>
<p>
  O atraso no pagamento superior a 10 (dez) dias poderá suspender as entregas
  até a regularização, sem prejuízo da cobrança dos valores devidos.
</p>

<h2>4. Obrigações do Cliente</h2>
<p>O Cliente se compromete a:</p>
<ul>
  <li>fornecer informações, acessos, conteúdos e materiais necessários em tempo hábil;</li>
  <li>indicar um ponto de contato para decisões e validações;</li>
  <li>realizar feedbacks e aprovações dentro dos prazos acordados;</li>
  <li>efetuar os pagamentos nas condições deste contrato;</li>
  <li>utilizar o portal do cliente para acompanhamento de status, links e atualizações.</li>
</ul>
<p>
  Atrasos do Cliente na disponibilização de insumos ou aprovações podem
  impactar o cronograma sem caracterizar inadimplemento da Prestadora.
</p>

<h2>5. Obrigações da Prestadora</h2>
<p>A Prestadora se compromete a:</p>
<ul>
  <li>executar os serviços com diligência técnica e boa-fé;</li>
  <li>manter o Cliente informado sobre o andamento do projeto;</li>
  <li>registrar atualizações relevantes no portal do cliente;</li>
  <li>respeitar prazos razoáveis alinhados ao escopo e à disponibilidade de insumos;</li>
  <li>proteger credenciais e dados de acesso fornecidos pelo Cliente.</li>
</ul>

<h2>6. Propriedade Intelectual</h2>
<p>
  Após a quitação integral dos valores devidos referentes a cada entrega,
  os códigos, artefatos e materiais produzidos especificamente para o Cliente
  no âmbito deste contrato passam a ser de titularidade do Cliente,
  ressalvadas ferramentas, bibliotecas, frameworks, componentes reutilizáveis
  e know-how pré-existentes da Prestadora, que permanecem de sua propriedade.
</p>
<p>
  A Prestadora poderá mencionar o projeto em portfólio apenas com autorização
  prévia do Cliente, salvo informações já públicas.
</p>

<h2>7. Confidencialidade</h2>
<p>
  As partes obrigam-se a manter em sigilo informações técnicas, comerciais,
  financeiras e estratégicas trocadas durante a vigência deste contrato,
  utilizando-as apenas para a execução dos serviços. A obrigação de
  confidencialidade permanece por 2 (dois) anos após o término do contrato,
  exceto quanto a informações públicas ou exigidas por lei.
</p>

<h2>8. Vigência e Rescisão</h2>
<p>
  Este contrato vigorará de <strong>${v(data.commencementDate)}</strong>
  até <strong>${v(data.conclusionDate)}</strong>,
  podendo ser prorrogado por acordo escrito entre as partes.
</p>
<p>
  Qualquer das partes poderá rescindir este contrato mediante aviso prévio
  por escrito de <strong>${v(data.noticeDays)} dias</strong>.
  Em caso de rescisão, o Cliente deverá pagar os serviços já executados
  e despesas previamente aprovadas até a data efetiva do término.
  Em caso de inadimplemento grave, a parte inocente poderá rescindir
  imediatamente, sem prejuízo de indenizações cabíveis.
</p>

<h2>9. Limitação de Responsabilidade</h2>
<p>
  A responsabilidade total da Prestadora por danos decorrentes deste contrato
  fica limitada ao valor efetivamente pago pelo Cliente nos 3 (três) meses
  anteriores ao evento gerador. Não haverá responsabilização por lucros
  cessantes, danos indiretos ou resultados de negócio, salvo dolo ou culpa grave.
</p>

<h2>10. Portal do Cliente e Onboarding</h2>
<p>
  Após a assinatura deste contrato, o Cliente terá acesso ao portal Three Devs,
  onde poderá acompanhar projetos, status, contratos, links e notas.
  Sem a assinatura deste instrumento, o onboarding e o acesso ao portal
  permanecem bloqueados.
</p>

<h2>11. Foro</h2>
<p>
  Fica eleito o foro de <strong>${v(data.jurisdiction)}</strong>
  para dirimir quaisquer controvérsias oriundas deste contrato,
  com renúncia a qualquer outro, por mais privilegiado que seja.
</p>

<h2>12. Aceite</h2>
<p>
  Ao assinar este contrato, as partes declaram ter lido, compreendido
  e concordado com todas as cláusulas aqui estabelecidas.
</p>

<div class="signatures">
  <div class="sign-block">
    <p><strong>Prestadora — ${v(data.agencyName)}</strong></p>
    <p>Responsável: ${v(data.leadDeveloperName)}</p>
    <p class="line">Assinatura: _______________________________</p>
    <p>Data: ____/____/________</p>
  </div>
  <div class="sign-block">
    <p><strong>Cliente — ${v(data.clientName)}</strong></p>
    <p>${data.clientCompany ? `Empresa: ${v(data.clientCompany)}` : "Nome / razão social"}</p>
    <p class="line">Assinatura: _______________________________</p>
    <p>Data: ____/____/________</p>
  </div>
</div>
`.trim();
}
