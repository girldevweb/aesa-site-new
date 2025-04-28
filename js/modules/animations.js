export default function initAnimations() {
    // Elementos que receberão animações
    const sections = document.querySelectorAll('[data-anime]');
    const windowHeight = window.innerHeight * 0.85; // 85% da altura da janela

    function animateOnScroll() {
        sections.forEach(section => {
            // Distância do elemento ao topo
            const sectionTop = section.getBoundingClientRect().top;
            const isSectionVisible = (sectionTop - windowHeight) < 0;

            // Verifica o tipo de animação
            const animationType = section.getAttribute('data-anime');

            if (isSectionVisible) {
                section.classList.add('animate');
            }
        });
    }

    // Verifica se existem elementos para animar
    if (sections.length) {
        // Animação inicial
        animateOnScroll();

        // Observer para animações no scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    observer.unobserve(entry.target); // Remove observação após animar
                }
            });
        }, {
            threshold: 0.25 // 25% do elemento visível
        });

        sections.forEach(section => {
            observer.observe(section);
        });
    }
}
