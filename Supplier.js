(function () {
  const pageParameters = new URLSearchParams(location.search);
  const supplierId = pageParameters.get("id");

  const supplier = SUPPLIERS.find(function (item) {
    return item.id === supplierId;
  });

  const supplierDetails = document.getElementById("detail");

  function displayNotFoundMessage() {
    supplierDetails.innerHTML = `
      <div class="empty">
        <h3>Supplier not found</h3>
        <p>This supplier may have been removed or the link is incorrect.</p>
        <a class="btn btn-green" href="Index.html#categories">Browse categories</a>
      </div>
    `;
  }

  function createRatingHTML() {
    if (!supplier.rating) {
      return "";
    }

    const fullStars = Math.round(supplier.rating);
    const emptyStars = 5 - fullStars;
    const starsText = "★".repeat(fullStars) + "☆".repeat(emptyStars);
    let reviewText = "";

    if (supplier.reviews) {
      reviewText = ` (${supplier.reviews} reviews)`;
    }

    return `
      <div class="rating">
        <span class="stars" aria-hidden="true">${starsText}</span>
        <span>${supplier.rating.toFixed(1)}${reviewText}</span>
      </div>
    `;
  }

  function createGalleryHTML() {
    const galleryItems = [];

    for (let imageNumber = 0; imageNumber < 3; imageNumber += 1) {
      let imagePath = supplier.images && supplier.images[imageNumber];

      if (!imagePath && imageNumber === 0) {
        imagePath = supplier.photoPath;
      }

      if (imagePath) {
        galleryItems.push(`
          <img
            src="${escapeHTML(imagePath)}"
            alt="${escapeHTML(supplier.name)} photo ${imageNumber + 1}"
            loading="lazy"
          >
        `);
      } else {
        galleryItems.push('<div class="ph">Photo not available</div>');
      }
    }

    return galleryItems.join("");
  }

  function createBusinessHoursHTML() {
    if (supplier.openingHours) {
      return `<p class="hours-note">${escapeHTML(supplier.openingHours)}</p>`;
    }

    const supplierHours = supplier.hours || [];

    const hoursRows = supplierHours.map(function (openingHours) {
      const day = escapeHTML(openingHours[0]);
      const time = escapeHTML(openingHours[1]);

      return `<tr><td>${day}</td><td>${time}</td></tr>`;
    }).join("");

    if (!hoursRows) {
      return "";
    }

    return `<table class="hours"><tbody>${hoursRows}</tbody></table>`;
  }

  function createServicesHTML() {
    const services = supplier.details || supplier.services;

    return services.map(function (service) {
      return `
        <li>
          <span>${escapeHTML(service)}</span>
        </li>
      `;
    }).join("");
  }

  function createContactPanelHTML() {
    const phoneNumber = supplier.phone
      ? escapeHTML(supplier.phone)
      : "Phone number not listed";
    const callButton = supplier.phone
      ? `<a class="btn btn-green" href="tel:${getTelephoneLink(supplier.phone)}">Call</a>`
      : "";
    const whatsappNumber = supplier.whatsapp === undefined
      ? supplier.phone
      : supplier.whatsapp;
    const whatsappButton = whatsappNumber
      ? `<a class="btn btn-wa" href="${getWhatsAppLink(whatsappNumber)}" target="_blank" rel="noopener">${whatsappIcon(16)} WhatsApp</a>`
      : "";
    const contactButtons = callButton || whatsappButton
      ? `<div class="btn-row">${callButton}${whatsappButton}</div>`
      : "";
    const mapLink = supplier.googleMapsUrl || getMapLink(supplier.address);

    return `
      <section class="panel">
        <h2 class="d-h">Contact Information</h2>
        <div class="row">
          <span>Phone:</span>
          <span>${phoneNumber}</span>
        </div>
        ${contactButtons}
        <div class="row addr">
          <div>
            <span>${escapeHTML(supplier.address)}</span><br>
            <a class="link" href="${escapeHTML(mapLink)}" target="_blank" rel="noopener">
              View on Google Maps
            </a>
          </div>
        </div>
      </section>
    `;
  }

  function createHoursPanelHTML(hoursHTML) {
    if (!hoursHTML) {
      return "";
    }

    return `
      <section class="panel">
        <h2 class="d-h">Business Hours</h2>
        ${hoursHTML}
      </section>
    `;
  }

  function displaySupplierDetails() {
    const ratingHTML = createRatingHTML();
    const galleryHTML = createGalleryHTML();
    const hoursHTML = createBusinessHoursHTML();
    const serviceListHTML = createServicesHTML();
    const distanceText = typeof supplier.km === "number"
      ? ", " + supplier.km.toFixed(1) + " km from campus"
      : "";

    supplierDetails.innerHTML = `
      <div class="detail">
        <div class="d-main">
          <div>
            <h1>${escapeHTML(supplier.name)}</h1>
            ${ratingHTML}
            <p class="s-loc">
              <span>${escapeHTML(supplier.area)}${distanceText}</span>
            </p>
          </div>

          <div class="chips">
            ${supplier.services.map(function (service) {
              return `<span class="chip">${escapeHTML(service)}</span>`;
            }).join("")}
          </div>

          <p class="d-desc">${escapeHTML(supplier.description)}</p>

          <h2 class="d-h">Gallery</h2>
          <div class="gallery">${galleryHTML}</div>

          <section class="panel services">
            <h2 class="d-h">Services Offered</h2>
            <ul>${serviceListHTML}</ul>
          </section>
        </div>

        <aside class="aside" aria-label="Contact details">
          ${createContactPanelHTML()}
          ${createHoursPanelHTML(hoursHTML)}
        </aside>
      </div>
    `;

    addGalleryImageFallbacks();
  }

  function addGalleryImageFallbacks() {
    const galleryImages = supplierDetails.querySelectorAll(".gallery img");

    galleryImages.forEach(function (image) {
      image.addEventListener("error", function () {
        const imagePlaceholder = document.createElement("div");
        imagePlaceholder.className = "ph";
        imagePlaceholder.textContent = "Photo not available";
        image.replaceWith(imagePlaceholder);
      });
    });
  }

  if (!supplier) {
    displayNotFoundMessage();
    return;
  }

  const supplierCategory = findCategoryById(supplier.category);

  document.title = supplier.name + " – ComradeHub";
  document.getElementById("d-hero").classList.add("bg-" + supplierCategory.id);
  document.getElementById("back-link").href =
    "Category.html?cat=" + supplierCategory.id;
  document.getElementById("back-text").textContent =
    "Back to " + supplierCategory.name;

  displaySupplierDetails();
})();
