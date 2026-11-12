/* ==========================================================
   LUMORA STUDIO - script.js
   Adds interactivity: mobile menu, smooth scrolling and
   contact form validation. Plain JavaScript, no libraries.
   ========================================================== */

/* ---------- Grab the elements we need from index.html ---------- */
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-links");
const contactForm = document.querySelector(".contact-form");

/* Wait until the page is ready, then switch everything on */
document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupSmoothScrolling();
    setupContactForm();
});

/* ==========================================================
   1. MOBILE MENU
   Opens and closes the menu when the hamburger is clicked.
   It does this by adding/removing the class "is-open" on the
   menu and "is-active" on the button, and by updating the
   aria-expanded attribute (which tells screen readers whether
   the menu is open).
   ========================================================== */

function openMenu() {
    if (!navToggle || !navMenu) return;
    navMenu.classList.add("is-open");
    navToggle.classList.add("is-active");
    navToggle.setAttribute("aria-expanded", "true");
}

function closeMenu() {
    if (!navToggle || !navMenu) return;
    navMenu.classList.remove("is-open");
    navToggle.classList.remove("is-active");
    navToggle.setAttribute("aria-expanded", "false");
}

function setupMobileMenu() {
    // If the button or menu is missing, stop quietly (no errors).
    if (!navToggle || !navMenu) return;

    // Click the hamburger: open if closed, close if open.
    navToggle.addEventListener("click", function () {
        const isOpen = navToggle.getAttribute("aria-expanded") === "true";
        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Click anywhere outside the menu: close it.
    document.addEventListener("click", function (event) {
        const clickedInsideMenu = navMenu.contains(event.target);
        const clickedButton = navToggle.contains(event.target);
        if (!clickedInsideMenu && !clickedButton) {
            closeMenu();
        }
    });

    // Press the Escape key: close it.
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeMenu();
        }
    });

    // If the screen becomes wide (desktop), reset the menu.
    window.addEventListener("resize", function () {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });
}

/* ==========================================================
   2 & 3. NAVIGATION LINKS + SMOOTH SCROLLING
   Every link that starts with "#" (like #services) scrolls
   smoothly to the section with that ID, then closes the
   mobile menu. If a person has "reduce motion" turned on in
   their device settings, we scroll instantly instead.
   ========================================================== */

function setupSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(function (link) {
        link.addEventListener("click", function (event) {
            const href = link.getAttribute("href");

            // Ignore empty links like href="#"
            if (!href || href === "#") return;

            const target = document.getElementById(href.slice(1));

            // If the section doesn't exist, let the browser do its normal thing.
            if (!target) return;

            event.preventDefault();
            closeMenu();

            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;

            target.scrollIntoView({
                behavior: prefersReducedMotion ? "auto" : "smooth",
                block: "start"
            });

            // Update the address bar (e.g. ...index.html#about).
            try {
                history.pushState(null, "", href);
            } catch (error) {
                // Some environments block this. It is safe to ignore.
            }

            // Move keyboard focus to the section for accessibility.
            if (!target.hasAttribute("tabindex")) {
                target.setAttribute("tabindex", "-1");
            }
            target.focus({ preventScroll: true });
        });
    });
}

/* ==========================================================
   4. CONTACT FORM VALIDATION
   The form is NOT connected to a server yet, so it can never
   send a real message. After a valid submit we show an honest
   message saying so.
   ========================================================== */

// A simple pattern: something@something.something
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ERROR_COLOR = "#f87171";
const SUCCESS_COLOR = "#34d399";

/* Show an error message under a field and mark it red */
function showFieldError(field, message) {
    const errorId = field.id + "-error";
    let errorBox = document.getElementById(errorId);

    // Create the message element the first time we need it.
    if (!errorBox) {
        errorBox = document.createElement("p");
        errorBox.id = errorId;
        errorBox.style.color = ERROR_COLOR;
        errorBox.style.fontSize = "0.85rem";
        errorBox.style.marginTop = "6px";
        field.insertAdjacentElement("afterend", errorBox);
    }

    errorBox.textContent = message;
    field.style.borderColor = ERROR_COLOR;
    field.setAttribute("aria-invalid", "true");
    field.setAttribute("aria-describedby", errorId);
}

/* Remove the error message and red border from a field */
function clearFieldError(field) {
    const errorBox = document.getElementById(field.id + "-error");
    if (errorBox) {
        errorBox.remove();
    }
    field.style.borderColor = "";
    field.removeAttribute("aria-invalid");
    field.removeAttribute("aria-describedby");
}

/* Check one field. Returns true if it is OK, false if not. */
function validateField(field) {
    const value = field.value.trim();

    if (field.required && value === "") {
        showFieldError(field, "This field is required.");
        return false;
    }

    if (field.type === "email" && value !== "" && !EMAIL_PATTERN.test(value)) {
        showFieldError(field, "Please enter a valid email address, like name@example.com.");
        return false;
    }

    clearFieldError(field);
    return true;
}

/* Show a message box above the submit button */
function showFormStatus(form, message, isSuccess) {
    let status = document.getElementById("form-status");

    if (!status) {
        status = document.createElement("div");
        status.id = "form-status";
        status.setAttribute("role", "status"); // screen readers announce it
        status.style.padding = "14px 16px";
        status.style.marginBottom = "16px";
        status.style.borderRadius = "10px";
        status.style.fontSize = "0.95rem";
        status.style.lineHeight = "1.5";

        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            form.insertBefore(status, submitButton);
        } else {
            form.appendChild(status);
        }
    }

    const color = isSuccess ? SUCCESS_COLOR : ERROR_COLOR;
    status.textContent = message;
    status.style.color = color;
    status.style.border = "1px solid " + color;
    status.style.backgroundColor = isSuccess
        ? "rgba(52, 211, 153, 0.1)"
        : "rgba(248, 113, 113, 0.1)";
}

function setupContactForm() {
    if (!contactForm) return;

    // Turn off the browser's own pop-up errors so ours show instead.
    contactForm.setAttribute("novalidate", "");

    const fields = contactForm.querySelectorAll("input, select, textarea");

    fields.forEach(function (field) {
        // Check a field when the person leaves it.
        field.addEventListener("blur", function () {
            validateField(field);
        });

        // While typing, remove an old error as soon as it is fixed.
        field.addEventListener("input", function () {
            if (field.getAttribute("aria-invalid") === "true") {
                validateField(field);
            }
        });
    });

    contactForm.addEventListener("submit", function (event) {
        // Stop the page from reloading.
        event.preventDefault();

        let firstInvalidField = null;

        fields.forEach(function (field) {
            const isValid = validateField(field);
            if (!isValid && !firstInvalidField) {
                firstInvalidField = field;
            }
        });

        if (firstInvalidField) {
            showFormStatus(
                contactForm,
                "Please fix the highlighted fields and try again.",
                false
            );
            firstInvalidField.focus();
            return;
        }

        // Everything is valid. Be honest: nothing is actually sent.
        showFormStatus(
            contactForm,
            "Thank you! Your details look good. Note: this website is not connected to " +
            "a server yet, so your message has NOT been sent. Please email " +
            "hello@lumorastudio.com directly for now.",
            true
        );

        contactForm.reset();
    });
}
