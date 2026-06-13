function scrollToBooking() {
    document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
}
function scrollToAbout() {
    document.getElementById("about").scrollIntoView({ behavior: "smooth" });
}
function scrollToSupport() {
    document.getElementById("support").scrollIntoView({ behavior: "smooth" });
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

//testimonials animation
const track = document.querySelector(".testimonials-track");
const pillars = document.querySelectorAll(".testimonials-pillar");
const visibleCount = 3;
let index = 0;

function moveTestimonials() {
  index++;
  if (index > pillars.length - visibleCount) {
    index = 0; // reset to start
  }
  const offset = -(index * (100 / visibleCount));
  track.style.transform = `translateX(${offset}%)`;
}

setInterval(moveTestimonials, 8000); // every 6 seconds