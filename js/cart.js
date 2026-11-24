(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {

        var cartContent = document.querySelector('.hs-cart-content');
        var emptyCart = document.getElementById('emptyCart');
        var subtotalElement = document.getElementById('cartSubtotal');
        var discountElement = document.getElementById('cartDiscount');
        var grandTotalElement = document.getElementById('cartGrandTotal');
        var itemCountElement = document.getElementById('cartItemCount');
        var promoInput = document.getElementById('promoCode');
        var promoMessage = document.getElementById('promoMessage');

        var discountRate = 0;

        // GET SELECTED CURRENCY
        function getCurrency() {
            return localStorage.getItem('hs-currency') || 'LKR';
        }

        // FORMAT PRICE BASED ON SELECTED CURRENCY
        function formatPrice(amount) {

            if (getCurrency() === 'USD') {
                return '$' + amount.toFixed(2);
            }

            return 'LKR ' + Math.round(amount).toLocaleString('en-US');
        }

        function getItems() {
            return document.querySelectorAll('.hs-cart-item');
        }

        // UPDATE CART TOTALS
        function updateCart() {

            var items = getItems();
            var subtotal = 0;
            var totalQuantity = 0;

            var currency = getCurrency();

            for (var i = 0; i < items.length; i++) {

                // Price attributes are inside .hs-cart-item-total
                var priceElement = items[i].querySelector('.hs-cart-item-total');

                var price;

                if (currency === 'USD') {
                    price = parseFloat(priceElement.getAttribute('data-usd'));
                } else {
                    price = parseFloat(priceElement.getAttribute('data-price'));
                }

                if (isNaN(price)) {
                    price = 0;
                }

                var quantityInput = items[i].querySelector('.hs-qty-input');
                var quantity = parseInt(quantityInput.value) || 1;

                var itemTotal = price * quantity;

                items[i].querySelector('.hs-item-total').textContent =
                    formatPrice(itemTotal);

                subtotal += itemTotal;
                totalQuantity += quantity;
            }

            var discount = subtotal * discountRate;
            var grandTotal = subtotal - discount;

            subtotalElement.textContent = formatPrice(subtotal);
            discountElement.textContent = formatPrice(discount);
            grandTotalElement.textContent = formatPrice(grandTotal);

            itemCountElement.textContent = totalQuantity +
                (totalQuantity === 1 ? ' Item' : ' Items');

            if (items.length === 0) {
                cartContent.style.display = 'none';
                emptyCart.style.display = 'block';
            } else {
                cartContent.style.display = 'block';
                emptyCart.style.display = 'none';
            }
        }

        // QUANTITY BUTTONS
        document.addEventListener('click', function (event) {

            var button = event.target.closest('.hs-qty-btn');

            if (!button) return;

            var cartItem = button.closest('.hs-cart-item');
            var input = cartItem.querySelector('.hs-qty-input');

            var quantity = parseInt(input.value) || 1;
            var max = parseInt(input.max) || 99;

            if (button.getAttribute('data-action') === 'increase') {

                if (quantity < max) {
                    input.value = quantity + 1;
                }

            } else if (button.getAttribute('data-action') === 'decrease') {

                if (quantity > 1) {
                    input.value = quantity - 1;
                }
            }

            updateCart();
        });

        // REMOVE PRODUCT
        document.addEventListener('click', function (event) {

            var button = event.target.closest('.hs-cart-remove');

            if (!button) return;

            var cartItem = button.closest('.hs-cart-item');

            cartItem.remove();

            discountRate = 0;
            promoInput.value = '';
            promoMessage.textContent = '';

            updateCart();
        });

        // CLEAR CART
        var clearCartButton = document.getElementById('clearCart');

        if (clearCartButton) {
            clearCartButton.addEventListener('click', function () {

                if (!confirm('Are you sure you want to clear your cart?')) {
                    return;
                }

                var items = getItems();

                for (var i = 0; i < items.length; i++) {
                    items[i].remove();
                }

                discountRate = 0;
                promoInput.value = '';
                promoMessage.textContent = '';

                updateCart();
            });
        }

        // DEMO PROMO CODE: HS10
        var applyPromoButton = document.getElementById('applyPromo');

        if (applyPromoButton) {
            applyPromoButton.addEventListener('click', function () {

                var code = promoInput.value.trim().toUpperCase();

                if (code === 'HS10') {

                    discountRate = 0.10;

                    promoMessage.style.color = '#6d9676';
                    promoMessage.textContent =
                        '10% discount applied successfully!';

                } else {

                    discountRate = 0;

                    promoMessage.style.color = '#c76b6b';
                    promoMessage.textContent =
                        'Invalid promo code. Please try again.';
                }

                updateCart();
            });
        }

        // UPDATE CART WHEN CURRENCY CHANGES
        window.addEventListener('currencyChanged', function () {
            updateCart();
        });

        // INITIAL CART CALCULATION
        updateCart();

    });

})();