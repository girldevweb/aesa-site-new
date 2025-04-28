export default function initVideos() {
    const searchInput = document.querySelector('.search-filter input');
    const filterSelects = document.querySelectorAll('.filter-select');
    const videoCards = document.querySelectorAll('.video-card');
    const paginationButtons = document.querySelectorAll('.pagination-button');

    // Função para filtrar vídeos
    function filterVideos() {
        const searchTerm = searchInput.value.toLowerCase();
        const yearFilter = filterSelects[0].value;
        const themeFilter = filterSelects[1].value;

        videoCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('.video-description').textContent.toLowerCase();
            const date = card.querySelector('.video-date').textContent;
            const year = date.split('/')[2];

            const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);
            const matchesYear = !yearFilter || year === yearFilter;
            const matchesTheme = !themeFilter || description.includes(themeFilter);

            if (matchesSearch && matchesYear && matchesTheme) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Event Listeners
    searchInput.addEventListener('input', filterVideos);
    filterSelects.forEach(select => {
        select.addEventListener('change', filterVideos);
    });

    // Paginação
    paginationButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.disabled) return;

            // Remove active class from all buttons
            paginationButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            // Update disabled state of prev/next buttons
            const currentPage = parseInt(this.textContent);
            paginationButtons[0].disabled = currentPage === 1;
            paginationButtons[paginationButtons.length - 1].disabled = currentPage === paginationButtons.length - 2;
        });
    });

    // Play button hover effect
    videoCards.forEach(card => {
        const playButton = card.querySelector('.play-button');
        
        card.addEventListener('mouseenter', () => {
            playButton.style.opacity = '1';
        });

        card.addEventListener('mouseleave', () => {
            playButton.style.opacity = '0';
        });
    });
} 