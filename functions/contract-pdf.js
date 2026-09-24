const PDFDocument = require("pdfkit");

const COLORS = {
  ink: "#172033",
  muted: "#64748b",
  accent: "#4f46e5",
  line: "#dbe2ea",
  soft: "#f5f7fb",
};

const PAGE = {
  margin: 54,
  width: 595.28,
  height: 841.89,
};

function value(input, fallback = "________________") {
  const normalized = String(input ?? "").trim();
  return normalized || fallback;
}

function formatDate(input) {
  const normalized = String(input ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return value(normalized);

  const [year, month, day] = normalized.split("-");
  return `${day}/${month}/${year}`;
}

function safeFilename(title) {
  const base = String(title || "contrato")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${base || "contrato"}.pdf`;
}

function addFooter(doc, pageNumber) {
  const bottom = PAGE.height - 34;
  const previousBottomMargin = doc.page.margins.bottom;
  doc.page.margins.bottom = 0;
  doc
    .save()
    .moveTo(PAGE.margin, bottom - 10)
    .lineTo(PAGE.width - PAGE.margin, bottom - 10)
    .strokeColor(COLORS.line)
    .lineWidth(0.6)
    .stroke()
    .font("Helvetica")
    .fontSize(8)
    .fillColor(COLORS.muted)
    .text("Three Devs - Contrato de Prestação de Serviços", PAGE.margin, bottom, {
      width: PAGE.width - PAGE.margin * 2 - 70,
      lineBreak: false,
    })
    .text(String(pageNumber), PAGE.width - PAGE.margin - 60, bottom, {
      width: 60,
      align: "right",
      lineBreak: false,
    })
    .restore();
  doc.page.margins.bottom = previousBottomMargin;
}

function ensureSpace(doc, height) {
  if (doc.y + height <= PAGE.height - 62) return;
  doc.addPage();
}

function addHeading(doc, number, title) {
  ensureSpace(doc, 62);
  doc
    .moveDown(0.7)
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor(COLORS.ink)
    .text(`${number}. ${title}`, { paragraphGap: 8 });
}

function addParagraph(doc, text) {
  doc
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor(COLORS.ink)
    .text(text, {
      align: "justify",
      lineGap: 2.2,
      paragraphGap: 7,
    });
}

function addBulletList(doc, items) {
  for (const item of items) {
    ensureSpace(doc, 28);
    const y = doc.y;
    doc.circle(PAGE.margin + 3, y + 5, 1.6).fill(COLORS.accent);
    doc
      .font("Helvetica")
      .fontSize(9.5)
      .fillColor(COLORS.ink)
      .text(item, PAGE.margin + 14, y, {
        width: PAGE.width - PAGE.margin * 2 - 14,
        lineGap: 2,
        paragraphGap: 4,
      });
  }
  doc.moveDown(0.25);
}

function addSignature(doc, label, name, detail) {
  ensureSpace(doc, 96);
  doc
    .moveDown(1.2)
    .moveTo(PAGE.margin, doc.y)
    .lineTo(PAGE.margin + 210, doc.y)
    .strokeColor(COLORS.ink)
    .lineWidth(0.8)
    .stroke();
  doc
    .moveDown(0.35)
    .font("Helvetica-Bold")
    .fontSize(9.5)
    .fillColor(COLORS.ink)
    .text(`${label}: ${value(name)}`);
  if (detail) {
    doc.font("Helvetica").fontSize(8.5).fillColor(COLORS.muted).text(detail);
  }
  doc.font("Helvetica").fontSize(8.5).fillColor(COLORS.muted).text("Data: ____/____/________");
}

function buildContractPdf(contract) {
  const data = contract.template || {};
  const doc = new PDFDocument({
    size: "A4",
    margins: {
      top: PAGE.margin,
      right: PAGE.margin,
      bottom: 66,
      left: PAGE.margin,
    },
    bufferPages: true,
    info: {
      Title: contract.title || "Contrato de Prestação de Serviços",
      Author: value(data.agencyName, "Three Devs"),
      Subject: `Contrato do projeto ${value(data.projectName, "")}`,
      Creator: "Three Devs",
    },
  });

  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  const completion = new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  doc
    .roundedRect(PAGE.margin, PAGE.margin, PAGE.width - PAGE.margin * 2, 7, 3)
    .fill(COLORS.accent);
  doc
    .moveDown(1.7)
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor(COLORS.accent)
    .text("THREE DEVS", { characterSpacing: 1.7 });
  doc
    .moveDown(0.55)
    .font("Helvetica-Bold")
    .fontSize(24)
    .fillColor(COLORS.ink)
    .text("Contrato de Prestação de Serviços", { lineGap: 2 });
  doc
    .moveDown(0.45)
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor(COLORS.muted)
    .text("Documento comercial para formalização do desenvolvimento de software.");

  const cardY = doc.y + 18;
  doc
    .roundedRect(PAGE.margin, cardY, PAGE.width - PAGE.margin * 2, 76, 8)
    .fill(COLORS.soft);
  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor(COLORS.muted)
    .text("CLIENTE", PAGE.margin + 16, cardY + 14)
    .font("Helvetica")
    .fontSize(10)
    .fillColor(COLORS.ink)
    .text(value(data.clientName), PAGE.margin + 16, cardY + 29, { width: 210 })
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor(COLORS.muted)
    .text("PROJETO", PAGE.margin + 250, cardY + 14)
    .font("Helvetica")
    .fontSize(10)
    .fillColor(COLORS.ink)
    .text(value(data.projectName), PAGE.margin + 250, cardY + 29, { width: 220 })
    .font("Helvetica")
    .fontSize(8.5)
    .fillColor(COLORS.muted)
    .text(
      `Vigência: ${formatDate(data.commencementDate)} a ${formatDate(data.conclusionDate)}`,
      PAGE.margin + 16,
      cardY + 53,
      { width: 430 },
    );
  doc.y = cardY + 88;

  addHeading(doc, 1, "Acordo integral");
  addParagraph(
    doc,
    `Este documento constitui o entendimento integral entre ${value(data.agencyName)} ("Prestadora") e ${value(data.clientName)} ("Cliente")${data.clientCompany ? `, representando ${value(data.clientCompany)}` : ""}, e substitui acordos anteriores relativos ao seu objeto. Alterações somente terão validade quando feitas por escrito e aceitas por ambas as partes. Se uma cláusula for considerada inválida, as demais permanecerão em vigor.`,
  );
  addParagraph(
    doc,
    `Prestadora: ${value(data.agencyName)}${data.agencyDocument ? `, documento ${value(data.agencyDocument)}` : ""}${data.agencyEmail ? `, e-mail ${value(data.agencyEmail)}` : ""}. Cliente: ${value(data.clientName)}${data.clientDocument ? `, documento ${value(data.clientDocument)}` : ""}${data.clientEmail ? `, e-mail ${value(data.clientEmail)}` : ""}.`,
  );

  addHeading(doc, 2, "Objeto e escopo dos serviços");
  addParagraph(
    doc,
    `A Prestadora prestará ao Cliente serviços de ${value(data.servicesDescription)} durante a vigência deste contrato, relacionados ao projeto ${value(data.projectName)}. O pacote contratado é ${value(data.packageName)} e inclui:`,
  );
  addBulletList(doc, [
    value(data.deliverable1),
    value(data.deliverable2),
    value(data.deliverable3),
  ]);
  addParagraph(
    doc,
    `O escopo contempla até ${value(data.monthlyHours)} horas por mês e até ${value(data.revisionRounds)} rodadas de revisão por entrega principal. Demandas adicionais, mudanças relevantes de escopo ou horas excedentes dependem de disponibilidade e de aprovação comercial prévia. O acompanhamento será conduzido por ${value(data.leadDeveloperName)}.`,
  );

  addHeading(doc, 3, "Condições comerciais e pagamento");
  addParagraph(
    doc,
    `O valor total estimado é de R$ ${value(data.totalValue)}, pago de forma ${value(data.paymentInstallments)}, pelo prazo de ${value(data.termMonths)} meses. Os pagamentos serão realizados via ${value(data.paymentMethod)}. O retainer ou parcela fixa é de R$ ${value(data.retainerValue)}. Serviços fora do escopo poderão gerar valores adicionais, mediante aprovação por escrito.`,
  );
  addParagraph(
    doc,
    "O atraso superior a 10 (dez) dias poderá suspender as entregas até a regularização, sem prejuízo da cobrança dos valores devidos.",
  );

  addHeading(doc, 4, "Obrigações do Cliente");
  addBulletList(doc, [
    "Fornecer informações, acessos, conteúdos e materiais necessários em tempo hábil.",
    "Indicar um ponto de contato para decisões e validações.",
    "Realizar feedbacks, aprovações e pagamentos nos prazos acordados.",
    "Utilizar o portal do cliente para acompanhar status, links e atualizações.",
  ]);
  addParagraph(
    doc,
    "Atrasos na disponibilização de insumos ou aprovações podem impactar o cronograma sem caracterizar inadimplemento da Prestadora.",
  );

  addHeading(doc, 5, "Obrigações da Prestadora");
  addBulletList(doc, [
    "Executar os serviços com diligência técnica e boa-fé.",
    "Manter o Cliente informado sobre o andamento do projeto.",
    "Registrar atualizações relevantes no portal do cliente.",
    "Proteger credenciais e dados fornecidos pelo Cliente.",
  ]);

  addHeading(doc, 6, "Propriedade intelectual");
  addParagraph(
    doc,
    "Após a quitação integral dos valores de cada entrega, os códigos, artefatos e materiais produzidos especificamente para o Cliente passam a ser de sua titularidade. Ferramentas, bibliotecas, frameworks, componentes reutilizáveis e conhecimento preexistentes da Prestadora permanecem de sua propriedade. A menção do projeto em portfólio depende de autorização prévia do Cliente, salvo informações já públicas.",
  );

  addHeading(doc, 7, "Confidencialidade");
  addParagraph(
    doc,
    "As partes manterão em sigilo informações técnicas, comerciais, financeiras e estratégicas trocadas durante a vigência, utilizando-as apenas para executar os serviços. A obrigação permanece por 2 (dois) anos após o término, exceto para informações públicas ou exigidas por lei.",
  );

  addHeading(doc, 8, "Vigência e rescisão");
  addParagraph(
    doc,
    `Este contrato vigorará de ${formatDate(data.commencementDate)} até ${formatDate(data.conclusionDate)}, podendo ser prorrogado por acordo escrito. Qualquer parte poderá rescindi-lo mediante aviso prévio de ${value(data.noticeDays)} dias. Na rescisão, o Cliente pagará os serviços executados e despesas previamente aprovadas até a data efetiva do término.`,
  );

  addHeading(doc, 9, "Limitação de responsabilidade");
  addParagraph(
    doc,
    "A responsabilidade total da Prestadora por danos decorrentes deste contrato fica limitada ao valor efetivamente pago pelo Cliente nos 3 (três) meses anteriores ao evento gerador. Não haverá responsabilização por lucros cessantes, danos indiretos ou resultados de negócio, salvo dolo ou culpa grave.",
  );

  addHeading(doc, 10, "Portal do cliente e onboarding");
  addParagraph(
    doc,
    "Após a assinatura, o Cliente terá acesso ao portal Three Devs para acompanhar projetos, status, contratos, links e notas. Sem a assinatura deste instrumento, o onboarding e o acesso ao portal permanecem bloqueados.",
  );

  addHeading(doc, 11, "Foro");
  addParagraph(
    doc,
    `Fica eleito o foro de ${value(data.jurisdiction)} para dirimir controvérsias oriundas deste contrato, com renúncia a qualquer outro, por mais privilegiado que seja.`,
  );

  ensureSpace(doc, 220);
  addHeading(doc, 12, "Aceite");
  addParagraph(
    doc,
    "Ao assinar este contrato, as partes declaram ter lido, compreendido e concordado com todas as cláusulas aqui estabelecidas.",
  );

  addSignature(
    doc,
    "Prestadora",
    data.agencyName,
    `Responsável: ${value(data.leadDeveloperName)}`,
  );
  addSignature(
    doc,
    "Cliente",
    data.clientName,
    data.clientCompany ? `Empresa: ${value(data.clientCompany)}` : "",
  );

  const pages = doc.bufferedPageRange();
  for (let pageIndex = pages.start; pageIndex < pages.start + pages.count; pageIndex += 1) {
    doc.switchToPage(pageIndex);
    addFooter(doc, pageIndex - pages.start + 1);
  }
  doc.end();

  return completion;
}

module.exports = {
  buildContractPdf,
  formatDate,
  safeFilename,
};
