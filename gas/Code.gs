const SHEET_NAME = "RSVP";
const RSVP_MESSAGE_SOURCE = "wedding-invitation-rsvp";
const REQUIRED_HEADERS = [
  "回答日時",
  "出欠",
  "名前",
  "アレルギー",
  "お子様",
  "配慮事項",
  "メッセージ",
  "郵便番号",
  "住所"
];

function doGet() {
  return ContentService
    .createTextOutput("Wedding Invitation API is running.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  console.log("RAW PARAMETER:");
  console.log(JSON.stringify(e && e.parameter ? e.parameter : {}));

  try {
    const data = normalizeRequest_(e);

    console.log("NORMALIZED DATA:");
    console.log(JSON.stringify(data));

    validateRequest_(data);

    const cache = CacheService.getScriptCache();
    const cacheKey = `rsvp:${data.submissionId}`;

    if (data.submissionId && cache.get(cacheKey)) {
      return createResponse_("success", "すでに受け付けています。");
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);

    try {
      const sheet = getRsvpSheet_();

      console.log("SPREADSHEET:");
      console.log(sheet.getParent().getName());

      console.log("SHEET:");
      console.log(sheet.getName());

      ensureHeaders_(sheet);

      sheet.appendRow([
        new Date(),
        data.attendance,
        data.name,
        data.allergy,
        data.children,
        data.consideration,
        data.message,
        data.postalCode,
        data.address
      ]);

      if (data.submissionId) {
        cache.put(cacheKey, "1", 600);
      }
    } finally {
      lock.releaseLock();
    }

    return createResponse_("success", "回答を保存しました。");
  } catch (error) {
    console.error(error);
    return createResponse_("error", "回答を保存できませんでした。");
  }
}

function normalizeRequest_(e) {
  const parameters = e && e.parameter ? e.parameter : {};

  return {
    submissionId: sanitize_(parameters.submissionId),
    attendance: sanitize_(parameters.attendance),
    name: sanitize_(parameters.name),
    allergy: sanitize_(parameters.allergy),
    children: sanitize_(parameters.children),
    consideration: sanitize_(parameters.consideration),
    message: sanitize_(parameters.message),
    postalCode: normalizePostalCode_(parameters.postalCode),
    address: sanitize_(parameters.address)
  };
}

function validateRequest_(data) {
  if (!["出席", "欠席"].includes(data.attendance)) {
    throw new Error("Invalid attendance value.");
  }

  if (!data.name) {
    throw new Error("Name is required.");
  }

  if (!/^\d{3}-\d{4}$/.test(data.postalCode)) {
    throw new Error("Valid postal code is required.");
  }

  if (!data.address) {
    throw new Error("Address is required.");
  }
}

function getRsvpSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) {
    throw new Error("Active spreadsheet not found.");
  }

  const sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    throw new Error(`Sheet not found: ${SHEET_NAME}`);
  }

  return sheet;
}

function ensureHeaders_(sheet) {
  const currentHeaders = sheet
    .getRange(1, 1, 1, REQUIRED_HEADERS.length)
    .getDisplayValues()[0];

  const needsUpdate = REQUIRED_HEADERS.some(
    (header, index) => currentHeaders[index] !== header
  );

  if (needsUpdate) {
    sheet
      .getRange(1, 1, 1, REQUIRED_HEADERS.length)
      .setValues([REQUIRED_HEADERS]);

    sheet.setFrozenRows(1);
  }
}

function normalizePostalCode_(value) {
  const digits = String(value || "")
    .replace(/\D/g, "")
    .slice(0, 7);

  if (digits.length !== 7) {
    return sanitize_(value);
  }

  return `${digits.slice(0, 3)}-${digits.slice(3)}`;
}

function sanitize_(value) {
  const text = String(value || "").trim().slice(0, 2000);

  // スプレッドシートで数式として解釈されるのを防止
  if (/^[=+\-@]/.test(text)) {
    return "'" + text;
  }

  return text;
}

function createResponse_(status, message) {
  const payload = JSON.stringify({
    source: RSVP_MESSAGE_SOURCE,
    status,
    message
  }).replace(/</g, "\u003c");

  return HtmlService
    .createHtmlOutput(`<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
</head>
<body>
<script>
  const payload = ${payload};

  window.parent.postMessage(payload, "*");

  if (window.top !== window.parent) {
    window.top.postMessage(payload, "*");
  }
<\/script>
</body>
</html>`)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
