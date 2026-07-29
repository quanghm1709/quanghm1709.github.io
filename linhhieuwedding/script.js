"use strict";

// ===============================
// CẤU HÌNH NHANH
// Thay ngày cưới tại đây theo định dạng: YYYY-MM-DDTHH:mm:ss+07:00
// ===============================
const WEDDING_DATE = new Date("2026-12-20T11:30:00+07:00");

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const intro = $("#intro");
const openInvitation = $("#openInvitation");
const header = $("#header");
const menuToggle = $("#menuToggle");
const nav = $("#nav");
const soundToggle = $("#soundToggle");
const bgMusic = $("#bgMusic");
const toast = $("#toast");

let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2800);
}

function launchConfetti(amount = 90) {
  const colors = ["#d8b36b", "#f1dbad", "#7b2635", "#fffaf3", "#9d4350"];

  for (let i = 0; i < amount; i += 1) {
    const piece = document.createElement("i");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.setProperty("--duration", `${2.6 + Math.random() * 2.8}s`);
    piece.style.setProperty("--drift", `${-180 + Math.random() * 360}px`);
    piece.style.setProperty("--spin", `${360 + Math.random() * 900}deg`);
    piece.style.width = `${6 + Math.random() * 8}px`;
    piece.style.height = `${8 + Math.random() * 14}px`;
    piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "1px";
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 6000);
  }
}

function startExperience() {
  intro.classList.add("is-hidden");
  document.body.classList.remove("is-locked");
  launchConfetti(120);

  // Trình duyệt có thể chặn autoplay nếu chưa có file nhạc.
  bgMusic.play()
    .then(() => soundToggle.classList.add("is-playing"))
    .catch(() => {});
}

// Khóa scroll trước khi mở thiệp.
document.body.classList.add("is-locked");
openInvitation.addEventListener("click", startExperience);

// Header thu gọn khi cuộn.
window.addEventListener("scroll", () => {
  header.classList.toggle("is-scrolled", window.scrollY > 40);
}, { passive: true });

// Menu mobile.
menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.classList.toggle("is-open");
  nav.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("is-locked", isOpen);
});

$$('#nav a').forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.classList.remove("is-open");
    nav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("is-locked");
  });
});

// Highlight mục menu theo section đang xem.
const sections = $$('main section[id]');
const navLinks = $$('#nav a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
    });
  });
}, { rootMargin: "-40% 0px -50% 0px", threshold: 0 });

sections.forEach((section) => sectionObserver.observe(section));

// Reveal khi cuộn.
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    observer.unobserve(entry.target);
  });
}, { threshold: 0.13, rootMargin: "0px 0px -60px" });

$$('.reveal').forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
  revealObserver.observe(element);
});

// Countdown.
function pad(value, size = 2) {
  return String(Math.max(0, value)).padStart(size, "0");
}

function updateCountdown() {
  const now = new Date();
  const difference = WEDDING_DATE.getTime() - now.getTime();

  if (difference <= 0) {
    $("#days").textContent = "000";
    $("#hours").textContent = "00";
    $("#minutes").textContent = "00";
    $("#seconds").textContent = "00";
    return;
  }

  const days = Math.floor(difference / 86_400_000);
  const hours = Math.floor((difference / 3_600_000) % 24);
  const minutes = Math.floor((difference / 60_000) % 60);
  const seconds = Math.floor((difference / 1_000) % 60);

  $("#days").textContent = pad(days, 3);
  $("#hours").textContent = pad(hours);
  $("#minutes").textContent = pad(minutes);
  $("#seconds").textContent = pad(seconds);
}

updateCountdown();
setInterval(updateCountdown, 1000);

// Nhạc nền.
soundToggle.addEventListener("click", async () => {
  try {
    if (bgMusic.paused) {
      await bgMusic.play();
      soundToggle.classList.add("is-playing");
      showToast("Đã bật nhạc nền");
    } else {
      bgMusic.pause();
      soundToggle.classList.remove("is-playing");
      showToast("Đã tắt nhạc nền");
    }
  } catch {
    showToast("Hãy thêm file assets/wedding-music.mp3 để bật nhạc");
  }
});

// Hiệu ứng glow theo con trỏ.
const cursorGlow = $(".cursor-glow");
window.addEventListener("mousemove", (event) => {
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
  cursorGlow.style.opacity = "1";
}, { passive: true });

window.addEventListener("mouseout", () => {
  cursorGlow.style.opacity = "0";
});

// Parallax nhẹ cho hero.
window.addEventListener("scroll", () => {
  const heroMedia = $(".hero__media");
  if (heroMedia && window.scrollY < window.innerHeight * 1.2) {
    heroMedia.style.translate = `0 ${window.scrollY * 0.12}px`;
  }
}, { passive: true });

// Mở/đóng modal.
function openModal(modal) {
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-locked");
}

function closeModal(modal) {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-locked");
}

$$('[data-close-modal]').forEach((button) => {
  button.addEventListener("click", () => closeModal(button.closest(".modal")));
});

$$('.modal').forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal(modal);
  });
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    $$('.modal.is-open').forEach(closeModal);
  }
});

// Gallery lightbox.
const lightbox = $("#lightbox");
const lightboxImage = $("#lightboxImage");
const lightboxCaption = $("#lightboxCaption");

$$('.gallery__item').forEach((item) => {
  item.addEventListener("click", () => {
    const backgroundImage = getComputedStyle(item).backgroundImage;
    lightboxImage.style.backgroundImage = backgroundImage;
    lightboxCaption.textContent = item.dataset.caption;
    openModal(lightbox);
  });
});

// RSVP.
const rsvpModal = $("#rsvpModal");
$("#openRsvp").addEventListener("click", () => openModal(rsvpModal));

$("#rsvpForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const name = data.get("name") || "Bạn";
  const attendance = data.get("attendance");

  closeModal(rsvpModal);
  event.currentTarget.reset();

  if (attendance === "yes") {
    launchConfetti(140);
    showToast(`Cảm ơn ${name}! Hẹn gặp bạn trong ngày vui.`);
  } else {
    showToast(`Cảm ơn ${name} đã gửi lời nhắn đến Linh & Hiệu.`);
  }

  // Gợi ý tích hợp thực tế:
  // Gửi dữ liệu lên Google Sheets / Firebase / Formspree tại đây.
  console.info("RSVP data:", Object.fromEntries(data.entries()));
});

// Gift modal.
const giftModal = $("#giftModal");
$("#showGift").addEventListener("click", () => openModal(giftModal));

$("#copyAccount").addEventListener("click", async (event) => {
  const account = event.currentTarget.dataset.account;
  try {
    await navigator.clipboard.writeText(account);
    showToast("Đã sao chép số tài khoản");
  } catch {
    showToast(`Số tài khoản: ${account}`);
  }
});

// Nút gửi lời chúc ở hero.
$("#burstButton").addEventListener("click", () => {
  launchConfetti(120);
  showToast("Linh & Hiệu đã nhận được lời chúc của bạn! ♡");
});
