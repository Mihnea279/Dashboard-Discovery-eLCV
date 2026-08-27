# Dashboard-Discovery-eLCV

New repo for the claude sonnet 5 agentic processing in BADSI

## Ce este acest site

Site static (GitHub Pages), publicat din acest repo, care arată **statistici
agregate** despre procesul de calificare a lead-urilor B2B ("Discovery
B2B"): numărători pe pipeline/status, distribuții de scor, industrii,
rezultate de vânzări.

**Nu conține date de identificare a lead-urilor** (nume, denumire firmă,
CUI, email, telefon, date financiare). Datele reale ale lead-urilor trăiesc
local, într-un proiect separat, și rămân acolo — vezi
`scripts/export_statistici_publice.py` din acel proiect, care generează
`data/stats.json` deja anonimizat/agregat, singurul lucru publicat aici.

## Cum se actualizează

Manual, ori de câte ori se dorește o actualizare (nu automat):

1. În proiectul local "Agentic Base": `python3 scripts/export_statistici_publice.py`
   — rescrie `Dashboard-Discovery-eLCV/data/stats.json`.
2. Verifică rapid conținutul (doar numărători, fără nume/CUI/email).
3. În acest repo: `git add data/stats.json && git commit -m "..." && git push`.

## Cum se rulează local

```bash
python3 -m http.server 8080
```

apoi deschide `http://localhost:8080/`.
