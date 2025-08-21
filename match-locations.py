#!/usr/bin/env python3
import json
import requests

# 현재 데이터베이스에서 장비명 목록 가져오기
try:
    response = requests.get('http://localhost:3000/api/outdoor-units')
    if response.status_code == 200:
        data = response.json()
        current_names = {item['name']: item['id'] for item in data['data']}
    else:
        print(f"Error fetching data: {response.status_code}")
        exit(1)
except Exception as e:
    print(f"Error: {e}")
    exit(1)

# 업데이트할 location 매핑 (제공된 데이터)
location_mapping = {
    "AHU-H1-1호-CDU1": "전자소재3공장",
    "AHU-H1-1호-CDU2": "전자소재3공장",
    "AHU-H1-1호-CDU3": "전자소재3공장",
    "AHU-H1-1호-CDU4": "전자소재3공장",
    "AHU-H1-1호-CDU5": "전자소재3공장",
    "AHU-H1-1호-CDU6": "전자소재3공장",
    "AHU-H1-2호-CDU1": "전자소재3공장",
    "AHU-H1-2호-CDU2": "전자소재3공장",
    "AHU-H2-1호-CDU1": "전자소재3공장",
    "AHU-H2-1호-CDU2": "전자소재3공장",
    "AHU-H2-2호-CDU1": "전자소재3공장",
    "AHU-H2-2호-CDU2": "전자소재3공장",
    "AHU-D1-1-1": "전자소재3공장",
    "AHU-D1-1-2": "전자소재3공장",
    "AHU-D1-2-1": "전자소재3공장",
    "AHU-D1-2-2": "전자소재3공장",
    "AHU-D2-1-1": "전자소재3공장",
    "AHU-D2-1-2": "전자소재3공장",
    "AHU-D2-2-1": "전자소재3공장",
    "AHU-D2-2-2": "전자소재3공장",
    "AHU-D3-1-1": "전자소재3공장",
    "AHU-D3-1-2": "전자소재3공장",
    "AHU-D3-2-1": "전자소재3공장",
    "AHU-D3-2-2": "전자소재3공장",
    "AHU-D3-3-1": "전자소재3공장",
    "AHU-D3-3-2": "전자소재3공장",
    "OAC-1-1-1": "전자소재3공장",
    "OAC-1-1-2": "전자소재3공장",
    "OAC-1-1-3": "전자소재3공장",
    "OAC-2-1-1": "전자소재3공장",
    "OAC-2-1-2": "전자소재3공장",
    "OAC-2-1-3": "전자소재3공장",
    "PID AHU 1-1": "전자소재3공장",
    "PID AHU 1-2": "전자소재3공장",
    "PID AHU 1-3": "전자소재3공장",
    "PID AHU 1-4": "전자소재3공장",
    "PID AHU 2-1": "전자소재3공장",
    "PID AHU 2-2": "전자소재3공장",
    "타발1-1": "전자소재3공장",
    "타발1-2": "전자소재3공장",
    "재용창고 AHU 1 CDU1": "전자소재3공장",
    "저온창고 CDU1": "전자소재3공장",
    "저온창고 CDU2": "전자소재3공장",
    "AHU-3 PC#1": "전자소재6공장",
    "AHU-3 PC#2": "전자소재6공장",
    "AHU-2 CDU1": "전자소재6공장",
    "AHU-2 CDU2": "전자소재6공장",
    "AHU-1 CDU1": "전자소재6공장",
    "AHU-1 CDU2": "전자소재6공장",
    "AHU-3 AC#1": "전자소재6공장",
    "AHU-3 AC#2": "전자소재6공장",
    "QA1-1": "전자소재6공장",
    "QA1-2": "전자소재6공장",
    "QA2-1": "전자소재6공장",
    "가동 1-1": "전자소재7공장",
    "가동 1-2": "전자소재7공장",
    "가동 2-1": "전자소재7공장",
    "가동 2-2": "전자소재7공장",
    "4-1": "전자소재7공장",
    "4-2": "전자소재7공장",
    "4-3": "전자소재7공장",
    "4-4": "전자소재7공장",
    "5-1": "전자소재7공장",
    "5-2": "전자소재7공장",
    "6-1": "전자소재7공장",
    "6-2": "전자소재7공장",
    "7-1": "전자소재7공장",
    "7-2": "전자소재7공장",
    "7-3": "전자소재7공장",
    "7-4": "전자소재7공장",
    "8-1": "전자소재7공장",
    "8-2": "전자소재7공장",
    "8-3": "전자소재7공장",
    "8-4": "전자소재7공장",
    "9-A": "전자소재7공장",
    "9-B": "전자소재7공장",
    "항온항습기 CDU1": "전자소재8공장",
    "항온항습기 CDU2": "전자소재8공장",
    "항온항습기 2 CDU1": "전자소재8공장",
    "항온항습기 2 CDU2": "전자소재8공장",
    "DHU-1-2 AC 1-1": "전자소재8공장",
    "DHU-1-2 AC 1-2": "전자소재8공장",
    "DHU-1-2 PC 1-1": "전자소재8공장",
    "DHU-1-2 PC 1-2": "전자소재8공장",
    "AHU-1 1F CDE #1": "전자소재8공장",
    "AHU-1 1F CDE #2": "전자소재8공장",
    "DHU-1-1 1F AC 1-1": "전자소재8공장",
    "DHU-1-1 1F AC 1-2": "전자소재8공장",
    "DHU-1-1 1F RC": "전자소재8공장",
    "DHU-1-1 1F PC": "전자소재8공장",
    "2F옥외 2F CDU3": "전자소재8공장",
    "2F옥외 2F CDU1": "전자소재8공장",
    "4F 옥외 냉동기 1": "전자소재8공장",
    "4F 옥외 냉동기 2": "전자소재8공장",
    "4F AHU2 CDU1": "전자소재8공장",
    "4F AHU2 CDU2": "전자소재8공장",
    "4F AHU3 CDU1": "전자소재8공장",
    "4F AHU3 CDU2": "전자소재8공장",
    "4F AHU3 CDU3": "전자소재8공장",
    "4F AHU3 CDU4": "전자소재8공장",
    "4F AHU4 CDU1": "전자소재8공장",
    "4F AHU4 CDU2": "전자소재8공장",
    "DHU-3 4F옥상R 3F PC1-1": "전자소재8공장",
    "DHU-3 4F옥상R 3F PC1-2": "전자소재8공장",
    "DHU-3 4F옥상R 3F PC2-1": "전자소재8공장",
    "DHU-3 4F옥상R 3F PC2-2": "전자소재8공장",
    "DHU-3 4F옥상R 3F AC1-1": "전자소재8공장",
    "DHU-3 4F옥상R 3F AC1-2": "전자소재8공장",
    "DHU-3 4F옥상R 3F AC2-1": "전자소재8공장",
    "DHU-3 4F옥상R 3F AC2-2": "전자소재8공장",
    "승화실 BCU(승화1실)": "전자소재8공장",
    "승화실 BCU(승화2실)": "전자소재8공장",
    "승화실 BCU(승화3실)": "전자소재8공장",
    "승화실 BCU(승화4실)": "전자소재8공장",
    "승화실 4BCU(승화5실)": "전자소재8공장",
    "승화실 1BCU(승화6실)": "전자소재8공장",
    "승화실 3BCU(승화7실)": "전자소재8공장",
    "승화실 2BCU(승화8실)": "전자소재8공장",
    "SDU SRT": "전자소재8공장",
    "2F P/C 1-1": "전자소재8공장",
    "2F P/C 1-2": "전자소재8공장",
    "2F P/C 2-1": "전자소재8공장",
    "2F P/C 2-2": "전자소재8공장",
    "2F A/C 1-1": "전자소재8공장",
    "2F A/C 1-2": "전자소재8공장",
    "2F R/C #1": "전자소재8공장",
    "DHU-1902 에프터글로리 CDU1": "전자소재8공장",
    "DHU-1902 에프터글로리 CDU2": "전자소재8공장",
    "DHU-1902 프리글로리 CDU1": "전자소재8공장",
    "DHU-1902 프리글로리 CDU2": "전자소재8공장",
    "DHU-1901 3F CDU1": "전자소재8공장",
    "DHU-1901 3F CDU2": "전자소재8공장",
    "DHU-1901 3F CDU3": "전자소재8공장",
    "DHU-1901 3F CDU4": "전자소재8공장",
    "AHU-1901 3F옥상 CDU1": "전자소재9공장",
    "AHU-1901 3F옥상 CDU2": "전자소재9공장",
    "AHU-1901 3F옥상 CDU3": "전자소재9공장",
    "AHU-1902 3F옥상 CDU1": "전자소재9공장",
    "AHU-1902 3F옥상 CDU2": "전자소재9공장",
    "AHU-1902 3F옥상 CDU3": "전자소재9공장",
    "AHU-1903 3F옥상 CDU1": "전자소재9공장",
    "AHU-1903 3F옥상 CDU2": "전자소재9공장",
    "AHU-1903 3F옥상 CDU3": "전자소재9공장",
    "AHU-1904 3F옥상 CDU1": "전자소재9공장",
    "AHU-1904 3F옥상 CDU2": "전자소재9공장",
    "AHU-1904 3F옥상 CDU3": "전자소재9공장",
    "AHU-1905 1F옥외 CDU1": "전자소재9공장",
    "AHU-1905 1F옥외 CDU2": "전자소재9공장",
    "AHU CDU01": "부설연구소",
    "AHU CDU02": "부설연구소",
    "AHU CDU03": "부설연구소",
    "OAC CDU01": "부설연구소",
    "OAC CDU02": "부설연구소",
    "공정평가실1": "부설연구소",
    "공정평가실2": "부설연구소",
    "C104 항온항습기 1": "부설연구소",
    "C104 항온항습기 2": "부설연구소",
    "C102 항온항습기 1": "부설연구소",
    "C106 LTC 항온항습기": "부설연구소",
    "C110 멀티고어식 항온항습기": "부설연구소",
    "C112 멀티고어식 항온항습기": "부설연구소",
    "C107 항온항습기": "부설연구소",
    "C109 항온항습기1": "부설연구소",
    "C109 항온항습기2": "부설연구소",
    "C211 항온항습기1": "부설연구소",
    "C211 항온항습기2": "부설연구소"
}

# 매칭되는 장비 찾기
matched_updates = []
not_found = []

for name, location in location_mapping.items():
    if name in current_names:
        matched_updates.append({
            "name": name,
            "location": location
        })
        print(f"✓ Found: {name}")
    else:
        not_found.append(name)
        print(f"✗ Not found: {name}")

print(f"\nMatched: {len(matched_updates)} / {len(location_mapping)}")
print(f"Not found: {len(not_found)}")

# 매칭된 업데이트 데이터를 JSON 파일로 저장
if matched_updates:
    with open('matched-location-updates.json', 'w', encoding='utf-8') as f:
        json.dump(matched_updates, f, ensure_ascii=False, indent=2)
    print(f"\nSaved {len(matched_updates)} matched updates to matched-location-updates.json")

# 찾지 못한 장비명 출력
if not_found:
    print(f"\nNot found equipment names:")
    for name in not_found[:10]:  # 처음 10개만 출력
        print(f"  - {name}")
    if len(not_found) > 10:
        print(f"  ... and {len(not_found) - 10} more")