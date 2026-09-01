# Dashboard-Discovery-eLCV

New repo for the claude sonnet 5 agentic processing in BADSI

## Ce este acest site

Site static (GitHub Pages), publicat din acest repo, care arată **statistici
agregate** despre procesul de calificare a lead-urilor B2B ("Discovery
B2B"), pe 4 ferestre de timp (24h/săptămână/lună/an): lead-uri noi, scor
mediu, timp mediu de procesare, CUI negăsit, recomandări cu greșeală
(din audituri umane), status pipeline, recomandări pe tip de vehicul,
schimbare procentuală a lead-urilor necontactate.

**Nu conține date de identificare a lead-urilor** (nume, denumire firmă,
CUI, email, telefon, date financiare). Datele reale trăiesc local, într-un
proiect separat ("Agentic Base"), și rămân acolo — vezi
`scripts/export_statistici_publice.py` din acel proiect, care generează
`data/stats.json` deja anonimizat/agregat, singurul lucru publicat aici.

## Cum se actualizează

**Automat**, din 1 sep 2026: `rulare_programata.sh` (launchd, zilnic 9:00,
zile lucrătoare, în proiectul "Agentic Base") rulează Discovery B2B, apoi
`scripts/actualizeaza_si_publica_statistici.sh` face export + commit + push
aici, fără intervenție umană — vezi `CLAUDE.md` din "Agentic Base" pentru
pragurile de siguranță (nu publică nimic dacă exportul eșuează sau produce
date invalide).

Actualizare manuală, imediată (nu trebuie să aștepți ora 9:00):

```bash
# din proiectul "Agentic Base"
./scripts/actualizeaza_si_publica_statistici.sh   # export + commit + push
# SAU doar exportul, fără push:
python3 scripts/export_statistici_publice.py
```

Statistica "recomandări cu greșeală" nu se calculează automat — se
înregistrează manual, după un audit uman al recomandărilor, cu
`python3 scripts/inregistreaza_audit.py --autor "..." --recomandari-verificate N
--recomandari-cu-erori M` (din proiectul "Agentic Base"; vezi
`orchestrator/audit_log.py` pentru motiv).

## Cum se rulează local

```bash
python3 -m http.server 8080
```

apoi deschide `http://localhost:8080/`.
