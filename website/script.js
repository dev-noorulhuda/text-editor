// Text Editor Website Scripts (Lightweight & Zero-dependency)

document.addEventListener("DOMContentLoaded", () => {
  // Update footer year dynamically
  const yearSpan = document.getElementById("current-year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Mobile navigation toggle
  const toggleBtn = document.querySelector(".mobile-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener("click", () => {
      navLinks.classList.toggle("open");
      const isOpen = navLinks.classList.contains("open");
      toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  // Highlight active TOC link on scroll for legal pages
  const tocLinks = document.querySelectorAll(".legal-toc a");
  if (tocLinks.length > 0) {
    const sections = Array.from(tocLinks)
      .map((link) => {
        const id = link.getAttribute("href")?.replace("#", "");
        return id ? document.getElementById(id) : null;
      })
      .filter((el): el is HTMLElement => el !== null);

    const onScroll = () => {
      const scrollPos = window.scrollY + 120;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPos) {
          tocLinks.forEach((l) => l.classList.remove("active"));
          const activeLink = document.querySelector(
            `.legal-toc a[href="#${section.id}"]`
          );
          activeLink?.classList.add("active");
          break;
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
});
