// app.js — randează data/stats.json (export agregat, fără date de
// identificare a lead-urilor) ca pagină statică. Fără librării externe,
// consecvent cu restul proiectului Discovery B2B (stdlib-only pe partea
// Python, vanilla JS aici).

const FERESTRE = [
  ["24h", "24 ore"],
  ["saptamana", "Săptămână"],
  ["luna", "Lună"],
  ["an", "An"],
];

const NUME_GRAFICE = [
  ["dupa_status", "Pipeline (status curent)"],
  ["recomandari_dupa_tip_vehicul", "Recomandări pe tip de vehicul"],
];

// Nume de afișare pentru id-ul de agent (cheie tehnică din config.yaml) —
// "discovery_b2b" pe site apare ca "Discovery B2B". Un id fără intrare aici
// apare neschimbat (fallback sigur pentru un agent nou, adăugat ulterior).
const NUME_AFISARE_AGENT = {
  discovery_b2b: "Discovery B2B",
};

// Ordinea cerută explicit pentru graficul de pipeline (nu alfabetică, nu
// după valoare) — vezi STATUS_ID_NUME din scripts/export_statistici_publice.py
// pentru maparea id→nume. Orice status apărut în date dar absent de-aici
// (ex. un "Status #<id>" încă nemapat) e adăugat la coadă, în ordinea din
// date, ca să nu dispară din grafic.
const ORDINE_STATUS = [
  "Necontactat", "Zero Value", "În prospectare", "Prezentare produs",
  "În negociere", "Contractat", "Livrat", "Vânzare pierdută",
];

let STATS = null;
let FEREASTRA_CURENTA = "saptamana";

function elem(tag, atribute = {}, copii = []) {
  const el = document.createElement(tag);
  for (const [cheie, valoare] of Object.entries(atribute)) {
    if (cheie === "class") el.className = valoare;
    else if (cheie === "text") el.textContent = valoare;
    else el.setAttribute(cheie, valoare);
  }
  for (const copil of copii) el.appendChild(copil);
  return el;
}

function formateazaProcent(valoare) {
  if (valoare === null || valoare === undefined) return "—";
  const semn = valoare > 0 ? "+" : "";
  return `${semn}${valoare}%`;
}

function formateazaNumar(valoare, sufix = "") {
  return valoare === null || valoare === undefined ? "—" : `${valoare}${sufix}`;
}

function randeazaBaraGrafic(titlu, date, ordineFixa = null) {
  let intrari;
  if (ordineFixa) {
    const ramase = new Set(Object.keys(date || {}));
    intrari = [];
    for (const eticheta of ordineFixa) {
      if (ramase.has(eticheta)) {
        intrari.push([eticheta, date[eticheta]]);
        ramase.delete(eticheta);
      }
    }
    // Orice cheie neprevăzută în ordinea fixă (ex. un status_id nou,
    // nemapat încă) — adăugată la coadă, ca să nu dispară din grafic.
    for (const eticheta of ramase) intrari.push([eticheta, date[eticheta]]);
  } else {
    intrari = Object.entries(date || {}).sort((a, b) => b[1] - a[1]);
  }
  const bloc = elem("div", { class: "grafic" }, [elem("h3", { text: titlu })]);

  if (intrari.length === 0) {
    bloc.appendChild(elem("p", { class: "grafic-gol", text: "Fără date în această fereastră." }));
    return bloc;
  }

  const maxim = Math.max(...intrari.map(([, v]) => v));
  for (const [eticheta, valoare] of intrari) {
    const procent = maxim > 0 ? (valoare / maxim) * 100 : 0;
    const umplere = elem("div", { class: "bara-umplere" });
    umplere.style.width = `${procent}%`;
    const pista = elem("div", { class: "bara-pista" }, [umplere]);
    bloc.appendChild(
      elem("div", { class: "bara-rand" }, [
        elem("span", { class: "bara-eticheta", text: eticheta, title: eticheta }),
        pista,
        elem("span", { class: "bara-valoare", text: String(valoare) }),
      ])
    );
  }
  return bloc;
}

function cardStat(valoare, eticheta, sub = null) {
  const copii = [
    elem("div", { class: "valoare", text: valoare }),
    elem("div", { class: "eticheta", text: eticheta }),
  ];
  if (sub) copii.push(elem("div", { class: "sub-eticheta", text: sub }));
  return elem("div", { class: "card" }, copii);
}

function randeazaSelectorFereastra(container) {
  const bara = elem("div", { class: "selector-fereastra" }, [
    elem("label", { for: "select-fereastra", text: "Perioadă:" }),
  ]);
  const select = elem("select", { id: "select-fereastra" });
  for (const [cheie, eticheta] of FERESTRE) {
    const optiune = elem("option", { value: cheie, text: eticheta });
    if (cheie === FEREASTRA_CURENTA) optiune.selected = true;
    select.appendChild(optiune);
  }
  select.addEventListener("change", () => {
    FEREASTRA_CURENTA = select.value;
    randeazaTot();
  });
  bara.appendChild(select);
  container.appendChild(bara);
}

function randeazaUltimaRulare(ultimaRulare) {
  const bloc = elem("div", { class: "ultima-rulare-bloc" }, [
    elem("h3", { text: "Ultima rulare" }),
  ]);
  if (!ultimaRulare) {
    bloc.appendChild(elem("p", { class: "grafic-gol", text: "Orchestratorul nu a mai rulat încă." }));
    return bloc;
  }
  bloc.appendChild(
    elem("p", {
      class: "ultima-rulare-data",
      text: `${new Date(ultimaRulare.data_rulare).toLocaleString("ro-RO")}`,
    })
  );
  const carduri = elem("div", { class: "carduri" }, [
    cardStat(formateazaNumar(ultimaRulare.total_lead_uri), "Lead-uri procesate"),
    cardStat(formateazaNumar(ultimaRulare.finalizate), "Finalizate (recomandare scrisă)"),
    cardStat(formateazaNumar(ultimaRulare.in_asteptare), "În așteptare (continuă rularea următoare)"),
    cardStat(formateazaNumar(ultimaRulare.erori), "Erori"),
  ]);
  bloc.appendChild(carduri);
  return bloc;
}

function randeazaAgent(idAgent, statsAgent) {
  const fw = statsAgent.ferestre[FEREASTRA_CURENTA];
  const nume = NUME_AFISARE_AGENT[idAgent] || idAgent;
  const bloc = elem("section", { class: "agent-bloc" }, [elem("h2", { text: nume })]);

  bloc.appendChild(randeazaUltimaRulare(statsAgent.ultima_rulare));
  bloc.appendChild(elem("h3", { class: "titlu-fereastra", text: `Statistici: ${FERESTRE.find(([c]) => c === FEREASTRA_CURENTA)[1]}` }));

  const carduri = elem("div", { class: "carduri" }, [
    cardStat(formateazaNumar(fw.numar_leaduri_noi), "Lead-uri noi"),
    cardStat(formateazaNumar(fw.scor_mediu), "Scor mediu"),
    cardStat(
      formateazaNumar(fw.timp_mediu_procesare_minute, " min"),
      "Timp mediu de procesare",
      "CRM → scor → recomandare"
    ),
    cardStat(
      formateazaNumar(fw.cui_negasite) + " / " + formateazaNumar(fw.cui_verificate_total),
      "CUI negăsit",
      formateazaProcent(fw.cui_negasite_procent)
    ),
    cardStat(
      formateazaNumar(fw.recomandari_cu_erori) + " / " + formateazaNumar(fw.recomandari_analizate_total),
      "Recomandări cu greșeală (din audituri)",
      formateazaProcent(fw.recomandari_cu_erori_procent)
    ),
    cardStat(
      formateazaNumar(fw.necontactate_curent),
      "Necontactate (lead-uri noi din fereastră)",
      `${formateazaProcent(fw.necontactate_procent_schimbare_vs_perioada_anterioara)} vs. perioada anterioară`
    ),
  ]);
  bloc.appendChild(carduri);

  const grafice = elem("div", { class: "grafice" });
  for (const [cheie, titlu] of NUME_GRAFICE) {
    const ordineFixa = cheie === "dupa_status" ? ORDINE_STATUS : null;
    grafice.appendChild(randeazaBaraGrafic(titlu, fw[cheie], ordineFixa));
  }
  bloc.appendChild(grafice);

  return bloc;
}

function randeazaTot() {
  const containerAgenti = document.getElementById("agenti");
  const containerSelector = document.getElementById("selector-fereastra");
  const containerAudit = document.getElementById("audit-info");
  containerAgenti.innerHTML = "";
  containerSelector.innerHTML = "";
  containerAudit.innerHTML = "";

  if (!STATS) return;

  randeazaSelectorFereastra(containerSelector);

  const agenti = STATS.agenti || {};
  if (Object.keys(agenti).length === 0) {
    containerAgenti.appendChild(elem("p", { class: "grafic-gol", text: "Niciun agent cu date încă." }));
    return;
  }
  for (const [idAgent, statsAgent] of Object.entries(agenti)) {
    if (statsAgent.ultimul_audit) {
      const { data_audit, autor } = statsAgent.ultimul_audit;
      containerAudit.appendChild(
        elem("p", { class: "ultimul-audit", text: `Ultimul audit al recomandărilor: ${data_audit} (${autor})` })
      );
    } else {
      containerAudit.appendChild(
        elem("p", { class: "ultimul-audit ultimul-audit-lipsa", text: "Niciun audit înregistrat încă." })
      );
    }
    containerAgenti.appendChild(randeazaAgent(idAgent, statsAgent));
  }
}

async function init() {
  const mesajEroare = document.getElementById("mesaj-eroare");
  const generatLa = document.getElementById("generat-la");

  try {
    const raspuns = await fetch("data/stats.json", { cache: "no-store" });
    if (!raspuns.ok) throw new Error(`HTTP ${raspuns.status}`);
    STATS = await raspuns.json();

    generatLa.textContent = STATS.generat_la
      ? `Ultimul export: ${new Date(STATS.generat_la).toLocaleString("ro-RO")}`
      : "";

    randeazaTot();
  } catch (eroare) {
    mesajEroare.textContent = `Nu s-au putut încărca statisticile (${eroare.message}).`;
    mesajEroare.classList.remove("ascuns");
    generatLa.textContent = "";
  }
}

init();
