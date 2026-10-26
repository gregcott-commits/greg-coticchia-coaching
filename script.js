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