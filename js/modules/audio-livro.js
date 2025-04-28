export class AudioPlayer {
    constructor() {
        this.initializeElements();
        this.initializeAudio();
        this.initializeEvents();
    }

    initializeElements() {
        // Elementos do player
        this.audioSection = document.getElementById('audioSection');
        this.audioBtn = document.getElementById('audioBtn');
        this.playPauseBtn = document.getElementById('playPause');
        this.prevBtn = document.getElementById('prevChapter');
        this.nextBtn = document.getElementById('nextChapter');
        this.rewindBtn = document.getElementById('rewind');
        this.forwardBtn = document.getElementById('forward');
        this.progressBar = document.querySelector('.progress-bar');
        this.progress = document.querySelector('.progress');
        this.currentTime = document.querySelector('.current-time');
        this.totalTime = document.querySelector('.total-time');
        this.chapterTitle = document.querySelector('.chapter-title');
    }

    initializeAudio() {
        this.audio = new Audio();
        this.isPlaying = false;
        this.currentChapter = 1;
        this.chapters = [
            { title: 'Capítulo 1', file: 'audio/cap1.mp3' },
            { title: 'Capítulo 2', file: 'audio/cap2.mp3' },
            // ... mais capítulos
        ];
    }

    initializeEvents() {
        // Toggle do player
        this.audioBtn?.addEventListener('click', () => this.toggleAudioSection());

        // Controles do player
        this.playPauseBtn?.addEventListener('click', () => this.togglePlayPause());
        this.prevBtn?.addEventListener('click', () => this.changeChapter('prev'));
        this.nextBtn?.addEventListener('click', () => this.changeChapter('next'));
        this.rewindBtn?.addEventListener('click', () => this.seek(-10));
        this.forwardBtn?.addEventListener('click', () => this.seek(10));

        // Progresso
        this.progressBar?.addEventListener('click', (e) => this.updateProgress(e));

        // Eventos do áudio
        this.audio.addEventListener('timeupdate', () => this.updateTimeDisplay());
        this.audio.addEventListener('ended', () => this.onAudioEnded());
        this.audio.addEventListener('loadedmetadata', () => this.onAudioLoaded());
    }

    toggleAudioSection() {
        this.audioSection?.classList.toggle('hidden');
        if (!this.audioSection?.classList.contains('hidden')) {
            this.audioSection?.scrollIntoView({ behavior: 'smooth' });
        }
    }

    togglePlayPause() {
        if (this.audio.paused) {
            this.audio.play();
            this.playPauseBtn.querySelector('i').className = 'fas fa-pause';
        } else {
            this.audio.pause();
            this.playPauseBtn.querySelector('i').className = 'fas fa-play';
        }
    }

    changeChapter(direction) {
        const newChapter = direction === 'prev' ? 
            this.currentChapter - 1 : 
            this.currentChapter + 1;

        if (newChapter > 0 && newChapter <= this.chapters.length) {
            this.currentChapter = newChapter;
            this.loadChapter();
        }
    }

    seek(seconds) {
        const newTime = this.audio.currentTime + seconds;
        if (newTime >= 0 && newTime <= this.audio.duration) {
            this.audio.currentTime = newTime;
        }
    }

    updateProgress(e) {
        const rect = this.progressBar.getBoundingClientRect();
        const clickPosition = e.clientX - rect.left;
        const percentage = clickPosition / rect.width;
        
        this.audio.currentTime = percentage * this.audio.duration;
    }

    updateTimeDisplay() {
        if (this.currentTime && this.totalTime) {
            this.currentTime.textContent = this.formatTime(this.audio.currentTime);
            this.totalTime.textContent = this.formatTime(this.audio.duration);
        }
        
        if (this.progress) {
            const percentage = (this.audio.currentTime / this.audio.duration) * 100;
            this.progress.style.width = `${percentage}%`;
        }
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    loadChapter() {
        const chapter = this.chapters[this.currentChapter - 1];
        this.audio.src = chapter.file;
        this.chapterTitle.textContent = chapter.title;
        this.playPauseBtn.querySelector('i').className = 'fas fa-play';
    }

    onAudioEnded() {
        if (this.currentChapter < this.chapters.length) {
            this.changeChapter('next');
        } else {
            this.playPauseBtn.querySelector('i').className = 'fas fa-play';
        }
    }

    onAudioLoaded() {
        this.totalTime.textContent = this.formatTime(this.audio.duration);
    }
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new AudioPlayer();
}); 