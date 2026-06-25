function scrollToBooking() {
    document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
}
function scrollToAbout() {
    document.getElementById("about").scrollIntoView({ behavior: "smooth" });
}

function scrollToContact() {
    document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
}
function scrollToTop(){
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// testimonials animation
const track = document.querySelector(".testimonials-track");
const pillars = document.querySelectorAll(".testimonials-pillar");
let visibleCount = window.innerWidth <= 768 ? 1 : 3; // 📱 mobile shows 1, desktop shows 3
let index = 0;

function moveTestimonials() {
  index++;
  if (index > pillars.length - visibleCount) {
    index = 0; // reset to start
  }
  const offset = -(index * (100 / visibleCount));
  track.style.transform = `translateX(${offset}%)`;
}

// re-check visibleCount if window is resized
window.addEventListener("resize", () => {
  visibleCount = window.innerWidth <= 768 ? 1 : 3;
  index = 0; // reset when switching layout
  track.style.transform = "translateX(0%)";
});

setInterval(moveTestimonials, 6000); // every 8 seconds

function toggleText(buttonId, contentId) {
    const button = document.getElementById(buttonId);
    const content = document.getElementById(contentId);

    button.addEventListener("click", () => {
        content.classList.toggle("hidden");

        if (content.classList.contains("hidden")) {
            button.innerHTML = "Learn More &rarr;";
        } else {
            button.innerHTML = "&larr;";
        }
    });
}

toggleText("learn-more-btn", "extra-about-text");