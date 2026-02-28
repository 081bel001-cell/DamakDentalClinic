(function () {
  const config = window.CLINIC_CONFIG;
  if (!config) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const setText = (selector, value) => {
    if (typeof value !== "string") return;
    document.querySelectorAll(selector).forEach((node) => {
      node.textContent = value;
    });
  };

  const setImage = (selector, src, fallbackAlt) => {
    if (!src) return;
    document.querySelectorAll(selector).forEach((img) => {
      img.setAttribute("src", src);
      if (!img.getAttribute("alt")) {
        img.setAttribute("alt", fallbackAlt);
      }
      img.addEventListener("error", () => {
        const frame = img.closest(".image-frame");
        if (frame) frame.classList.add("is-missing");
      });
    });
  };

  const setList = (selector, items) => {
    if (!Array.isArray(items)) return;
    document.querySelectorAll(selector).forEach((list) => {
      list.innerHTML = "";
      items.forEach((entry) => {
        const li = document.createElement("li");
        li.textContent = String(entry);
        list.appendChild(li);
      });
    });
  };

  const setHours = () => {
    if (!Array.isArray(config.hours)) return;
    document.querySelectorAll("[data-hours-list]").forEach((list) => {
      list.innerHTML = "";
      config.hours.forEach((entry) => {
        const li = document.createElement("li");
        li.textContent = `${entry.day}: ${entry.time}`;
        list.appendChild(li);
      });
    });
  };

  const hydrateTrustStats = () => {
    if (!Array.isArray(config.trustStats)) return;
    document.querySelectorAll("[data-trust-stats]").forEach((list) => {
      list.innerHTML = "";
      config.trustStats.forEach((item) => {
        const li = document.createElement("li");
        const strong = document.createElement("strong");
        const span = document.createElement("span");
        strong.textContent = item.value || "";
        span.textContent = item.label || "";
        li.append(strong, span);
        list.appendChild(li);
      });
    });
  };

  const hydrateTestimonials = () => {
    if (!Array.isArray(config.testimonials)) return;
    document.querySelectorAll("[data-testimonials]").forEach((grid) => {
      grid.innerHTML = "";
      config.testimonials.forEach((testimonial) => {
        const card = document.createElement("article");
        card.className = "testimonial-card reveal";

        const image = document.createElement("img");
        image.src = testimonial.image || "";
        image.alt = `${testimonial.name || "Patient"} testimonial`;
        image.loading = "lazy";
        image.addEventListener("error", () => {
          const fallback = document.createElement("div");
          fallback.className = "image-frame is-missing";
          fallback.style.minHeight = "180px";
          image.replaceWith(fallback);
        });

        const stars = document.createElement("p");
        stars.className = "stars";
        const rating = Math.max(1, Math.min(5, Number(testimonial.stars) || 5));
        stars.textContent = "*".repeat(rating);

        const quote = document.createElement("p");
        quote.textContent = testimonial.quote || "";

        const name = document.createElement("h3");
        name.textContent = testimonial.name || "Patient";

        card.append(image, stars, quote, name);
        grid.appendChild(card);
      });
    });
  };

  setText("[data-clinic-name]", config.clinicName);
  setText("[data-tagline]", config.tagline);
  setText("[data-address]", config.addressLine);
  setText("[data-phone-display]", config.phoneDisplay);
  setText("[data-primary-service]", config.primaryService);

  if (config.doctor) {
    setText("[data-doctor-name]", config.doctor.name || "");
    setText("[data-doctor-credential]", config.doctor.credential || "");
    setText("[data-doctor-bio]", config.doctor.bio || "");
  }

  if (config.cleaningOffer) {
    setText("[data-offer-title]", config.cleaningOffer.title || "");
    setText("[data-offer-subtitle]", config.cleaningOffer.subtitle || "");
    setText("[data-offer-price]", config.cleaningOffer.priceLabel || "");
    setList("[data-offer-points]", config.cleaningOffer.bulletPoints || []);
  }

  if (config.booking) {
    setText("[data-booking-window]", config.booking.responseWindowText || "");
  }

  const primaryHref =
    (config.booking && config.booking.formPath) ||
    config.primaryCtaHref ||
    "contact.html#booking-form";
  const primaryLabel = config.primaryCtaLabel || "Book My Cleaning";

  document.querySelectorAll("[data-primary-cta]").forEach((link) => {
    link.setAttribute("href", primaryHref);
    link.textContent = primaryLabel;
  });

  document.querySelectorAll("[data-primary-cta-label]").forEach((button) => {
    button.textContent = primaryLabel;
  });

  document.querySelectorAll("[data-phone-link]").forEach((link) => {
    link.setAttribute("href", `tel:${config.phoneE164}`);
  });

  document.querySelectorAll("[data-email-link]").forEach((link) => {
    link.setAttribute("href", `mailto:${config.email}`);
    link.textContent = config.email;
  });

  setHours();
  hydrateTrustStats();
  hydrateTestimonials();

  if (config.heroImages) {
    setImage("[data-hero-main]", config.heroImages.main, "Professional dental cleaning");
    setImage("[data-hero-detail]", config.heroImages.detail, "Close-up of clean teeth");
    setImage("[data-clinic-photo]", config.heroImages.clinic, "Sterile clinic treatment room");
    setImage("[data-dentist-photo]", config.heroImages.dentist, "Dentist portrait");
  }

  const mapFrame = document.querySelector("[data-map-embed]");
  if (mapFrame && config.mapEmbedUrl) {
    mapFrame.setAttribute("src", config.mapEmbedUrl);
  }

  const parseDaySpec = (daySpec) => {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday"
    ];
    const map = {
      Mon: "Monday",
      Tue: "Tuesday",
      Wed: "Wednesday",
      Thu: "Thursday",
      Fri: "Friday",
      Sat: "Saturday",
      Sun: "Sunday"
    };

    const clean = String(daySpec || "").trim();
    if (days.includes(clean)) return [clean];
    if (map[clean]) return [map[clean]];

    if (clean.includes("-")) {
      const parts = clean.split("-").map((part) => part.trim());
      const start = map[parts[0]] || parts[0];
      const end = map[parts[1]] || parts[1];
      const startIndex = days.indexOf(start);
      const endIndex = days.indexOf(end);

      if (startIndex >= 0 && endIndex >= 0) {
        if (startIndex <= endIndex) return days.slice(startIndex, endIndex + 1);
        return days.slice(startIndex).concat(days.slice(0, endIndex + 1));
      }
    }

    return [];
  };

  const schemaNode = document.getElementById("localbusiness-schema");
  if (schemaNode) {
    const openingHoursSpecification = (config.hours || [])
      .map((entry) => {
        const days = parseDaySpec(entry.day);
        const parts = String(entry.time || "")
          .split(" - ")
          .map((item) => item.trim());
        if (!days.length || parts.length !== 2) return null;
        return {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: days,
          opens: parts[0],
          closes: parts[1]
        };
      })
      .filter(Boolean);

    const schema = {
      "@context": "https://schema.org",
      "@type": "Dentist",
      name: config.clinicName,
      description: config.tagline,
      address: {
        "@type": "PostalAddress",
        streetAddress: config.addressLine,
        addressLocality: "Damak",
        addressRegion: "Jhapa",
        addressCountry: "NP"
      },
      areaServed: "Damak, Nepal",
      telephone: config.phoneE164,
      email: config.email,
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Dental Cleaning Services",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "MedicalProcedure",
              name: config.primaryService,
              description: "Professional teeth scaling and polishing in Damak."
            }
          }
        ]
      }
    };

    if (openingHoursSpecification.length) {
      schema.openingHoursSpecification = openingHoursSpecification;
    }

    schemaNode.textContent = JSON.stringify(schema);
  }

  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  document.querySelectorAll(".faq-group").forEach((group) => {
    const items = group.querySelectorAll(".faq-item");
    items.forEach((item) => {
      item.addEventListener("toggle", () => {
        if (!item.open) return;
        items.forEach((other) => {
          if (other !== item) other.open = false;
        });
      });
    });
  });

  const revealNodes = document.querySelectorAll(".reveal");
  const markLoaded = () => document.body.classList.add("is-loaded");

  if (prefersReducedMotion) {
    markLoaded();
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  } else {
    requestAnimationFrame(markLoaded);

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          });
        },
        { threshold: 0.16 }
      );

      revealNodes.forEach((node) => observer.observe(node));
    } else {
      revealNodes.forEach((node) => node.classList.add("is-visible"));
    }

    const layers = document.querySelectorAll(".parallax-layer");
    if (layers.length) {
      let ticking = false;
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const y = window.scrollY || window.pageYOffset;
          layers.forEach((layer) => {
            const speed = Number(layer.getAttribute("data-speed") || 0.08);
            layer.style.transform = `translate3d(0, ${y * speed}px, 0)`;
          });
          ticking = false;
        });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
    }
  }
})();
