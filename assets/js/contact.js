(function () {
  const form = document.getElementById("booking-form");
  if (!form) return;

  const config = window.CLINIC_CONFIG || {};
  const booking = config.booking || {};

  // Update this endpoint before production deployment.
  const BOOKING_ENDPOINT = booking.endpoint || "https://example.com/api/cleaning-booking";

  const fields = {
    name: document.getElementById("name"),
    phone: document.getElementById("phone"),
    preferredTime: document.getElementById("preferredTime"),
    message: document.getElementById("message")
  };

  const errors = {
    name: document.getElementById("name-error"),
    phone: document.getElementById("phone-error"),
    preferredTime: document.getElementById("preferredTime-error"),
    message: document.getElementById("message-error")
  };

  const status = document.getElementById("form-status");
  const submitButton = form.querySelector("button[type='submit']");

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

    const name = fields.name.value.trim();
    const phoneDigits = fields.phone.value.replace(/\D/g, "");
    const preferredTime = fields.preferredTime.value.trim();

    if (name.length < 2) {
      setFieldError("name", "Please enter at least 2 characters.");
      valid = false;
    }

    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      setFieldError("phone", "Please enter a valid phone number.");
      valid = false;
    }

    if (!preferredTime) {
      setFieldError("preferredTime", "Please choose your preferred time.");
      valid = false;
    }

    return valid;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("", "");

    if (!validate()) {
      setStatus("Please fix the highlighted fields and try again.", "error");
      return;
    }

    const payload = {
      service: config.primaryService || "Dental Cleaning & Scaling",
      name: fields.name.value.trim(),
      phone: fields.phone.value.trim(),
      preferredTime: fields.preferredTime.value.trim(),
      message: fields.message.value.trim()
    };

    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    try {
      const response = await fetch(BOOKING_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Booking request failed");
      }

      form.reset();
      clearErrors();

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
      submitButton.textContent = config.primaryCtaLabel || "Book My Cleaning";
    }
  });
})();
