/* ============================================================
   A Better Way Out WA — Shared behaviour
   Mobile navigation menu: open/close, outside click, Escape key.
   ============================================================ */
(function () {
    var toggle = document.querySelector('.mobile-toggle');
    var menu = document.querySelector('.navbar-menu');
    if (!toggle || !menu) return;

    function setOpen(open) {
        menu.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'primary-menu');
    menu.id = menu.id || 'primary-menu';

    toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        setOpen(!menu.classList.contains('open'));
    });

    // Close when tapping anywhere outside the menu
    document.addEventListener('click', function (e) {
        if (!menu.classList.contains('open')) return;
        if (!menu.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });

    // Close after choosing a link (matters for same-page anchors)
    menu.addEventListener('click', function (e) {
        if (e.target.closest('a')) setOpen(false);
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') setOpen(false);
    });

    // Reset state when resizing back to desktop
    window.addEventListener('resize', function () {
        if (window.innerWidth > 768) setOpen(false);
    });
})();


/* ============================================================
   Google Analytics 4 — measurement + outbound CTA events
   Property: abetterwayoutwa.org   ID: G-4CR5B79GXJ
   ============================================================ */
(function () {
    var GA_ID = 'G-4CR5B79GXJ';

    // Load gtag.js
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID);

    // --- Custom events on the calls to action -------------------
    // These live on other domains (Zeffy, Facebook), so GA cannot
    // see them without being told explicitly.
    document.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('a');
        if (!a || !a.href) return;

        var page = document.title;

        if (a.href.indexOf('zeffy.com') !== -1) {
            gtag('event', 'donate_click', {
                location: a.classList.contains('nav-donate') ? 'navbar' : 'page_cta',
                page_title: page
            });
        } else if (a.href.indexOf('facebook.com/a.better.way.out') !== -1) {
            gtag('event', 'volunteer_click', {
                location: a.classList.contains('btn-involve') ? 'page_cta' : 'other',
                page_title: page
            });
        }
    });

    // --- Newsletter form seen (homepage only) -------------------
    var form = document.querySelector('.newsletter-section iframe');
    if (form && 'IntersectionObserver' in window) {
        var seen = false;
        new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting && !seen) {
                    seen = true;
                    gtag('event', 'newsletter_view');
                    obs.disconnect();
                }
            });
        }, { threshold: 0.5 }).observe(form);
    }
})();
