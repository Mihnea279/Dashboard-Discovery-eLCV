// app.js — randează data/stats.json (export agregat, fără date de
// identificare a lead-urilor) ca pagină statică. Fără librării externe,
// consecvent cu restul proiectului Discovery B2B (stdlib-only pe partea
// Python, vanilla JS aici).

const NUME_GRAFICE = [
  ["dupa_status", "Pipeline (status curent)"],
  ["dupa_agent_status", "Stare agent"],
  ["dupa_clasificare_scor", "Clasificare scor"],
  ["dupa_banda_scor_intermediar", "Scor intermediar (bandă)"],
  ["dupa_banda_scor_final", "Scor final (bandă)"],
  ["dupa_industrie", "Industrie"],
  ["zile_de_la_trimitere_fara_raspuns", "Zile de la trimitere (fără răspuns)"],
  ["feedback_store_dupa_status", "Rezultate vânzări (Feedback Store)"],
];

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

function randeazaBaraGrafic(titlu, date) {
  const intrari = Object.entries(date || {}).sort((a, b) => b[1] - a[1]);
  const bloc = elem("div", { class: "grafic" }, [elem("h3", { text: titlu })]);

  if (intrari.length === 0) {
    bloc.appendChild(elem("p", { class: "grafic-gol", text: "Fără date." }));
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

function randeazaAgent(idAgent, stats) {
  const bloc = elem("section", { class: "agent-bloc" }, [
    elem("h2", { text: idAgent }),
  ]);

  const carduri = elem("div", { class: "carduri" }, [
    elem("div", { class: "card" }, [
      elem("div", { class: "valoare", text: String(stats.total_leads ?? 0) }),
      elem("div", { class: "eticheta", text: "Total lead-uri" }),
    ]),
  ]);
  bloc.appendChild(carduri);

  const grafice = elem("div", { class: "grafice" });
  for (const [cheie, titlu] of NUME_GRAFICE) {
    grafice.appendChild(randeazaBaraGrafic(titlu, stats[cheie]));
  }
  bloc.appendChild(grafice);

  return bloc;
}

async function init() {
  const containerAgenti = document.getElementById("agenti");
  const mesajEroare = document.getElementById("mesaj-eroare");
  const generatLa = document.getElementById("generat-la");

  try {
    const raspuns = await fetch("data/stats.json", { cache: "no-store" });
    if (!raspuns.ok) throw new Error(`HTTP ${raspuns.status}`);
    const date = await raspuns.json();

    generatLa.textContent = date.generat_la
      ? `Ultimul export: ${new Date(date.generat_la).toLocaleString("ro-RO")}`
      : "";

    const agenti = date.agenti || {};
    if (Object.keys(agenti).length === 0) {
      containerAgenti.appendChild(
        elem("p", { class: "grafic-gol", text: "Niciun agent cu date încă." })
      );
      return;
    }
    for (const [idAgent, stats] of Object.entries(agenti)) {
      containerAgenti.appendChild(randeazaAgent(idAgent, stats));
    }
  } catch (eroare) {
    mesajEroare.textContent = `Nu s-au putut încărca statisticile (${eroare.message}).`;
    mesajEroare.classList.remove("ascuns");
    generatLa.textContent = "";
  }
}

init();
