/* ============================================================
   INTHA RASA — script.js
   ============================================================ */

'use strict';

/* ---------- NAVBAR: scroll effect & active link ---------- */
const navbar   = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

function onScroll() {
    // Sticky style
    if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Active nav link via IntersectionObserver is handled below,
    // but also check scroll position for accuracy
    updateActiveLink();

    // Back-to-top visibility
    const btt = document.getElementById('backToTop');
    if (window.scrollY > 400) {
        btt.classList.add('visible');
    } else {
        btt.classList.remove('visible');
    }
}

function updateActiveLink() {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 140;
        const sectionBottom = sectionTop + section.offsetHeight;
        if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
            current = section.getAttribute('id');
        }
    });
    // Fallback: jika belum ada yang cocok (di paling atas), aktifkan yang pertama
    if (!current && window.scrollY < 200) {
        current = sections[0]?.getAttribute('id') || '';
    }
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll(); // run once on load


/* ---------- MOBILE NAV TOGGLE ---------- */
const navToggle   = document.getElementById('navToggle');
const navLinksEl  = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
    const isOpen = navLinksEl.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
});

// Close mobile menu when a link is clicked
navLinksEl.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navLinksEl.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', false);
    });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
        navLinksEl.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', false);
    }
});


/* ---------- ANIMATED COUNTER ---------- */
function animateCounter(el) {
    const target  = parseInt(el.dataset.target, 10);
    const suffix  = el.dataset.suffix || '';
    const duration = 1800;
    const start    = performance.now();

    function step(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const value  = Math.round(eased * target);
        el.textContent = value + suffix;
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

// Use IntersectionObserver to trigger counters once visible
const counters = document.querySelectorAll('.stat-num[data-target]');
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
            entry.target.dataset.animated = 'true';
            animateCounter(entry.target);
        }
    });
}, { threshold: 0.5 });

counters.forEach(c => counterObserver.observe(c));


/* ---------- SCROLL REVEAL ---------- */
const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el    = entry.target;
            const delay = el.dataset.delay ? parseInt(el.dataset.delay, 10) : 0;

            setTimeout(() => {
                el.classList.add('revealed');
            }, delay);

            revealObserver.unobserve(el);
        }
    });
}, {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));


/* ---------- VISI / MISI TABS ---------- */
const vmBtns = document.querySelectorAll('.vm-btn');
const visiContent = document.getElementById('visiContent');
const misiContent = document.getElementById('misiContent');

vmBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        vmBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const tab = btn.dataset.tab;
        if (tab === 'visi') {
            visiContent.classList.remove('hidden');
            misiContent.classList.add('hidden');
        } else {
            misiContent.classList.remove('hidden');
            visiContent.classList.add('hidden');
        }
    });
});


/* ---------- BACK TO TOP ---------- */
document.getElementById('backToTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* ---------- SMOOTH SCROLL for anchor links ---------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            e.preventDefault();
            const offset = navbar.offsetHeight + 16;
            const top    = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});


/* ---------- PRODUK CARD: hover accent colour per type ---------- */
const produkCards = document.querySelectorAll('.produk-card');
produkCards.forEach(card => {
    card.addEventListener('mouseenter', function () {
        const badge = this.querySelector('.produk-badge');
        if (badge && badge.classList.contains('badge-dsayur')) {
            this.style.setProperty('--card-accent', '#f6a622');
        }
    });
    card.addEventListener('mouseleave', function () {
        this.style.removeProperty('--card-accent');
    });
});


/* ---------- LAZY IMAGE handling with placeholder emoji ---------- */
document.querySelectorAll('.card-img-wrap img').forEach(img => {
    img.addEventListener('error', function () {
        this.style.display = 'none';
        const emoji = this.parentElement.querySelector('.card-emoji');
        if (emoji) emoji.style.display = 'flex';
    });
    img.addEventListener('load', function () {
        if (this.complete && this.naturalWidth > 0) {
            const emoji = this.parentElement.querySelector('.card-emoji');
            if (emoji) emoji.style.display = 'none';
        }
    });
});

// Profile image fallback
const profileImg         = document.getElementById('profileImg');
const profilePlaceholder = document.getElementById('profilePlaceholder');
if (profileImg) {
    if (!profileImg.src || profileImg.src === window.location.href) {
        profileImg.style.display = 'none';
    }
    profileImg.addEventListener('error', () => {
        profileImg.style.display = 'none';
        if (profilePlaceholder) profilePlaceholder.style.display = 'flex';
    });
    profileImg.addEventListener('load', () => {
        if (profileImg.naturalWidth > 0) {
            if (profilePlaceholder) profilePlaceholder.style.display = 'none';
        } else {
            profileImg.style.display = 'none';
        }
    });
}

/* ---------- FORM ULASAN ---------- */
(function () {
    const stars      = document.querySelectorAll('.star');
    const ratingInput = document.getElementById('ulasanRating');
    const textarea   = document.getElementById('ulasanPesan');
    const charCount  = document.getElementById('charCount');
    const submitBtn  = document.getElementById('ulasanSubmit');
    const submitText = document.getElementById('submitText');
    const submitSpinner = document.getElementById('submitSpinner');
    const notif      = document.getElementById('ulasanNotif');

    // Star hover & click
    stars.forEach(star => {
        star.addEventListener('mouseenter', () => highlightStars(+star.dataset.val));
        star.addEventListener('mouseleave', () => highlightStars(+ratingInput.value));
        star.addEventListener('click', () => {
            ratingInput.value = star.dataset.val;
            highlightStars(+star.dataset.val);
        });
    });

    function highlightStars(val) {
        stars.forEach(s => {
            s.classList.toggle('active', +s.dataset.val <= val);
        });
    }

    // Char counter
    if (textarea) {
        textarea.addEventListener('input', () => {
            charCount.textContent = textarea.value.length + ' / 500';
        });
    }

    // Submit
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            const nama    = document.getElementById('ulasanNama').value.trim();
            const produk  = document.getElementById('ulasanProduk').value;
            const rating  = ratingInput.value;
            const pesan   = textarea.value.trim();

            // Validasi
            if (!nama) { showNotif('Nama lengkap wajib diisi.', 'error'); return; }
            if (!produk) { showNotif('Pilih produk yang Anda beli.', 'error'); return; }
            if (!rating || rating === '0') { showNotif('Berikan rating bintang terlebih dahulu.', 'error'); return; }
            if (!pesan) { showNotif('Ulasan / komentar wajib diisi.', 'error'); return; }

            // Kirim ke backend
            setLoading(true);

            const formData = new FormData();
            formData.append('nama', nama);
            formData.append('produk', produk);
            formData.append('rating', rating);
            formData.append('pesan', pesan);

            fetch('submit_ulasan.php', {
                method: 'POST',
                body: formData
            })
            .then(r => r.json())
            .then(data => {
                setLoading(false);
                if (data.status === 'sukses') {
                    showNotif('✅ Terima kasih! Ulasan Anda berhasil dikirim.', 'sukses');
                    resetForm();
                } else {
                    showNotif('❌ Gagal mengirim: ' + (data.pesan || 'Terjadi kesalahan.'), 'error');
                }
            })
            .catch(() => {
                setLoading(false);
                showNotif('❌ Koneksi bermasalah. Coba lagi beberapa saat.', 'error');
            });
        });
    }

    function showNotif(msg, type) {
        notif.textContent = msg;
        notif.className = 'ulasan-notif ' + type;
        notif.style.display = 'block';
        notif.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        setTimeout(() => { notif.style.display = 'none'; }, 6000);
    }

    function setLoading(state) {
        submitBtn.disabled = state;
        submitText.style.display = state ? 'none' : 'inline';
        submitSpinner.style.display = state ? 'inline' : 'none';
    }

    function resetForm() {
        document.getElementById('ulasanNama').value = '';
        document.getElementById('ulasanProduk').value = '';
        textarea.value = '';
        ratingInput.value = '0';
        charCount.textContent = '0 / 500';
        highlightStars(0);
    }
})();