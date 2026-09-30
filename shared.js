/* ============================================================
   A Better Way Out WA — Shared behaviour
   1. Mobile navigation menu
   2. Header hairline once the page scrolls
   3. Time-limited blocks (data-until="YYYY-MM-DD") hide themselves
   ============================================================ */
(function () {
    var toggle = document.querySelector('.mobile-toggle');
    var menu = document.querySelector('.navbar-menu');

    if (toggle && menu) {
        var setOpen = function (open) {
            menu.classList.toggle('open', open);
            document.body.classList.toggle('menu-open', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        };

        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            setOpen(!menu.classList.contains('open'));
        });

        // Close after choosing a link (matters for same-page anchors)
        menu.addEventListener('click', function (e) {
            if (e.target.closest('a')) setOpen(false);
        });

        // Close on Escape and hand focus back to the button
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && menu.classList.contains('open')) {
                setOpen(false);
                toggle.focus();
            }
        });

        // Reset state when resizing back to desktop
        window.addEventListener('resize', function () {
            if (window.innerWidth > 960) setOpen(false);
        });
    }

    var header = document.querySelector('.site-header');
    if (header) {
        var onScroll = function () {
            header.classList.toggle('is-scrolled', window.scrollY > 8);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    // Blocks such as "Next event" disappear the day they go stale.
    var today = new Date();
    var stamp = today.getFullYear() + '-' +
        String(today.getMonth() + 1).padStart(2, '0') + '-' +
        String(today.getDate()).padStart(2, '0');
    document.querySelectorAll('[data-until]').forEach(function (el) {
        if (stamp >= el.getAttribute('data-until')) el.hidden = true;
    });

    // Opening an event from a link like events-2026.html#amando
    var openFromHash = function () {
        if (!location.hash) return;
        var target = document.getElementById(location.hash.slice(1));
        if (target && target.tagName === 'DETAILS') target.open = true;
    };
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
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
