/* ============================================
   Priyadharshini Portfolio — Client Script
   ============================================ */

import ASSETS from "./assets-data.js";

window.ASSETS = ASSETS;

const CONFIG = {
  name: "Priyadharshini",
  title: "Graphic Designer",
  email: "",
  phone: "",
  location: "",
  experience: "Add experience",
  projects: "Add project count",
  instagram: "",
  behance: "",
  linkedin: "",
  // Set a specific profile filename (e.g. "portrait.jpg") or leave "" to use the first image found
  profileImage: "",
  // Contact form: "mailto" opens the user's email client. Change when a backend is connected.
  contactMethod: "mailto",
};

/* ---------- State ---------- */

const state = {
  galleryImages: [],
  lightboxImages: [],
  lightboxIndex: 0,
  touchStartX: 0,
  touchStartY: 0,
};

/* ---------- Helpers ---------- */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function displayOrPlaceholder(value, placeholder) {
  return value && String(value).trim() ? String(value).trim() : placeholder;
}

async function loadAssetList(key) {
  return Array.isArray(window.ASSETS?.[key]) ? window.ASSETS[key] : [];
}

function setConfigText(attr, value) {
  $$(`[data-config="${attr}"]`).forEach((el) => {
    el.textContent = value;
  });
}

function setupSocialLink(id, url) {
  const link = $(id);
  if (!link) return;
  if (url && url.trim()) {
    link.href = url.trim();
    link.setAttribute("aria-disabled", "false");
    link.classList.add("is-active");
  } else {
    link.href = "#";
    link.setAttribute("aria-disabled", "true");
    link.removeAttribute("target");
  }
}

/* ---------- Apply CONFIG ---------- */

function applyConfig() {
  setConfigText("experience", CONFIG.experience || "Add experience");
  setConfigText("projects", CONFIG.projects || "Add project count");
  setConfigText(
    "location",
    displayOrPlaceholder(CONFIG.location, "Add location")
  );
  setConfigText(
    "locationDisplay",
    displayOrPlaceholder(CONFIG.location, "Add location")
  );
  setConfigText("phoneDisplay", displayOrPlaceholder(CONFIG.phone, "Add phone"));

  const emailEl = $('[data-config="emailDisplay"]');
  if (emailEl) {
    const email = displayOrPlaceholder(CONFIG.email, "Add email");
    if (CONFIG.email && CONFIG.email.trim()) {
      emailEl.innerHTML = `<a href="mailto:${CONFIG.email.trim()}">${CONFIG.email.trim()}</a>`;
    } else {
      emailEl.textContent = email;
    }
  }

  const phoneEl = $('[data-config="phoneDisplay"]');
  if (phoneEl && CONFIG.phone && CONFIG.phone.trim()) {
    phoneEl.innerHTML = `<a href="tel:${CONFIG.phone.trim().replace(/\s+/g, "")}">${CONFIG.phone.trim()}</a>`;
  }

  setupSocialLink("#link-instagram", CONFIG.instagram);
  setupSocialLink("#link-behance", CONFIG.behance);
  setupSocialLink("#link-linkedin", CONFIG.linkedin);
}

/* ---------- Navigation ---------- */

function initNavigation() {
  const header = $("#site-header");
  const toggle = $("#nav-toggle");
  const menu = $("#nav-menu");
  const overlay = $("#nav-overlay");
  const links = $$(".nav-link");

  function closeMenu() {
    menu.classList.remove("is-open");
    overlay.classList.remove("is-open");
    overlay.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    document.body.style.overflow = "";
  }

  function openMenu() {
    menu.classList.add("is-open");
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add("is-open"));
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
    document.body.style.overflow = "hidden";
  }

  toggle.addEventListener("click", () => {
    if (menu.classList.contains("is-open")) closeMenu();
    else openMenu();
  });

  overlay.addEventListener("click", closeMenu);

  links.forEach((link) => {
    link.addEventListener("click", () => closeMenu());
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("is-open")) {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768 && menu.classList.contains("is-open")) {
      closeMenu();
    }
  });

  window.addEventListener(
    "scroll",
    () => {
      header.classList.toggle("is-scrolled", window.scrollY > 20);
    },
    { passive: true }
  );

  const sections = [
    "home",
    "about",
    "gallery",
    "videos",
    "tools",
    "contact",
  ]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        links.forEach((link) => {
          link.classList.toggle(
            "is-active",
            link.dataset.section === id
          );
        });
      });
    },
    {
      rootMargin: "-40% 0px -50% 0px",
      threshold: 0,
    }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ---------- Scroll Reveal ---------- */

function initReveal() {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (reduceMotion) {
    $$(".reveal").forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  $$(".reveal").forEach((el) => observer.observe(el));
}

/* ---------- Profile Image ---------- */

async function loadProfileImage() {
  const container = $("#hero-portrait");
  const fallback = $("#hero-portrait-fallback");
  if (!container) return;

  try {
    const images = await loadAssetList("profile");
    if (!images.length) return;

    let selected = images[0];
    if (CONFIG.profileImage) {
      const match = images.find(
        (img) =>
          img.filename.toLowerCase() === CONFIG.profileImage.toLowerCase()
      );
      if (match) selected = match;
    }

    const img = document.createElement("img");
    img.src = selected.url;
    img.alt = `${CONFIG.name} — ${CONFIG.title}`;
    img.loading = "eager";
    img.decoding = "async";
    img.addEventListener("load", () => {
      if (fallback) fallback.remove();
    });
    img.addEventListener("error", () => {
      img.remove();
    });
    container.prepend(img);
  } catch (err) {
    console.warn("Profile image unavailable:", err.message);
  }
}

/* ---------- Lightbox ---------- */

function openLightbox(images, index) {
  const lightbox = $("#lightbox");
  const img = $("#lightbox-image");
  if (!lightbox || !img || !images.length) return;

  state.lightboxImages = images;
  state.lightboxIndex = index;
  updateLightboxImage();
  lightbox.hidden = false;
  requestAnimationFrame(() => lightbox.classList.add("is-open"));
  document.body.style.overflow = "hidden";
  $(".lightbox-close")?.focus();
}

function updateLightboxImage() {
  const img = $("#lightbox-image");
  const current = state.lightboxImages[state.lightboxIndex];
  if (!img || !current) return;
  img.src = current.url;
  img.alt = current.name || "Artwork";
}

function closeLightbox() {
  const lightbox = $("#lightbox");
  if (!lightbox) return;
  lightbox.classList.remove("is-open");
  document.body.style.overflow = "";
  setTimeout(() => {
    if (!lightbox.classList.contains("is-open")) {
      lightbox.hidden = true;
      $("#lightbox-image").removeAttribute("src");
    }
  }, 300);
}

function lightboxPrev() {
  if (!state.lightboxImages.length) return;
  state.lightboxIndex =
    (state.lightboxIndex - 1 + state.lightboxImages.length) %
    state.lightboxImages.length;
  updateLightboxImage();
}

function lightboxNext() {
  if (!state.lightboxImages.length) return;
  state.lightboxIndex =
    (state.lightboxIndex + 1) % state.lightboxImages.length;
  updateLightboxImage();
}

function initLightbox() {
  const lightbox = $("#lightbox");
  if (!lightbox) return;

  lightbox.addEventListener("click", (e) => {
    if (e.target.closest("[data-lightbox-close]")) closeLightbox();
  });

  $("#lightbox-prev")?.addEventListener("click", (e) => {
    e.stopPropagation();
    lightboxPrev();
  });

  $("#lightbox-next")?.addEventListener("click", (e) => {
    e.stopPropagation();
    lightboxNext();
  });

  document.addEventListener("keydown", (e) => {
    if (lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") lightboxPrev();
    if (e.key === "ArrowRight") lightboxNext();
  });

  lightbox.addEventListener(
    "touchstart",
    (e) => {
      if (!e.changedTouches[0]) return;
      state.touchStartX = e.changedTouches[0].screenX;
      state.touchStartY = e.changedTouches[0].screenY;
    },
    { passive: true }
  );

  lightbox.addEventListener(
    "touchend",
    (e) => {
      if (lightbox.hidden || !e.changedTouches[0]) return;
      const dx = e.changedTouches[0].screenX - state.touchStartX;
      const dy = e.changedTouches[0].screenY - state.touchStartY;
      if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;
      if (dx > 0) lightboxPrev();
      else lightboxNext();
    },
    { passive: true }
  );
}

/* ---------- Gallery ---------- */

async function loadGallery() {
  const grid = $("#gallery-grid");
  const empty = $("#gallery-empty");
  if (!grid) return;

  try {
    const images = await loadAssetList("images");
    state.galleryImages = images;

    if (!images.length) {
      empty.hidden = false;
      return;
    }

    empty.hidden = true;
    const frag = document.createDocumentFragment();

    images.forEach((item, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gallery-item reveal";
      button.setAttribute("aria-label", `View ${item.name}`);

      const img = document.createElement("img");
      img.src = item.url;
      img.alt = item.name;
      img.loading = "lazy";
      img.decoding = "async";

      button.appendChild(img);
      button.addEventListener("click", () => openLightbox(images, index));
      frag.appendChild(button);
    });

    grid.appendChild(frag);
    observeNewReveals(grid);
  } catch (err) {
    console.error("Gallery error:", err);
    empty.hidden = false;
    empty.textContent = "Unable to load gallery images.";
  }
}

/* ---------- Videos ---------- */

function createVideoCard(item, orientation) {
  const card = document.createElement("article");
  card.className = `video-card video-card--${orientation} reveal`;

  const frame = document.createElement("div");
  frame.className = "video-frame";

  const video = document.createElement("video");
  video.src = item.url;
  video.controls = true;
  video.playsInline = true;
  video.preload = "metadata";
  video.setAttribute("aria-label", item.name);
  if (item.poster) video.poster = item.poster;

  frame.appendChild(video);
  card.appendChild(frame);
  return card;
}

function getVideoOrientation(video) {
  const width = video.videoWidth || 0;
  const height = video.videoHeight || 0;
  if (!width || !height) return "horizontal";
  return width >= height ? "horizontal" : "vertical";
}

async function loadVideos() {
  const horizontalGrid = $("#videos-horizontal");
  const verticalGrid = $("#videos-vertical");
  const empty = $("#videos-empty");
  if (!horizontalGrid || !verticalGrid) return;

  try {
    const videos = await loadAssetList("videos");

    if (!videos.length) {
      empty.hidden = false;
      return;
    }

    empty.hidden = true;

    await Promise.all(
      videos.map(
        (item) =>
          new Promise((resolve) => {
            const probe = document.createElement("video");
            probe.preload = "metadata";
            probe.muted = true;
            probe.src = item.url;

            const finish = (orientation) => {
              const card = createVideoCard(item, orientation);
              if (orientation === "vertical") {
                verticalGrid.appendChild(card);
              } else {
                horizontalGrid.appendChild(card);
              }
              probe.removeAttribute("src");
              probe.load();
              resolve();
            };

            probe.addEventListener("loadedmetadata", () => {
              finish(getVideoOrientation(probe));
            });

            probe.addEventListener("error", () => {
              finish("horizontal");
            });
          })
      )
    );

    if (!horizontalGrid.children.length && !verticalGrid.children.length) {
      empty.hidden = false;
      return;
    }

    observeNewReveals(horizontalGrid);
    observeNewReveals(verticalGrid);
  } catch (err) {
    console.error("Videos error:", err);
    empty.hidden = false;
    empty.textContent = "Unable to load videos.";
  }
}

/* ---------- Tools ---------- */

async function loadTools() {
  const grid = $("#tools-grid");
  const empty = $("#tools-empty");
  if (!grid) return;

  try {
    const tools = await loadAssetList("tools");

    if (!tools.length) {
      empty.hidden = false;
      return;
    }

    empty.hidden = true;
    const frag = document.createDocumentFragment();

    tools.forEach((item) => {
      const card = document.createElement("article");
      card.className = "tool-card reveal";

      const img = document.createElement("img");
      img.src = item.url;
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";

      const name = document.createElement("span");
      name.textContent = item.name;

      card.appendChild(img);
      card.appendChild(name);
      card.setAttribute("aria-label", item.name);
      frag.appendChild(card);
    });

    grid.appendChild(frag);
    observeNewReveals(grid);
  } catch (err) {
    console.error("Tools error:", err);
    empty.hidden = false;
    empty.textContent = "Unable to load tools.";
  }
}

/* ---------- Reveal for dynamically added content ---------- */

let revealObserver;

function getRevealObserver() {
  if (revealObserver) return revealObserver;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (reduceMotion) {
    revealObserver = {
      observe(el) {
        el.classList.add("is-visible");
      },
    };
    return revealObserver;
  }

  revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  return revealObserver;
}

function observeNewReveals(root) {
  const obs = getRevealObserver();
  $$(".reveal:not(.is-visible)", root).forEach((el) => obs.observe(el));
}

/* ---------- Contact Form ---------- */

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function setFieldError(id, message) {
  const input = $(`#contact-${id}`);
  const error = $(`#error-${id}`);
  const group = input?.closest(".form-group");
  if (error) error.textContent = message || "";
  if (group) group.classList.toggle("is-invalid", Boolean(message));
}

function clearFormErrors() {
  ["name", "email", "subject", "message"].forEach((id) =>
    setFieldError(id, "")
  );
}

function initContactForm() {
  const form = $("#contact-form");
  const status = $("#form-status");
  const submit = $("#contact-submit");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearFormErrors();
    status.textContent = "";
    status.className = "form-status";

    const name = $("#contact-name").value.trim();
    const email = $("#contact-email").value.trim();
    const subject = $("#contact-subject").value.trim();
    const message = $("#contact-message").value.trim();

    let valid = true;

    if (!name) {
      setFieldError("name", "Please enter your name.");
      valid = false;
    }
    if (!email) {
      setFieldError("email", "Please enter your email.");
      valid = false;
    } else if (!validateEmail(email)) {
      setFieldError("email", "Please enter a valid email address.");
      valid = false;
    }
    if (!subject) {
      setFieldError("subject", "Please enter a subject.");
      valid = false;
    }
    if (!message) {
      setFieldError("message", "Please enter a message.");
      valid = false;
    }

    if (!valid) {
      status.textContent = "Please fix the errors above.";
      status.classList.add("is-error");
      return;
    }

    submit.classList.add("is-loading");
    submit.textContent = "Sending…";

    // Simulate brief processing, then use configured contact method
    setTimeout(() => {
      submit.classList.remove("is-loading");
      submit.textContent = "Send Message";

      if (CONFIG.contactMethod === "mailto") {
        const recipient = CONFIG.email && CONFIG.email.trim()
          ? CONFIG.email.trim()
          : "";

        if (!recipient) {
          status.textContent =
            "Email is not configured yet. Add your email in CONFIG within script.js, or connect a form backend.";
          status.classList.add("is-error");
          return;
        }

        const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
        const mailto = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailto;

        status.textContent =
          "Opening your email client… If nothing opens, email me directly using the address above.";
        status.classList.add("is-success");
        form.reset();
        return;
      }

      status.textContent =
        "Form backend is not connected yet. Configure contactMethod in script.js.";
      status.classList.add("is-error");
    }, 400);
  });
}

/* ---------- Init ---------- */

document.addEventListener("DOMContentLoaded", () => {
  applyConfig();
  initNavigation();
  initReveal();
  initLightbox();
  initContactForm();
  loadProfileImage();
  loadGallery();
  loadVideos();
  loadTools();
});
