# Backend REST API 測試

## 初始化新 Run

```bash
curl -X POST http://localhost:3000/api/run/init \
  -H "Content-Type: application/json" \
  -D "{\"professionId\": \"CHEMIST\", \"seed\": 12345}"
```

### PowerShell

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/run/init" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"professionId": "CHEMIST", "seed": 12345}'
```

### 預期回應

```json
{
  "success": true,
  "data": {
    "runId": "run-...",
    "professionId": "CHEMIST",
    "seed": 12345
  }
}
```
