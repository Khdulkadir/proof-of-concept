document.querySelectorAll('.fadein').forEach(function(fadeElement) {
    new IntersectionObserver(function(entries, observer) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 }).observe(fadeElement);
});

const mainProductForm = document.querySelectorAll("#main-product-form")
mainProductForm.forEach(function (form) {
    form.addEventListener('submit', function (event) {
        document.querySelector(".main-product-cart-button").classList.add("loading");
        document.querySelector(".main-product-cart-button").classList.remove("success");
        const data = new FormData(this);
        fetch(this.action, {
            method: this.method,
            body: new URLSearchParams(data)
        })
            .then(function (response) {
                return response.text();
            })
            .then(function () {
                document.querySelector(".main-product-cart-button").classList.remove("loading");
                document.querySelector(".main-product-cart-button").classList.add("success");
            });
        event.preventDefault();
    });
});
function addFormListeners(n) {
for (let i = 1; i <= 4; i++) {
        const subProductForms = document.querySelectorAll(`#sub-product-form-product${i}`)
        subProductForms.forEach(function (form) {
            form.addEventListener('submit', function (event) {
                document.querySelector(`.sub-product-cart-button.product${i}`).classList.add("loading");
                document.querySelector(`.sub-product-cart-button.product${i}`).classList.remove("success");
                const data = new FormData(this);
                fetch(this.action, {
                    method: this.method,
                    body: new URLSearchParams(data)
                })
                    .then(function (response) {
                        return response.text();
                    })
                    .then(function () {
                        document.querySelector(`.sub-product-cart-button.product${i}`).classList.remove("loading");
                        document.querySelector(`.sub-product-cart-button.product${i}`).classList.add("success");
                    });
                event.preventDefault();
            });
        });
    }
}
addFormListeners(4);
