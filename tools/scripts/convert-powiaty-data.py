#!/usr/bin/env python3
"""
Convert powiaty Excel data to JSON format

Reads: data/pkt 6_emerytury_powiaty.xlsx
Writes: packages/data/json/powiaty.json

TERYT codes are converted from 4-digit format (województwo+powiat) 
to 7-digit format (województwo+powiat+gmina+type) by appending '000'
"""

import pandas as pd
import json
import sys
from pathlib import Path

def main():
    # Setup paths
    repo_root = Path(__file__).parent.parent.parent
    excel_path = repo_root / "data" / "pkt 6_emerytury_powiaty.xlsx"
    output_path = repo_root / "packages" / "data" / "src" / "json" / "powiaty.json"
    
    print(f"Reading Excel file: {excel_path}")
    
    # Read Excel data (skip header rows)
    df = pd.read_excel(excel_path, sheet_name=0, skiprows=9)
    
    # Extract powiat data
    powiaty = []
    for _, row in df.iterrows():
        if pd.notna(row.iloc[1]):  # Has powiat name
            # Convert TERYT from 4-digit to 7-digit format
            teryt_4digit = int(row.iloc[2]) if pd.notna(row.iloc[2]) else None
            teryt_7digit = f"{teryt_4digit:04d}000" if teryt_4digit else None
            
            # Column indices based on header analysis:
            # Col 3-5: Men without allowances (max, min, avg)
            # Col 6-8: Women without allowances (max, min, avg)
            powiat = {
                "name": str(row.iloc[1]).strip(),
                "teryt": teryt_7digit,
                "avgPensionMale": float(row.iloc[5]) if pd.notna(row.iloc[5]) else None,
                "avgPensionFemale": float(row.iloc[8]) if pd.notna(row.iloc[8]) else None
            }
            powiaty.append(powiat)
    
    # Calculate national averages
    male_pensions = [p["avgPensionMale"] for p in powiaty if p["avgPensionMale"] is not None]
    female_pensions = [p["avgPensionFemale"] for p in powiaty if p["avgPensionFemale"] is not None]
    
    national_avg_male = sum(male_pensions) / len(male_pensions) if male_pensions else 0
    national_avg_female = sum(female_pensions) / len(female_pensions) if female_pensions else 0
    national_avg_overall = (national_avg_male + national_avg_female) / 2
    
    # Build output structure
    output_data = {
        "version": "1.0.0",
        "source": "pkt 6_emerytury_powiaty.xlsx",
        "dataDate": "2024-12",
        "description": "Average pension amounts by powiat (district) in Poland",
        "nationalAverage": {
            "overall": round(national_avg_overall, 2),
            "male": round(national_avg_male, 2),
            "female": round(national_avg_female, 2)
        },
        "powiaty": powiaty
    }
    
    # Ensure output directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Write JSON
    print(f"Writing {len(powiaty)} powiaty to: {output_path}")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Conversion complete!")
    print(f"  National average (overall): {national_avg_overall:.2f} PLN")
    print(f"  National average (male): {national_avg_male:.2f} PLN")
    print(f"  National average (female): {national_avg_female:.2f} PLN")
    print(f"  Total powiaty: {len(powiaty)}")

if __name__ == "__main__":
    main()
