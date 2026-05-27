(function () {
  const storageKey = "secondbeat-theme";
  const dayStartHour = 7;
  const dayEndHour = 19;

  function getThemeByTime() {
    const hour = new Date().getHours();
    return hour >= dayStartHour && hour < dayEndHour ? "light" : "dark";
  }

  function resolveTheme(mode) {
    if (mode === "light" || mode === "dark") return mode;
    return getThemeByTime();
  }

  function getStoredMode() {
    const stored = localStorage.getItem(storageKey);
    if (stored === "light" || stored === "dark" || stored === "auto") return stored;
    return "auto";
  }

  function updateToggleLabel(toggle, mode, effective) {
    if (mode === "auto") {
      toggle.setAttribute("aria-label", `Auto theme (${effective}). Click to set manually.`);
      toggle.setAttribute("title", `Auto — ${effective} by time. Click: manual. Shift+click: auto.`);
      toggle.dataset.mode = "auto";
      return;
    }

    toggle.setAttribute(
      "aria-label",
      effective === "dark" ? "Switch to light mode" : "Switch to dark mode",
    );
    toggle.setAttribute("title", effective === "dark" ? "Light mode" : "Dark mode");
    toggle.dataset.mode = mode;
  }

  function applyTheme(mode) {
    const effective = resolveTheme(mode);
    document.documentElement.setAttribute("data-theme", effective);
    localStorage.setItem(storageKey, mode);

    const toggle = document.querySelector(".theme-toggle");
    if (toggle) updateToggleLabel(toggle, mode, effective);
  }

  function scheduleAutoCheck() {
    if (getStoredMode() !== "auto") return;

    applyTheme("auto");

    const now = new Date();
    const next = new Date(now);
    const hour = now.getHours();
    if (hour >= dayStartHour && hour < dayEndHour) {
      next.setHours(dayEndHour, 0, 0, 0);
    } else if (hour >= dayEndHour) {
      next.setDate(next.getDate() + 1);
      next.setHours(dayStartHour, 0, 0, 0);
    } else {
      next.setHours(dayStartHour, 0, 0, 0);
    }

    const delay = Math.max(next - now, 60000);
    window.setTimeout(scheduleAutoCheck, delay);
  }

  applyTheme(getStoredMode());
  scheduleAutoCheck();

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible" && getStoredMode() === "auto") {
      applyTheme("auto");
    }
  });

  document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.querySelector(".theme-toggle");
    if (!toggle) return;

    toggle.addEventListener("click", function (event) {
      if (event.shiftKey) {
        applyTheme("auto");
        scheduleAutoCheck();
        return;
      }

      const mode = getStoredMode();
      const effective = resolveTheme(mode);
      applyTheme(effective === "dark" ? "light" : "dark");
    });
  });
})();
