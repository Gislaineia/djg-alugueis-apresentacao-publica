"use strict";

// Apenas os mesmos registros inventados por tools/create_synthetic_demo.py.
// Nenhum dado é carregado, gravado ou enviado a um servidor.
const properties = [
  { id: "DEMO-LOJA-01", address: "Rua Exemplo, 100", unit: "Loja A", tenant: "Comércio Fictício Ltda", rent: 145000 },
  { id: "DEMO-SALA-02", address: "Avenida Modelo, 200", unit: "Sala 2", tenant: "Serviços Modelo Ltda", rent: 235000 },
  { id: "DEMO-GALPAO-03", address: "Travessa Fictícia, 30", unit: "Galpão", tenant: "Empresa de Teste Ltda", rent: 425000 },
];
const receipts = [
  { id: "REC-DEMO-01", propertyId: "DEMO-LOJA-01", competence: "2026-10", cashDate: "2026-11-10", amount: 145000 },
];
const costs = [
  { id: "CUSTO-DEMO-IPTU", propertyId: "DEMO-LOJA-01", kind: "IPTU", amount: 22000, source: "Guia fictícia" },
  { id: "CUSTO-DEMO-AGUA", propertyId: "DEMO-SALA-02", kind: "Água", amount: 8900, source: "Conta fictícia" },
  { id: "CUSTO-DEMO-ENERGIA", propertyId: "DEMO-SALA-02", kind: "Energia", amount: 16400, source: "Conta fictícia" },
  { id: "CUSTO-DEMO-SEGURO", propertyId: "DEMO-GALPAO-03", kind: "Seguro", amount: 36000, source: "Apólice fictícia" },
];
const names = {
  inicio: "Visão geral", imoveis: "Carteira e filtros", dossie: "Imóvel 360°",
  contratos: "Contratos", recebimentos: "Recebimentos", custos: "Custos e deveres",
  importar: "Importar arquivos", inventario: "Inventário da migração", auditoria: "Auditoria",
};
const brl = (cents) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
const esc = (value) => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[character]);
const byId = (id) => document.getElementById(id);
const propertyOptions = (all = true) => `${all ? '<option value="">Todos</option>' : ""}${properties.map((p) => `<option value="${esc(p.id)}">${esc(p.id)} · ${esc(p.unit)}</option>`).join("")}`;

function showView() {
  const requested = decodeURIComponent(location.hash.slice(1));
  const target = Object.hasOwn(names, requested) ? requested : "inicio";
  document.querySelectorAll(".view").forEach((view) => { view.classList.toggle("active", view.id === target); });
  document.querySelectorAll("#nav a").forEach((link) => {
    const active = link.dataset.view === target;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
    if (active) link.scrollIntoView({ block: "nearest", inline: "nearest" });
  });
  byId("path").textContent = names[target];
  if (requested !== target) history.replaceState(null, "", `#${target}`);
  window.scrollTo({ top: 0, behavior: "instant" });
}

function renderProperties() {
  const query = byId("property-query").value.trim().toLocaleLowerCase("pt-BR");
  const status = byId("property-status").value;
  const rows = properties.filter((p) => (!query || [p.id, p.address, p.unit, p.tenant].some((value) => value.toLocaleLowerCase("pt-BR").includes(query))) && (!status || status === "PROPOSTA"));
  byId("properties-body").innerHTML = rows.length ? rows.map((p) => `<tr><td><strong>${esc(p.id)}</strong></td><td>${esc(p.address)} · ${esc(p.unit)}</td><td>${esc(p.tenant)}</td><td><span class="badge pending">Proposta</span></td><td><a href="#dossie" data-select-property="${esc(p.id)}">Abrir 360°</a></td></tr>`).join("") : '<tr><td colspan="5" class="empty-row">Nenhum imóvel fictício corresponde ao filtro.</td></tr>';
  byId("properties-count").textContent = `${rows.length} de ${properties.length} imóveis fictícios`;
}

function renderContracts() {
  byId("contracts-body").innerHTML = properties.map((p) => `<tr><td>CTR-${esc(p.id)} · v1</td><td>${esc(p.id)}</td><td>${esc(p.tenant)}</td><td>01/01/2026</td><td>${brl(p.rent)}</td><td><span class="badge pending">Proposta fictícia</span></td></tr>`).join("");
}

function renderReceipts() {
  const month = byId("receipt-month").value;
  const propertyId = byId("receipt-property").value;
  const rows = receipts.filter((r) => (!month || r.competence === month) && (!propertyId || r.propertyId === propertyId));
  byId("receipts-body").innerHTML = rows.length ? rows.map((r) => `<tr><td>${esc(r.id)}</td><td>${esc(r.propertyId)}</td><td>${esc(r.competence)}</td><td>${esc(r.cashDate)} · informada</td><td>${brl(r.amount)}</td><td><span class="badge pending">Sem conciliação</span></td></tr>`).join("") : '<tr><td colspan="6" class="empty-row">Nenhum recebimento fictício corresponde ao filtro.</td></tr>';
  byId("receipts-count").textContent = `${rows.length} de ${receipts.length} registro fictício`;
}

function renderCosts() {
  const propertyId = byId("cost-property").value;
  const kind = byId("cost-kind").value;
  const rows = costs.filter((c) => (!propertyId || c.propertyId === propertyId) && (!kind || c.kind === kind));
  byId("costs-body").innerHTML = rows.length ? rows.map((c) => `<tr><td>${esc(c.id)}</td><td>${esc(c.propertyId)}</td><td>${esc(c.kind)}</td><td>2026-10</td><td>${brl(c.amount)}</td><td>${esc(c.source)}</td><td><span class="badge pending">A conferir</span></td></tr>`).join("") : '<tr><td colspan="7" class="empty-row">Nenhum custo fictício corresponde ao filtro.</td></tr>';
  byId("costs-count").textContent = `${rows.length} de ${costs.length} custos fictícios`;
}

function renderDossier() {
  const p = properties.find((item) => item.id === byId("dossier-property").value);
  if (!p) { byId("dossier-content").innerHTML = '<p class="small">Selecione um imóvel fictício.</p>'; return; }
  const relatedReceipt = receipts.filter((r) => r.propertyId === p.id);
  const relatedCosts = costs.filter((c) => c.propertyId === p.id);
  byId("dossier-content").innerHTML = `<div class="dossier-head"><div><span class="eyebrow">${esc(p.id)}</span><h2>${esc(p.address)} · ${esc(p.unit)}</h2><p>${esc(p.tenant)} · Proprietário fictício</p></div><span class="badge pending">Dados de exemplo</span></div><div class="dossier-grid"><div class="subcard"><h3>Contrato</h3><div class="dossier-row"><strong>CTR-${esc(p.id)} · v1</strong><small>Proposta fictícia · início informado 01/01/2026 · ${brl(p.rent)}</small></div></div><div class="subcard"><h3>Recebimentos informados (${relatedReceipt.length})</h3>${relatedReceipt.length ? relatedReceipt.map((r) => `<div class="dossier-row"><strong>${esc(r.id)} · ${brl(r.amount)}</strong><small>Competência ${esc(r.competence)} · caixa informado ${esc(r.cashDate)} · sem extrato</small></div>`).join("") : '<p>Nenhum recebimento neste exemplo.</p>'}</div><div class="subcard"><h3>Custos informados (${relatedCosts.length})</h3>${relatedCosts.length ? relatedCosts.map((c) => `<div class="dossier-row"><strong>${esc(c.kind)} · ${brl(c.amount)}</strong><small>${esc(c.source)} · responsável a conferir</small></div>`).join("") : '<p>Nenhum custo neste exemplo.</p>'}</div><div class="subcard"><h3>Documentos</h3><p>Nenhum documento original é servido nesta prévia pública.</p></div></div>`;
}

document.addEventListener("DOMContentLoaded", () => {
  byId("dossier-property").innerHTML = propertyOptions(false);
  byId("receipt-property").innerHTML = propertyOptions(true);
  byId("cost-property").innerHTML = propertyOptions(true);
  byId("dossier-property").value = properties[0].id;
  renderProperties(); renderContracts(); renderReceipts(); renderCosts(); renderDossier(); showView();
  window.addEventListener("hashchange", showView);
  byId("property-query").addEventListener("input", renderProperties);
  byId("property-status").addEventListener("change", renderProperties);
  byId("dossier-property").addEventListener("change", renderDossier);
  byId("receipt-month").addEventListener("change", renderReceipts);
  byId("receipt-property").addEventListener("change", renderReceipts);
  byId("cost-property").addEventListener("change", renderCosts);
  byId("cost-kind").addEventListener("change", renderCosts);
  byId("properties-body").addEventListener("click", (event) => {
    const link = event.target.closest("[data-select-property]");
    if (!link) return;
    byId("dossier-property").value = link.dataset.selectProperty;
    renderDossier();
  });
});
