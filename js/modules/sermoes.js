// Configuração da API
const config = {
    api: {
        baseUrl: 'http://localhost:3000/api'
    }
};

// Dados dos sermões
let sermoes = [];

// Verificar se é administrador
let isAdmin = false;

// Função para verificar se é administrador
async function verificarAdmin() {
    try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            isAdmin = false;
            return;
        }

        const response = await fetch(`${config.api.baseUrl}/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        isAdmin = response.ok;
    } catch (error) {
        console.error('Erro ao verificar admin:', error);
        isAdmin = false;
    }
}

// Cache para armazenar os sermões
let sermonCache = {
    data: null,
    timestamp: null,
    CACHE_DURATION: 5 * 60 * 1000 // 5 minutos em milissegundos
};

// Função para verificar se o cache é válido
function isCacheValid() {
    if (!sermonCache.data || !sermonCache.timestamp) return false;
    return (Date.now() - sermonCache.timestamp) < sermonCache.CACHE_DURATION;
}

// Função para carregar os sermões com retry
async function carregarSermoesDaAPI(retryCount = 3) {
    try {
        // Verificar cache
        if (isCacheValid()) {
            console.log('Usando dados do cache');
            return sermonCache.data;
        }

        console.log('Iniciando carregamento dos sermões...');
        const response = await fetch(`${config.api.baseUrl}/sermoes`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Atualizar cache
        sermonCache.data = data;
        sermonCache.timestamp = Date.now();
        
        return data;
    } catch (error) {
        console.error('Erro ao carregar sermões:', error);
        
        // Tentar novamente se ainda houver tentativas
        if (retryCount > 0) {
            console.log(`Tentando novamente... Tentativas restantes: ${retryCount}`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
            return carregarSermoesDaAPI(retryCount - 1);
        }
        
        // Se todas as tentativas falharem, retornar dados do cache se disponível
        if (sermonCache.data) {
            console.log('Usando dados do cache após falha nas tentativas');
            return sermonCache.data;
        }
        
        throw error;
    }
}

// Função para exibir os sermões
async function exibirSermoes() {
    const playlist = document.querySelector('.playlist');
    if (!playlist) return;

    // Mostrar loading state
    playlist.innerHTML = '<div class="loading">Carregando sermões...</div>';

    try {
        const data = await carregarSermoesDaAPI();
        const sermons = data;

        if (!sermons || sermons.length === 0) {
            playlist.innerHTML = '<div class="no-sermons">Nenhum sermão encontrado</div>';
            return;
        }

        // Limpar loading state
        playlist.innerHTML = '';
        
        // Adicionar cada sermão à playlist
        sermons.forEach(sermon => {
            const sermonElement = document.createElement('div');
            sermonElement.className = 'sermon-item';
            sermonElement.innerHTML = `
                <div class="sermon-info">
                    <h3>${sermon.titulo}</h3>
                    <p>${sermon.autor}</p>
                </div>
                <button class="play-btn" data-audio-url="${sermon.audioUrl}">
                    <i class="fas fa-play"></i>
                </button>
            `;
            playlist.appendChild(sermonElement);
        });

        // Adicionar event listeners para os botões de play
        document.querySelectorAll('.play-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const audioUrl = btn.getAttribute('data-audio-url');
                if (audioUrl) {
                    const audioPlayer = document.getElementById('audio-player');
                    audioPlayer.src = audioUrl;
                    audioPlayer.play().catch(error => {
                        console.error('Erro ao reproduzir áudio:', error);
                    });
                }
            });
        });
    } catch (error) {
        console.error('Erro ao exibir sermões:', error);
        playlist.innerHTML = '<div class="error">Erro ao carregar os sermões. Tente novamente mais tarde.</div>';
    }
}

// Carregar sermões quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    verificarAdmin();
    exibirSermoes();
});

// Recarregar sermões a cada 5 minutos
setInterval(exibirSermoes, 5 * 60 * 1000);

// Elementos do DOM
const audioPlayer = document.getElementById('audio-player');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressBar = document.querySelector('.progress');
const currentTimeDisplay = document.querySelector('.tempo-atual');
const totalTimeDisplay = document.querySelector('.tempo-total');
const playlist = document.querySelector('.playlist');
const searchInput = document.getElementById('search-input');

// Configuração da API Azure
const azureConfig = {
    clientId: 'SEU_CLIENT_ID_AQUI', // Substitua pelo Client ID do seu app no Azure
    tenantId: 'SEU_TENANT_ID_AQUI', // Substitua pelo Tenant ID do seu app no Azure
    redirectUri: 'http://localhost:5500', // URL para desenvolvimento local
    scopes: ['Files.Read.All', 'Sites.Read.All'],
    apiEndpoint: 'https://graph.microsoft.com/v1.0',
    driveId: 'SEU_DRIVE_ID_AQUI' // ID da pasta onde estão os sermões
};

// Lista de sermões (será preenchida dinamicamente)
let listaSermoes = [];

let currentIndex = 0;
let isPlaying = false;
let retryCount = 0;
const MAX_RETRIES = 3;
let loadingTimeout;
let isOneDrive = false;
let accessToken = null;

// Função para obter token de acesso da Azure
async function obterTokenAzure() {
    try {
        // Verificar token existente
        const storedToken = localStorage.getItem('azureToken');
        const tokenExpiry = localStorage.getItem('azureTokenExpiry');
        
        if (storedToken && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
            return storedToken;
        }

        // Configurar autenticação Azure
        const authUrl = `https://login.microsoftonline.com/${azureConfig.tenantId}/oauth2/v2.0/authorize?client_id=${azureConfig.clientId}&response_type=token&redirect_uri=${azureConfig.redirectUri}&scope=${azureConfig.scopes.join(' ')}&response_mode=fragment`;
        
        const popup = window.open(authUrl, 'Azure Auth', 'width=600,height=600');
        
        return new Promise((resolve, reject) => {
            const checkAuth = setInterval(() => {
                try {
                    if (popup.closed) {
                        clearInterval(checkAuth);
                        reject(new Error('Autenticação necessária'));
                    }
                    
                    const hash = popup.location.hash;
                    if (hash) {
                        const params = new URLSearchParams(hash.substring(1));
                        const token = params.get('access_token');
                        const expiresIn = params.get('expires_in');
                        
                        if (token) {
                            // Armazenar token com informações adicionais
                            localStorage.setItem('azureToken', token);
                            localStorage.setItem('azureTokenExpiry', Date.now() + (expiresIn * 1000));
                            popup.close();
                            clearInterval(checkAuth);
                            resolve(token);
                        }
                    }
                } catch (e) {
                    // Ignorar erros de cross-origin
                }
            }, 100);
        });
    } catch (error) {
        console.error('Erro ao obter token Azure:', error);
        throw error;
    }
}

// Função para carregar arquivos da pasta do Azure
async function carregarArquivosDaPasta() {
    try {
        const loadingElement = mostrarLoading();
        loadingElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando lista de sermões...';

        // Obter token Azure
        const token = await obterTokenAzure();

        // URL da API Azure para listar arquivos
        const url = `${azureConfig.apiEndpoint}/drives/${azureConfig.driveId}/items/root/children`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Token expirado, tentar obter novo
                localStorage.removeItem('azureToken');
                localStorage.removeItem('azureTokenExpiry');
                return carregarArquivosDaPasta();
            }
            throw new Error(`Erro ao carregar arquivos: ${response.status}`);
        }

        const data = await response.json();
        
        // Filtrar e processar arquivos de áudio
        const arquivosAudio = data.value.filter(item => 
            item.name.toLowerCase().endsWith('.mp3') || 
            item.name.toLowerCase().endsWith('.wav') ||
            item.name.toLowerCase().endsWith('.m4a')
        );

        // Converter para o formato da lista de sermões
        listaSermoes = arquivosAudio.map((arquivo, index) => ({
            title: arquivo.name.replace(/\.[^/.]+$/, ""),
            preacher: "Reverendo Antônio Elias",
            audioUrl: `${azureConfig.apiEndpoint}/drives/${azureConfig.driveId}/items/${arquivo.id}/content`,
            duration: 0
        }));

        removerLoading(loadingElement);
        atualizarPlaylist();
    } catch (error) {
        console.error('Erro ao carregar arquivos:', error);
        alert('Erro ao carregar a lista de sermões. Por favor, tente novamente mais tarde.');
    }
}

// Função para mostrar estado de carregamento
function mostrarLoading() {
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading';
    loadingElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
    document.querySelector('.pregador-container').appendChild(loadingElement);
    return loadingElement;
}

// Função para remover estado de carregamento
function removerLoading(loadingElement) {
    if (loadingElement && loadingElement.parentNode) {
        loadingElement.parentNode.removeChild(loadingElement);
    }
}

// Função para criar item da playlist
function criarItemPlaylist(sermao, index) {
    const item = document.createElement('div');
    item.className = 'playlist-item';
    item.dataset.index = index;
    
    item.innerHTML = `
        <div class="playlist-item-content">
            <span class="playlist-item-title">${sermao.title}</span>
            <span class="playlist-item-preacher">${sermao.preacher}</span>
        </div>
        <span class="playlist-item-duration">${formatTime(sermao.duration)}</span>
    `;

    item.addEventListener('click', () => {
        currentIndex = index;
        carregarSermao(sermao, true);
        atualizarPlaylist();
    });

    return item;
}

// Função para carregar um sermão com retry
async function carregarSermao(sermao, shouldPlay = false) {
    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    }

    const loadingElement = mostrarLoading();
    isOneDrive = true;
    
    // Limpar timeout anterior se existir
    if (loadingTimeout) {
        clearTimeout(loadingTimeout);
    }
    
    // Timeout para remover loading após 30 segundos
    loadingTimeout = setTimeout(() => {
        removerLoading(loadingElement);
        alert('O áudio está demorando muito para carregar. Por favor, tente novamente.');
    }, 30000);
    
    try {
        // Configurar o player para OneDrive
        audioPlayer.preload = 'none';
        audioPlayer.crossOrigin = 'anonymous';
        
        // Adicionar token de acesso ao URL
        const url = new URL(sermao.audioUrl);
        url.searchParams.append('access_token', accessToken);
        audioPlayer.src = url.toString();
        
        if (shouldPlay) {
            await audioPlayer.play();
                    isPlaying = true;
                    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            retryCount = 0;
            removerLoading(loadingElement);
            clearTimeout(loadingTimeout);
        }
    } catch (error) {
                    console.error('Erro ao reproduzir:', error);
        removerLoading(loadingElement);
        clearTimeout(loadingTimeout);
        
        if (retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`Tentando novamente (${retryCount}/${MAX_RETRIES})...`);
            setTimeout(() => carregarSermao(sermao, true), 1000);
        } else {
            alert('Não foi possível carregar o áudio. Por favor, tente novamente mais tarde.');
        }
    }

    document.querySelector('.pregador-container h2').textContent = sermao.title;
}

// Função para atualizar a playlist
function atualizarPlaylist() {
    playlist.innerHTML = ''; // Limpar playlist atual
    
    listaSermoes.forEach((sermao, index) => {
        const item = criarItemPlaylist(sermao, index);
        if (index === currentIndex) {
            item.classList.add('active');
        }
        playlist.appendChild(item);
    });
}

// Função para formatar tempo
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Event Listeners
playBtn.addEventListener('click', () => {
    if (isPlaying) {
        audioPlayer.pause();
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    } else {
        audioPlayer.play()
                .then(() => {
                    isPlaying = true;
                    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                })
                .catch(error => {
                    console.error('Erro ao reproduzir:', error);
                if (isOneDrive) {
                    alert('Não foi possível reproduzir o áudio do OneDrive. Por favor, tente novamente ou use um navegador diferente.');
                } else {
                    alert('Não foi possível reproduzir o áudio. Por favor, tente novamente.');
                }
            });
    }
    isPlaying = !isPlaying;
});

prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        carregarSermao(listaSermoes[currentIndex], true);
    atualizarPlaylist();
    }
});

nextBtn.addEventListener('click', () => {
    if (currentIndex < listaSermoes.length - 1) {
        currentIndex++;
        carregarSermao(listaSermoes[currentIndex], true);
    atualizarPlaylist();
    }
});

audioPlayer.addEventListener('timeupdate', () => {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressBar.style.width = `${progress}%`;
    currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
});

audioPlayer.addEventListener('loadedmetadata', () => {
    totalTimeDisplay.textContent = formatTime(audioPlayer.duration);
    // Atualizar duração na lista de sermões
    if (listaSermoes[currentIndex]) {
        listaSermoes[currentIndex].duration = audioPlayer.duration;
    atualizarPlaylist();
    }
});

audioPlayer.addEventListener('error', (e) => {
    console.error('Erro no player de áudio:', e);
    if (retryCount < MAX_RETRIES) {
        retryCount++;
        setTimeout(() => carregarSermao(listaSermoes[currentIndex], true), 1000);
    } else {
        if (isOneDrive) {
            alert('Erro ao carregar o áudio do OneDrive. Por favor, tente novamente mais tarde ou use um navegador diferente.');
        } else {
            alert('Erro ao carregar o áudio. Por favor, tente novamente mais tarde.');
        }
    }
});

audioPlayer.addEventListener('ended', () => {
    isPlaying = false;
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
    if (currentIndex < listaSermoes.length - 1) {
        currentIndex++;
        carregarSermao(listaSermoes[currentIndex], true);
        atualizarPlaylist();
    }
});

// Inicializar a playlist
document.addEventListener('DOMContentLoaded', () => {
    carregarArquivosDaPasta();
});

