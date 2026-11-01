const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyA-27UoxUHSXohLSRU5lKIYwfwfEEOFNMUWPVDdSXzhgeLvOfaEderryV2o_futSZQdA/exec";

const form = document.querySelector("#registration-form");
const submitButton = document.querySelector("#submit-button");
const statusMessage = document.querySelector("#form-status");
const submissionFrame = document.querySelector("#submission-frame");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!form.reportValidity()) {
    return;
  }

  if (!APPS_SCRIPT_URL) {
    setStatus("表單服務尚未設定，請稍後再試或聯絡活動主辦單位。", "error");
    return;
  }

  submitButton.disabled = true;
  setStatus("正在送出申請…");
  form.action = APPS_SCRIPT_URL;
  form.target = submissionFrame.name;
  form.method = "post";
  form.submit();
});

window.addEventListener("message", (event) => {
  if (
    !event.origin.endsWith(".script.googleusercontent.com") ||
    event.data?.channel !== "wise-registration"
  ) {
    return;
  }

  submitButton.disabled = false;
  if (event.data.success) {
    form.reset();
    setStatus("申請已送出，靈知科技將盡快與您聯繫。");
  } else {
    setStatus(event.data.message || "送出失敗，請稍後重試或聯絡活動主辦單位。", "error");
  }
});

function setStatus(message, state = "success") {
  statusMessage.textContent = message;
  statusMessage.dataset.state = state;
}
