(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {

        console.log('Product JavaScript started');

        /* =====================================
           PRODUCT CONFIGURATION
        ===================================== */

        var product = {
            id: 'HS-001',
            name: 'Classic Black Shirt',
            sku: 'HS-MEN-001',
            priceLkr: 6500,
            priceUsd: 21,
            oldPriceLkr: 7500,
            oldPriceUsd: 24.25,
            maxQuantity: 5
        };

        var selectedColor = 'Black';
        var selectedSize = 'M';
        var quantity = 1;
        var currency = 'LKR';

        try {
            currency = localStorage.getItem('hs-currency') || 'LKR';
        } catch (error) {
            console.error('Cannot access local storage:', error);
        }

        /* =====================================
           ELEMENTS
        ===================================== */

        var mainImage = document.getElementById('hsMainProductImage');
        var thumbnails = document.querySelectorAll('.hs-thumbnail');
        var imageCurrent = document.getElementById('hsImageCurrent');

        var colorButtons = document.querySelectorAll('.hs-color-swatch');
        var sizeButtons = document.querySelectorAll('.hs-size-options button');

        var colorLabel = document.getElementById('hsSelectedColor');
        var sizeLabel = document.getElementById('hsSelectedSize');
        var sizeError = document.getElementById('hsSizeError');

        var quantityInput = document.getElementById('hsQuantity');
        var minusButton = document.getElementById('hsQuantityMinus');
        var plusButton = document.getElementById('hsQuantityPlus');

        var productPrice = document.getElementById('hsProductPrice');
        var mobilePrice = document.getElementById('hsMobilePrice');

        var wishlistButton = document.querySelector('.hs-gallery-wishlist');

        var addButtons = document.querySelectorAll(
            '#hsAddToCart, #hsMobileAddToCart'
        );

        var buyNowButton = document.getElementById('hsBuyNow');

        var toast = document.getElementById('hsProductToast');
        var toastMessage = document.getElementById('hsProductToastMessage');

        /* =====================================
           HELPER FUNCTIONS
        ===================================== */

        function getArray(key) {
            try {
                var value = JSON.parse(localStorage.getItem(key) || '[]');

                if (Array.isArray(value)) {
                    return value;
                }

                return [];

            } catch (error) {
                console.error('Storage read error:', error);
                return [];
            }
        }

        function saveArray(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;

            } catch (error) {
                console.error('Storage save error:', error);
                showToast('Unable to save data.');
                return false;
            }
        }

        var toastTimer;

        function showToast(message) {

            if (!toast) {
                console.log(message);
                return;
            }

            if (toastMessage) {
                toastMessage.textContent = message;
            } else {
                toast.textContent = message;
            }

            toast.classList.add('show');

            clearTimeout(toastTimer);

            toastTimer = setTimeout(function () {
                toast.classList.remove('show');
            }, 2500);
        }

        /* =====================================
           IMAGE GALLERY
        ===================================== */

        function activateImage(button, index) {

            if (!mainImage || !button) return;

            var imageUrl = button.getAttribute('data-image');

            if (!imageUrl) {
                var image = button.querySelector('img');

                if (image) {
                    imageUrl = image.getAttribute('src');
                }
            }

            if (!imageUrl) return;

            mainImage.setAttribute('src', imageUrl);

            var thumbnailImage = button.querySelector('img');

            if (thumbnailImage) {
                mainImage.setAttribute(
                    'alt',
                    thumbnailImage.getAttribute('alt') || product.name
                );
            }

            for (var i = 0; i < thumbnails.length; i++) {
                thumbnails[i].classList.remove('active');
            }

            button.classList.add('active');

            if (imageCurrent) {
                imageCurrent.textContent = '0' + (index + 1);
            }
        }

        for (var i = 0; i < thumbnails.length; i++) {

            (function (index) {

                thumbnails[index].addEventListener('click', function () {
                    activateImage(this, index);
                });

            })(i);
        }

        /* =====================================
           COLOUR SELECTION
        ===================================== */

        for (var c = 0; c < colorButtons.length; c++) {

            colorButtons[c].addEventListener('click', function () {

                if (this.disabled) return;

                for (var j = 0; j < colorButtons.length; j++) {
                    colorButtons[j].classList.remove('active');
                    colorButtons[j].setAttribute('aria-pressed', 'false');
                }

                this.classList.add('active');
                this.setAttribute('aria-pressed', 'true');

                selectedColor = this.getAttribute('data-color');

                if (colorLabel) {
                    colorLabel.textContent = selectedColor;
                }

                var colorImage = this.getAttribute('data-image');

                if (colorImage && mainImage) {
                    mainImage.setAttribute('src', colorImage);

                    for (var k = 0; k < thumbnails.length; k++) {
                        thumbnails[k].classList.remove('active');
                    }
                }

                console.log('Selected colour:', selectedColor);

            });
        }

        /* =====================================
           SIZE SELECTION
        ===================================== */

        function showSizeError(show) {

            if (sizeError) {
                sizeError.classList.toggle('show', show);
            }
        }

        for (var s = 0; s < sizeButtons.length; s++) {

            sizeButtons[s].addEventListener('click', function () {

                if (
                    this.disabled ||
                    this.classList.contains('disabled') ||
                    this.getAttribute('data-available') === 'false'
                ) {
                    return;
                }

                for (var j = 0; j < sizeButtons.length; j++) {
                    sizeButtons[j].classList.remove('active');
                }

                this.classList.add('active');

                selectedSize = this.getAttribute('data-size');

                if (sizeLabel) {
                    sizeLabel.textContent = selectedSize;
                }

                showSizeError(false);

                console.log('Selected size:', selectedSize);

            });
        }

        /* =====================================
           QUANTITY CONTROLS
        ===================================== */

        function updateQuantity() {

            if (quantity < 1) quantity = 1;

            if (quantity > product.maxQuantity) {
                quantity = product.maxQuantity;
            }

            if (quantityInput) {
                quantityInput.value = quantity;
            }

            if (minusButton) {
                minusButton.disabled = quantity <= 1;
            }

            if (plusButton) {
                plusButton.disabled = quantity >= product.maxQuantity;
            }
        }

        if (minusButton) {

            minusButton.addEventListener('click', function () {

                quantity--;

                updateQuantity();

            });
        }

        if (plusButton) {

            plusButton.addEventListener('click', function () {

                if (quantity < product.maxQuantity) {
                    quantity++;
                } else {
                    showToast('Maximum quantity is ' + product.maxQuantity);
                }

                updateQuantity();

            });
        }

        if (quantityInput) {

            quantityInput.addEventListener('change', function () {

                quantity = parseInt(this.value, 10);

                if (isNaN(quantity)) {
                    quantity = 1;
                }

                updateQuantity();

            });
        }

        updateQuantity();

        /* =====================================
           CURRENCY
        ===================================== */

        function formatPrice(lkr, usd) {

            if (currency === 'USD') {
                return '$' + Number(usd).toFixed(2);
            }

            return 'Rs. ' + Number(lkr).toLocaleString('en-LK', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }

        function updatePrices() {

            var current = formatPrice(
                product.priceLkr,
                product.priceUsd
            );

            var old = formatPrice(
                product.oldPriceLkr,
                product.oldPriceUsd
            );

            if (productPrice) {
                productPrice.textContent = current;
            }

            if (mobilePrice) {
                mobilePrice.textContent = current;
            }

            var oldPrice = document.querySelector('.hs-old-price');

            if (oldPrice) {
                oldPrice.textContent = old;
            }

            var currencyLabel = document.getElementById('currencyLabel');

            if (currencyLabel) {
                currencyLabel.textContent = currency;
            }
        }

        var currencyButtons = document.querySelectorAll('.currency-option');

        for (var i = 0; i < currencyButtons.length; i++) {

            currencyButtons[i].addEventListener('click', function () {

                var selectedCurrency = this.getAttribute('data-currency');

                if (selectedCurrency !== 'LKR' && selectedCurrency !== 'USD') {
                    return;
                }

                currency = selectedCurrency;

                localStorage.setItem('hs-currency', currency);

                updatePrices();

            });
        }

        updatePrices();

        /* =====================================
           WISHLIST
        ===================================== */

        function isProductWishlisted(list) {

            for (var i = 0; i < list.length; i++) {

                var item = list[i];

                if (
                    item === product.name ||
                    (item && item.id === product.id) ||
                    (item && item.productId === product.id)
                ) {
                    return true;
                }
            }

            return false;
        }

        function updateWishlist() {

            var wishlist = getArray('hs-wishlist');

            var exists = isProductWishlisted(wishlist);

            if (wishlistButton) {

                wishlistButton.classList.toggle('active', exists);

                wishlistButton.setAttribute(
                    'aria-pressed',
                    exists ? 'true' : 'false'
                );

                var icon = wishlistButton.querySelector('i');

                if (icon) {

                    if (exists) {
                        icon.classList.remove('bi-heart');
                        icon.classList.add('bi-heart-fill');
                    } else {
                        icon.classList.remove('bi-heart-fill');
                        icon.classList.add('bi-heart');
                    }
                }
            }

            var wishlistCounters = document.querySelectorAll(
                '[data-wishlist-count]'
            );

            for (var i = 0; i < wishlistCounters.length; i++) {
                wishlistCounters[i].textContent = wishlist.length;
            }
        }

        if (wishlistButton) {

            wishlistButton.addEventListener('click', function () {

                var wishlist = getArray('hs-wishlist');

                if (isProductWishlisted(wishlist)) {

                    wishlist = wishlist.filter(function (item) {

                        if (item === product.name) return false;

                        if (item && item.id === product.id) return false;

                        if (item && item.productId === product.id) return false;

                        return true;

                    });

                    showToast('Removed from your wishlist');

                } else {

                    wishlist.push({
                        id: product.id,
                        product: product.name,
                        priceLkr: product.priceLkr,
                        priceUsd: product.priceUsd,
                        image: mainImage ? mainImage.getAttribute('src') : ''
                    });

                    showToast('Added to your wishlist');
                }

                if (saveArray('hs-wishlist', wishlist)) {
                    updateWishlist();
                }

            });
        }

        updateWishlist();

        /* =====================================
           CART COUNTER
        ===================================== */

        function updateCartCount() {

            var cart = getArray('hs-cart');

            var total = 0;

            for (var i = 0; i < cart.length; i++) {
                total += Number(cart[i].quantity) || 0;
            }

            var counters = document.querySelectorAll('[data-cart-count]');

            for (var j = 0; j < counters.length; j++) {
                counters[j].textContent = total;
            }
        }

        /* =====================================
           VALIDATE PRODUCT
        ===================================== */

        function validateProduct() {

            if (!selectedColor) {
                showToast('Please select a colour');
                return false;
            }

            if (!selectedSize) {

                showSizeError(true);

                showToast('Please select a size');

                var sizeSection = document.querySelector('.hs-size-options');

                if (sizeSection) {
                    sizeSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }

                return false;
            }

            showSizeError(false);

            return true;
        }

        /* =====================================
           ADD TO CART
        ===================================== */

        function addProductToCart() {

            if (!validateProduct()) {
                return false;
            }

            var cart = getArray('hs-cart');

            var existingItem = null;

            for (var i = 0; i < cart.length; i++) {

                if (
                    String(cart[i].id) === product.id &&
                    cart[i].color === selectedColor &&
                    cart[i].size === selectedSize
                ) {
                    existingItem = cart[i];
                    break;
                }
            }

            var existingQuantity = existingItem ?
                Number(existingItem.quantity) || 0 :
                0;

            if (existingQuantity + quantity > product.maxQuantity) {

                showToast(
                    'Maximum ' + product.maxQuantity +
                    ' items allowed for this size and colour'
                );

                return false;
            }

            if (existingItem) {

                existingItem.quantity = existingQuantity + quantity;

            } else {

                cart.push({

                    id: product.id,
                    product: product.name,
                    sku: product.sku,

                    color: selectedColor,
                    size: selectedSize,

                    priceLkr: product.priceLkr,
                    priceUsd: product.priceUsd,

                    quantity: quantity,

                    image: mainImage ?
                        mainImage.getAttribute('src') : ''

                });
            }

            if (!saveArray('hs-cart', cart)) {
                return false;
            }

            updateCartCount();

            showToast('Added to your shopping bag');

            console.log('Cart updated:', cart);

            return true;
        }

        /* =====================================
           ADD TO CART BUTTONS
        ===================================== */

        for (var i = 0; i < addButtons.length; i++) {

            addButtons[i].addEventListener('click', function () {

                addProductToCart();

            });
        }

        /* =====================================
           BUY NOW
        ===================================== */

        if (buyNowButton) {

            buyNowButton.addEventListener('click', function () {

                if (addProductToCart()) {
                    window.location.href = 'cart.html';
                }

            });
        }

        /* =====================================
           INITIALIZE
        ===================================== */

        updateCartCount();

        updateWishlist();

        updatePrices();

        updateQuantity();

        console.log('Hawthorne Signatures product page initialized successfully.');

    });

})();