const SPREADSHEET_NAME = "2026_靈知機台軟體試用申請";
const SHEET_TAB_NAME = "報名資料";
const HEADERS = ["飯店名稱", "姓名", "職稱", "Email", "電話", "報名時間"];
const SPREADSHEET_ID_PROPERTY = "REGISTRATION_SPREADSHEET_ID";

function setupSpreadsheet() {
  const properties = PropertiesService.getScriptProperties();
  let spreadsheetId = properties.getProperty(SPREADSHEET_ID_PROPERTY);
  let spreadsheet;

  if (spreadsheetId) {
    spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  } else {
    const matches = DriveApp.getFilesByName(SPREADSHEET_NAME);
    let existingSpreadsheet = null;
    while (matches.hasNext()) {
      const file = matches.next();
      if (file.getMimeType() !== MimeType.GOOGLE_SHEETS) continue;
      if (existingSpreadsheet) {
        throw new Error("找到多個同名試算表，請先整理雲端硬碟中的重複檔案。");
      }
      existingSpreadsheet = file;
    }

    spreadsheet = existingSpreadsheet
      ? SpreadsheetApp.openById(existingSpreadsheet.getId())
      : SpreadsheetApp.create(SPREADSHEET_NAME);
    spreadsheetId = spreadsheet.getId();
    properties.setProperty(SPREADSHEET_ID_PROPERTY, spreadsheetId);
  }

  let sheet = spreadsheet.getSheetByName(SHEET_TAB_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_TAB_NAME);

  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  const currentHeaders = headerRange.getDisplayValues()[0];
  if (currentHeaders.every((value) => value === "")) {
    headerRange.setValues([HEADERS]);
    headerRange.setFontWeight("bold");
  } else if (HEADERS.some((header, index) => currentHeaders[index] !== header)) {
    throw new Error("試算表第一列標題與預期欄位不符，請先確認欄位順序。");
  }

  sheet.getRange("E:E").setNumberFormat("@");
  sheet.setFrozenRows(1);
  return spreadsheet.getUrl();
}

function doPost(event) {
  try {
    const parameters = event && event.parameter;
    if (!parameters) throw new Error("沒有收到表單資料。");

    const registration = {
      hotel: requiredValue(parameters.hotel, "飯店名稱"),
      name: requiredValue(parameters.name, "姓名"),
      title: requiredValue(parameters.title, "職稱"),
      email: requiredValue(parameters.email, "Email"),
      phone: requiredValue(parameters.phone, "電話")
    };

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registration.email)) {
      throw new Error("Email 格式不正確。");
    }

    const spreadsheetId = PropertiesService.getScriptProperties().getProperty(SPREADSHEET_ID_PROPERTY);
    if (!spreadsheetId) throw new Error("試算表尚未初始化，請先執行 setupSpreadsheet。");

    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(SHEET_TAB_NAME);
    if (!sheet) throw new Error("找不到報名資料工作表，請重新執行 setupSpreadsheet。");

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const row = sheet.getLastRow() + 1;
      sheet.getRange(row, 5).setNumberFormat("@");
      sheet.getRange(row, 1, 1, HEADERS.length).setValues([[
        registration.hotel,
        registration.name,
        registration.title,
        registration.email,
        registration.phone,
        new Date()
      ]]);
    } finally {
      lock.releaseLock();
    }

    return resultPage({ success: true });
  } catch (error) {
    console.error(error);
    return resultPage({ success: false, message: error.message || "資料儲存失敗，請稍後重試。" });
  }
}

function requiredValue(value, label) {
  const normalized = String(value || "").trim();
  if (!normalized) throw new Error(label + "為必填欄位。");
  return normalized;
}

function resultPage(result) {
  const message = JSON.stringify({
    channel: "wise-registration",
    success: result.success,
    message: result.message
  });
  const html = "<!doctype html><html><body><script>window.top.postMessage(" +
    message +
    ", '*');</script></body></html>";

  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
