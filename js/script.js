const CONFIG = window.WEDDING_CONFIG;
const GAS_URL = CONFIG.rsvp.gasUrl;
const WEDDING_DATE = new Date(CONFIG.wedding.dateTime);
const RSVP_MESSAGE_SOURCE = "wedding-invitation-rsvp";
const COVER_STORAGE_KEY = "weddingInvitationOpened";

document.addEventListener("DOMContentLoaded", () => {
    applyWeddingConfig();
    initInvitationCover();
    initHeroSlideshow();
    initCountdown();
    initRevealAnimation();
    initGallery();
    initRsvpForm();
});

function applyWeddingConfig() {
    const setText = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    };

    const { couple, wedding, venue, heroImages, galleryImages, storyImages = [] } = CONFIG;
    document.title = `${couple.groom} & ${couple.bride} | Wedding Invitation`;
    const description = document.getElementById("pageDescription");
    if (description) description.content = `${couple.groom} & ${couple.bride} Wedding Invitation - ${wedding.shortDate}`;

    setText("coverDate", wedding.shortDate);
    setText("loadingNames", `${couple.groom} & ${couple.bride}`);
    setText("heroGroom", couple.groom);
    setText("heroBride", couple.bride);
    setText("heroDate", wedding.displayDate);
    setText("heroVenue", venue.name);
    setText("countdownDate", `${wedding.shortDate} SAT`);
    setText("infoDate", wedding.shortDate);
    setText("infoDay", wedding.dayLabel);
    setText("infoVenue", venue.name);
    setText("infoArea", venue.area);
    setText("accessVenue", venue.name);
    setText("footerGroom", couple.groom);
    setText("footerBride", couple.bride);
    setText("footerDate", wedding.displayDate);

    const address = document.getElementById("accessAddress");
    if (address) address.innerHTML = venue.postalAddress.replace("\n", "<br>");
    const mapLink = document.getElementById("accessMapLink");
    if (mapLink) mapLink.href = venue.mapUrl;
    const mapEmbed = document.getElementById("mapEmbed");
    if (mapEmbed) {
        mapEmbed.src = venue.mapEmbedUrl;
        mapEmbed.title = `${venue.name}の地図`;
    }

    const heroContainer = document.querySelector(".hero-slides");
    if (heroContainer) {
        heroContainer.innerHTML = "";
        heroImages.forEach((imagePath, index) => {
            const slide = document.createElement("div");
            slide.className = `hero-slide${index === 0 ? " is-active" : ""}`;
            slide.style.backgroundImage = `url('${imagePath}')`;
            heroContainer.appendChild(slide);
        });
    }

    const gallery = document.getElementById("gallery");
    if (gallery) {
        gallery.innerHTML = "";
        galleryImages.forEach((imagePath, index) => {
            const item = document.createElement("button");
            item.type = "button";
            item.className = `gallery-item gallery-item-${(index % 5) + 1}`;
            item.dataset.image = imagePath;
            item.setAttribute("aria-label", `写真${index + 1}を拡大`);

            const image = document.createElement("img");
            image.src = imagePath;
            image.alt = `AkiraとHinakoの写真${index + 1}`;
            image.loading = index < 3 ? "eager" : "lazy";
            image.addEventListener("error", () => item.remove(), { once: true });
            item.appendChild(image);
            gallery.appendChild(item);
        });
    }
    document.querySelectorAll(".story-photo img").forEach((image, index) => {
        if (storyImages[index]) image.src = storyImages[index];
    });
}

function initInvitationCover() {
    const cover = document.getElementById("invitationCover");
    const openButton = document.getElementById("openInvitation");
    const loading = document.getElementById("loading");
    if (!cover || !openButton || !loading) return;

    const alreadyOpened = sessionStorage.getItem(COVER_STORAGE_KEY) === "true";
    if (alreadyOpened) {
        cover.remove();
        document.body.classList.remove("is-locked");
        return;
    }

    openButton.addEventListener("click", () => {
        openButton.disabled = true;
        cover.classList.add("is-opening");
        sessionStorage.setItem(COVER_STORAGE_KEY, "true");

        window.setTimeout(() => loading.classList.add("is-visible"), 950);
        window.setTimeout(() => cover.classList.add("is-hidden"), 1450);
        window.setTimeout(() => {
            document.body.classList.remove("is-locked");
            loading.classList.remove("is-visible");
        }, 2250);
        window.setTimeout(() => cover.remove(), 2600);
    }, { once: true });
}

function initHeroSlideshow() {
    const slides = [...document.querySelectorAll(".hero-slide")];
    if (slides.length < 2) return;

    let activeIndex = 0;
    window.setInterval(() => {
        slides[activeIndex].classList.remove("is-active");
        activeIndex = (activeIndex + 1) % slides.length;
        slides[activeIndex].classList.add("is-active");
    }, 5500);
}

function initCountdown() {
    const countdown = document.getElementById("countdown");
    if (!countdown) return;

    const update = () => {
        const diff = WEDDING_DATE.getTime() - Date.now();
        const days = Math.ceil(diff / 86400000);
        countdown.textContent = days > 0 ? `${days} Days` : days === 0 ? "Today" : "Thank You";
    };
    update();
    window.setInterval(update, 3600000);
}

function initRevealAnimation() {
    const targets = document.querySelectorAll(".reveal, .reveal-child");
    if (!("IntersectionObserver" in window)) {
        targets.forEach((target) => target.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -30px" });

    targets.forEach((target, index) => {
        if (target.classList.contains("reveal-child")) target.style.transitionDelay = `${(index % 3) * 100}ms`;
        observer.observe(target);
    });
}

function initGallery() {
    const lightbox = document.getElementById("lightbox");
    const lightboxImage = document.getElementById("lightboxImage");
    const closeButton = document.getElementById("closeLightbox");
    const items = document.querySelectorAll(".gallery-item");
    if (!lightbox || !lightboxImage || !closeButton) return;

    const close = () => {
        lightbox.hidden = true;
        lightboxImage.src = "";
        document.body.classList.remove("is-locked");
    };

    items.forEach((item) => item.addEventListener("click", () => {
        lightboxImage.src = item.dataset.image || "";
        lightbox.hidden = false;
        document.body.classList.add("is-locked");
        closeButton.focus();
    }));
    closeButton.addEventListener("click", close);
    lightbox.addEventListener("click", (event) => { if (event.target === lightbox) close(); });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !lightbox.hidden) close(); });
}

function initRsvpForm() {
    const form = document.getElementById("rsvpForm");
    const sending = document.getElementById("sending");
    const complete = document.getElementById("complete");
    const errorMessage = document.getElementById("formError");
    const submissionId = document.getElementById("submissionId");
    const submitButton = form?.querySelector('button[type="submit"]');
    if (!form || !sending || !complete || !errorMessage || !submissionId || !submitButton) return;

    form.action = GAS_URL;
    let responseTimer;

    window.addEventListener("message", (event) => {
        const data = event.data;
        if (!data || data.source !== RSVP_MESSAGE_SOURCE) return;
        window.clearTimeout(responseTimer);

        if (data.status === "success") {
            sending.classList.remove("is-visible");
            form.hidden = true;
            complete.classList.add("is-visible");
            complete.focus();
            return;
        }

        showFormError(form, sending, submitButton, errorMessage, data.message || "送信に失敗しました。時間をおいてもう一度お試しください。");
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        errorMessage.textContent = "";
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        if (!submissionId.value) submissionId.value = createSubmissionId();
        submitButton.disabled = true;
        submitButton.querySelector("span").textContent = "送信中...";
        form.hidden = true;
        sending.classList.add("is-visible");

        responseTimer = window.setTimeout(() => {
            showFormError(form, sending, submitButton, errorMessage, "応答を確認できませんでした。通信環境をご確認のうえ、もう一度お試しください。");
        }, CONFIG.rsvp.timeoutMs);
        form.submit();
    });
}

function createSubmissionId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function showFormError(form, sending, submitButton, errorMessage, message) {
    sending.classList.remove("is-visible");
    form.hidden = false;
    submitButton.disabled = false;
    const label = submitButton.querySelector("span");
    if (label) label.textContent = "回答を送信する";
    errorMessage.textContent = message;
    errorMessage.scrollIntoView({ behavior: "smooth", block: "center" });
}
