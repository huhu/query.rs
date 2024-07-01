export default class Toast {
    constructor(selector) {
        this.element = document.querySelector(selector);
        this.dismissTimeoutId = null;
        this.element.addEventListener("mouseover", () => {
            if (this.dismissTimeoutId) {
                clearTimeout(this.dismissTimeoutId);
            }
        });
        this.element.addEventListener("mouseleave", () => {
            this.dismiss();
        });
        this.dismiss();
    }

    info(message) {
        this.element.style.display = "block";
        this.element.style.background = "#fbeca0dd";
        this.element.textContent = message;
    }

    success(message) {
        this.element.style.display = "block";
        this.element.style.background = "#357911dd";
        this.element.textContent = message;
    }

    error(message) {
        this.element.style.display = "block";
        this.element.style.background = "#ff0000dd";
        this.element.textContent = message;
    }

    dismiss(delay = 3000) {
        this.dismissTimeoutId = setTimeout(() => this.element.style.display = "none", delay);
    }
}
