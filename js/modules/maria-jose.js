// Animação suave do scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Animação de entrada dos elementos
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, {
    threshold: 0.1
});

document.querySelectorAll('.timeline-item, .obra-card, .pilar').forEach((el) => {
    observer.observe(el);
});

// Navbar transparente no topo
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0)';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('.header');
    const stickyImage = document.getElementById('stickyImage');
    
    // Ajusta o top da imagem baseado na altura do header
    function updateStickyPosition() {
        const headerHeight = header.offsetHeight;
        const topValue = headerHeight + 20; // 20px de margem
        
        if (window.innerWidth <= 992) {
            stickyImage.style.top = `${topValue}px`;
        } else {
            stickyImage.style.top = `${topValue}px`;
        }
    }
    
    // Atualiza na inicialização e no redimensionamento
    updateStickyPosition();
    window.addEventListener('resize', updateStickyPosition);
});

// Inicializa a biblioteca AOS
AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true
});

// Adiciona classe ao header quando a página é rolada
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});