(function () {
  const form = document.getElementById("booking-form");
  if (!form) return;

  const config = window.CLINIC_CONFIG || {};
  const booking = config.booking || {};

  // Update this endpoint before production deployment.
  const BOOKING_ENDPOINT = booking.endpoint || "https://example.com/api/cleaning-booking";

  // Rate limiting: prevent multiple submissions within a short time
  const RATE_LIMIT_MS = 60000; // 1 minute
  let lastSubmitTime = 0;

  const fields = {
    name: document.getElementById("name"),
    phone: document.getElementById("phone"),
    preferredTime: document.getElementById("preferredTime"),
    message: document.getElementById("message"),
    website: document.getElementById("website") // honeypot field
  };

  const errors = {
    name: document.getElementById("name-error"),
    phone: document.getElementById("phone-error"),
    preferredTime: document.getElementById("preferredTime-error"),
    message: document.getElementById("message-error")
  };

  const status = document.getElementById("form-status");
  const submitButton = form.querySelector("button[type='submit']");
  const successModal = document.getElementById("success-modal");
  const modalClose = successModal ? successModal.querySelector(".modal-close") : null;

  // Modal functions
  const showModal = () => {
    if (!successModal) return;
    successModal.classList.add("show");
    document.body.style.overflow = "hidden";
    // Focus on close button for accessibility
    if (modalClose) modalClose.focus();
  };

  const hideModal = () => {
    if (!successModal) return;
    successModal.classList.remove("show");
    document.body.style.overflow = "";
  };

  // Close modal on button click
  if (modalClose) {
    modalClose.addEventListener("click", hideModal);
  }

  // Close modal on overlay click
  if (successModal) {
    successModal.addEventListener("click", (e) => {
      if (e.target === successModal) {
        hideModal();
      }
    });
  }

  // Close modal on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && successModal && successModal.classList.contains("show")) {
      hideModal();
    }
  });

  // Input sanitization function
  const sanitizeInput = (input) => {
    if (typeof input !== 'string') return '';
    // Remove script tags, HTML tags, and trim whitespace
    return input
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .trim();
  };

  const setStatus = (text, type) => {
    status.textContent = text;
    status.classList.remove("success", "error");
    if (type) status.classList.add(type);
  };

  const setFieldError = (key, message) => {
    const errorNode = errors[key];
    const fieldNode = fields[key];
    if (!errorNode || !fieldNode) return;

    errorNode.textContent = message;
    fieldNode.setAttribute("aria-invalid", message ? "true" : "false");
  };

  const clearErrors = () => {
    Object.keys(errors).forEach((key) => setFieldError(key, ""));
  };

  const validate = () => {
    clearErrors();
    let valid = true;

    const name = sanitizeInput(fields.name.value);
    const phoneDigits = fields.phone.value.replace(/\D/g, "");
    const preferredTime = fields.preferredTime.value.trim();
    const message = sanitizeInput(fields.message.value);

    // Enhanced validation for name (prevent special characters abuse)
    if (name.length < 2) {
      setFieldError("name", "Please enter at least 2 characters.");
      valid = false;
    } else if (name.length > 100) {
      setFieldError("name", "Name is too long (max 100 characters).");
      valid = false;
    } else if (!/^[a-zA-Z\s\u0900-\u097F\u0980-\u09FF.-]+$/.test(name)) {
      setFieldError("name", "Please enter a valid name (letters and spaces only).");
      valid = false;
    }

    // Enhanced phone validation
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      setFieldError("phone", "Please enter a valid phone number (7-15 digits).");
      valid = false;
    }

    if (!preferredTime) {
      setFieldError("preferredTime", "Please choose your preferred time.");
      valid = false;
    }

    // Validate message length if provided
    if (message.length > 500) {
      setFieldError("message", "Message is too long (max 500 characters).");
      valid = false;
    }

    return valid;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("", "");

    // Honeypot check - if filled, likely a bot
    if (fields.website && fields.website.value !== "") {
      // Silently reject without showing error to bot
      setStatus("Your request has been received.", "success");
      return;
    }

    // Rate limiting check
    const now = Date.now();
    if (now - lastSubmitTime < RATE_LIMIT_MS) {
      const remainingSeconds = Math.ceil((RATE_LIMIT_MS - (now - lastSubmitTime)) / 1000);
      setStatus(`Please wait ${remainingSeconds} seconds before submitting again.`, "error");
      return;
    }

    if (!validate()) {
      setStatus("Please fix the highlighted fields and try again.", "error");
      return;
    }

    const payload = {
      service: config.primaryService || "Dental Cleaning & Scaling",
      name: sanitizeInput(fields.name.value),
      phone: sanitizeInput(fields.phone.value),
      preferredTime: fields.preferredTime.value.trim(),
      message: sanitizeInput(fields.message.value),
      timestamp: new Date().toISOString()
    };

    submitButton.disabled = true;
    submitButton.classList.add("btn-loading");

    try {
      const response = await fetch(BOOKING_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Booking request failed");
      }

      lastSubmitTime = now;
      form.reset();
      clearErrors();

      // Show success modal instead of inline message
      showModal();

      // Also show inline success for users without JS modal support
      const successMessage =
        booking.successMessage || "Your cleaning booking request has been received.";
      const responseWindow = booking.responseWindowText || "";

      setStatus(
        responseWindow ? `${successMessage} ${responseWindow}` : successMessage,
        "success"
      );
    } catch (error) {
      setStatus(
        "Could not submit booking right now. Please call the clinic directly.",
        "error"
      );
    } finally {
      submitButton.disabled = false;
      submitButton.classList.remove("btn-loading");
    }
  });
})();
