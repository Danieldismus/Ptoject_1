function createCategoryCard(category) {
  return `
    <a class="cat-card tone-${category.tone}" href="Category.html?cat=${category.id}">
      <div class="cat-art">
        <img src="${category.image}" alt="${category.name}">
      </div>
      <div class="cat-body">
        <div>
          <h3>${category.name}</h3>
          <p>${category.blurb}</p>
        </div>
        <span class="go">View</span>
      </div>
    </a>
  `;
}

const categoryGrid = document.getElementById("cat-grid");
categoryGrid.innerHTML = CATEGORIES.map(createCategoryCard).join("");

const homeSearchForm = document.getElementById("hero-search");

homeSearchForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const searchText = homeSearchForm.elements.q.value.trim();
  let resultsPage = "Category.html?cat=all";

  if (searchText) {
    resultsPage += "&q=" + encodeURIComponent(searchText);
  }

  location.href = resultsPage;
});
