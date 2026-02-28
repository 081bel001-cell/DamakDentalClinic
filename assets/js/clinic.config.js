window.CLINIC_CONFIG = {
  clinicName: "Damak Dental Clinic",
  tagline: "Professional dental cleaning in Damak with gentle care and modern hygiene.",
  phoneE164: "+977XXXXXXXXXX",
  phoneDisplay: "+977-XXXXXXXXXX",
  email: "clinic@example.com",
  addressLine: "Damak, Jhapa, Nepal",
  hours: [
    { day: "Sun-Fri", time: "09:00 - 18:00" },
    { day: "Sat", time: "Emergency only" }
  ],
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=PLACEHOLDER",
  doctor: {
    name: "Dr. Placeholder Name",
    credential: "BDS",
    bio: "Focused on preventive dentistry with a special emphasis on deep cleaning and gum health."
  },
  primaryService: "Dental Cleaning & Scaling",
  primaryCtaLabel: "Book My Cleaning",
  primaryCtaHref: "contact.html#booking-form",
  cleaningOffer: {
    title: "Intro Cleaning Package",
    subtitle: "Complete scaling and polish for first-time visitors.",
    priceLabel: "NPR 1,999",
    bulletPoints: [
      "Consult + oral exam",
      "Scaling and stain removal",
      "Polishing finish",
      "Home-care recommendations"
    ]
  },
  heroImages: {
    main: "assets/images/hero-cleaning-main.jpg",
    detail: "assets/images/hero-cleaning-detail.jpg",
    clinic: "assets/images/clinic-sterile-room.jpg",
    dentist: "assets/images/dentist-portrait.jpg"
  },
  testimonials: [
    {
      name: "Anita R.",
      quote: "I noticed a visible difference after one cleaning visit. The treatment was very gentle.",
      stars: 5,
      image: "assets/images/testimonial-1.jpg"
    },
    {
      name: "Suman K.",
      quote: "Best cleaning experience I had in Damak. Very hygienic and professionally handled.",
      stars: 5,
      image: "assets/images/testimonial-2.jpg"
    },
    {
      name: "Mina P.",
      quote: "No discomfort, smooth process, and my teeth felt fresh instantly.",
      stars: 5,
      image: "assets/images/testimonial-3.jpg"
    }
  ],
  trustStats: [
    { label: "Smiles cleaned", value: "5000+" },
    { label: "Years of practice", value: "12+" },
    { label: "Patient satisfaction", value: "98%" }
  ],
  booking: {
    endpoint: "https://example.com/api/cleaning-booking",
    successMessage: "Your cleaning request has been received.",
    responseWindowText: "Our team will call you within 30 minutes during clinic hours.",
    formPath: "contact.html#booking-form"
  }
};
