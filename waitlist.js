(function () {
  var form = document.getElementById("waitlist-form");
  if (!form) return;

  var messageEl = document.getElementById("waitlist-message");
  var submitBtn = document.getElementById("waitlist-submit");
  var turnstileMount = document.getElementById("waitlist-turnstile");
  var siteKey = document.documentElement.getAttribute("data-turnstile-site-key") || "";
  var turnstileWidgetId = null;
  var turnstileReady = false;

  function showMessage(text, isError) {
    if (!messageEl) return;
    messageEl.hidden = false;
    messageEl.textContent = text;
    messageEl.classList.toggle("waitlist-message-error", !!isError);
    messageEl.classList.toggle("waitlist-message-success", !isError);
  }

  function clearMessage() {
    if (!messageEl) return;
    messageEl.hidden = true;
    messageEl.textContent = "";
    messageEl.classList.remove("waitlist-message-error", "waitlist-message-success");
  }

  function setSubmitting(isSubmitting) {
    if (submitBtn) {
      submitBtn.disabled = isSubmitting;
      submitBtn.setAttribute("aria-busy", isSubmitting ? "true" : "false");
    }
  }

  function loadTurnstile(onReady) {
    if (!siteKey || !turnstileMount) {
      onReady();
      return;
    }

    turnstileMount.removeAttribute("aria-hidden");

    function renderWidget() {
      if (!window.turnstile || turnstileWidgetId != null) {
        onReady();
        return;
      }
      turnstileWidgetId = window.turnstile.render(turnstileMount, {
        sitekey: siteKey,
        theme: document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light",
        callback: function () {
          turnstileReady = true;
        },
        "expired-callback": function () {
          turnstileReady = false;
        },
        "error-callback": function () {
          turnstileReady = false;
        },
      });
      onReady();
    }

    if (window.turnstile) {
      renderWidget();
      return;
    }

    var script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = renderWidget;
    script.onerror = function () {
      showMessage("Could not load the security check. Refresh and try again.", true);
    };
    document.head.appendChild(script);
  }

  function getTurnstileToken() {
    if (!siteKey) return "";
    if (!window.turnstile || turnstileWidgetId == null) return "";
    return window.turnstile.getResponse(turnstileWidgetId) || "";
  }

  function resetTurnstile() {
    if (window.turnstile && turnstileWidgetId != null) {
      window.turnstile.reset(turnstileWidgetId);
      turnstileReady = false;
    }
  }

  loadTurnstile(function () {});

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearMessage();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var emailInput = form.querySelector("#waitlist-email");
    var instrumentSelect = form.querySelector("#waitlist-instrument");
    var consentInput = form.querySelector('input[name="consent"]');
    var token = getTurnstileToken();

    if (siteKey && !token) {
      showMessage("Complete the security check below, then try again.", true);
      return;
    }

    setSubmitting(true);

    fetch("/api/waitlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: emailInput.value,
        instrument_interest: instrumentSelect.value,
        consent: consentInput.checked,
        turnstile_token: token,
        source: "landing-cta",
      }),
    })
      .then(function (response) {
        return response.json().then(function (data) {
          return { ok: response.ok, status: response.status, data: data };
        });
      })
      .then(function (result) {
        if (result.ok && result.data && result.data.ok) {
          showMessage(
            result.data.message ||
              "You're on the list — we'll be in touch when Used Gear early access opens.",
            false
          );
          form.reset();
          resetTurnstile();
          return;
        }

        var errorText =
          (result.data && result.data.error) ||
          "Could not join the waitlist. Please try again.";
        showMessage(errorText, true);
        resetTurnstile();
      })
      .catch(function () {
        showMessage("Network error. Check your connection and try again.", true);
        resetTurnstile();
      })
      .finally(function () {
        setSubmitting(false);
      });
  });
})();
