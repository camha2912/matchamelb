// ========== ALL FEATURES IN ONE DOMContentLoaded BLOCK ==========
// This ensures all DOM elements are fully loaded before any script runs
document.addEventListener("DOMContentLoaded", function () {
  // === RECIPE FILTER BUTTON LOGIC ===
  // Toggles the display of different recipe categories based on selected filter
  const filterButtons = document.querySelectorAll(".recipe-filter-btn");
  const categories = document.querySelectorAll(".recipe-category");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const selectedCategory = btn.dataset.category;

      // Remove "active" state from all buttons
      filterButtons.forEach((b) => b.classList.remove("active"));

      // Add "active" class to the clicked button
      btn.classList.add("active");

      // Show selected recipe category, hide others
      categories.forEach((cat) => {
        if (cat.id === selectedCategory) {
          cat.classList.remove("d-none");
        } else {
          cat.classList.add("d-none");
        }
      });
    });
  });

  // === REVIEW CARD SEARCH BAR ===
  // Filters review cards in real-time by matching user input with location
  const reviewSearchInput = document.getElementById("reviewSearch");
  const reviewCards = document.querySelectorAll("#reviewCards .col-md-4");

  reviewSearchInput?.addEventListener("input", () => {
    const keyword = reviewSearchInput.value.trim().toLowerCase();

    reviewCards.forEach((card) => {
      const locationText =
        card.querySelector(".suburb-postcode")?.innerText.toLowerCase() || "";
      const visible = locationText.includes(keyword);
      card.style.display = visible ? "block" : "none";
    });
  });

  // === REVIEW CARD SLIDER (3 at a time) ===
  // Simulates a slider by showing 3 cards per page with next/prev buttons
  const cards = document.querySelectorAll("#reviewCards .col-md-4");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const cardsPerPage = 3;
  let currentIndex = 0;

  // Update which cards are visible based on current index
  function updateCardVisibility() {
    cards.forEach((card, index) => {
      card.style.display =
        index >= currentIndex && index < currentIndex + cardsPerPage
          ? "block"
          : "none";
    });

    // Disable buttons when limits are reached
    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex + cardsPerPage >= cards.length;
  }

  // Scroll back to previous 3 cards
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentIndex >= cardsPerPage) {
        currentIndex -= cardsPerPage;
        updateCardVisibility();
      }
    });
  }

  // Scroll forward to next 3 cards
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (currentIndex + cardsPerPage < cards.length) {
        currentIndex += cardsPerPage;
        updateCardVisibility();
      }
    });
  }

  // Initialize slider on load
  updateCardVisibility();

  // === COUNTRY DROPDOWN POPULATION ===
  // Fetch country list from a local JSON file and populate the <select>
  fetch("countries.json")
    .then((res) => res.json())
    .then((data) => {
      const countrySelect = document.getElementById("country");
      if (!countrySelect) return;

      // Sort country names and populate the dropdown
      data
        .map((entry) => entry.name)
        .sort()
        .forEach((name) => {
          const option = document.createElement("option");
          option.value = name;
          option.textContent = name;
          countrySelect.appendChild(option);
        });
    })
    .catch((err) => console.error("Error loading country list:", err));

  // === CUSTOM FORM VALIDATION ===
  // Validates the review form on submission with custom error messages
  const form = document.getElementById("reviewForm");

  if (form) {
    form.onsubmit = function (event) {
      // Watch input fields and clear error messages as user types
      const inputsToWatch = [
        "name",
        "email",
        "phone",
        "country",
        "venue",
        "review",
      ];
      inputsToWatch.forEach((id) => {
        const input = document.getElementById(id);
        input?.addEventListener("input", () => {
          document.getElementById(id + "-error").innerText = "";
        });
      });

      // Watch for changes to the star rating input
      document.querySelectorAll('input[name="rating"]').forEach((radio) => {
        radio.addEventListener("change", () => {
          document.getElementById("rating-error").innerText = "";
        });
      });

      let isValid = true;

      // Clear all error messages before new validation run
      const errorFields = [
        "name-error",
        "email-error",
        "phone-error",
        "country-error",
        "venue-error",
        "review-error",
        "rating-error",
      ];
      errorFields.forEach((id) => (document.getElementById(id).innerText = ""));

      // === Individual Field Validations ===

      const name = document.getElementById("name").value.trim();
      if (name === "") {
        document.getElementById("name-error").innerText =
          "Oops! Don’t forget to tell us your name.";
        isValid = false;
      }

      const email = document.getElementById("email").value.trim();
      const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      if (!emailPattern.test(email)) {
        document.getElementById("email-error").innerText =
          "Hmm… that email doesn’t look right. Could you check it?";
        isValid = false;
      }

      const phone = document.getElementById("phone").value.trim();
      const phonePattern = /^[0-9]{10}$/;
      if (!phonePattern.test(phone)) {
        document.getElementById("phone-error").innerText =
          "That doesn't look like a phone number. It should be exactly 10 digits — no spaces or dots, just numbers please!";
        isValid = false;
      }

      const country = document.getElementById("country").value;
      if (!country) {
        document.getElementById("country-error").innerText =
          "We’d love to know where you’re from — just a country name is perfect!";
        isValid = false;
      }

      const venue = document.getElementById("venue").value.trim();
      if (venue === "") {
        document.getElementById("venue-error").innerText =
          "Don’t forget to share the name of the matcha place you went to.";
        isValid = false;
      }

      const review = document.getElementById("review").value.trim();
      if (review === "") {
        document.getElementById("review-error").innerText =
          "We’d love to hear your thoughts — tell us a bit more about your matcha experience!";
        isValid = false;
      }

      const ratingChecked = document.querySelector(
        'input[name="rating"]:checked'
      );
      if (!ratingChecked) {
        document.getElementById("rating-error").innerText =
          "Almost done! Just let us know how many stars you’d give this place.";
        isValid = false;
      }

      // Prevent form submission if any fields are invalid
      if (!isValid) event.preventDefault();
      return isValid;
    };
  }
});

// ========== SUBSCRIPTION MODAL HANDLER ==========
// Displays a success modal when redirected with a "subscribed=true" query string
window.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("subscribed") === "true") {
    const modal = new bootstrap.Modal(
      document.getElementById("subscribeSuccessModal")
    );
    modal.show();
  }
});
