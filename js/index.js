document.addEventListener('DOMContentLoaded', function () {

    /* =====================================
       DARK / LIGHT MODE
    ===================================== */

    const themeButtons = document.querySelectorAll('.theme-toggle');

    function updateThemeIcons(theme) {

        themeButtons.forEach(button => {

            const icon = button.querySelector('i');

            icon.className = theme === 'dark' ?
                'bi bi-sun' :
                'bi bi-moon-stars';

            button.setAttribute(
                'aria-label',
                theme === 'dark' ?
                'Switch to light mode' :
                'Switch to dark mode'
            );

        });

    }

    function setTheme(theme) {

        document.documentElement.setAttribute('data-theme', theme);

        localStorage.setItem('hs-theme', theme);

        updateThemeIcons(theme);

    }

    const savedTheme = localStorage.getItem('hs-theme') || 'light';

    setTheme(savedTheme);

    themeButtons.forEach(button => {

        button.addEventListener('click', function () {

            const currentTheme =
                document.documentElement.getAttribute('data-theme');

            setTheme(currentTheme === 'dark' ? 'light' : 'dark');

        });

    });


    /* =====================================
       CURRENCY SELECTOR
    ===================================== */

    const currencyLabel = document.getElementById('currencyLabel');

    const currencyOptions = document.querySelectorAll('.currency-option');

    function setCurrency(currency) {

        if (!['LKR', 'USD'].includes(currency)) {
            currency = 'LKR';
        }

        if (currencyLabel) {
            currencyLabel.textContent = currency;
        }

        localStorage.setItem('hs-currency', currency);

        // Notify other website components

        window.dispatchEvent(
            new CustomEvent('currencyChanged', {
                detail: {
                    currency: currency
                }
            })
        );

    }

    const savedCurrency = localStorage.getItem('hs-currency') || 'LKR';

    setCurrency(savedCurrency);

    currencyOptions.forEach(option => {

        option.addEventListener('click', function () {

            setCurrency(this.dataset.currency);

        });

    });

});


/* =========================================
   HERO ENTRANCE ANIMATION
========================================= */

document.addEventListener('DOMContentLoaded', function () {

    const heroContent = document.querySelector('.hs-hero-content');

    if (heroContent) {
        heroContent.classList.add('hero-loaded');
    }

});



/* =========================================
   FEATURED PRODUCTS FUNCTIONALITY
========================================= */

document.addEventListener('DOMContentLoaded', function () {

    /* PRODUCT FILTERS */

    const filterButtons = document.querySelectorAll('.hs-filter-btn');
    const productItems = document.querySelectorAll('.hs-product-item');

    filterButtons.forEach(button => {

        button.addEventListener('click', function () {

            const filter = this.dataset.filter;

            filterButtons.forEach(btn => btn.classList.remove('active'));

            this.classList.add('active');

            productItems.forEach(product => {

                const categories = product.dataset.category.split(' ');

                const show =
                    filter === 'all' || categories.includes(filter);

                product.classList.toggle('is-hidden', !show);

            });

        });

    });


    /* CURRENCY DISPLAY */

    function updateProductPrices(currency) {

        document.querySelectorAll('.hs-product-price').forEach(price => {

            const amount = currency === 'USD' ?
                Number(price.dataset.usd) :
                Number(price.dataset.lkr);

            const formatted = new Intl.NumberFormat(
                currency === 'LKR' ? 'en-LK' : 'en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            ).format(amount);

            price.textContent = currency === 'LKR' ?
                'Rs. ' + formatted :
                '$ ' + formatted;

        });

    }

    updateProductPrices(
        localStorage.getItem('hs-currency') || 'LKR'
    );

    window.addEventListener('currencyChanged', function (event) {
        updateProductPrices(event.detail.currency);
    });


    /* WISHLIST */

    const wishlistButtons = document.querySelectorAll('.hs-wishlist-btn');

    let wishlist = JSON.parse(
        localStorage.getItem('hs-wishlist') || '[]'
    );

    wishlistButtons.forEach((button, index) => {

        const product = button.closest('.hs-product-card')
            .querySelector('h3').textContent.trim();

        const active = wishlist.includes(product);

        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));

        button.querySelector('i').className = active ?
            'bi bi-heart-fill' :
            'bi bi-heart';

        button.addEventListener('click', function () {

            if (wishlist.includes(product)) {
                wishlist = wishlist.filter(item => item !== product);
            } else {
                wishlist.push(product);
            }

            localStorage.setItem(
                'hs-wishlist',
                JSON.stringify(wishlist)
            );

            const isActive = wishlist.includes(product);

            this.classList.toggle('active', isActive);
            this.setAttribute('aria-pressed', String(isActive));

            this.querySelector('i').className = isActive ?
                'bi bi-heart-fill' :
                'bi bi-heart';

        });

    });


    /* SHOPPING BAG */

    let cart = JSON.parse(
        localStorage.getItem('hs-cart') || '[]'
    );

    const cartCount = document.querySelector('[data-cart-count]');

    function updateCartCount() {

        if (cartCount) {

            const total = cart.reduce(
                (sum, item) => sum + item.quantity,
                0
            );

            cartCount.textContent = total;

        }

    }

    updateCartCount();


    /* TOAST NOTIFICATION */

    const toast = document.getElementById('hsToast');
    const toastMessage = document.getElementById('hsToastMessage');

    let toastTimeout;

    function showToast(message) {

        if (!toast || !toastMessage) return;

        toastMessage.textContent = message;

        toast.classList.add('show');

        clearTimeout(toastTimeout);

        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);

    }


    /* ADD TO BAG BUTTON */

    document.querySelectorAll('.hs-quick-add').forEach(button => {

        button.addEventListener('click', function () {

            const product = this.dataset.product;

            const priceLkr = Number(this.dataset.priceLkr);
            const priceUsd = Number(this.dataset.priceUsd);

            if (!product || !Number.isFinite(priceLkr) ||
                !Number.isFinite(priceUsd)) return;

            const existing = cart.find(item => item.product === product);

            if (existing) {
                existing.quantity++;
            } else {
                cart.push({
                    product: product,
                    priceLkr: priceLkr,
                    priceUsd: priceUsd,
                    quantity: 1
                });
            }

            localStorage.setItem('hs-cart', JSON.stringify(cart));

            updateCartCount();

            showToast(product + ' added to your bag!');

        });

    });

});



/* =========================================
   NEWSLETTER SUBSCRIPTION
========================================= */

document.addEventListener('DOMContentLoaded', function () {

    const newsletterForm =
        document.getElementById('hsNewsletterForm');

    const newsletterMessage =
        document.getElementById('newsletterMessage');

    if (!newsletterForm) return;

    newsletterForm.addEventListener('submit', function (event) {

        event.preventDefault();

        const emailInput =
            document.getElementById('newsletterEmail');

        const email = emailInput.value.trim();

        newsletterMessage.className = 'hs-newsletter-message';

        if (!emailInput.checkValidity() || !email) {

            newsletterMessage.textContent =
                'Please enter a valid email address.';

            newsletterMessage.classList.add('error');

            emailInput.focus();

            return;
        }

        newsletterMessage.textContent =
            'Thank you! Your email is ready for subscription.';

        newsletterMessage.classList.add('success');

        newsletterForm.reset();

    });

});



/* =========================================
   FOOTER FUNCTIONALITY
========================================= */

document.addEventListener('DOMContentLoaded', function () {

    // Dynamic copyright year

    const footerYear = document.getElementById('footerYear');

    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    }


    // Back to top

    const backToTop = document.getElementById('backToTop');

    if (backToTop) {

        backToTop.addEventListener('click', function () {

            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

        });

    }

});