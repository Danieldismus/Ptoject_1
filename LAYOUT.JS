function escapeHTML(value) {
  const charactersToEscape = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  };

  return String(value).replace(/[&<>"']/g, function (character) {
    return charactersToEscape[character];
  });
}

function getInternationalPhone(phoneNumber) {
  const digitsOnly = String(phoneNumber).replace(/\D/g, "");

  if (digitsOnly.startsWith("0")) {
    return "254" + digitsOnly.slice(1);
  }

  return digitsOnly;
}

function getTelephoneLink(phoneNumber) {
  return "+" + getInternationalPhone(phoneNumber);
}

function getWhatsAppLink(phoneNumber) {
  return "https://wa.me/" + getInternationalPhone(phoneNumber);
}

function getMapLink(address) {
  const searchAddress = address + ", Kenya";
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(searchAddress);
}

function findCategoryById(categoryId) {
  return CATEGORIES.find(function (category) {
    return category.id === categoryId;
  });
}

function getSupplierLocationGroup(supplier) {
  const listedLocations = LOCATIONS.slice(0, -1);

  if (listedLocations.includes(supplier.area)) {
    return supplier.area;
  }

  return "Others";
}

function buildSiteLayout() {
  const currentPage = document.body.dataset.page || "";
  let activeNavigationPage = currentPage;

  if (currentPage === "category" || currentPage === "supplier") {
    activeNavigationPage = "categories";
  }

  const navigationLinks = [
    { label: "Home", href: "Index.html", page: "home" },
    { label: "Categories", href: "Index.html#categories", page: "categories" },
    { label: "About", href: "About.html", page: "about" },
    { label: "Contact", href: "Contact.html", page: "contact" }
  ];

  const mainNavigationHTML = navigationLinks.map(function (link) {
    const isCurrentPage = link.page === activeNavigationPage;
    const activeAttributes = isCurrentPage
      ? ' class="active" aria-current="page"'
      : "";

    return `<a href="${link.href}"${activeAttributes}>${link.label}</a>`;
  }).join("");

  if (SITE.showSampleBanner) {
    document.body.insertAdjacentHTML(
      "afterbegin",
      '<div class="sample-banner">Demo data: supplier details on this site are samples. Replace them in <code>Data.js</code> before launch.</div>'
    );
  }

  document.getElementById("site-header").outerHTML = `
    <header class="site-header" id="header">
      <div class="container bar">
        <a class="brand" href="Index.html" aria-label="${SITE.name} home">
          <span>Comrade<b>Hub</b></span>
        </a>
        <nav class="nav" id="nav" aria-label="Main">
          ${mainNavigationHTML}
        </nav>
        <div class="bar-actions">
          <a class="search-link" href="Category.html?cat=all">Search</a>
          <button
            class="menu-btn"
            id="menu-btn"
            aria-label="Open menu"
            aria-expanded="false"
            aria-controls="nav"
          >Menu</button>
        </div>
      </div>
    </header>
  `;

  document.getElementById("site-footer").outerHTML = `
    <footer class="site-footer">
      <div class="container foot">
        <a class="brand" href="Index.html">
          <span>Comrade<b>Hub</b><small>${SITE.tagline}</small></span>
        </a>
      </div>
    </footer>
  `;

  const header = document.getElementById("header");
  const menuButton = document.getElementById("menu-btn");

  menuButton.addEventListener("click", function () {
    const menuIsOpen = header.classList.toggle("open");

    menuButton.setAttribute("aria-expanded", menuIsOpen);

    if (menuIsOpen) {
      menuButton.setAttribute("aria-label", "Close menu");
    } else {
      menuButton.setAttribute("aria-label", "Open menu");
    }
  });
}

buildSiteLayout();
