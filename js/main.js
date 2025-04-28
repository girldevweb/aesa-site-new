import initMenu from './modules/menu.js';
import initAnimations from './modules/animations.js';
import Search from './modules/search.js';
import initMobileMenu from './modules/mobileMenu.js';
import initVideos from './modules/videos.js';

// Inicialização dos módulos
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initAnimations();
    
    // Inicializa o módulo de vídeos se estiver na página de vídeos
    if (document.querySelector('.videos-page')) {
        initVideos();
    }
    
    // Inicialização da busca
    const search = new Search();
    
    // Inicialização do Swiper para o carrossel de livros
    const bookSwiperElement = document.querySelector('.book-swiper');
    if (bookSwiperElement) {
        const bookSwiper = new Swiper('.book-swiper', {
            // Configurações básicas
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            
            // Navegação
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            
            // Paginação
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            
            // Responsividade
            breakpoints: {
                640: {
                    slidesPerView: 2,
                },
                1024: {
                    slidesPerView: 3,
                },
            }
        });
    }

    // Scroll suave para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        if (anchor.getAttribute('href') !== '#') {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const target = document.getElementById(targetId);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        }
    });

    // Animação de fade-in para elementos ao rolar
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observar elementos com classes de animação
    document.querySelectorAll('[data-anime]').forEach(element => {
        observer.observe(element);
    });

    // Controle dos Submenus
    const submenuItems = document.querySelectorAll('.dropdown-submenu > a');
    
    submenuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if (window.innerWidth <= 1100) {
                e.preventDefault();
                const parent = item.parentElement;
                parent.classList.toggle('active');
            }
        });
    });

    // Fechar submenus ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown-submenu')) {
            submenuItems.forEach(item => {
                item.parentElement.classList.remove('active');
            });
        }
    });
});
