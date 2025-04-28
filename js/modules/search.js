class Search {
    constructor() {
        console.log('Inicializando módulo de busca...');
        
        // Elementos da busca
        this.searchContainer = document.querySelector('.search-container');
        this.searchToggle = document.querySelector('.search-toggle');
        this.searchBox = document.querySelector('.search-box');
        this.searchInput = document.querySelector('.search-input');
        this.searchResults = document.querySelector('.search-results');
        
        console.log('Elementos encontrados:', {
            container: !!this.searchContainer,
            toggle: !!this.searchToggle,
            box: !!this.searchBox,
            input: !!this.searchInput,
            results: !!this.searchResults
        });
        
        // Dados de busca (estáticos)
        this.searchData = {
            sermons: [
                {
                    title: "Efésios 1:15-23",
                    description: "Oração de Paulo pelos Efésios",
                    url: "/pages/sermoes.html"
                },
                {
                    title: "Romanos 8:28",
                    description: "Todas as coisas cooperam para o bem",
                    url: "/pages/sermoes.html"
                }
            ],
            books: [
                {
                    title: "A Oração na Bíblia",
                    author: "Maria José A. Elias",
                    url: "/pages/livros.html"
                },
                {
                    title: "O Deus Presente",
                    author: "Maria José A. Elias",
                    url: "/pages/livros.html"
                }
            ],
            biographies: [
                {
                    name: "Rev. Antônio Elias",
                    description: "Pastor e pregador",
                    url: "/pages/antonio-elias.html"
                },
                {
                    name: "Profa. Maria José",
                    description: "Professora e escritora",
                    url: "/pages/maria-jose.html"
                }
            ]
        };
        
        // Cache de resultados
        this.cache = new Map();
        
        // Configurações
        this.minSearchLength = 2;
        this.debounceTime = 300;
        this.maxResults = 10;
        
        this.init();
    }

    init() {
        if (!this.searchContainer || !this.searchToggle || !this.searchBox || !this.searchInput || !this.searchResults) {
            console.error('Elementos da busca não encontrados');
            return;
        }

        this.setupEventListeners();
        console.log('Módulo de busca inicializado com sucesso');
    }

    setupEventListeners() {
        console.log('Configurando event listeners...');
        
        // Toggle da busca
        this.searchToggle.addEventListener('click', (e) => {
            console.log('Botão de busca clicado');
            e.preventDefault();
            e.stopPropagation();
            this.toggleSearch();
        });

        // Fechar ao clicar fora
        document.addEventListener('click', (e) => {
            if (!this.searchContainer.contains(e.target)) {
                console.log('Clique fora da busca detectado');
                this.closeSearch();
            }
        });

        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                console.log('Tecla ESC pressionada');
                this.closeSearch();
            }
        });

        // Busca ao digitar
        this.searchInput.addEventListener('input', this.debounce(() => {
            console.log('Input detectado');
            this.handleSearch();
        }, 300));
        
        console.log('Event listeners configurados');
    }

    toggleSearch() {
        console.log('Alternando visibilidade da busca');
        this.searchBox.classList.toggle('active');
        console.log('Estado da classe active:', this.searchBox.classList.contains('active'));
        
        if (this.searchBox.classList.contains('active')) {
            this.searchInput.focus();
            console.log('Input focado');
        }
    }

    closeSearch() {
        console.log('Fechando busca');
        this.searchBox.classList.remove('active');
        this.searchInput.value = '';
        this.searchResults.innerHTML = '';
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    handleSearch() {
        const query = this.searchInput.value.trim().toLowerCase();
        console.log('Realizando busca por:', query);
        
        if (query.length < this.minSearchLength) {
            this.searchResults.innerHTML = '';
            return;
        }

        // Verificar cache
        if (this.cache.has(query)) {
            this.displayResults(this.cache.get(query));
            return;
        }

        // Buscar resultados
        const results = this.search(query);
        this.cache.set(query, results);
        this.displayResults(results);
    }

    search(query) {
        console.log('Buscando resultados para:', query);
        const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        
        const results = {
            sermons: this.searchInSermons(normalizedQuery),
            books: this.searchInBooks(normalizedQuery),
            biographies: this.searchInBiographies(normalizedQuery)
        };

        return this.formatResults(results);
    }

    searchInSermons(query) {
        return this.searchData.sermons
            .filter(sermon => 
                sermon.title.toLowerCase().includes(query) ||
                sermon.description.toLowerCase().includes(query)
            )
            .slice(0, this.maxResults);
    }

    searchInBooks(query) {
        return this.searchData.books
            .filter(book => 
                book.title.toLowerCase().includes(query) ||
                book.author.toLowerCase().includes(query)
            )
            .slice(0, this.maxResults);
    }

    searchInBiographies(query) {
        return this.searchData.biographies
            .filter(bio => 
                bio.name.toLowerCase().includes(query) ||
                bio.description.toLowerCase().includes(query)
            )
            .slice(0, this.maxResults);
    }

    formatResults(results) {
        const formattedResults = [];
        
        if (results.sermons.length > 0) {
            formattedResults.push({
                type: 'sermons',
                title: 'Sermões',
                items: results.sermons
            });
        }
        
        if (results.books.length > 0) {
            formattedResults.push({
                type: 'books',
                title: 'Livros',
                items: results.books
            });
        }
        
        if (results.biographies.length > 0) {
            formattedResults.push({
                type: 'biographies',
                title: 'Biografias',
                items: results.biographies
            });
        }
        
        console.log('Resultados formatados:', formattedResults);
        return formattedResults;
    }

    displayResults(results) {
        console.log('Exibindo resultados:', results);
        
        if (!this.searchResults || results.length === 0) {
            this.searchResults.innerHTML = '';
            return;
        }

        this.searchResults.innerHTML = '';
        
        results.forEach(section => {
            const sectionElement = document.createElement('div');
            sectionElement.className = 'search-section';
            
            const titleElement = document.createElement('h3');
            titleElement.textContent = section.title;
            sectionElement.appendChild(titleElement);
            
            const listElement = document.createElement('ul');
            section.items.forEach(item => {
                const itemElement = document.createElement('li');
                const linkElement = document.createElement('a');
                linkElement.href = item.url;
                
                const titleDiv = document.createElement('div');
                titleDiv.className = 'search-item-title';
                titleDiv.textContent = item.title || item.name;
                
                const descriptionDiv = document.createElement('div');
                descriptionDiv.className = 'search-item-description';
                descriptionDiv.textContent = item.description;
                
                linkElement.appendChild(titleDiv);
                linkElement.appendChild(descriptionDiv);
                
                if (item.author) {
                    const authorDiv = document.createElement('div');
                    authorDiv.className = 'search-item-author';
                    authorDiv.textContent = item.author;
                    linkElement.appendChild(authorDiv);
                }
                
                itemElement.appendChild(linkElement);
                listElement.appendChild(itemElement);
            });
            
            sectionElement.appendChild(listElement);
            this.searchResults.appendChild(sectionElement);
        });
        
        console.log('Resultados exibidos com sucesso');
        this.searchResults.classList.add('active');
        this.searchResults.style.display = 'block';
        setTimeout(() => {
            this.searchResults.style.opacity = '1';
            this.searchResults.style.visibility = 'visible';
            this.searchResults.style.transform = 'translateY(0)';
        }, 10);
    }
}

export default Search;
