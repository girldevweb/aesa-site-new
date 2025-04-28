document.addEventListener('DOMContentLoaded', () => {
    const livros = [
        { id: 1, titulo: "A Oração na Bíblia", autor: "Maria José A. Elias", imagem: "../images/livros/Oracao.jpg", categoria: "Oração" },
        { id: 2, titulo: "O Deus Presente", autor: "Maria José A. Elias", imagem: "../images/livros/O Deus Presente.jpg", categoria: "Espiritualidade" },
        { id: 3, titulo: "A Família do Pastor e a Igreja", autor: "Maria José A. Elias", imagem: "../images/livros/A Familia do Pastor.jpg", categoria: "Família" },
        { id: 4, titulo: "Passos pelo caminho", autor: "Maria José A. Elias", imagem: "../images/livros/Passos.jpg", categoria: "Vida Cristã" },
        { id: 5, titulo: "Propostas Bíblicas para a Liderança Cristã", autor: "Maria José A. Elias", imagem: "../images/livros/Propostas.jpg", categoria: "Liderança" },
        { id: 6, titulo: "Sucata de Lembranças", autor: "Maria José A. Elias", imagem: "../images/livros/Sucata.jpg", categoria: "Poesia" },
        
        { id: 7, titulo: "Cantigas para o meu Deus", autor: "Maria José A. Elias", imagem: "../images/livros/Cantigas.jpg", categoria: "Poesia" },
        { id: 8, titulo: "Testemunhos Vivos", autor: "Rev. Antônio Elias", imagem: "../images/livros/Testemunhos.jpg", categoria: "Testemunhos" },
        { id: 9, titulo: "Família em Foco", autor: "Maria José A. Elias", imagem: "../images/livros/Familia em Foco.jpg", categoria: "Família" },
        { id: 10, titulo: "Era sem forma e vazia...", autor: "Maria José A. Elias", imagem: "../images/livros/Era Sem Forma.jpg", categoria: "Estudo Bíblico" },
        { id: 11, titulo: "Água feita vinho", autor: "Maria José A. Elias e Rev. Antônio Elias", imagem: "../images/livros/Agua feita.jpg", categoria: "Estudo Bíblico" },
        { id: 12, titulo: "O teu Deus, onde está?", autor: "Maria José A. Elias", imagem: "../images/livros/O teu Deus.jpg", categoria: "Espiritualidade" },
        { id: 13, titulo: "Sementeira da Palavra", autor: "Rev. Antônio Elias", imagem: "../images/livros/Sementeira.jpg", categoria: "Sermões" },
        { id: 14, titulo: "Cartas de Amor", autor: "Maria José A. Elias e Rev. Antônio Elias", imagem: "../images/livros/Cartas de Amor.jpg", categoria: "Testemunhos" }
    ];

    const livrosGrid = document.querySelector('.livros-grid');
    const categoriasBtns = document.querySelectorAll('.categorias-lista button');
    const categoriasBtn = document.querySelector('.categorias-btn');
    const categoriasConteudo = document.querySelector('.categorias-conteudo');
    let categoriaAtual = 'Todos';

    // Função para filtrar livros
    function filtrarLivros() {
        if (categoriaAtual === 'Todos') {
            return livros;
        }
        return livros.filter(livro => livro.categoria === categoriaAtual);
    }

    // Função para criar card de livro
    function criarCardLivro(livro) {
        return `
            <div class="livro-card">
                <div class="livro-imagem">
                    <img src="${livro.imagem}" alt="${livro.titulo}">
                    <div class="ver-livro-container">
                        <a href="livro.html?id=${livro.id}" class="ver-livro">VER LIVRO</a>
                    </div>
                </div>
                <div class="livro-info">
                    <h3>${livro.titulo}</h3>
                    <p>${livro.autor}</p>
                </div>
            </div>
        `;
    }

    // Função para renderizar os livros
    function renderizarLivros() {
        const livrosFiltrados = filtrarLivros();
        livrosGrid.innerHTML = livrosFiltrados.map(criarCardLivro).join('');

        // Adiciona animação de fade com delay
        const cards = livrosGrid.querySelectorAll('.livro-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('visible');
            }, index * 50);
        });
    }

    // Event Listeners
    if (categoriasBtn && categoriasConteudo) {
        categoriasBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            categoriasConteudo.classList.toggle('ativo');
            categoriasBtn.classList.toggle('ativo');
        });

        document.addEventListener('click', (e) => {
            if (!categoriasBtn.contains(e.target) && !categoriasConteudo.contains(e.target)) {
                categoriasConteudo.classList.remove('ativo');
                categoriasBtn.classList.remove('ativo');
            }
        });

        categoriasBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                categoriaAtual = btn.textContent;
                
                // Atualiza o texto do botão em telas menores
                if (window.innerWidth <= 768) {
                    const categoriaTexto = document.querySelector('.categoria-texto');
                    if (categoriaTexto) {
                        categoriaTexto.textContent = categoriaAtual;
                    }
                }
                
                categoriasBtns.forEach(b => b.classList.remove('ativo'));
                btn.classList.add('ativo');
                renderizarLivros();
                
                // Fecha o dropdown em telas menores
                if (window.innerWidth <= 768) {
                    categoriasConteudo.classList.remove('ativo');
                    categoriasBtn.classList.remove('ativo');
                }
            });
        });
    }

    // Renderiza os livros inicialmente
    renderizarLivros();
}); 