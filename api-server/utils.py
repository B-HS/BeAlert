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
    response = httpx.get(GOV_API_URL, verify=False)
    response.raise_for_status()
    data = response.json()
    messages = []
    disaster_msgs = data.get("DisasterMsg", [])

    for item in disaster_msgs:
        rows = item.get("row", [])
        for row in rows:
            try:
                
                create_date_str = row.get("CRT_DT", "")
                create_date = datetime.strptime(create_date_str, "%Y/%m/%d %H:%M:%S")
                raw_regions = row.get("RCPTN_RGN_NM", "")
                regions = [region.strip() for region in raw_regions.split(",") if region.strip()]
                location_ids = []
                
                for region in regions:
                    parts = region.split(maxsplit=2)
                    province = parts[0] if len(parts) > 0 else ""
                    city = parts[1] if len(parts) > 1 else ""
                    town = parts[2] if len(parts) > 2 else ""
                    matched_location = next(
                        (loc for loc in locations_data if loc["province"] == province and loc["city"] == city and loc["town"] == town),
                        None
                    )

                    if matched_location:
                        location_ids.append(matched_location["location_id"])
                    else:
                        print(f"No match found for region: {region}")

                
                location_id = location_ids if location_ids else []
                md101_sn = row.get("SN", "")
                emrg_step_nm = row.get("EMRG_STEP_NM", "")
                dst_se_nm = row.get("DST_SE_NM", "")
                msg_cn = row.get("MSG_CN", "")
                msg = f"[{emrg_step_nm}][{dst_se_nm}] {msg_cn}"

                
                message = {
                    "create_date": create_date,
                    "location_id": location_id,  
                    "location_name": raw_regions,  
                    "md101_sn": md101_sn,
                    "msg": msg,
                    "send_platform": ""  
                }

                messages.append(message)

            except Exception as e:
                print(f"Error processing row: {row}, Error: {e}")

    return messages