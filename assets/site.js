(() => {
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

  if (navHost) {
    navHost.classList.add("site-nav");
    navHost.innerHTML = `
      <div class="site-nav-row">
        <span class="site-nav-title">Ruben Sutton Portfolio</span>
        <button class="site-nav-toggle" type="button" aria-expanded="false">Menu</button>
      </div>
      <ul class="site-nav-list"></ul>
    `;

    const list = navHost.querySelector(".site-nav-list");
    pages.forEach(([href, label]) => {
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

    const toggle = navHost.querySelector(".site-nav-toggle");
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      list.classList.toggle("open");
    });
  }

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
