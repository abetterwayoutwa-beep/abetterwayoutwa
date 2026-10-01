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


/* ============================================================
   Motion layer — reveals, the reading thread, footer wordmark.
   Skipped entirely when the visitor prefers reduced motion.
   ============================================================ */
(function () {
    var root = document.documentElement;
    window.__abwo = true;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- Reading thread in the header ---------------------------
    var header = document.querySelector('.site-header');
    if (header) {
        var thread = document.createElement('span');
        thread.className = 'thread';
        thread.setAttribute('aria-hidden', 'true');
        header.appendChild(thread);
        var ticking = false;
        var paint = function () {
            ticking = false;
            var max = root.scrollHeight - window.innerHeight;
            var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
            thread.style.setProperty('--progress', p.toFixed(4));
            thread.style.setProperty('--thread-on', p > 0.004 ? 1 : 0);
        };
        window.addEventListener('scroll', function () {
            if (!ticking) { ticking = true; requestAnimationFrame(paint); }
        }, { passive: true });
        window.addEventListener('resize', paint);
        paint();
    }

    // --- Footer wordmark ----------------------------------------
    var footWrap = document.querySelector('.site-footer .wrap');
    var mark = null;
    if (footWrap) {
        mark = document.createElement('p');
        mark.className = 'footer-mark';
        mark.setAttribute('aria-hidden', 'true');
        mark.innerHTML = '<span>A Better Way Out</span>';
        footWrap.appendChild(mark);
        var fit = function () {
            var inner = mark.firstChild;
            mark.style.fontSize = '100px';
            var w = inner.getBoundingClientRect().width;
            if (w > 0) mark.style.fontSize = (100 * mark.clientWidth / w * 0.995) + 'px';
        };
        fit();
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
        window.addEventListener('resize', fit);
    }

    if (reduce || !('IntersectionObserver' in window)) {
        root.classList.remove('js');
        return;
    }

    // --- Split headings into words ------------------------------
    var split = function (el) {
        if (el.children.length || el.closest('details')) return;
        var text = el.textContent.replace(/\s+/g, ' ').trim();
        if (!text) return;
        el.setAttribute('aria-label', text);
        el.textContent = '';
        text.split(' ').forEach(function (word, i) {
            var w = document.createElement('span');
            w.className = 'w';
            w.setAttribute('aria-hidden', 'true');
            var s = document.createElement('span');
            s.style.setProperty('--i', i);
            s.textContent = word;
            w.appendChild(s);
            el.appendChild(w);
            el.appendChild(document.createTextNode(' '));
        });
        el.classList.add('split');
    };
    var heads = document.querySelectorAll('main h1, main .section h2:not(.visually-hidden), .cta-title, [data-split]');
    heads.forEach(split);

    // --- Mark photographs and supporting copy -------------------
    document.querySelectorAll('figure.photo img, .person-photo, .service img, .voices-thumb, .frame, .mission-mark img').forEach(function (el) {
        if (el.closest('details') || el.closest('.frame') && !el.classList.contains('frame')) return;
        el.classList.add('rv');
    });
    document.querySelectorAll('[data-fade]').forEach(function (el) { el.classList.add('fade'); });

    // A fully clipped element never "intersects", so photographs are
    // revealed by watching their parent instead.
    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var t = entry.target;
            (t.__reveal || [t]).forEach(function (el) { el.classList.add('in'); });
            io.unobserve(t);
        });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
    document.querySelectorAll('.split, .fade, .cta-row, [data-in]').forEach(function (el) { io.observe(el); });
    var footBottom = document.querySelector('.footer-bottom');
    if (mark && footBottom) { footBottom.__reveal = [mark]; io.observe(footBottom); }
    document.querySelectorAll('.rv').forEach(function (el) {
        var host = el.parentElement;
        (host.__reveal = host.__reveal || []).push(el);
        io.observe(host);
    });

    // --- Mission statement lights up as it is read --------------
    var scrub = document.querySelector('.scrub');
    if (scrub) {
        var words = scrub.textContent.trim().split(/\s+/);
        scrub.setAttribute('aria-label', words.join(' '));
        scrub.textContent = '';
        var spans = words.map(function (word) {
            var s = document.createElement('span');
            s.setAttribute('aria-hidden', 'true');
            s.textContent = word;
            scrub.appendChild(s);
            scrub.appendChild(document.createTextNode(' '));
            return s;
        });
        scrub.classList.add('is-scrub');
        var lit = -1, queued = false;
        var read = function () {
            queued = false;
            var r = scrub.getBoundingClientRect();
            var vh = window.innerHeight;
            var p = (vh * 0.86 - r.top) / (r.height + vh * 0.36);
            var n = Math.round(Math.min(1, Math.max(0, p)) * spans.length);
            if (n === lit) return;
            lit = n;
            for (var i = 0; i < spans.length; i++) spans[i].classList.toggle('on', i < n);
        };
        window.addEventListener('scroll', function () {
            if (!queued) { queued = true; requestAnimationFrame(read); }
        }, { passive: true });
        read();
    }
})();

/* ============================================================
   Homepage — "Four ways" list and the next-event countdown
   ============================================================ */
(function () {
    var ways = document.querySelectorAll('.ways-list .way');
    var shots = document.querySelectorAll('.ways-frame img');
    if (ways.length) {
        var activate = function (i) {
            ways.forEach(function (w, k) {
                w.classList.toggle('is-active', k === i);
                var b = w.querySelector('button');
                if (b) b.setAttribute('aria-expanded', k === i ? 'true' : 'false');
            });
            shots.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
        };
        ways.forEach(function (w, i) {
            w.addEventListener('mouseenter', function () { activate(i); });
            w.addEventListener('focusin', function () { activate(i); });
            w.addEventListener('click', function () { activate(i); });
        });
    }

    var next = document.querySelector('.next-event[data-date]');
    if (next && !next.hidden) {
        var parts = next.getAttribute('data-date').split('-');
        var day = new Date(+parts[0], +parts[1] - 1, +parts[2]);
        var now = new Date(); now.setHours(0, 0, 0, 0);
        var days = Math.round((day - now) / 864e5);
        var slot = next.querySelector('.next-count');
        if (slot && days >= 0) {
            slot.textContent = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : 'In ' + days + ' days';
        }
    }
})();
