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

Manual, ori de câte ori se dorește o actualizare (nu automat):

1. În proiectul local "Agentic Base": `python3 scripts/export_statistici_publice.py`
   — rescrie `Dashboard-Discovery-eLCV/data/stats.json` (citește CRM-ul
   Workleto real + `_marcaje_locale.json` + `audit_log.csv`).
2. Verifică rapid conținutul (doar numărători, fără nume/CUI/email).
3. În acest repo: `git add data/stats.json && git commit -m "..." && git push`.

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
