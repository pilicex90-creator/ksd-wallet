// ui/settings.js
import { renderSettingsUI } from "./settings-ui.js";
import { log, LOG_LEVELS } from "../core/logger.js";

let mounted = false;

window.addEventListener("DOMContentLoaded", () => {
  if (mounted) {
    log(LOG_LEVELS.WARN, "Settings UI already mounted, skipping duplicate init", "SETTINGS");
    return;
  }

  const container = document.getElementById("app");
  if (!container) {
    log(LOG_LEVELS.ERROR, "未找到挂载容器 #app", "SETTINGS");
    return;
  }

  try {
    renderSettingsUI(container);
    mounted = true;
    log(LOG_LEVELS.INFO, "Settings UI mounted successfully", "SETTINGS");
  } catch (err) {
    console.error("Failed to render Settings UI:", err);
    log(LOG_LEVELS.ERROR, `Failed to render Settings UI: ${err.message}\n${err.stack}`, "SETTINGS");
  }
});
