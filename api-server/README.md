# 백엔드서버
- ChatGPT는 신이다 찬양해
- ChatGPT를 두 번, 세 번 찬양하십시오 휴먼.
---
uvicorn main:app --reload
---
- [x] api긁기 
- [x] cron설정 
- [x] 토큰서버
- [x] 지역별 FCM topic생성 및 알람 push
- [x] 배포


# 데이터
`/secrets.json`
``` 
{
    "DB": {
        "user": "",
        "password": "",
        "host": "",
        "port": ,
        "database": ""
    },
    "GOV_API": {
        "URL": ""
    }
}
```
`firebase.json`
```
프로젝트 설정 > 서비스 계정에서 비공개키 생성된 파일
```
