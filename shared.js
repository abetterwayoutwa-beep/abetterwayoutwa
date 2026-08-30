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
