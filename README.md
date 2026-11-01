# 2026_靈知機台軟體試用申請

靈知科技智慧多國語言旅客自助 CHECK IN 軟體試用申請頁面。

網站：<https://wisepeter2000-blip.github.io/2026-wise-hotel-trial-application/>

## Google 試算表與表單服務

1. 在 [Google Apps Script](https://script.google.com/) 建立新專案，將 `apps-script/Code.gs` 貼入編輯器並儲存。
2. 在函式選單選擇 `setupSpreadsheet`，按「執行」並完成 Google 授權。此函式會建立或連結名為 `2026_靈知機台軟體試用申請` 的試算表，建立標題列，並把「電話」欄設為純文字。
3. 確認試算表建立後，在 Apps Script 選擇「部署」→「新增部署」→「網頁應用程式」；執行身分選「我」，存取權依活動需求選擇可提交申請的對象，然後部署並複製網頁應用程式網址。
4. 將網址填入 `script.js` 最上方的 `APPS_SCRIPT_URL`，再提交網站變更。

Apps Script 專案更新後，請在「部署」→「管理部署」編輯現有部署並選擇新版本。網頁應用程式需以有權存取試算表的帳號執行。

## 本機預覽

以本機 HTTP 伺服器開啟網站，例如：

```powershell
python -m http.server 8000
```

瀏覽 `http://localhost:8000`。完成 Apps Script 設定前，表單會提示服務尚未設定，不會假裝送出成功。
