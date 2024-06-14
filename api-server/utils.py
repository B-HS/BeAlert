import httpx
import json
import os
from datetime import datetime

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
SECRET_FILE = os.path.join(BASE_DIR, 'secrets.json')

with open(SECRET_FILE) as f:
    secrets = json.load(f)

GOV_API_URL = secrets["GOV_API"]["URL"]

ERROR_CODE_MAP = {
    290: "인증키가 유효하지 않습니다. 인증키가 없는 경우 홈페이지에서 인증키를 신청하십시오.",
    310: "해당하는 서비스를 찾을 수 없습니다. 요청인자 중 SERVICE를 확인하십시오.",
    333: "요청위치 값의 타입이 유효하지 않습니다. 요청위치 값은 정수를 입력하세요.",
    336: "데이터 요청은 한번에 최대 1,000건을 넘을 수 없습니다.",
    337: "일별 트래픽 제한을 넘은 호출입니다. 오늘은 더이상 호출할 수 없습니다.",
    500: "서버 오류입니다. 지속적으로 발생시 홈페이지로 문의(Q&A) 바랍니다.",
    600: "데이터베이스 연결 오류입니다. 지속적으로 발생시 홈페이지로 문의(Q&A) 바랍니다.",
    601: "SQL 문장 오류입니다. 지속적으로 발생시 홈페이지로 문의(Q&A) 바랍니다.",
    0: "정상 처리되었습니다.",
    300: "관리자에 의해 인증키 사용이 제한되었습니다.",
    200: "해당하는 데이터가 없습니다."
}

def fetch_disaster_messages():
    response = httpx.get(GOV_API_URL, verify=False)  
    response.raise_for_status()  
    data = response.json()

    error_code = data.get("errorCode")
    if error_code in ERROR_CODE_MAP:
        if error_code != 0:
            raise ValueError(ERROR_CODE_MAP[error_code])

    messages = []
    disaster_msgs = data.get("DisasterMsg", [])
    for item in disaster_msgs:
        rows = item.get("row", [])
        for row in rows:
            row["create_date"] = datetime.strptime(row["create_date"], "%Y/%m/%d %H:%M:%S")
            messages.append(row)
    print(messages)
    return messages