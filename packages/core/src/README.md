# Pension Calculation Engine — Specification

## Domain Glossary

- **Waloryzacja roczna**: Annual valorization (capital increase by macro rate)
- **Waloryzacja kwartalna**: Quarterly valorization (correction by retirement quarter)
- **CPI**: Consumer Price Index (inflation adjustment)
- **SDŻ**: Średnie dalsze życie (life expectancy mapping)

## Algorithm Steps

1. **Wage projection**: base salary × wage growth path (from macro.json)
2. **Contributions**: wage × 19.52% × absenceFactor
3. **Annual valorization**: accumulatedCapital × (1 + valorizationRate)
4. **Quarterly valorization**: apply quarterly correction depending on retirement quarter
5. **Initial capital**: valorized using coefficients from initial capital data
6. **Life expectancy mapping**: SDŻ from life_expectancy.json
7. **Pension nominal**: capital / (lifeExpectancyYears × 12)
8. **Pension real (today)**: nominal / cumulative CPI
9. **Replacement rate**: pensionReal / currentGrossMonthly
10. **Capital trajectory**: yearly capital values
11. **Return all assumptions used**

## Constraints

- No hard-coded constants; all parameters loaded from @data JSON
- Deterministic math, pure functions, no side effects
- Handles edge cases: short careers, high salary, absenceFactor < 1, future/past start years, extreme retirement ages

## Edge Cases

- **Short careers**: e.g. < 10 years
- **Very high salary**: e.g. > 50,000 PLN/month
- **Absence factor < 1**: e.g. long-term sickness
- **Future/past start years**: e.g. startWorkYear in future or before 1980
- **Extreme retirement ages**: e.g. 60 or 70

## Usage

Reference `calculatePension` in API service layer. All inputs/outputs strictly typed via `@types`.
