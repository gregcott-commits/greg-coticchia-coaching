const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.getElementById("site-nav");
if (menuToggle && siteNav) {
  const setMenu = (open) => {
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    siteNav.dataset.open = String(open);
  };
  menuToggle.addEventListener("click", () => setMenu(menuToggle.getAttribute("aria-expanded") !== "true"));
  siteNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      setMenu(false);
      menuToggle.focus();
    }
  });
  window.matchMedia("(min-width: 64rem)").addEventListener("change", () => setMenu(false));
}

const header = document.querySelector("[data-header]");
if (header) {
  const updateHeader = () => header.toggleAttribute("data-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();
}

const revealed = document.querySelectorAll("[data-reveal]");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -10% 0px" });
  revealed.forEach((element) => observer.observe(element));
} else {
  revealed.forEach((element) => element.classList.add("is-visible"));
}

const form = document.querySelector("[data-form]");
if (form) {
  const status = form.querySelector('[role="status"]');
  const messages = { name: "Enter your name.", email: "Enter an email like name@example.com." };
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let firstInvalid = null;
    form.querySelectorAll("input[required], textarea[required]").forEach((field) => {
      field.value = field.value.trim();
      const error = document.getElementById(`${field.id}-error`);
      const valid = field.checkValidity();
      field.setAttribute("aria-invalid", String(!valid));
      if (error) {
        error.hidden = valid;
        error.textContent = valid ? "" : messages[field.name] ?? "Fill in this field.";
        if (!valid) field.setAttribute("aria-describedby", error.id);
      }
      if (!valid && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }
    const first = form.elements.namedItem("name")?.value.split(" ")[0];
    if (status) status.textContent = first ? `Thanks, ${first}. Greg reads every message and will reply within a few working days.` : "Thanks. Greg will reply within a few working days.";
    form.reset();
  });
}
const speakingForm = document.querySelector("[data-speaking-form]");
if (speakingForm) {
  const status = speakingForm.querySelector(".speaking-status");
  const submit = speakingForm.querySelector(".speaking-submit");
  speakingForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    let firstInvalid = null;
    speakingForm.querySelectorAll("input[required]").forEach((field) => {
      field.value = field.value.trim();
      const valid = field.checkValidity();
      field.setAttribute("aria-invalid", String(!valid));
      if (!valid && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) {
      status.textContent = firstInvalid.type === "email" ? "Please enter a valid email address." : "Please enter your name and email.";
      firstInvalid.focus();
      return;
    }
    submit.disabled = true;
    status.textContent = "Sending...";
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(speakingForm),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || String(result.success) !== "true") throw new Error(result.message || "Request failed");
      const first = speakingForm.elements.namedItem("name").value.split(" ")[0];
      status.textContent = `Thanks, ${first}. Greg will get back to you about your date shortly.`;
      speakingForm.reset();
    } catch (error) {
      status.innerHTML = 'Something went wrong. Please email Greg at <a href="mailto:gregcott@gmail.com">gregcott@gmail.com</a>.';
    } finally {
      submit.disabled = false;
    }
  });
}

const checklistForm = document.querySelector("[data-checklist-form]");
if (checklistForm) {
  const status = checklistForm.querySelector(".checklist-status");
  const submit = checklistForm.querySelector("button[type=submit]");
  const pdf = "assets/ceo-scaling-checklist.pdf";
  checklistForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    let firstInvalid = null;
    checklistForm.querySelectorAll("input[required]").forEach((field) => {
      field.value = field.value.trim();
      const valid = field.checkValidity();
      field.setAttribute("aria-invalid", String(!valid));
      if (!valid && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) {
      status.textContent = firstInvalid.type === "email" ? "Please enter a valid email address." : "Please enter your first name and email.";
      firstInvalid.focus();
      return;
    }
    submit.disabled = true;
    status.textContent = "Sending...";
    try {
      const response = await fetch("https://api.web3forms.com/submit", { method: "POST", headers: { Accept: "application/json" }, body: new FormData(checklistForm) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || String(result.success) !== "true") throw new Error(result.message || "Request failed");
      const first = checklistForm.elements.namedItem("name").value.split(" ")[0];
      status.innerHTML = `Thanks, ${first.replace(/[<>&"]/g, "")}. Your checklist is ready: <a class="checklist-download" href="${pdf}" target="_blank" rel="noopener" download>Download the CEO Scaling Checklist (PDF)</a>`;
      checklistForm.reset();
      window.open(pdf, "_blank", "noopener");
    } catch (error) {
      status.innerHTML = `Something went wrong sending your details, but you can still <a href="${pdf}" target="_blank" rel="noopener" download>download the checklist here</a>.`;
    } finally {
      submit.disabled = false;
    }
  });
}

const mobileCta = document.querySelector(".mobile-cta");
if (mobileCta) {
  const hideZones = ["#contact", "#checklist", "#speaking-form"].map((sel) => document.querySelector(sel)).filter(Boolean);
  const update = () => {
    const nearTop = window.scrollY < 400;
    const inZone = hideZones.some((el) => { const r = el.getBoundingClientRect(); return r.top < window.innerHeight && r.bottom > 0; });
    mobileCta.toggleAttribute("data-hidden", nearTop || inZone);
  };
  window.addEventListener("scroll", update, { passive: true });
  update();
}
