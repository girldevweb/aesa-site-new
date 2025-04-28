export default function initMenu() {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMobile = document.querySelector('.nav-mobile');
    const dropdowns = document.querySelectorAll('.nav-mobile .dropdown');
    const body = document.body;

    if (!mobileToggle || !navMobile) return;

    // Toggle menu mobile
    mobileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
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

    // Fechar menu ao clicar em links (exceto dropdowns)
    const links = navMobile.querySelectorAll('a:not(.dropdown .nav-link)');
    links.forEach(link => {
        link.addEventListener('click', () => {
            navMobile.classList.remove('active');
            mobileToggle.classList.remove('active');
            body.classList.remove('menu-open');
        });
    });

    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
        const isClickInsideNav = navMobile.contains(e.target);
        const isClickOnToggle = mobileToggle.contains(e.target);
        
        if (!isClickInsideNav && !isClickOnToggle && navMobile.classList.contains('active')) {
            navMobile.classList.remove('active');
            mobileToggle.classList.remove('active');
            body.classList.remove('menu-open');
            dropdowns.forEach(dropdown => dropdown.classList.remove('active'));
        }
    });

    // Resetar ao redimensionar
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1100) {
            navMobile.classList.remove('active');
            mobileToggle.classList.remove('active');
            body.classList.remove('menu-open');
            dropdowns.forEach(dropdown => dropdown.classList.remove('active'));
        }
    });
}

