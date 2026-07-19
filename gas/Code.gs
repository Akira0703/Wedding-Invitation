const SHEET_NAME = "RSVP";
const RSVP_MESSAGE_SOURCE = "wedding-invitation-rsvp";
const REQUIRED_HEADERS = [
  "回答日時",
  "出欠",
  "名前",
  "アレルギー",
  "お子様",
  "配慮事項",
  "メッセージ"
];

function doGet() {
  return ContentService
    .createTextOutput("Wedding Invitation API is running.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    const data = normalizeRequest_(e);
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
      ensureHeaders_(sheet);

      sheet.appendRow([
        new Date(),
        data.attendance,
        data.name,
        data.allergy,
        data.children,
        data.consideration,
        data.message
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
    message: sanitize_(parameters.message)
  };
}

function validateRequest_(data) {
  if (!["出席", "欠席"].includes(data.attendance)) {
    throw new Error("Invalid attendance value.");
  }

  if (!data.name) {
    throw new Error("Name is required.");
  }
}

function getRsvpSheet_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  if (!sheet) {
    throw new Error(`Sheet not found: ${SHEET_NAME}`);
  }

  return sheet;
}

function ensureHeaders_(sheet) {
  const currentHeaders = sheet
    .getRange(1, 1, 1, REQUIRED_HEADERS.length)
    .getDisplayValues()[0];

  if (currentHeaders.every((value) => value === "")) {
    sheet.getRange(1, 1, 1, REQUIRED_HEADERS.length).setValues([REQUIRED_HEADERS]);
    sheet.setFrozenRows(1);
  }
}

function sanitize_(value) {
  return String(value || "").trim().slice(0, 2000);
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
<head><meta charset="utf-8"></head>
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
