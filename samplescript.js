const sr = ScrollReveal({
  origin: "top",
  distance: "100px",
  duration: 2000,
  reset: true,
});

sr.reveal(".header-top", { delay: 100 });
sr.reveal("#first-section", { delay: 100 });
sr.reveal("#second-section", {delay: 100});
sr.reveal("#third-section", {delay: 100});

var typingEffect = new Typed(".typed-text", {
  strings: [
    "#hardCoded",
    "#resume",
    "#coverletter",
    "#referral",
    "#ats",
    "#personalized",
    "#assistance",
    "We got you covered !",
    "😊",
  ],
  loop: true,
  typeSpeed: 100,
  backSpeed: 80,
  backDelay: 2000,
});

// Get the button
let backToTopBtn = document.getElementById("backToTopBtn");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function () {
  scrollFunction();
};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    backToTopBtn.style.display = "block";
  } else {
    backToTopBtn.style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document
backToTopBtn.addEventListener("click", function () {
  window.scrollTo({
    top: 0,
    behavior: "smooth", // Smooth scrolling
  });
});

document.getElementById("themeToggle").addEventListener("click", function () {
  document.body.classList.toggle("dark-mode");

  // Toggle the button text
  if (this.textContent === "Dark Mode") {
    this.textContent = "Go Light";
  } else {
    this.textContent = "Dark Mode";
  }
});


// const srLeft = ScrollReveal({
//   origin: "left",
//   distance: "80px",
//   duration: 2000,
//   reset: true,
// });

// srLeft.reveal("#second-section", { delay: 100 });

// const srRight = ScrollReveal({
//   origin: "right",
//   distance: "80px",
//   duration: 2000,
//   reset: true,
// });

// srRight.reveal(".header-top", { delay: 100 });
// srRight.reveal("#first-section", { delay: 100 });
// srRight.reveal("#second-section", { delay: 100 });
// srRight.reveal("#third-section", { delay: 100 });

// Add any JavaScript you need here, e.g., event listeners
// document.getElementById('responsiveButton').addEventListener('click', function() {
//   alert('Button clicked!');
// });

document.addEventListener('DOMContentLoaded', () => {
  const responsiveButton = document.getElementById('responsiveButton');
  const sidebar = document.getElementById('sidebar');
  const closeSidebar = document.getElementById('closeSidebar');

  responsiveButton.addEventListener('click', () => {
      sidebar.classList.add('open');
      document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  });

  closeSidebar.addEventListener('click', () => {
      sidebar.classList.remove('open');
      document.body.style.overflow = ''; // Allow scrolling when modal is closed
  });

  // Close the sidebar if clicking outside of it
  sidebar.addEventListener('click', (event) => {
      if (event.target === sidebar) {
          sidebar.classList.remove('open');
          document.body.style.overflow = ''; // Allow scrolling when modal is closed
      }
  });
});
