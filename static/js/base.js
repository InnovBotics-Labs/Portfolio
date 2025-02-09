    window.addEventListener("scroll", function() {
        let navbar = document.getElementById("navbar");
        if (window.scrollY > 50) {
            navbar.classList.remove("transparent");
            navbar.classList.add("solid");
        } else {
            navbar.classList.remove("solid");
            navbar.classList.add("transparent");
        }
    });

    document.addEventListener("DOMContentLoaded", function () {
    const slidingDivs = document.querySelectorAll(".sliding-div");
    const navLinks = document.querySelectorAll(".nav-link");
    const closeButtons = document.querySelectorAll(".close-btn");

    // Function to show the correct sliding div
    function showContent(section) {
        slidingDivs.forEach(div => div.classList.remove("active")); // Hide all first
        document.getElementById(section).classList.add("active"); // Show selected one
    }

    // Attach event listeners to navbar links
    navLinks.forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault();
            const sectionId = this.getAttribute("onclick").split("'")[1]; // Extract ID
            showContent(sectionId);
        });
    });

    // Close button functionality
    closeButtons.forEach(button => {
        button.addEventListener("click", function () {
            this.parentElement.classList.remove("active");
        });
    });

    // Close when clicking outside the div
    document.addEventListener("click", function (event) {
        if (!event.target.closest(".sliding-div") && !event.target.closest(".nav-link")) {
            slidingDivs.forEach(div => div.classList.remove("active"));
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
  const links = document.querySelectorAll("a[href^='#']");

  links.forEach(link => {
    link.addEventListener("click", function (event) {
      event.preventDefault();

      const targetId = this.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop,
          behavior: "smooth"
        });
      }
    });
  });
});
