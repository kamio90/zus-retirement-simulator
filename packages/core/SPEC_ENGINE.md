# Actuarial Algorithm Specification — ZUS Engine

## Steps

A. Entitlement setup
- Compute retirementAge (default by gender if not provided)
- Compute entitlementYear and claimDate (year + month)
- Map EntitlementQuarter from claimMonth (Q1/Q2/Q3/Q4)

B. Wage projection (annualized)
- AnchorYear = simulation calendar year (default 2025)
- Wage baseline: Option A (backcast current gross to startWorkYear, forecast forward); Option B (forward-only from anchor)
- For each year Y in [startWorkYear..entitlementYear-1], yield annual wage in nominal PLN

C. Annual contributions
- Contribution = annual wage × contribution rate × absenceFactor
- Contribution rate injected by provider

D. Annual valorization
- Contributions by 31 Jan of year Y valorized on 1 June using annual index for Y-1
- Cumulative valorization in order

E. Quarterly valorization
- Contributions after last 31 Jan not yet valorized: apply quarterly up to claim month
- Quarter mapping: Q1→Q3 prev year, Q2→Q4 prev year, Q3→Q1 curr year, Q4→Q2 curr year
- Valorize on last day of first month of quarter, compounding indices

F. Initial capital
- If provided: valorize using special 1999 index (1 June 2000), then annual path
- Quarterly rules apply at entitlement

G. Sub-account (optional)
- Valorize per provider path if present

H. Base and pension
- Base = sum of valorized contributions + initial capital (+ sub-account)
- SDŻ (life expectancy) from provider, claim date window (Apr–Mar)
- Monthly pension nominal = base / (SDŻ_years × 12)
- Monthly pension real = nominal discounted by cumulative CPI
- Replacement rate = real monthly pension / current gross monthly

I. Explainability
- Build capital trajectory per year
- Record final quarterly step
- Emit assumptions, index IDs, SDŻ table ID, explainers

## Notes
- Chronology: annual before quarterly; cutoff semantics
- Partial years: define handling for final pre-claim period
