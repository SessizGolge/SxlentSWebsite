// Music Player - Persistent across all pages
class MusicPlayer {
  constructor() {
    // Use persistent audio element stored on window
    if (!window.globalAudio) {
      window.globalAudio = new Audio();
      window.globalAudio.crossOrigin = 'anonymous';
    }
    this.audio = window.globalAudio;
    
    this.playlist = [];
    this.currentIndex = 0;
    this.isShuffled = false;
    this.loopMode = 0; // 0: no loop, 1: loop all, 2: loop one
    this.isPlaying = false;
    this.isCollapsed = true;
    this.isDragging = false;
    this.hideTimeout = null;
    this.inactivityTimer = null;
    this.init();
  }

  async init() {
    // Set this as the current player instance for audio event listeners
    window.currentMusicPlayer = this;
    
    // Create player UI
    this.createPlayerUI();
    
    // Load music files
    await this.loadMusicFiles();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Load saved state
    this.loadPlayerState();
    
    // Setup page transition handling
    this.setupPageTransitionHandling();
  }

  setupPageTransitionHandling() {
    // Save state before page unload
    window.addEventListener('beforeunload', () => {
      localStorage.setItem('musicTransition', 'true');
      this.savePlaybackState();
    });
    
    // Check if we're coming from a page transition
    const isTransition = localStorage.getItem('musicTransition') === 'true';
    if (isTransition) {
      localStorage.removeItem('musicTransition');
      // If audio is already playing, don't interrupt
      if (this.audio.src && this.audio.duration > 0) {
        this.isPlaying = this.audio.currentTime < this.audio.duration;
      }
    }
  }

  createPlayerUI() {
    const playerHTML = `
      <div id="musicPlayer" class="music-player collapsed">
        <div class="player-track-info">
          <span class="player-song-title">No song loaded</span>
        </div>

        <div class="player-progress-container">
          <span class="player-time">0:00</span>
          <div class="player-progress-bar">
            <div class="player-progress"></div>
          </div>
          <span class="player-duration">0:00</span>
        </div>

        <div class="player-controls">
          <button id="playerShuffle" class="player-btn player-shuffle-btn" title="Shuffle">
            ⇄
          </button>

          <button id="playerPrev" class="player-btn" title="Previous">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 6l-8.5 6L18 18V6zm-9 0h-2v12h2V6z"/>
            </svg>
          </button>

          <button id="playerPlayPause" class="player-btn player-play-btn" title="Play">
            <svg class="player-play-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <svg class="player-pause-icon hidden" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          </button>

          <button id="playerNext" class="player-btn" title="Next">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zm9-12h2v12h-2V6z"/>
            </svg>
          </button>

          <button id="playerLoop" class="player-btn player-loop-btn" title="Loop">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
            </svg>
          </button>
        </div>

        <div class="player-volume">
          <svg class="player-volume-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.26 2.5-4.02z"/>
          </svg>
          <input type="range" id="playerVolume" class="player-volume-slider" min="0" max="100" value="70">
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', playerHTML);
  }

  async loadMusicFiles() {
    try {
      const response = await fetch('../music/');
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Try to extract music files from directory listing
      const links = doc.querySelectorAll('a[href*=".mp3"], a[href*=".m4a"], a[href*=".wav"], a[href*=".ogg"]');
      
      if (links.length > 0) {
        links.forEach(link => {
          const href = link.getAttribute('href');
          if (href && !href.includes('./')) {
            const filename = href.split('/').pop();
            this.playlist.push({
              title: this.formatTitle(filename),
              url: `../music/${filename}`,
              filename
            });
          }
        });
        console.log(`🎵 Loaded ${links.length} music file(s)`);
      } else {
        console.log('🎵 No music files found in ../music/ folder. Add .mp3, .m4a, .wav, or .ogg files to enable the jukebox.');
      }
    } catch (error) {
      console.warn('⚠️ Music folder not accessible. GitHub Pages tip: Ensure you have audio files in the ../music/ folder. Directory listings may not work on some hosts - consider using a hardcoded playlist instead.');
    }
  }

  formatTitle(filename) {
    return filename
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[_]/g, ' ')     // Replace hyphens/underscores with spaces
  }

  setupEventListeners() {
    const player = document.getElementById('musicPlayer');
    const playPauseBtn = document.getElementById('playerPlayPause');
    const prevBtn = document.getElementById('playerPrev');
    const nextBtn = document.getElementById('playerNext');
    const shuffleBtn = document.getElementById('playerShuffle');
    const loopBtn = document.getElementById('playerLoop');
    const volumeSlider = document.getElementById('playerVolume');
    const progressBar = document.querySelector('.player-progress-bar');

    // Collapse/Expand with click only
    player.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent document listener from firing
      if (!e.target.closest('button') && !e.target.closest('input') && !e.target.closest('.player-progress-bar')) {
        this.toggleExpand();
      }
    });

    // Click outside to collapse
    document.addEventListener('click', (e) => {
      if (!player.contains(e.target) && !this.isCollapsed) {
        this.collapse();
      }
    });

    // Controls
    playPauseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.togglePlayPause();
    });
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.playPrevious();
    });
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.playNext();
    });
    shuffleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleShuffle();
    });
    loopBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleLoop();
    });
    volumeSlider.addEventListener('input', (e) => {
      e.stopPropagation();
      this.setVolume(e.target.value);
    });

    // Progress bar - drag and click
    progressBar.addEventListener('mousedown', (e) => this.startDrag(e));
    progressBar.addEventListener('touchstart', (e) => this.startDrag(e));
    document.addEventListener('mousemove', (e) => this.drag(e));
    document.addEventListener('touchmove', (e) => this.drag(e));
    document.addEventListener('mouseup', () => this.endDrag());
    document.addEventListener('touchend', () => this.endDrag());
    progressBar.addEventListener('click', (e) => {
      if (!this.isDragging) this.seek(e);
    });

    // Audio events - only add once, use global reference to handle instance changes
    if (!this.audio.__listenersAdded) {
      this.audio.addEventListener('timeupdate', () => window.currentMusicPlayer?.updateProgress());
      this.audio.addEventListener('ended', () => window.currentMusicPlayer?.onAudioEnded());
      this.audio.addEventListener('loadedmetadata', () => window.currentMusicPlayer?.updateDuration());
      this.audio.addEventListener('play', () => window.currentMusicPlayer?.setPlayingState(true));
      this.audio.addEventListener('pause', () => window.currentMusicPlayer?.setPlayingState(false));
      this.audio.__listenersAdded = true;
    }
  }

  setPlayingState(playing) {
    this.isPlaying = playing;
    const player = document.getElementById('musicPlayer');
    if (player) {
      if (playing) {
        player.classList.add('playing');
      } else {
        player.classList.remove('playing');
      }
    }
  }

  toggleExpand() {
    if (this.isCollapsed) {
      this.expand();
    } else {
      this.collapse();
    }
  }

  expand() {
    const player = document.getElementById('musicPlayer');
    player.classList.remove('collapsed');
    this.isCollapsed = false;
  }

  collapse() {
    const player = document.getElementById('musicPlayer');
    player.classList.add('collapsed');
    this.isCollapsed = true;
  }

  startDrag(e) {
    if (this.playlist.length === 0) return;
    this.isDragging = true;
    this.drag(e);
  }

  drag(e) {
    if (!this.isDragging) return;
    
    const progressBar = document.querySelector('.player-progress-bar');
    const rect = progressBar.getBoundingClientRect();
    let clientX;

    if (e.type.includes('touch')) {
      clientX = e.touches?.[0]?.clientX;
    } else {
      clientX = e.clientX;
    }

    if (!clientX) return;

    let clickX = clientX - rect.left;
    clickX = Math.max(0, Math.min(clickX, rect.width));
    
    if (this.audio.duration) {
      const percentage = clickX / rect.width;
      const progress = document.querySelector('.player-progress');
      progress.style.width = (percentage * 100) + '%';
      
      const currentTimeDisplay = document.querySelector('.player-time');
      currentTimeDisplay.textContent = this.formatTime(percentage * this.audio.duration);
    }
  }

  endDrag() {
    if (!this.isDragging) return;
    
    const progressBar = document.querySelector('.player-progress-bar');
    const rect = progressBar.getBoundingClientRect();
    const progress = document.querySelector('.player-progress');
    const percentage = parseInt(progress.style.width) / 100;
    
    this.audio.currentTime = percentage * this.audio.duration;
    this.isDragging = false;
  }

  seek(e) {
    if (!this.audio.duration) return;

    const progressBar = document.querySelector('.player-progress-bar');
    const rect = progressBar.getBoundingClientRect();
    let clickX;

    if (e.type.includes('touch')) {
      clickX = e.touches?.[0]?.clientX - rect.left;
    } else {
      clickX = e.clientX - rect.left;
    }

    clickX = Math.max(0, Math.min(clickX, rect.width));
    const percentage = clickX / rect.width;
    this.audio.currentTime = percentage * this.audio.duration;
  }

  play(index = this.currentIndex) {
    if (this.playlist.length === 0) {
      console.log('No music files available');
      return;
    }

    this.currentIndex = index % this.playlist.length;
    const track = this.playlist[this.currentIndex];
    
    this.audio.src = track.url;
    this.audio.play().catch(err => console.log('Playback error:', err));
    this.isPlaying = true;
    this.updateUI();
    this.savePlayerState();
    this.resetInactivityTimer();
    this.expand();
  }

  togglePlayPause() {
    if (this.playlist.length === 0) return;

    if (this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
    } else {
      if (this.audio.src === '') {
        this.play(0);
      } else {
        this.audio.play();
        this.isPlaying = true;
      }
    }
    this.updateUI();
    this.savePlayerState();
    this.savePlaybackState();
    this.expand();
  }

  playNext() {
    if (this.playlist.length === 0) return;

    if (this.isShuffled) {
      this.currentIndex = Math.floor(Math.random() * this.playlist.length);
    } else {
      this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    }

    this.play(this.currentIndex);
  }

  playPrevious() {
    if (this.playlist.length === 0) return;

    this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    this.play(this.currentIndex);
  }

  toggleShuffle() {
    this.isShuffled = !this.isShuffled;
    document.getElementById('playerShuffle').classList.toggle('active', this.isShuffled);
    this.savePlayerState();
    this.resetInactivityTimer();
  }

  toggleLoop() {
    this.loopMode = (this.loopMode + 1) % 3;
    const loopBtn = document.getElementById('playerLoop');
    loopBtn.classList.toggle('active', this.loopMode > 0);
    loopBtn.dataset.mode = this.loopMode;
    this.savePlayerState();
    this.resetInactivityTimer();
  }

  setVolume(value) {
    this.audio.volume = value / 100;
    this.savePlayerState();
  }

  resetInactivityTimer() {
    // Clear existing timer
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
    
    // Set new timer to collapse after 5 seconds of inactivity
    this.inactivityTimer = setTimeout(() => {
      if (!this.isCollapsed) {
        this.collapse();
      }
    }, 5000);
  }

  updateProgress() {
    if (this.isDragging) return; // Don't update while dragging

    const progress = document.querySelector('.player-progress');
    const currentTimeDisplay = document.querySelector('.player-time');
    
    if (this.audio.duration) {
      const percentage = (this.audio.currentTime / this.audio.duration) * 100;
      progress.style.width = percentage + '%';
    }

    currentTimeDisplay.textContent = this.formatTime(this.audio.currentTime);
    
    // Save playback state frequently to ensure smooth resume on page change
    this.savePlaybackState();
  }

  updateDuration() {
    const durationDisplay = document.querySelector('.player-duration');
    durationDisplay.textContent = this.formatTime(this.audio.duration);
  }

  formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  onAudioEnded() {
    if (this.loopMode === 2) {
      // Loop one - repeat current song
      this.audio.currentTime = 0;
      this.audio.play();
    } else if (this.loopMode === 1) {
      // Loop all - play next song
      if (this.currentIndex < this.playlist.length - 1) {
        this.playNext();
      } else {
        // At end of playlist, go back to first song
        this.currentIndex = 0;
        this.play(0);
      }
    } else {
      // No loop - pause when song ends
      this.isPlaying = false;
      this.updateUI();
      this.savePlaybackState();
    }
  }

  updateUI() {
    const playIcon = document.querySelector('.player-play-icon');
    const pauseIcon = document.querySelector('.player-pause-icon');
    const titleDisplay = document.querySelector('.player-song-title');

    if (this.isPlaying) {
      playIcon.classList.add('hidden');
      pauseIcon.classList.remove('hidden');
    } else {
      playIcon.classList.remove('hidden');
      pauseIcon.classList.add('hidden');
    }

    if (this.playlist.length > 0) {
      titleDisplay.textContent = this.playlist[this.currentIndex].title;
    }
  }

  savePlaybackState() {
    localStorage.setItem('musicPlaybackState', JSON.stringify({
      currentIndex: this.currentIndex,
      currentTime: this.audio.currentTime,
      isPlaying: this.isPlaying,
      timestamp: Date.now()
    }));
  }

  savePlayerState() {
    localStorage.setItem('musicPlayerState', JSON.stringify({
      currentIndex: this.currentIndex,
      isShuffled: this.isShuffled,
      loopMode: this.loopMode,
      volume: this.audio.volume * 100
    }));
  }

  loadPlayerState() {
    const saved = localStorage.getItem('musicPlayerState');
    if (saved) {
      const state = JSON.parse(saved);
      this.currentIndex = state.currentIndex;
      this.isShuffled = state.isShuffled;
      this.loopMode = state.loopMode;
      this.audio.volume = state.volume / 100;

      document.getElementById('playerVolume').value = state.volume;
      document.getElementById('playerShuffle').classList.toggle('active', this.isShuffled);
      document.getElementById('playerLoop').classList.toggle('active', this.loopMode > 0);
      document.getElementById('playerLoop').dataset.mode = this.loopMode;
    }

    // Check if audio is already playing from previous page
    const isAudioAlreadyPlaying = this.audio.src && this.audio.currentTime >= 0 && !this.audio.paused;
    
    if (isAudioAlreadyPlaying) {
      // Audio is already playing - just sync UI and state
      this.isPlaying = true;
      this.updateUI();
      this.expand();
      return;
    }

    // Restore playback state if page was just changed
    const playbackState = localStorage.getItem('musicPlaybackState');
    if (playbackState) {
      const state = JSON.parse(playbackState);
      const timeSinceLastUpdate = Date.now() - state.timestamp;
      
      // If less than 20 seconds have passed, restore the state seamlessly
      if (timeSinceLastUpdate < 20000 && this.playlist.length > 0) {
        this.currentIndex = Math.min(state.currentIndex, this.playlist.length - 1);
        
        // Check if this is the same track that was playing
        if (this.audio.src === this.playlist[this.currentIndex].url && this.audio.duration > 0) {
          // Same track - restore time directly without changing source
          this.audio.currentTime = state.currentTime;
        } else {
          // Different track or first load - set source
          const track = this.playlist[this.currentIndex];
          this.audio.src = track.url;
          
          // Try to set time immediately (might not work until loaded)
          try {
            this.audio.currentTime = state.currentTime;
          } catch (e) {
            // Time might not be settable yet, will sync on loadedmetadata
          }
        }
        
        // Resume playback IMMEDIATELY if it was playing
        this.isPlaying = state.isPlaying;
        if (state.isPlaying) {
          // Resume immediately without delay
          this.audio.play().catch(err => {
            console.log('Autoplay failed (might need user interaction):', err);
            this.isPlaying = false;
          });
        }
        
        this.updateUI();
        this.expand();
      }
    }
  }
}

// Initialize player when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.musicPlayer = new MusicPlayer();
  });
} else {
  window.musicPlayer = new MusicPlayer();
}
