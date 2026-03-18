(() => {
  const configPath = "menu-config.json";

  const pages = [
    ["index.html", "Overview"],
    ["home.html", "Home"],
    ["year-9-program.html", "Year 9 Program"],
    ["the-calling.html", "The Calling"],
    ["my-story.html", "My Story"],
    ["the-departure.html", "The Departure"],
    ["service.html", "Service"],
    ["elite-minds.html", "Elite Minds"],
    ["indigenous-learning.html", "Indigenous Learning"],
    ["abyss-journey.html", "Abyss Journey"],
    ["class-challenges.html", "Class Challenges"],
    ["final-reflection.html", "Final Reflection"],
    ["year-10-futures.html", "Year 10 Futures"],
    ["work-experience.html", "Work Experience"],
    ["pathway-plans.html", "Pathway Plans"],
    ["microcredentials.html", "Microcredentials"],
    ["alternatives-to-violence-pat-cronin-foundation.html", "Alternatives to Violence"],
    ["year-11-12.html", "Year 11/12"],
    ["new-metrics.html", "New Metrics"]
  ];

  const normalizePath = (path) => {
    const cleaned = path.replace(/\\/g, "/").replace(/\/+/g, "/");
    const leaf = cleaned.split("/").pop() || "";
    return leaf.toLowerCase() || "index.html";
  };

  const readConfig = async () => {
    try {
      const response = await fetch(configPath, { cache: "no-store" });
      if (!response.ok) {
        return { hiddenPages: [] };
      }
      const parsed = await response.json();
      const hiddenPages = Array.isArray(parsed.hiddenPages)
        ? parsed.hiddenPages.map((item) => String(item).toLowerCase())
        : [];
      return { hiddenPages };
    } catch {
      return { hiddenPages: [] };
    }
  };

  const closeMenu = (navHost, toggle, panel) => {
    navHost.classList.remove("is-open");
    navHost.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
    panel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
  };

  const openMenu = (navHost, toggle, panel) => {
    navHost.classList.add("is-open");
    navHost.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
    panel.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-open");
  };

  const initMenu = async () => {
    const config = await readConfig();
    const hidden = new Set(config.hiddenPages);
    const current = normalizePath(window.location.pathname);

    let navHost = document.querySelector("[data-site-nav]");

    if (!navHost) {
      const header = document.querySelector("header");
      if (header) {
        navHost = document.createElement("nav");
        navHost.className = "site-nav";
        navHost.setAttribute("data-site-nav", "");
        header.insertAdjacentElement("afterend", navHost);
      }
    }

    if (!navHost) {
      return;
    }

    const menuId = "site-menu-links";
    navHost.classList.add("site-nav");
    navHost.setAttribute("aria-hidden", "true");
    navHost.innerHTML = `
      <button class="site-nav-toggle" type="button" aria-expanded="false" aria-controls="${menuId}" aria-label="Open site menu">
        <span class="site-nav-toggle-icon" aria-hidden="true"></span>
      </button>
      <div class="site-nav-overlay" data-menu-overlay></div>
      <section class="site-nav-panel" aria-hidden="true">
        <div class="site-nav-row">
          <span class="site-nav-title">Ruben Sutton Portfolio</span>
          <button class="site-nav-close" type="button" aria-label="Close site menu">Close</button>
        </div>
        <ul class="site-nav-list" id="${menuId}"></ul>
      </section>
      <div class="site-nav-fab" aria-hidden="true">
        <span>Menu</span>
      </div>
    `;

    const list = navHost.querySelector(".site-nav-list");
    pages.forEach(([href, label]) => {
      if (hidden.has(href.toLowerCase())) {
        return;
      }
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = href;
      a.textContent = label;
      if (href.toLowerCase() === current || (current === "" && href === "index.html")) {
        a.setAttribute("aria-current", "page");
      }
      li.appendChild(a);
      list.appendChild(li);
    });

    const panel = navHost.querySelector(".site-nav-panel");
    const toggle = navHost.querySelector(".site-nav-toggle");
    const closeBtn = navHost.querySelector(".site-nav-close");
    const overlay = navHost.querySelector("[data-menu-overlay]");

    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      if (expanded) {
        closeMenu(navHost, toggle, panel);
      } else {
        openMenu(navHost, toggle, panel);
      }
    });

    closeBtn.addEventListener("click", () => closeMenu(navHost, toggle, panel));
    overlay.addEventListener("click", () => closeMenu(navHost, toggle, panel));

    list.addEventListener("click", (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("a")) {
        closeMenu(navHost, toggle, panel);
      }
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu(navHost, toggle, panel);
      }
    });
  };

  initMenu();

  // Shared, lightweight reveal motion across all pages.
  const revealTargets = document.querySelectorAll("main > *");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
      }
    });
  }, { threshold: 0.12 });

  revealTargets.forEach((el, i) => {
    el.classList.add("reveal");
    el.style.transitionDelay = `${Math.min(i * 35, 280)}ms`;
    observer.observe(el);
  });
})();
