# Rounding & Precision Policy

- Internal math: IEEE-754 double, no intermediate rounding
- Currency outputs: round to 2 decimals (PLN grosz)
- Rates: round to 4–6 decimals
- Avoid subtractive cancellation; prefer multiplicative compounding
- Decimal library can be swapped in without changing contracts
