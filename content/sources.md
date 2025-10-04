# Official Sources - ZUS Retirement Simulator

This document lists all official sources used for content and calculations in the ZUS Retirement Simulator.

## Primary Sources

### ZUS (Zakład Ubezpieczeń Społecznych)
- **Main Portal**: https://www.zus.pl
- **Pension Calculator**: https://www.zus.pl/emerytura/kalkulator-emerytalny
- **Contribution Rates**: https://www.zus.pl/baza-wiedzy/skladki
- **Valorization Rules**: https://www.zus.pl/baza-wiedzy/waloryzacja

### GOV.PL
- **Retirement Information**: https://www.gov.pl/web/emerytury-i-renty
- **Social Insurance**: https://www.gov.pl/web/zus

### GUS (Główny Urząd Statystyczny)
- **Life Expectancy Tables**: https://stat.gov.pl/obszary-tematyczne/ludnosc/trwanie-zycia/
- **Mortality Tables**: https://stat.gov.pl/tablice-trwania-zycia/

### Legal Acts
- **Pension Act**: https://isap.sejm.gov.pl/ (Act on pensions from FUS)
- **Social Insurance Act**: https://isap.sejm.gov.pl/ (Social insurance system act)

## Data Sources Used

### Macroeconomic Parameters
- Source: `/data/Parametry-III 2025.xlsx`
- Contains: CPI indices, wage growth rates, valorization coefficients

### Life Expectancy (SDŻ - Średnie Dalsze Życie)
- Source: GUS Tables + ZUS publications
- Window: April 1 - March 31 (annual update)
- Reference: https://stat.gov.pl/tablice-trwania-zycia/

### Valorization Rules
- Annual valorization: Applied June 1st using previous year indices
- Quarterly valorization: Applied based on claim quarter
- Source: ZUS regulations + `/data/Parametry-III 2025.xlsx`

### Initial Capital (Kapitał Początkowy)
- First index: 115.60% (1999 baseline)
- Source: `/data/pkt 3_kapitał początkowy.xlsx`

### Contribution Rates
- Standard rate: 19.52% of contribution base
- UoP: Full gross salary as base
- JDG: Minimum base or declared amount
- JDG Ryczałt: Reduced base (30% of income or 4500 PLN max)
- Source: https://www.zus.pl/baza-wiedzy/skladki

## Content Verification

All "Worth Knowing" content items reference official sources listed above. Content is:
- Neutral and factual
- Verified against official ZUS/GOV publications
- Updated as of 2025 (HackYeah competition year)

## Last Updated
2025-01-09
