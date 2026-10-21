const contactWebsite = document.getElementById("c-website");
const contactPhone = document.getElementById("c-phone");

contactWebsite.innerHTML =
  '<a class="link" href="mailto:eldoret@uoeld.ac.ke">Email us</a>';

contactPhone.innerHTML =
  '<a class="link" href="' + getWhatsAppLink("0712345678") +
  '" target="_blank" rel="noopener">WhatsApp us</a>';

const contactForm = document.getElementById("contact-form");

contactForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const formFields = contactForm.elements;
  const emailSubject = `[${SITE.name}] ${formFields.topic.value}`;
  const emailMessage = [
    "Name: " + formFields.fullname.value,
    "Email: " + formFields.email.value,
    "",
    formFields.message.value
  ].join("\n");

  location.href =
    `mailto:${SITE.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailMessage)}`;
});
