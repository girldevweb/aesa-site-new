export default function initMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMobile = document.querySelector('.nav-mobile');
    const body = document.body;
    const dropdowns = document.querySelectorAll('.nav-mobile .dropdown');

    if (!mobileToggle || !navMobile) return;

    // Toggle menu mobile
    mobileToggle.addEventListener('click', function() {
        mobileToggle.classList.toggle('active');
        navMobile.classList.toggle('active');
        body.classList.toggle('menu-open');
    });

    // Gerenciar dropdowns
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('.nav-link');
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Fecha outros dropdowns
            dropdowns.forEach(other => {
                if (other !== dropdown && other.classList.contains('active')) {
                    other.classList.remove('active');
                }
            });
            
            // Toggle do dropdown atual
            dropdown.classList.toggle('active');
        });
    });

    // Fechar menu apenas ao clicar em links que não são dropdowns
    document.querySelectorAll('.nav-mobile a:not(.dropdown > .nav-link)').forEach(link => {
        link.addEventListener('click', function() {
            mobileToggle.classList.remove('active');
            navMobile.classList.remove('active');
            body.classList.remove('menu-open');
        });
    });

    // Fechar menu ao clicar fora
    document.addEventListener('click', function(e) {
        if (!navMobile.contains(e.target) && !mobileToggle.contains(e.target)) {
            mobileToggle.classList.remove('active');
            navMobile.classList.remove('active');
            body.classList.remove('menu-open');
            // Fecha todos os dropdowns
            dropdowns.forEach(dropdown => dropdown.classList.remove('active'));
        }
    });

    // Fechar menu ao redimensionar
    window.addEventListener('resize', function() {
        if (window.innerWidth > 1100) {
            mobileToggle.classList.remove('active');
            navMobile.classList.remove('active');
            body.classList.remove('menu-open');
            // Fecha todos os dropdowns
            dropdowns.forEach(dropdown => dropdown.classList.remove('active'));
        }
    });
} 