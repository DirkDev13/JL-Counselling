const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth"
    });
}


// Sticky header: condense + shadow once the page is scrolled
const navbar = document.querySelector(".navbar");
const backToTopBtn = document.getElementById("back-to-top");
let navCondensed = false;

function onScroll() {
    const y = window.scrollY;

    // Condensing makes the header shorter, which shifts the page and the scroll
    // position. Separate on/off thresholds (further apart than that shift) stop
    // it flickering between the two states near the top of the page.
    if (!navCondensed && y > 120) navCondensed = true;
    else if (navCondensed && y < 10) navCondensed = false;

    if (navbar) navbar.classList.toggle("scrolled", navCondensed);
    if (backToTopBtn) backToTopBtn.classList.toggle("visible", y > 600);
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

if (backToTopBtn) {
    backToTopBtn.addEventListener("click", scrollToTop);
}


// Highlight the nav link for the section currently in view
const navLinks = document.querySelectorAll('.navbar-item[href^="#"]');

if (navLinks.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const link = document.querySelector(`.navbar-item[href="#${entry.target.id}"]`);
            if (link) link.classList.toggle("active", entry.isIntersecting);
        });
    }, { rootMargin: "-40% 0px -55% 0px" });

    navLinks.forEach((link) => {
        const section = document.querySelector(link.getAttribute("href"));
        if (section) spy.observe(section);
    });
}


// Testimonials carousel
const track = document.querySelector(".testimonials-track");

if (track) {
    const wrapper = document.querySelector(".testimonials-wrapper");
    const pillars = track.querySelectorAll(".testimonials-pillar");
    const dotsContainer = document.querySelector(".testimonials-dots");
    let index = 0;
    let visibleCount = getVisibleCount();

    function getVisibleCount() {
        if (window.innerWidth <= 768) return 1; // 📱 mobile shows 1
        if (window.innerWidth <= 1100) return 2; // tablet shows 2
        return 3; // desktop shows 3
    }

    function maxIndex() {
        return Math.max(0, pillars.length - visibleCount);
    }

    function buildDots() {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = "";
        for (let i = 0; i <= maxIndex(); i++) {
            const dot = document.createElement("button");
            dot.className = "testimonials-dot";
            dot.type = "button";
            dot.setAttribute("aria-label", `Show testimonial ${i + 1}`);
            dot.addEventListener("click", () => goTo(i));
            dotsContainer.appendChild(dot);
        }
    }

    function updateSlide() {
        track.style.setProperty("--per-view", visibleCount);
        const offset = -(index * (100 / visibleCount));
        track.style.transform = `translateX(${offset}%)`;

        // Size the carousel to the cards in view so short quotes don't leave a gap
        let tallest = 0;
        pillars.forEach((pillar, i) => {
            const inView = i >= index && i < index + visibleCount;
            pillar.setAttribute("aria-hidden", String(!inView));
            if (inView) tallest = Math.max(tallest, pillar.offsetHeight);
        });
        wrapper.style.height = `${tallest}px`;

        if (dotsContainer) {
            dotsContainer.querySelectorAll(".testimonials-dot").forEach((dot, i) => {
                dot.classList.toggle("active", i === index);
                dot.setAttribute("aria-current", i === index ? "true" : "false");
            });
        }
    }

    function goTo(i) {
        const last = maxIndex();
        if (i > last) i = 0; // wrap back to start
        if (i < 0) i = last; // wrap to last full window
        index = i;
        updateSlide();
    }

    document.getElementById("next-btn").addEventListener("click", () => goTo(index + 1));
    document.getElementById("prev-btn").addEventListener("click", () => goTo(index - 1));

    // Arrow keys when the carousel has focus
    wrapper.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") goTo(index + 1);
        if (e.key === "ArrowLeft") goTo(index - 1);
    });

    // Swipe on touch screens
    let startX = null;
    wrapper.addEventListener("pointerdown", (e) => { startX = e.clientX; });
    wrapper.addEventListener("pointerup", (e) => {
        if (startX === null) return;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 40) goTo(dx < 0 ? index + 1 : index - 1);
        startX = null;
    });

    // Handle resize: rebuild the dots only when the layout actually changes
    window.addEventListener("resize", () => {
        const next = getVisibleCount();
        if (next !== visibleCount) {
            visibleCount = next;
            index = Math.min(index, maxIndex());
            buildDots();
        }
        updateSlide();
    });

    // Initial render
    buildDots();
    updateSlide();
}


// Expand / collapse panels with a smooth height animation (see .collapsible in styles.css)
function setupToggle(buttonId, contentId, openLabel, closedLabel, onOpen) {
    const button = document.getElementById(buttonId);
    const content = document.getElementById(contentId);
    if (!button || !content) return null;

    content.inert = true;

    function setOpen(open) {
        content.classList.toggle("open", open);
        content.inert = !open;
        button.setAttribute("aria-expanded", String(open));
        button.innerHTML = open ? openLabel : closedLabel;
        if (open && onOpen) onOpen(content);
    }

    button.addEventListener("click", () => {
        setOpen(!content.classList.contains("open"));
    });

    return setOpen;
}

setupToggle("learn-more-btn", "extra-about-text", "Show Less &uarr;", "Learn More &rarr;");

const setBookingOpen = setupToggle("booking-btn", "booking-info", "Hide Calendar &uarr;", "Book a Session", (content) => {
    // Wait for the panel to start expanding, then bring the calendar into view
    setTimeout(() => {
        content.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    }, 150);
});

// Clicking a session card opens the booking calendar
document.querySelectorAll(".support-pillar").forEach((pillar) => {
    function open() {
        if (setBookingOpen) setBookingOpen(true);
    }
    pillar.addEventListener("click", open);
    pillar.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open();
        }
    });
});


// Motion: entrance + scroll reveals (GSAP). Skipped entirely for reduced motion
// or if GSAP failed to load, so content is always visible without it.
const motionEnabled = window.gsap && window.ScrollTrigger && !prefersReducedMotion;

// GSAP owns opacity/transform while it animates: CSS transitions on the same
// properties fight it (and can leave elements stuck invisible), so .motion-pending
// switches them off until the tween is done and its inline styles are cleared.
function animate(targets, fromVars, toVars, position, timeline) {
    const els = gsap.utils.toArray(targets);
    els.forEach((el) => el.classList.add("motion-pending"));
    const vars = {
        ...toVars,
        clearProps: "opacity,transform", // hand hover transforms back to CSS
        onComplete: () => els.forEach((el) => el.classList.remove("motion-pending"))
    };
    return timeline
        ? timeline.fromTo(els, fromVars, vars, position)
        : gsap.fromTo(els, fromVars, vars);
}

if (motionEnabled) {
    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance
    if (document.querySelector(".hero-text")) {
        const hero = gsap.timeline({ defaults: { ease: "power2.out" } });
        animate(".hero-text h2", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9 }, 0, hero);
        animate(".hero-text p", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.5", hero);
        animate(".hero-text .btn", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.4", hero);
        animate(".counsel-areas li", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, "-=0.3", hero);
    }

    // Gentle fade-up as each block scrolls into view
    gsap.utils.toArray(".section-heading, .blog-page-heading, .about-content, .testimonials-content, .contact-photo, .contact-content, .support-bookingbtn, .formbox").forEach((el) => {
        animate(el, { opacity: 0, y: 16 }, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power1.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true }
        });
    });

    // Session cards and blog cards come in one after another
    [".support-pillar", ".blog-post"].forEach((selector) => {
        if (!document.querySelector(selector)) return;
        gsap.utils.toArray(selector).forEach((el) => el.classList.add("motion-pending"));
        gsap.set(selector, { opacity: 0, y: 20 });
        ScrollTrigger.batch(selector, {
            start: "top 90%",
            once: true,
            onEnter: (batch) => animate(batch, { opacity: 0, y: 20 }, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: "power2.out",
                stagger: 0.1
            })
        });
    });
}

// The hero text starts hidden (see the <head> of index.html) so it doesn't flash
// before the entrance animation; GSAP's inline styles have taken over by now.
document.documentElement.classList.remove("motion-hero");
