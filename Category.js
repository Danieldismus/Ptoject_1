(function () {
  const pageParameters = new URLSearchParams(location.search);
  const selectedCategory = findCategoryById(pageParameters.get("cat"));

  const filterState = {
    searchText: pageParameters.get("q") || "",
    selectedLocations: new Set(),
    selectedExtras: new Set()
  };

  const suppliersForPage = SUPPLIERS
    .filter(function (supplier) {
      return !selectedCategory || supplier.category === selectedCategory.id;
    })
    .sort(function (firstSupplier, secondSupplier) {
      if (firstSupplier.km === null) {
        return secondSupplier.km === null ? 0 : 1;
      }

      if (secondSupplier.km === null) {
        return -1;
      }

      return firstSupplier.km - secondSupplier.km;
    });

  const searchInput = document.getElementById("q");
  const locationSelect = document.getElementById("loc");
  const supplierGrid = document.getElementById("grid");
  const resultsCount = document.getElementById("count");
  const filterPanel = document.getElementById("filters");

  function setPageHeading() {
    const hero = document.getElementById("cat-hero");
    const heroTitle = document.getElementById("hero-title");
    const heroDescription = document.getElementById("hero-text");

    hero.classList.add("bg-" + (selectedCategory ? selectedCategory.id : "all"));

    if (selectedCategory) {
      heroTitle.textContent = selectedCategory.name;
      heroDescription.textContent = selectedCategory.heroText;
      searchInput.placeholder = "Search " + selectedCategory.name.toLowerCase() + "...";
      document.title = selectedCategory.name + " – ComradeHub";
    } else {
      heroTitle.textContent = filterState.searchText ? "Search results" : "All Suppliers";
      heroDescription.textContent =
        "Search water depots, gas suppliers and electronics shops around campus.";
      searchInput.placeholder = "Search suppliers...";
      document.title = "All Suppliers – ComradeHub";
    }

    searchInput.value = filterState.searchText;
  }

  function addLocationOptions() {
    const locationOptions = LOCATIONS.map(function (locationName) {
      return `<option value="${escapeHTML(locationName)}">${escapeHTML(locationName)}</option>`;
    }).join("");

    locationSelect.innerHTML =
      '<option value="">All Locations</option>' + locationOptions;
  }

  function getFilterGroups() {
    const groups = [
      {
        key: "loc",
        label: "Location",
        items: LOCATIONS
      }
    ];

    if (selectedCategory) {
      const availableServices = new Set(selectedCategory.services);
      const removedWaterServices = [
        "dispensers",
        "water refill",
        "water refills",
        "reported delivery",
        "purified water",
        "purified drinking water",
        "bottled water",
        "bottled drinking water",
        "packaged water supply",
        "jerrycans & containers"
      ];
      const removedGasServices = [
        "accessories",
        "cooking gas",
        "lpg cylinders",
        "refills or exchanges",
        "lpg refills",
        "lpg supply",
        "gas supply",
        "refills",
        "reported local delivery"
      ];

      if (selectedCategory.id === "gas") {
        removedGasServices.forEach(function (service) {
          Array.from(availableServices).forEach(function (availableService) {
            if (availableService.toLowerCase() === service) {
              availableServices.delete(availableService);
            }
          });
        });
      }

      if (selectedCategory.id !== "electronics") {
        suppliersForPage.forEach(function (supplier) {
          supplier.services.forEach(function (service) {
            const serviceName = service.toLowerCase();
            const isRemovedWaterService =
              selectedCategory.id === "water" &&
              removedWaterServices.includes(serviceName);
            const isRemovedGasService =
              selectedCategory.id === "gas" &&
              removedGasServices.includes(serviceName);

            if (!isRemovedWaterService && !isRemovedGasService) {
              availableServices.add(service);
            }
          });
        });
      }

      groups.push({
        key: "svc",
        label: "Services",
        items: Array.from(availableServices)
      });
    } else {
      groups.push({
        key: "cat",
        label: "Category",
        items: CATEGORIES.map(function (category) {
          return category.name;
        })
      });
    }

    return groups;
  }

  function createFilterGroup(group) {
    const checkboxes = group.items.map(function (item) {
      const safeItem = escapeHTML(item);

      return `
        <label class="check">
          <input type="checkbox" data-group="${group.key}" value="${safeItem}">
          <span></span>
          ${safeItem}
        </label>
      `;
    }).join("");

    return `
      <fieldset class="fgroup">
        <legend>${group.label}</legend>
        ${checkboxes}
      </fieldset>
    `;
  }

  function createFilterPanel() {
    const filterGroups = getFilterGroups();
    const filterGroupsHTML = filterGroups.map(createFilterGroup).join("");

    filterPanel.innerHTML = "<h2>Filter</h2>" + filterGroupsHTML;
  }

  function createSearchableText(supplier) {
    const category = findCategoryById(supplier.category);
    const supplierDetails = [
      supplier.name,
      category.name,
      supplier.area,
      supplier.address,
      supplier.services.join(" "),
      supplier.description,
      supplier.openingHours || ""
    ];

    return supplierDetails.join(" ").toLowerCase();
  }

  function supplierMatchesFilters(supplier) {
    const supplierLocation = getSupplierLocationGroup(supplier);

    if (
      filterState.selectedLocations.size > 0 &&
      !filterState.selectedLocations.has(supplierLocation)
    ) {
      return false;
    }

    if (selectedCategory) {
      for (const service of filterState.selectedExtras) {
        const supplierOffersService = selectedCategory.id === "electronics"
          ? supplier.services.some(function (supplierService) {
            return supplierService.toLowerCase().includes(service.toLowerCase());
          })
          : selectedCategory.id === "water" && service === "Water Refill"
            ? supplier.services.some(function (supplierService) {
              return supplierService.toLowerCase().includes("water refill");
            })
            : selectedCategory.id === "water" && service === "Bottled Water"
              ? supplier.services.some(function (supplierService) {
                const serviceName = supplierService.toLowerCase();
                return serviceName.includes("bottled") && serviceName.includes("water");
              })
              : supplier.services.includes(service);

        if (!supplierOffersService) {
          return false;
        }
      }
    } else if (filterState.selectedExtras.size > 0) {
      const category = findCategoryById(supplier.category);

      if (!filterState.selectedExtras.has(category.name)) {
        return false;
      }
    }

    const searchWords = filterState.searchText.toLowerCase().split(/\s+/).filter(Boolean);
    const searchableText = createSearchableText(supplier);

    return searchWords.every(function (word) {
      return searchableText.includes(word);
    });
  }

  function createSupplierCard(supplier) {
    const category = findCategoryById(supplier.category);
    let categoryLabel = "";

    if (!selectedCategory) {
      categoryLabel = `<span class="s-chip">${escapeHTML(category.name)}</span>`;
    }

    const serviceSummary = supplier.services.slice(0, 3).join(" · ");
    const distanceText = typeof supplier.km === "number"
      ? ", " + supplier.km.toFixed(1) + " km"
      : "";
    const callButton = supplier.phone
      ? `<a class="btn btn-green" href="tel:${getTelephoneLink(supplier.phone)}">Call</a>`
      : "";

    return `
      <article class="s-card">
        <div class="s-top">
          <div class="s-info">
            ${categoryLabel}
            <h3>
              <a href="Supplier.html?id=${encodeURIComponent(supplier.id)}">
                ${escapeHTML(supplier.name)}
              </a>
            </h3>
            <p class="s-loc">
              <span>${escapeHTML(supplier.area)}${distanceText}</span>
            </p>
            <p class="s-svc">${escapeHTML(serviceSummary)}</p>
          </div>
        </div>
        <div class="s-actions${supplier.phone ? "" : " single-action"}">
          ${callButton}
          <a class="btn btn-outline" href="Supplier.html?id=${encodeURIComponent(supplier.id)}">
            View Details
          </a>
        </div>
      </article>
    `;
  }

  function createNoResultsMessage() {
    return `
      <div class="empty">
        <h3>No suppliers found</h3>
        <p>Try a different search word, or clear the filters.</p>
        <button class="btn btn-outline" id="clear" type="button">
          Clear search and filters
        </button>
      </div>
    `;
  }

  function displaySuppliers() {
    const matchingSuppliers = suppliersForPage.filter(supplierMatchesFilters);
    const supplierWord = matchingSuppliers.length === 1 ? "supplier" : "suppliers";

    resultsCount.textContent =
      `Showing ${matchingSuppliers.length} ${supplierWord}`;

    if (matchingSuppliers.length === 0) {
      supplierGrid.innerHTML = createNoResultsMessage();
      return;
    }

    supplierGrid.innerHTML = matchingSuppliers.map(createSupplierCard).join("");
  }

  function saveSearchInAddressBar() {
    if (location.protocol === "file:") {
      return;
    }

    try {
      const updatedURL = new URL(location.href);

      if (filterState.searchText) {
        updatedURL.searchParams.set("q", filterState.searchText);
      } else {
        updatedURL.searchParams.delete("q");
      }

      history.replaceState(null, "", updatedURL);
    } catch (error) {
      console.warn("Could not update the search in the address bar.", error);
    }
  }

  function clearAllFilters() {
    filterState.searchText = "";
    filterState.selectedLocations.clear();
    filterState.selectedExtras.clear();
    searchInput.value = "";
    locationSelect.value = "";

    filterPanel.querySelectorAll("input").forEach(function (checkbox) {
      checkbox.checked = false;
    });

    displaySuppliers();
  }

  function connectEventListeners() {
    filterPanel.addEventListener("change", function (event) {
      const checkbox = event.target;

      if (checkbox.tagName !== "INPUT") {
        return;
      }

      const selectedValues = checkbox.dataset.group === "loc"
        ? filterState.selectedLocations
        : filterState.selectedExtras;

      if (checkbox.checked) {
        selectedValues.add(checkbox.value);
      } else {
        selectedValues.delete(checkbox.value);
      }

      locationSelect.value = filterState.selectedLocations.size === 1
        ? Array.from(filterState.selectedLocations)[0]
        : "";

      displaySuppliers();
    });

    locationSelect.addEventListener("change", function () {
      filterState.selectedLocations = new Set();

      if (locationSelect.value) {
        filterState.selectedLocations.add(locationSelect.value);
      }

      filterPanel.querySelectorAll('[data-group="loc"]').forEach(function (checkbox) {
        checkbox.checked = filterState.selectedLocations.has(checkbox.value);
      });

      displaySuppliers();
    });

    document.getElementById("cat-search").addEventListener("submit", function (event) {
      event.preventDefault();
      filterState.searchText = searchInput.value.trim();
      displaySuppliers();
      saveSearchInAddressBar();
    });

    document.getElementById("filter-toggle").addEventListener("click", function (event) {
      const filtersAreOpen = filterPanel.classList.toggle("open");
      event.currentTarget.setAttribute("aria-expanded", filtersAreOpen);
    });

    supplierGrid.addEventListener("click", function (event) {
      if (event.target.closest("#clear")) {
        clearAllFilters();
      }
    });
  }

  setPageHeading();
  addLocationOptions();
  createFilterPanel();
  connectEventListeners();
  displaySuppliers();
})();
