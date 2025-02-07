import httpx
import json
import os
from datetime import datetime

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
SECRET_FILE = os.path.join(BASE_DIR, 'secrets.json')

with open(SECRET_FILE) as f:
    secrets = json.load(f)

GOV_API_URL = secrets["GOV_API"]["URL"]

def load_locations(filepath='locations.json'):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def fetch_disaster_messages():
    locations_data = load_locations()
    
    try:
        response = httpx.get(GOV_API_URL, verify=False)
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        print(f"Error fetching data from API: {e}")
        return []

    messages = []
    disaster_msgs = data.get("body", [])  

    for row in disaster_msgs:  
        try:
            create_date_str = row.get("CRT_DT", "")
            create_date = datetime.strptime(create_date_str, "%Y/%m/%d %H:%M:%S") if create_date_str else None            
            raw_regions = row.get("RCPTN_RGN_NM", "")
            regions = [region.strip() for region in raw_regions.split(",") if region.strip()]
            location_ids = []

            for region in regions:
                parts = region.split()
                province = parts[0] if len(parts) > 0 else ""
                city = ""
                town = ""

                if len(parts) >= 3:
                    city = " ".join(parts[1:-1])
                    town = parts[-1]
                elif len(parts) == 2:
                    city = parts[1]
                elif len(parts) == 1:
                    province = parts[0]

                matched_location = next(
                    (loc for loc in locations_data if 
                     loc.get("province") == province.replace('전체', '').strip() and 
                     loc.get("city") == city.replace('전체', '').strip() and 
                     loc.get("town") == town.replace('전체', '').strip()),
                    None
                )

                if matched_location:
                    location_ids.append(matched_location["location_id"])
                else:
                    print(f"No match found for region: {region}")

            md101_sn = row.get("SN", "")
            emrg_step_nm = row.get("EMRG_STEP_NM", "")
            dst_se_nm = row.get("DST_SE_NM", "")
            msg_cn = row.get("MSG_CN", "")
            msg = f"[{emrg_step_nm}][{dst_se_nm}] {msg_cn}"

            message = {
                "create_date": create_date,
                "location_id": ','.join(map(str, location_ids)),
                "location_name": raw_regions,
                "md101_sn": md101_sn,
                "msg": msg,
                "send_platform": "GOV"
            }

            messages.append(message)

        except Exception as e:
            print(f"Error processing row: {row}, Error: {e}")

    return messages