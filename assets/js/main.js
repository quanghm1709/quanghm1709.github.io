(() => {
  "use strict";

  const header = document.querySelector("[data-header]");
  const menuButton = document.querySelector("[data-menu-button]");
  const navigation = document.querySelector("[data-navigation]");
  const navLinks = [...document.querySelectorAll(".site-nav a[href^='#']")];
  const sections = [...document.querySelectorAll("main section[id]")];
  const year = document.querySelector("[data-year]");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  const setHeaderState = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  const closeMenu = () => {
    if (!menuButton || !navigation) return;

    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
    navigation.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };

  menuButton?.addEventListener("click", () => {
    if (!navigation) return;

    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute(
      "aria-label",
      isOpen ? "Open navigation" : "Close navigation"
    );
    navigation.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeMenu();
  });

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const revealElements = document.querySelectorAll(".reveal");

  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => {
      element.classList.add("is-visible");
    });
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  }

  if ("IntersectionObserver" in window) {
    const activeSectionObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (!visibleEntries.length) return;

        const currentId = visibleEntries[0].target.id;

        navLinks.forEach((link) => {
          link.classList.toggle(
            "is-active",
            link.getAttribute("href") === `#${currentId}`
          );
        });
      },
      {
        rootMargin: "-25% 0px -60% 0px",
        threshold: [0.01, 0.15, 0.35],
      }
    );

    sections.forEach((section) => {
      activeSectionObserver.observe(section);
    });
  }

  document.querySelectorAll(".project-media img, .team-item img").forEach((image) => {
    image.addEventListener("error", () => {
      image.style.display = "none";
      image.parentElement?.classList.add("image-fallback");
    });
  });
})();
