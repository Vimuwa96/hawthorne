(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {

        var products = Array.prototype.slice.call(
            document.querySelectorAll('.hs-shop-product')
        );

        var searchInput = document.getElementById('shopSearch');
        var sortSelect = document.getElementById('shopSort');
        var productGrid = document.getElementById('shopProductGrid');
        var resultsText = document.getElementById('productResults');
        var noProducts = document.getElementById('noProducts');

        var categoryTabs = document.querySelectorAll('.hs-category-tab');

        var sidebar = document.getElementById('shopSidebar');
        var overlay = document.getElementById('filterOverlay');

        var priceRange = document.getElementById('priceRange');
        var priceRangeValue = document.getElementById('priceRangeValue');

        var selectedCategory = 'all';
        var maxPrice = 25000;

        function getCheckedValues(name) {

            var checked = document.querySelectorAll(
                'input[name="' + name + '"]:checked'
            );

            var values = [];

            for (var i = 0; i < checked.length; i++) {
                values.push(checked[i].value.toLowerCase());
            }

            return values;
        }

        function filterProducts() {

            var search = searchInput.value.toLowerCase().trim();

            var categories = getCheckedValues('category');
            var sizes = getCheckedValues('size');
            var colors = getCheckedValues('color');

            var visibleProducts = [];

            for (var i = 0; i < products.length; i++) {

                var product = products[i];

                var name = product.getAttribute('data-name').toLowerCase();
                var category = product.getAttribute('data-category').toLowerCase();
                var price = parseFloat(product.getAttribute('data-price'));

                var productColors = product.getAttribute('data-colors')
                    .toLowerCase().split(',');

                var productSizes = product.getAttribute('data-sizes')
                    .toLowerCase().split(',');

                var tags = product.getAttribute('data-tags')
                    .toLowerCase().split(' ');

                var matchesSearch = name.indexOf(search) !== -1;

                var matchesCategory = selectedCategory === 'all' ||
                    category === selectedCategory ||
                    tags.indexOf(selectedCategory) !== -1;

                var matchesCategoryCheckbox = categories.length === 0 ||
                    categories.indexOf(category) !== -1;

                var matchesSize = sizes.length === 0 ||
                    sizes.some(function (size) {
                        return productSizes.indexOf(size) !== -1;
                    });

                var matchesColor = colors.length === 0 ||
                    colors.some(function (color) {
                        return productColors.indexOf(color) !== -1;
                    });

                var matchesPrice = price <= maxPrice;

                var visible = matchesSearch &&
                    matchesCategory &&
                    matchesCategoryCheckbox &&
                    matchesSize &&
                    matchesColor &&
                    matchesPrice;

                product.style.display = visible ? '' : 'none';

                if (visible) {
                    visibleProducts.push(product);
                }
            }

            // SORT PRODUCTS

            var sortValue = sortSelect.value;

            if (sortValue === 'price-low') {

                visibleProducts.sort(function (a, b) {
                    return parseFloat(a.dataset.price) -
                        parseFloat(b.dataset.price);
                });

            } else if (sortValue === 'price-high') {

                visibleProducts.sort(function (a, b) {
                    return parseFloat(b.dataset.price) -
                        parseFloat(a.dataset.price);
                });

            } else if (sortValue === 'newest') {

                visibleProducts.sort(function (a, b) {
                    return new Date(b.dataset.date) -
                        new Date(a.dataset.date);
                });

            } else if (sortValue === 'name') {

                visibleProducts.sort(function (a, b) {
                    return a.dataset.name.localeCompare(b.dataset.name);
                });

            }

            // UPDATE GRID ORDER

            for (var j = 0; j < visibleProducts.length; j++) {
                productGrid.appendChild(visibleProducts[j]);
            }

            resultsText.textContent = 'Showing ' +
                visibleProducts.length + ' products';

            noProducts.style.display =
                visibleProducts.length === 0 ? 'block' : 'none';

            productGrid.style.display =
                visibleProducts.length === 0 ? 'none' : 'grid';
        }

        // CATEGORY TABS

        for (var i = 0; i < categoryTabs.length; i++) {

            categoryTabs[i].addEventListener('click', function () {

                for (var j = 0; j < categoryTabs.length; j++) {
                    categoryTabs[j].classList.remove('active');
                }

                this.classList.add('active');

                selectedCategory = this.getAttribute('data-category');

                filterProducts();

            });
        }

        // SEARCH

        searchInput.addEventListener('input', filterProducts);

        // SORT

        sortSelect.addEventListener('change', filterProducts);

        // SIDEBAR FILTERS

        var filterInputs = document.querySelectorAll(
            '.hs-shop-sidebar input[type="checkbox"]'
        );

        for (var i = 0; i < filterInputs.length; i++) {
            filterInputs[i].addEventListener('change', filterProducts);
        }

        // PRICE RANGE

        priceRange.addEventListener('input', function () {

            maxPrice = parseInt(this.value);

            priceRangeValue.textContent =
                'LKR ' + maxPrice.toLocaleString('en-US');

            filterProducts();

        });

        // CLEAR FILTERS

        function resetFilters() {

            var inputs = document.querySelectorAll(
                '.hs-shop-sidebar input[type="checkbox"]'
            );

            for (var i = 0; i < inputs.length; i++) {
                inputs[i].checked = false;
            }

            searchInput.value = '';
            sortSelect.value = 'featured';

            priceRange.value = 25000;
            maxPrice = 25000;

            priceRangeValue.textContent = 'LKR 25,000';

            selectedCategory = 'all';

            for (var j = 0; j < categoryTabs.length; j++) {
                categoryTabs[j].classList.remove('active');

                if (categoryTabs[j].getAttribute('data-category') === 'all') {
                    categoryTabs[j].classList.add('active');
                }
            }

            filterProducts();
        }

        document.getElementById('clearFilters')
            .addEventListener('click', resetFilters);

        document.getElementById('resetShopFilters')
            .addEventListener('click', resetFilters);

        // MOBILE FILTER DRAWER

        function openFilters() {
            sidebar.classList.add('show');
            overlay.classList.add('show');
            document.body.style.overflow = 'hidden';
        }

        function closeFilters() {
            sidebar.classList.remove('show');
            overlay.classList.remove('show');
            document.body.style.overflow = '';
        }

        document.getElementById('openShopFilters')
            .addEventListener('click', openFilters);

        document.getElementById('closeShopFilters')
            .addEventListener('click', closeFilters);

        overlay.addEventListener('click', closeFilters);

        document.getElementById('applyFilters')
            .addEventListener('click', function () {
                filterProducts();
                closeFilters();
            });

        // WISHLIST VISUAL TOGGLE

        document.addEventListener('click', function (event) {

            var wishlistButton = event.target.closest('.hs-product-wishlist');

            if (!wishlistButton) return;

            wishlistButton.classList.toggle('active');

            var icon = wishlistButton.querySelector('i');

            if (icon) {
                icon.classList.toggle('bi-heart');
                icon.classList.toggle('bi-heart-fill');
            }

        });

        // INITIAL LOAD

        filterProducts();

    });

})();



// =====================================
// CURRENCY CONVERSION - SHOP PRODUCTS
// =====================================

function updateShopCurrency() {

    var currency = localStorage.getItem('hs-currency') || 'LKR';

    var shopPrices = document.querySelectorAll('.hs-shop-price');

    for (var i = 0; i < shopPrices.length; i++) {

        var priceElement = shopPrices[i];

        if (currency === 'USD') {

            var usdPrice = parseFloat(
                priceElement.getAttribute('data-usd')
            );

            priceElement.textContent = '$' + usdPrice.toFixed(2);

        } else {

            var lkrPrice = parseFloat(
                priceElement.getAttribute('data-lkr')
            );

            priceElement.textContent =
                'LKR ' + lkrPrice.toLocaleString('en-US');

        }
    }
}

// Initial currency
updateShopCurrency();

// Listen for existing website currency changes
window.addEventListener('currencyChanged', function () {
    updateShopCurrency();
});