(function () {
  var form = document.getElementById("waitlist-form");
  if (!form) return;

  var messageEl = document.getElementById("waitlist-message");
  var submitBtn = document.getElementById("waitlist-submit");
  var successPanel = document.getElementById("waitlist-success");
  var successTitle = document.getElementById("waitlist-success-title");
  var successText = document.getElementById("waitlist-success-text");
  var addAnotherBtn = document.getElementById("waitlist-add-another");
  var turnstileMount = document.getElementById("waitlist-turnstile");
  var siteKey = document.documentElement.getAttribute("data-turnstile-site-key") || "";
  var turnstileWidgetId = null;
  var submitLabel = submitBtn ? submitBtn.textContent : "Join the waitlist";

  function showMessage(text, isError) {
    if (!messageEl) return;
    messageEl.hidden = false;
    messageEl.textContent = text;
    messageEl.classList.toggle("waitlist-message-error", !!isError);
  }

  function clearMessage() {
    if (!messageEl) return;
    messageEl.hidden = true;
    messageEl.textContent = "";
    messageEl.classList.remove("waitlist-message-error");
  }

  function setSubmitting(isSubmitting) {
    if (!submitBtn) return;
    submitBtn.disabled = isSubmitting;
    submitBtn.setAttribute("aria-busy", isSubmitting ? "true" : "false");
    submitBtn.textContent = isSubmitting ? "Joining…" : submitLabel;
  }

  function resetWaitlistFields() {
    var emailInput = form.querySelector("#waitlist-email");
    var instrumentSelect = form.querySelector("#waitlist-instrument");
    var consentInput = form.querySelector('input[name="consent"]');
    if (emailInput) emailInput.value = "";
    if (instrumentSelect) instrumentSelect.value = "";
    if (consentInput) consentInput.checked = false;
  }

  function buildSuccessMessage(instrumentInterest) {
    var message =
      "We'll email you when Used Gear early access opens so you can create your Artist account.";
    if (instrumentInterest) {
      message += " We'll note your interest in " + instrumentInterest.toLowerCase() + " gear.";
    }
    return message;
  }

  function showSuccess(instrumentInterest) {
    if (!successPanel || !successText) return;

    clearMessage();
    resetWaitlistFields();
    resetTurnstile();
    form.classList.add("is-success");
    successPanel.hidden = false;
    successText.textContent = buildSuccessMessage(instrumentInterest);

    if (successTitle) {
      successTitle.focus();
    }
  }

  function showForm() {
    if (!successPanel) return;

    form.classList.remove("is-success");
    successPanel.hidden = true;
    clearMessage();
    resetTurnstile();

    var emailInput = form.querySelector("#waitlist-email");
    if (emailInput) {
      emailInput.focus();
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
        callback: function () {},
        "expired-callback": function () {},
        "error-callback": function () {},
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
    }
  }

  loadTurnstile(function () {});

  if (addAnotherBtn) {
    addAnotherBtn.addEventListener("click", showForm);
  }

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
    var instrumentInterest = instrumentSelect.value;
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
        instrument_interest: instrumentInterest,
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
          showSuccess(instrumentInterest);
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
