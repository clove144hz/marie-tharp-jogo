// ============================================================
// PARTÍCULAS DE FUNDO
// ============================================================
class ParticleSystem {
    constructor() {
        this.container = document.getElementById('particleContainer');
        this.particles = [];
        this.count = 20;
        this.init();
    }

    init() {
        for (let i = 0; i < this.count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.width = (2 + Math.random() * 4) + 'px';
            particle.style.height = particle.style.width;
            particle.style.animationDuration = (30 + Math.random() * 40) + 's';
            particle.style.animationDelay = (Math.random() * 30) + 's';
            particle.style.opacity = 0.1 + Math.random() * 0.2;
            this.container.appendChild(particle);
            this.particles.push(particle);
        }
    }
}

// ============================================================
// SISTEMA DE TOAST
// ============================================================
class ToastSystem {
    constructor() {
        this.container = document.getElementById('toastContainer');
        this.timeouts = [];
    }

    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: '💡'
        };

        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || '💡'}</span>
            <span>${message}</span>
            <button class="toast-close">×</button>
        `;

        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.remove(toast));

        this.container.appendChild(toast);

        const timeout = setTimeout(() => this.remove(toast), duration);
        this.timeouts.push(timeout);

        return toast;
    }

    remove(toast) {
        if (toast.parentNode) {
            toast.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }
    }

    clear() {
        this.timeouts.forEach(t => clearTimeout(t));
        this.timeouts = [];
        this.container.innerHTML = '';
    }
}

// ============================================================
// CLASSE DE ÁUDIO - COM SONS DE ONDAS
// ============================================================
class AudioManager {
    constructor() {
        this.enabled = true;
        this.ctx = null;
        this.waveGain = null;
        this.isWavePlaying = false;
        this.init();
    }

    init() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.startWaveSound();
        } catch (e) {
            this.enabled = false;
        }
    }

    startWaveSound() {
        if (!this.enabled || !this.ctx) return;
        
        try {
            const bufferSize = 2 * this.ctx.sampleRate;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                const wave = Math.sin(i * 0.005) * 0.5 + 0.5;
                const noise = (Math.random() * 2 - 1) * 0.1;
                data[i] = (noise + Math.sin(i * 0.003) * 0.05) * wave * 0.3;
            }
            
            const source = this.ctx.createBufferSource();
            source.buffer = buffer;
            source.loop = true;
            
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
            
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 400;
            filter.Q.value = 1;
            
            source.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            
            source.start();
            this.waveGain = gain;
            this.isWavePlaying = true;
        } catch (e) {
            // Silenciosamente falha
        }
    }

    play(type) {
        if (!this.enabled || !this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);

            switch (type) {
                case 'hit':
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.1);
                    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
                    osc.start(this.ctx.currentTime);
                    osc.stop(this.ctx.currentTime + 0.2);
                    break;
                case 'miss':
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.2);
                    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
                    osc.start(this.ctx.currentTime);
                    osc.stop(this.ctx.currentTime + 0.3);
                    break;
                case 'scan':
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(120 + Math.random() * 30, this.ctx.currentTime);
                    gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.005, this.ctx.currentTime + 0.08);
                    osc.start(this.ctx.currentTime);
                    osc.stop(this.ctx.currentTime + 0.08);
                    break;
                case 'newTarget':
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(523, this.ctx.currentTime);
                    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
                    osc.start(this.ctx.currentTime);
                    osc.stop(this.ctx.currentTime + 0.12);

                    setTimeout(() => {
                        const osc2 = this.ctx.createOscillator();
                        const gain2 = this.ctx.createGain();
                        osc2.connect(gain2);
                        gain2.connect(this.ctx.destination);
                        osc2.type = 'sine';
                        osc2.frequency.setValueAtTime(659, this.ctx.currentTime);
                        gain2.gain.setValueAtTime(0.12, this.ctx.currentTime);
                        gain2.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
                        osc2.start(this.ctx.currentTime);
                        osc2.stop(this.ctx.currentTime + 0.15);
                    }, 120);

                    setTimeout(() => {
                        const osc3 = this.ctx.createOscillator();
                        const gain3 = this.ctx.createGain();
                        osc3.connect(gain3);
                        gain3.connect(this.ctx.destination);
                        osc3.type = 'sine';
                        osc3.frequency.setValueAtTime(784, this.ctx.currentTime);
                        gain3.gain.setValueAtTime(0.12, this.ctx.currentTime);
                        gain3.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
                        osc3.start(this.ctx.currentTime);
                        osc3.stop(this.ctx.currentTime + 0.15);
                    }, 240);
                    break;
                case 'hint':
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
                    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
                    osc.start(this.ctx.currentTime);
                    osc.stop(this.ctx.currentTime + 0.08);

                    setTimeout(() => {
                        const osc2 = this.ctx.createOscillator();
                        const gain2 = this.ctx.createGain();
                        osc2.connect(gain2);
                        gain2.connect(this.ctx.destination);
                        osc2.type = 'sine';
                        osc2.frequency.setValueAtTime(554, this.ctx.currentTime);
                        gain2.gain.setValueAtTime(0.08, this.ctx.currentTime);
                        gain2.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
                        osc2.start(this.ctx.currentTime);
                        osc2.stop(this.ctx.currentTime + 0.08);
                    }, 100);
                    break;
                default:
                    break;
            }
        } catch (e) {
            // Silenciosamente falha
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

// ============================================================
// CLASSE DE SALVAMENTO
// ============================================================
class SaveManager {
    constructor() {
        this.key = 'marieTharpGameData';
    }

    save(gameState) {
        try {
            const data = {
                score: gameState.score,
                hits: gameState.hits,
                misses: gameState.misses,
                totalAttempts: gameState.totalAttempts,
                bestStreak: gameState.bestStreak,
                history: gameState.history.slice(-30),
                timestamp: Date.now()
            };
            localStorage.setItem(this.key, JSON.stringify(data));
        } catch (e) {
            // Ignorar erros de localStorage
        }
    }

    load() {
        try {
            const data = localStorage.getItem(this.key);
            if (data) {
                const parsed = JSON.parse(data);
                if (typeof parsed.score === 'number' &&
                    typeof parsed.hits === 'number' &&
                    typeof parsed.misses === 'number') {
                    return parsed;
                }
            }
        } catch (e) {
            // Ignorar
        }
        return null;
    }

    clear() {
        try {
            localStorage.removeItem(this.key);
        } catch (e) {
            // Ignorar
        }
    }
}

// ============================================================
// CLASSE PRINCIPAL DO JOGO
// ============================================================
class SonarGame {
    constructor() {
        // Canvas e contextos
        this.radarCanvas = document.getElementById('radarCanvas');
        this.radarCtx = this.radarCanvas.getContext('2d');
        this.mapCanvas = document.getElementById('mapCanvas');
        this.mapCtx = this.mapCanvas.getContext('2d');

        // Sistemas
        this.audio = new AudioManager();
        this.saveManager = new SaveManager();
        this.toast = new ToastSystem();
        this.particles = new ParticleSystem();

        // Estado do radar
        this.isScanning = false;
        this.angle = 0;
        this.scanSpeed = 1.2;
        this.animationId = null;
        this.hintActive = false;
        this.hintTimeout = null;
        this.isAnimating = false;
        this.scanSoundCounter = 0;

        // Dados do jogo
        this.target = null;
        this.playerMarks = [];
        this.score = 0;
        this.hits = 0;
        this.misses = 0;
        this.totalAttempts = 0;
        this.foundTarget = false;
        this.bestStreak = 0;
        this.currentStreak = 0;
        this.history = [];
        this.totalError = 0;
        this.startTime = Date.now();
        this.errorHistory = [];
        this.quadrantErrors = { NE: 0, NW: 0, SE: 0, SW: 0 };
        
        // Controle de fade do alvo (apenas no radar)
        this.targetFade = 1;
        this.targetFadeDirection = -1;
        this.targetFadeSpeed = 0.008;

        // Prévia
        this.previewX = null;
        this.previewY = null;

        // Dificuldade
        this.difficulty = 'easy';
        this.difficultySettings = {
            easy: { hitRadius: 30, pointsMultiplier: 1, hintTime: 4000, label: 'Fácil' },
            medium: { hitRadius: 20, pointsMultiplier: 1.5, hintTime: 3000, label: 'Médio' },
            hard: { hitRadius: 12, pointsMultiplier: 2, hintTime: 2000, label: 'Difícil' }
        };

        // Dimensões
        this.mapWidth = 700;
        this.mapHeight = 700;
        this.centerX = 350;
        this.centerY = 350;
        this.maxDepth = 600;
        this.margin = 40;
        this.scaleFactor = 1;

        // Carregar dados salvos
        this.loadSavedData();

        // Inicialização
        this.setupEventListeners();
        this.generateNewTarget();
        this.drawRadar();
        this.drawMap();
        this.updateStats();

        this.showMessage('radar', '💡 Use os dados do sonar para mapear o ponto no mapa!', 'info');
        this.showMessage('map', '🔍 Converta (θ, r) → (X, Y) e clique no mapa ou digite os valores!', 'info');

        this.startAnimationLoop();
    }

    // ===== CARREGAR DADOS SALVOS =====
    loadSavedData() {
        const saved = this.saveManager.load();
        if (saved) {
            this.score = saved.score || 0;
            this.hits = saved.hits || 0;
            this.misses = saved.misses || 0;
            this.totalAttempts = saved.totalAttempts || 0;
            this.bestStreak = saved.bestStreak || 0;
            if (saved.history && Array.isArray(saved.history)) {
                this.history = saved.history;
            }
            if (this.history.length > 0) {
                this.toast.show(`Dados carregados: ${this.history.length} mapeamentos`, 'info', 2000);
            }
        }
    }

    // ===== EVENTOS =====
    setupEventListeners() {
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        const newTargetBtn = document.getElementById('newTargetBtn');
        const hintBtn = document.getElementById('hintBtn');
        const tutorialBtn = document.getElementById('tutorialBtn');
        const resetBtn = document.getElementById('resetStatsBtn');
        const previewBtn = document.getElementById('previewBtn');
        const confirmBtn = document.getElementById('confirmCoordBtn');
        const coordX = document.getElementById('coordX');
        const coordY = document.getElementById('coordY');

        const calcBtn = document.getElementById('calcBtn');
        const calcFillBtn = document.getElementById('calcFillBtn');
        const calcClearBtn = document.getElementById('calcClearBtn');
        const calcAngle = document.getElementById('calcAngle');
        const calcDepth = document.getElementById('calcDepth');

        startBtn.addEventListener('click', () => this.startScan());
        stopBtn.addEventListener('click', () => this.stopScan());
        newTargetBtn.addEventListener('click', () => this.generateNewTarget());
        hintBtn.addEventListener('click', () => this.showHint());
        tutorialBtn.addEventListener('click', () => this.showTutorial());
        resetBtn.addEventListener('click', () => this.resetStats());
        previewBtn.addEventListener('click', () => this.showPreview());
        confirmBtn.addEventListener('click', () => this.confirmCoordinates());

        calcBtn.addEventListener('click', () => this.calculate());
        calcFillBtn.addEventListener('click', () => this.fillCalculatorData());
        calcClearBtn.addEventListener('click', () => this.clearCalculator());

        coordX.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (coordX.value && coordY.value) {
                    this.confirmCoordinates();
                } else {
                    this.showPreview();
                }
            }
        });
        coordY.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (coordX.value && coordY.value) {
                    this.confirmCoordinates();
                } else {
                    this.showPreview();
                }
            }
        });

        calcAngle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.calculate();
        });
        calcDepth.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.calculate();
        });

        coordX.addEventListener('input', () => this.updatePreviewText());
        coordY.addEventListener('input', () => this.updatePreviewText());

        document.querySelectorAll('.difficulty-badge').forEach(el => {
            el.addEventListener('click', () => {
                document.querySelectorAll('.difficulty-badge').forEach(b => b.classList.remove('active'));
                el.classList.add('active');
                this.difficulty = el.dataset.difficulty;
                const settings = this.difficultySettings[this.difficulty];
                this.toast.show(`Dificuldade: ${settings.label}`, 'info', 1500);
                this.showMessage('radar', `📊 Dificuldade: ${settings.label}`, 'info');
            });
        });

        this.mapCanvas.addEventListener('click', (e) => this.handleMapClick(e));
        this.mapCanvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.mapCanvas.getBoundingClientRect();
            const clickEvent = new MouseEvent('click', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.handleMapClick(clickEvent);
        });

        window.addEventListener('resize', () => {
            this.drawRadar();
            this.drawMap();
        });

        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (e.key === ' ' || e.key === 'Space') {
                e.preventDefault();
                if (this.isScanning) this.stopScan();
                else this.startScan();
            }
            if (e.key === 'n' || e.key === 'N') {
                e.preventDefault();
                this.generateNewTarget();
            }
            if (e.key === 'h' || e.key === 'H') {
                e.preventDefault();
                this.showHint();
            }
            if (e.key === 't' || e.key === 'T') {
                e.preventDefault();
                this.showTutorial();
            }
            if (e.key === 'r' || e.key === 'R') {
                e.preventDefault();
                this.resetStats();
            }
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.confirmCoordinates();
            }
        });

        document.getElementById('tutorialPrevBtn').addEventListener('click', () => this.tutorialPrev());
        document.getElementById('tutorialNextBtn').addEventListener('click', () => this.tutorialNext());
        document.getElementById('tutorialCloseBtn').addEventListener('click', () => this.closeTutorial());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeTutorial();
            }
        });

        document.getElementById('tutorialOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeTutorial();
            }
        });
    }

    // ===== CALCULADORA =====
    calculate() {
        const angleInput = document.getElementById('calcAngle');
        const depthInput = document.getElementById('calcDepth');
        
        let angle = parseFloat(angleInput.value);
        let depth = parseFloat(depthInput.value);

        if (isNaN(angle) || isNaN(depth)) {
            this.toast.show('⚠️ Preencha o ângulo e a profundidade!', 'warning', 1500);
            return;
        }

        const angleRad = (90 - angle) * Math.PI / 180;
        const sinVal = Math.sin(angleRad);
        const cosVal = Math.cos(angleRad);
        const tanVal = Math.tan(angleRad);

        const X = depth * cosVal;
        const Y = depth * sinVal;

        document.getElementById('calcRadians').textContent = angleRad.toFixed(6);
        document.getElementById('calcRadians').className = 'result highlight';
        
        document.getElementById('calcSin').textContent = sinVal.toFixed(6);
        document.getElementById('calcSin').className = 'result highlight';
        
        document.getElementById('calcCos').textContent = cosVal.toFixed(6);
        document.getElementById('calcCos').className = 'result highlight';
        
        document.getElementById('calcTan').textContent = tanVal.toFixed(6);
        document.getElementById('calcTan').className = 'result highlight';

        const resultDiv = document.getElementById('calcResult');
        resultDiv.innerHTML = `
            📍 Resultado: <span class="highlight-green">X = ${X.toFixed(1)}m</span> , 
            <span class="highlight-green">Y = ${Y.toFixed(1)}m</span>
            <span style="opacity:0.5; margin-left:10px; font-size:0.8rem;">
                (Arredondado: X = ${Math.round(X)}, Y = ${Math.round(Y)})
            </span>
            <br>
            <span style="font-size:0.7rem; opacity:0.5;">
                sen(${angle}°) = ${sinVal.toFixed(6)} | cos(${angle}°) = ${cosVal.toFixed(6)} | tan(${angle}°) = ${tanVal.toFixed(6)}
            </span>
        `;

        document.getElementById('coordX').value = Math.round(X);
        document.getElementById('coordY').value = Math.round(Y);
        this.updatePreviewText();

        this.toast.show(`✅ Cálculo concluído! X = ${Math.round(X)}, Y = ${Math.round(Y)}`, 'success', 2000);
    }

    fillCalculatorData() {
        const angleDisplay = document.getElementById('polarAngleDisplay');
        const depthDisplay = document.getElementById('polarDepthDisplay');
        
        const angleText = angleDisplay.textContent.replace('°', '');
        const depthText = depthDisplay.textContent.replace('m', '');
        
        if (angleText === '--' || depthText === '--') {
            this.toast.show('⚠️ Nenhum dado do sonar disponível!', 'warning', 1500);
            return;
        }

        document.getElementById('calcAngle').value = parseFloat(angleText);
        document.getElementById('calcDepth').value = parseFloat(depthText);
        
        this.toast.show('📥 Dados do sonar preenchidos!', 'info', 1500);
        this.calculate();
    }

    clearCalculator() {
        document.getElementById('calcAngle').value = '';
        document.getElementById('calcDepth').value = '';
        document.getElementById('calcRadians').textContent = '--';
        document.getElementById('calcRadians').className = 'result';
        document.getElementById('calcSin').textContent = '--';
        document.getElementById('calcSin').className = 'result';
        document.getElementById('calcCos').textContent = '--';
        document.getElementById('calcCos').className = 'result';
        document.getElementById('calcTan').textContent = '--';
        document.getElementById('calcTan').className = 'result';
        document.getElementById('calcResult').innerHTML = `
            📍 Resultado: <span class="highlight">X = --</span> , <span class="highlight">Y = --</span>
            <span style="opacity:0.5; margin-left:10px; font-size:0.8rem;">
                (Clique em "Preencher Dados" para usar os valores do sonar)
            </span>
        `;
        this.toast.show('🧹 Calculadora limpa!', 'info', 1000);
    }

    // ===== PRÉVIA =====
    updatePreviewText() {
        const x = document.getElementById('coordX').value;
        const y = document.getElementById('coordY').value;
        const previewText = document.getElementById('previewCoords');
        if (x && y) {
            previewText.textContent = `📍 (${x}, ${y})`;
            previewText.style.color = '#ffd93d';
        } else {
            previewText.textContent = '📍 (-- , --)';
            previewText.style.color = '';
        }
    }

    showPreview() {
        const xInput = document.getElementById('coordX');
        const yInput = document.getElementById('coordY');
        const x = parseFloat(xInput.value);
        const y = parseFloat(yInput.value);

        if (isNaN(x) || isNaN(y)) {
            this.toast.show('⚠️ Digite valores válidos para X e Y!', 'warning', 1500);
            return;
        }

        const maxCoord = 300;
        if (Math.abs(x) > maxCoord || Math.abs(y) > maxCoord) {
            this.toast.show(`⚠️ Os valores devem estar entre -${maxCoord} e ${maxCoord} metros`, 'warning', 1500);
            return;
        }

        this.previewX = x;
        this.previewY = y;
        
        const previewText = document.getElementById('previewCoords');
        previewText.textContent = `📍 (${x}, ${y})`;
        previewText.style.color = '#ff6bff';

        this.drawMap();
        this.toast.show(`👁️ Prévia: X = ${x}m, Y = ${y}m`, 'info', 1500);
    }

    confirmCoordinates() {
        const xInput = document.getElementById('coordX');
        const yInput = document.getElementById('coordY');
        const x = parseFloat(xInput.value);
        const y = parseFloat(yInput.value);

        if (isNaN(x) || isNaN(y)) {
            this.toast.show('⚠️ Digite valores válidos para X e Y!', 'warning', 1500);
            return;
        }

        if (!this.target || this.foundTarget) {
            this.toast.show('⚠️ Gere uma nova leitura do sonar primeiro!', 'warning', 1500);
            this.showMessage('map', '⚠️ Gere uma nova leitura do sonar primeiro!', 'warning');
            return;
        }

        const pixelX = this.centerX + x * this.scaleFactor;
        const pixelY = this.centerY - y * this.scaleFactor;

        if (pixelX < this.margin || pixelX > this.mapWidth - this.margin ||
            pixelY < this.margin || pixelY > this.mapHeight - this.margin) {
            this.toast.show(`⚠️ O ponto (${x}, ${y}) está fora do mapa!`, 'warning', 1500);
            return;
        }

        const rect = this.mapCanvas.getBoundingClientRect();
        const scaleX = this.mapCanvas.width / rect.width;
        const scaleY = this.mapCanvas.height / rect.height;
        
        const clientX = rect.left + (pixelX / scaleX);
        const clientY = rect.top + (pixelY / scaleY);

        const clickEvent = new MouseEvent('click', {
            clientX: clientX,
            clientY: clientY
        });

        this.previewX = null;
        this.previewY = null;
        document.getElementById('previewCoords').textContent = '📍 (-- , --)';
        document.getElementById('previewCoords').style.color = '';

        this.handleMapClick(clickEvent);
    }

    // ===== ANIMAÇÃO LOOP =====
    startAnimationLoop() {
        if (this.isAnimating) return;
        this.isAnimating = true;

        const loop = () => {
            // Atualizar fade do alvo APENAS no radar
            if (this.target && !this.foundTarget) {
                this.targetFade += this.targetFadeDirection * this.targetFadeSpeed;
                if (this.targetFade <= 0.2) {
                    this.targetFade = 0.2;
                    this.targetFadeDirection = 1;
                } else if (this.targetFade >= 1) {
                    this.targetFade = 1;
                    this.targetFadeDirection = -1;
                }
            }

            // Verificar se deve tocar som do scan (a cada ~5 segundos)
            if (this.isScanning) {
                this.scanSoundCounter += 1;
                if (this.scanSoundCounter >= 300) {
                    this.scanSoundCounter = 0;
                    this.audio.play('scan');
                }
            } else {
                this.scanSoundCounter = 0;
            }

            if (this.isScanning || this.foundTarget || this.target) {
                this.drawRadar();
                this.drawMap();
            }
            if (this.isAnimating) {
                requestAnimationFrame(loop);
            }
        };
        requestAnimationFrame(loop);
    }

    // ===== GERAÇÃO DO ALVO =====
    generateDepth(angle) {
        const baseDepth = 200;
        const dorsal = 150 * Math.exp(-Math.pow((angle - 180), 2) / 1600);
        const montanhas = 60 * Math.sin(angle * 0.035) * Math.cos(angle * 0.02);
        const ruido = (Math.random() - 0.5) * 60;
        const fossa = 100 * Math.exp(-Math.pow((angle - 350), 2) / 350) +
            100 * Math.exp(-Math.pow((angle - 10), 2) / 350);

        let profundidade = baseDepth - dorsal + montanhas + ruido + fossa;
        profundidade = Math.max(profundidade, 30);
        profundidade = Math.min(profundidade, this.maxDepth);

        if (Math.random() < 0.08) {
            profundidade += (Math.random() - 0.5) * 120;
        }

        return Math.round(profundidade * 10) / 10;
    }

    generateNewTarget() {
        if (this.hintTimeout) {
            clearTimeout(this.hintTimeout);
            this.hintTimeout = null;
        }
        this.hintActive = false;
        this.previewX = null;
        this.previewY = null;
        document.getElementById('previewCoords').textContent = '📍 (-- , --)';
        document.getElementById('previewCoords').style.color = '';

        this.target = null;
        this.foundTarget = false;
        this.playerMarks = [];

        let attempts = 0;
        let x, y, angle, depth;

        do {
            angle = Math.random() * 360;
            depth = this.generateDepth(angle);

            const angleRad = (90 - angle) * Math.PI / 180;
            
            const xMeters = depth * Math.cos(angleRad);
            const yMeters = depth * Math.sin(angleRad);
            
            x = this.centerX + xMeters * this.scaleFactor;
            y = this.centerY - yMeters * this.scaleFactor;
            
            attempts++;
        } while ((x < this.margin || x > this.mapWidth - this.margin ||
                y < this.margin || y > this.mapHeight - this.margin) && attempts < 50);

        x = Math.max(this.margin, Math.min(this.mapWidth - this.margin, x));
        y = Math.max(this.margin, Math.min(this.mapHeight - this.margin, y));

        this.target = {
            x: x,
            y: y,
            angle: angle,
            depth: depth,
            xMeters: Math.round((x - this.centerX) / this.scaleFactor),
            yMeters: Math.round((this.centerY - y) / this.scaleFactor)
        };

        this.targetFade = 1;
        this.targetFadeDirection = -1;

        const angleDisplay = document.getElementById('polarAngleDisplay');
        const depthDisplay = document.getElementById('polarDepthDisplay');
        angleDisplay.textContent = `${Math.round(angle)}°`;
        depthDisplay.textContent = `${depth}m`;
        angleDisplay.className = 'highlight-num new';
        depthDisplay.className = 'highlight-num new';
        setTimeout(() => {
            angleDisplay.className = 'highlight-num';
            depthDisplay.className = 'highlight-num';
        }, 500);

        this.showMessage('radar', `🌊 Nova leitura! θ = ${Math.round(angle)}°, r = ${depth}m`, 'info');
        this.showMessage('map', `🔍 Converta (θ, r) → (X, Y) e clique no mapa ou digite os valores!`, 'info');

        document.getElementById('angleText').textContent = `${Math.round(angle)}°`;
        document.getElementById('depthText').textContent = `${depth}m`;

        this.audio.play('newTarget');

        this.drawRadar();
        this.drawMap();

        this.toast.show(`🌊 Nova leitura do sonar! θ=${Math.round(angle)}° r=${depth}m`, 'info', 2000);
    }

    // ===== CONTROLE DO RADAR =====
    startScan() {
        if (!this.isScanning) {
            this.isScanning = true;
            this.scanSoundCounter = 0;
            document.getElementById('startBtn').disabled = true;
            document.getElementById('stopBtn').disabled = false;
            document.getElementById('statusText').textContent = '🔴 Varrendo...';
            document.getElementById('statusText').className = 'scanning';
            document.getElementById('radarCanvas').classList.add('scanning');
            this.toast.show('📡 Sonar iniciado', 'info', 1000);
            this.scan();
        }
    }

    stopScan() {
        this.isScanning = false;
        this.scanSoundCounter = 0;
        document.getElementById('startBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
        document.getElementById('statusText').textContent = '⏸ Pausado';
        document.getElementById('statusText').className = '';
        document.getElementById('radarCanvas').classList.remove('scanning');

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    scan() {
        if (!this.isScanning) return;

        const depth = this.generateDepth(this.angle);

        document.getElementById('angleText').textContent = `${Math.round(this.angle)}°`;
        document.getElementById('depthText').textContent = `${depth}m`;

        this.drawRadar();

        this.angle = (this.angle + this.scanSpeed) % 360;
        this.animationId = requestAnimationFrame(() => this.scan());
    }

    // ===== CLIQUE NO PLANO =====
    handleMapClick(e) {
        if (!this.target || this.foundTarget) {
            this.toast.show('⚠️ Gere uma nova leitura do sonar primeiro!', 'warning', 1500);
            this.showMessage('map', '⚠️ Gere uma nova leitura do sonar primeiro!', 'warning');
            return;
        }

        const rect = this.mapCanvas.getBoundingClientRect();
        const scaleX = this.mapCanvas.width / rect.width;
        const scaleY = this.mapCanvas.height / rect.height;

        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;

        if (mouseX < 0 || mouseX > this.mapWidth || mouseY < 0 || mouseY > this.mapHeight) {
            this.toast.show('⚠️ Clique dentro do mapa!', 'warning', 1000);
            this.showMessage('map', '⚠️ Clique dentro do mapa!', 'warning');
            return;
        }

        this.submitMark(mouseX, mouseY);
    }

    submitMark(mouseX, mouseY) {
        if (!this.target || this.foundTarget) return;

        const targetDx = mouseX - this.target.x;
        const targetDy = mouseY - this.target.y;
        const distance = Math.sqrt(targetDx * targetDx + targetDy * targetDy);

        const settings = this.difficultySettings[this.difficulty];
        const isHit = distance < settings.hitRadius;
        const type = isHit ? 'hit' : 'miss';

        const estimatedX = Math.round((mouseX - this.centerX) / this.scaleFactor);
        const estimatedY = Math.round((this.centerY - mouseY) / this.scaleFactor);

        this.playerMarks.push({
            x: mouseX,
            y: mouseY,
            type: type,
            distance: distance,
            estimatedX: estimatedX,
            estimatedY: estimatedY
        });

        this.totalAttempts++;
        this.totalError += distance;
        this.errorHistory.push(distance);

        const dx = mouseX - this.centerX;
        const dy = mouseY - this.centerY;
        if (dx >= 0 && dy < 0) this.quadrantErrors.NE++;
        else if (dx < 0 && dy < 0) this.quadrantErrors.NW++;
        else if (dx >= 0 && dy >= 0) this.quadrantErrors.SE++;
        else if (dx < 0 && dy >= 0) this.quadrantErrors.SW++;

        this.history.push({
            type: type,
            distance: Math.round(distance),
            angle: Math.round(this.target.angle),
            depth: Math.round(this.target.depth),
            estimatedX: estimatedX,
            estimatedY: estimatedY,
            correctX: this.target.xMeters,
            correctY: this.target.yMeters,
            timestamp: Date.now()
        });

        if (this.history.length > 50) {
            this.history.shift();
        }

        if (isHit) {
            this.hits++;
            this.currentStreak++;
            if (this.currentStreak > this.bestStreak) {
                this.bestStreak = this.currentStreak;
            }
            const basePoints = Math.max(150 - Math.floor(distance * 3), 10);
            const points = Math.round(basePoints * settings.pointsMultiplier);
            this.score += points;
            this.foundTarget = true;
            this.showMessage('map', `🎉 ACERTOU! Distância: ${Math.round(distance)}px. +${points} pontos!`,
                'success');
            this.showMessage('radar', `✅ Ponto mapeado! Use "Nova Leitura" para continuar.`, 'success');
            this.audio.play('hit');
            this.toast.show(`🎉 Acertou o ponto submarino! +${points} pontos!`, 'success', 2000);
        } else {
            this.misses++;
            this.currentStreak = 0;
            this.showMessage('map', `❌ Errou! Distância: ${Math.round(distance)}px. Tente novamente!`, 'fail');
            this.showMessage('radar', `🔄 Continue tentando! θ = ${Math.round(this.target.angle)}°, r = ${Math.round(this.target.depth)}m`,
                'info');
            this.audio.play('miss');
            this.toast.show(`❌ Errou! Distância: ${Math.round(distance)}px`, 'error', 1500);
        }

        this.updateStats();
        this.saveManager.save(this);
        
        this.previewX = null;
        this.previewY = null;
        document.getElementById('previewCoords').textContent = '📍 (-- , --)';
        document.getElementById('previewCoords').style.color = '';
        document.getElementById('coordX').value = '';
        document.getElementById('coordY').value = '';
        
        this.drawMap();
    }

    // ===== DICA =====
    showHint() {
        if (!this.target || this.foundTarget) {
            this.toast.show('⚠️ Gere uma nova leitura do sonar primeiro!', 'warning', 1500);
            this.showMessage('radar', '⚠️ Gere uma nova leitura do sonar primeiro!', 'warning');
            return;
        }

        this.hintActive = true;

        const x = this.target.xMeters;
        const y = this.target.yMeters;

        this.showMessage('map', `💡 Dica: X = ${x}m, Y = ${y}m`, 'info');
        this.showMessage('radar', `💡 Dica: θ = ${Math.round(this.target.angle)}°, r = ${Math.round(this.target.depth)}m`,
            'info');

        this.audio.play('hint');
        this.toast.show(`💡 Dica: X = ${x}m, Y = ${y}m`, 'info', 2000);

        this.drawMap(true);

        const settings = this.difficultySettings[this.difficulty];
        if (this.hintTimeout) clearTimeout(this.hintTimeout);
        this.hintTimeout = setTimeout(() => {
            this.hintActive = false;
            this.showMessage('map', '🔍 Continue mapeando!', 'info');
            this.drawMap();
        }, settings.hintTime);
    }

    // ===== TUTORIAL =====
    showTutorial() {
        const overlay = document.getElementById('tutorialOverlay');
        overlay.classList.add('active');
        this.tutorialStep = 0;
        this.tutorialSteps = [{
            text: 'Bem-vindo ao Mapeamento Oceânico de Marie Tharp! 🗺️<br>Você vai aprender a converter dados de sonar (θ, r) em coordenadas cartesianas (X, Y).',
            highlight: 'Marie Tharp revolucionou a ciência ao mapear o fundo do oceano usando essa técnica!'
        }, {
            text: '📡 No sonar à esquerda, você vê um ponto submarino representado por um ponto vermelho.<br>Ele possui:',
            highlight: '• Ângulo (θ): direção do sonar em graus<br>• Profundidade (r): distância em metros<br>⭐ SEMPRE use os valores do cabeçalho com a estrela!'
        }, {
            text: '📐 Agora você precisa converter para coordenadas cartesianas usando as fórmulas:',
            highlight: 'X = r × cos(θ)<br>Y = r × sin(θ)<br><br>💡 Dica: θ deve estar em radianos para o cálculo!<br>⚠️ Lembre-se: 0° é o norte (topo do radar)!'
        }, {
            text: '📍 Use a calculadora abaixo do mapa para fazer a conversão automaticamente!<br>Basta preencher os dados e clicar em "Calcular".',
            highlight: '🧮 A calculadora faz toda a matemática para você!'
        }, {
            text: '🎮 Dicas finais:<br>• Use o botão "Iniciar" para o sonar varrer<br>• "Nova Leitura" gera um novo ponto<br>• "Dica" mostra as coordenadas X, Y<br>• Atalhos: Espaço (iniciar/parar), N (nova), H (dica), T (tutorial)',
            highlight: '🌟 Pratique como Marie Tharp e domine o mapeamento oceânico!'
        }];
        this.updateTutorial();
    }

    tutorialNext() {
        if (this.tutorialStep < this.tutorialSteps.length - 1) {
            this.tutorialStep++;
            this.updateTutorial();
            this.audio.play('scan');
        }
    }

    tutorialPrev() {
        if (this.tutorialStep > 0) {
            this.tutorialStep--;
            this.updateTutorial();
        }
    }

    updateTutorial() {
        const step = this.tutorialSteps[this.tutorialStep];
        document.getElementById('stepText').innerHTML = step.text;
        document.getElementById('stepHighlight').innerHTML = step.highlight;
        document.getElementById('stepCounter').textContent = `Passo ${this.tutorialStep + 1} de ${this.tutorialSteps.length}`;
        document.getElementById('tutorialPrevBtn').disabled = this.tutorialStep === 0;
        document.getElementById('tutorialNextBtn').textContent =
            this.tutorialStep === this.tutorialSteps.length - 1 ? '✅ Concluir' : 'Próximo ➡';
    }

    closeTutorial() {
        document.getElementById('tutorialOverlay').classList.remove('active');
    }

    // ===== ESTATÍSTICAS =====
    updateStats() {
        document.getElementById('scoreText').textContent = this.score;
        document.getElementById('hitsText').textContent = this.hits;
        document.getElementById('missesText').textContent = this.misses;

        const accuracy = this.totalAttempts > 0 ?
            Math.round((this.hits / this.totalAttempts) * 100) : 0;
        document.getElementById('accuracyText').textContent = `${accuracy}%`;

        document.getElementById('bestStreakText').textContent = this.bestStreak;
        document.getElementById('totalAttemptsText').textContent = this.totalAttempts;

        const elapsedMinutes = (Date.now() - this.startTime) / 60000;
        const ppm = elapsedMinutes > 0 ? Math.round(this.score / elapsedMinutes) : 0;
        document.getElementById('ppmText').textContent = ppm;

        const avgError = this.totalAttempts > 0 ? Math.round(this.totalError / this.totalAttempts) : 0;
        document.getElementById('avgErrorText').textContent = `${avgError}px`;

        this.updateWeaknessAnalysis();
        this.updateHistory();
    }

    updateWeaknessAnalysis() {
        const display = document.getElementById('weaknessDisplay');
        const totalErrors = this.quadrantErrors.NE + this.quadrantErrors.NW +
            this.quadrantErrors.SE + this.quadrantErrors.SW;

        if (this.history.length < 3) {
            display.innerHTML = '💡 Faça mais mapeamentos para identificar seus padrões de erro';
            return;
        }

        const misses = this.history.filter(h => h.type === 'miss');

        if (misses.length === 0) {
            display.innerHTML = '🌟 Você está arrasando como Marie Tharp! Nenhum erro registrado!';
            return;
        }

        const quadrants = {
            'NE': this.quadrantErrors.NE,
            'NW': this.quadrantErrors.NW,
            'SE': this.quadrantErrors.SE,
            'SW': this.quadrantErrors.SW
        };

        let maxQuadrant = 'NE';
        let maxValue = 0;
        for (const [key, value] of Object.entries(quadrants)) {
            if (value > maxValue) {
                maxValue = value;
                maxQuadrant = key;
            }
        }

        const messages = {
            'NE': '💡 Seus erros estão concentrados no quadrante superior direito (X positivo, Y positivo)',
            'NW': '💡 Seus erros estão concentrados no quadrante superior esquerdo (X negativo, Y positivo)',
            'SE': '💡 Seus erros estão concentrados no quadrante inferior direito (X positivo, Y negativo)',
            'SW': '💡 Seus erros estão concentrados no quadrante inferior esquerdo (X negativo, Y negativo)'
        };

        if (maxValue > 0 && totalErrors > 3) {
            display.innerHTML = messages[maxQuadrant] +
                `<br><small style="opacity:0.5;">${maxValue} erros neste quadrante de ${totalErrors} totais</small>`;
        } else {
            display.innerHTML = '💡 Seus erros estão distribuídos uniformemente pelos quadrantes';
        }
    }

    updateHistory() {
        const container = document.getElementById('historyContainer');
        if (this.history.length === 0) {
            container.innerHTML = `<div class="history-empty">📝 Nenhum mapeamento registrado ainda</div>`;
            return;
        }

        let html = '';
        const recent = this.history.slice(-10).reverse();
        for (const item of recent) {
            const typeClass = item.type === 'hit' ? 'hit-text' : 'miss-text';
            const emoji = item.type === 'hit' ? '✅' : '❌';
            const time = new Date(item.timestamp);
            const timeStr = time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            html += `
                <div class="history-item">
                    <span>${emoji} ${item.type === 'hit' ? 'Acertou' : 'Errou'}</span>
                    <span class="${typeClass}">${item.distance}px</span>
                    <span class="distance-text">θ=${item.angle}° r=${item.depth}m</span>
                    <span class="time-text">${timeStr}</span>
                </div>
            `;
        }
        container.innerHTML = html;
        container.scrollTop = 0;
    }

    resetStats() {
        if (confirm('Tem certeza que deseja resetar todas as estatísticas?')) {
            this.score = 0;
            this.hits = 0;
            this.misses = 0;
            this.totalAttempts = 0;
            this.bestStreak = 0;
            this.currentStreak = 0;
            this.history = [];
            this.totalError = 0;
            this.errorHistory = [];
            this.quadrantErrors = { NE: 0, NW: 0, SE: 0, SW: 0 };
            this.startTime = Date.now();
            this.saveManager.clear();
            this.updateStats();
            this.showMessage('radar', '🔄 Estatísticas resetadas!', 'info');
            this.toast.show('🔄 Estatísticas resetadas', 'info', 1500);
            this.drawMap();
        }
    }

    // ===== MENSAGENS =====
    showMessage(target, text, type = 'info') {
        const element = document.getElementById(target === 'radar' ? 'radarMessage' : 'mapMessage');
        element.innerHTML = text;
        element.className = `message ${type}`;
        element.classList.add('pop');
        setTimeout(() => element.classList.remove('pop'), 300);
    }

    // ===== DESENHO DO RADAR =====
    drawRadar() {
        const ctx = this.radarCtx;
        const W = this.radarCanvas.width;
        const H = this.radarCanvas.height;
        const cx = this.centerX;
        const cy = this.centerY;
        const radius = 300;

        ctx.clearRect(0, 0, W, H);

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        gradient.addColorStop(0, 'rgba(10, 30, 60, 0.9)');
        gradient.addColorStop(0.5, 'rgba(5, 20, 40, 0.95)');
        gradient.addColorStop(1, 'rgba(0, 10, 30, 1)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);

        const depthSteps = 6;
        for (let i = 1; i <= depthSteps; i++) {
            const r = (i / depthSteps) * radius;
            const depthLabel = Math.round((i / depthSteps) * this.maxDepth);

            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(79, 195, 255, 0.12)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.fillStyle = 'rgba(79, 195, 255, 0.3)';
            ctx.font = '11px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${depthLabel}m`, cx + r + 8, cy);
        }

        for (let a = 0; a < 360; a += 30) {
            const angleRad = (90 - a) * Math.PI / 180;
            
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + radius * Math.cos(angleRad), cy + radius * Math.sin(angleRad));
            ctx.strokeStyle = 'rgba(79, 195, 255, 0.07)';
            ctx.lineWidth = 1;
            ctx.stroke();

            const labelR = radius + 22;
            ctx.fillStyle = 'rgba(79, 195, 255, 0.3)';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${a}°`, cx + labelR * Math.cos(angleRad), cy + labelR * Math.sin(angleRad));

            if (a % 90 === 0) {
                ctx.beginPath();
                ctx.arc(cx + radius * Math.cos(angleRad), cy + radius * Math.sin(angleRad), 4, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(79, 195, 255, 0.2)';
                ctx.fill();
                
                const labelMap = {0: 'N', 90: 'E', 180: 'S', 270: 'W'};
                ctx.fillStyle = 'rgba(79, 195, 255, 0.4)';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const labelR2 = radius + 38;
                ctx.fillText(labelMap[a] || '', cx + labelR2 * Math.cos(angleRad), cy + labelR2 * Math.sin(angleRad));
            }
        }

        const centerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 20);
        centerGlow.addColorStop(0, 'rgba(79, 195, 255, 0.6)');
        centerGlow.addColorStop(0.5, 'rgba(79, 195, 255, 0.1)');
        centerGlow.addColorStop(1, 'rgba(79, 195, 255, 0)');
        ctx.fillStyle = centerGlow;
        ctx.beginPath();
        ctx.arc(cx, cy, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#4fc3ff';
        ctx.fill();
        ctx.strokeStyle = 'rgba(79, 195, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (this.isScanning) {
            const angleRad = (90 - this.angle) * Math.PI / 180;
            const endX = cx + radius * Math.cos(angleRad);
            const endY = cy + radius * Math.sin(angleRad);

            ctx.shadowColor = 'rgba(0, 255, 100, 0.3)';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = 'rgba(0, 255, 100, 0.7)';
            ctx.lineWidth = 2.5;
            ctx.stroke();
            ctx.shadowBlur = 0;

            ctx.beginPath();
            const spread = 4 * Math.PI / 180;
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, angleRad - spread, angleRad + spread);
            ctx.closePath();
            ctx.fillStyle = `rgba(0, 255, 100, ${0.04 + 0.03 * Math.sin(Date.now() / 500)})`;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(endX, endY, 4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 255, 100, 0.8)';
            ctx.fill();
        }

        // Alvo com efeito de fade APENAS no radar
        if (this.target && !this.foundTarget) {
            const scale = radius / this.maxDepth;
            const distance = this.target.depth * scale;
            const angleRad = (90 - this.target.angle) * Math.PI / 180;
            const tx = cx + distance * Math.cos(angleRad);
            const ty = cy + distance * Math.sin(angleRad);

            const pulse = 1 + 0.15 * Math.sin(Date.now() / 400);
            const fade = this.targetFade;

            const glow = ctx.createRadialGradient(tx, ty, 0, tx, ty, 25 * pulse);
            glow.addColorStop(0, `rgba(255, 0, 0, ${0.6 * fade})`);
            glow.addColorStop(0.5, `rgba(255, 0, 0, ${0.2 * fade})`);
            glow.addColorStop(1, `rgba(255, 0, 0, 0)`);
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(tx, ty, 25 * pulse, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(tx, ty, 18 * pulse, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 0, 0, ${(0.3 + 0.15 * Math.sin(Date.now() / 300)) * fade})`;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.beginPath();
            ctx.arc(tx, ty, 7 * pulse, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 0, 0, ${fade})`;
            ctx.fill();
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 * fade})`;
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = `rgba(255, 200, 50, ${0.6 * fade})`;
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(`θ = ${Math.round(this.target.angle)}°`, tx, ty - 20);

            ctx.textBaseline = 'top';
            ctx.fillText(`r = ${Math.round(this.target.depth)}m`, tx, ty + 20);

            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(tx, ty);
            ctx.strokeStyle = `rgba(255, 200, 50, ${0.1 * fade})`;
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillStyle = 'rgba(79, 195, 255, 0.5)';
        ctx.font = '11px Arial';
        ctx.fillText('Profundidade (m)', 12, 12);

        const legendGrad = ctx.createLinearGradient(12, 35, 12, 115);
        legendGrad.addColorStop(0, '#0000ff');
        legendGrad.addColorStop(0.25, '#00ffff');
        legendGrad.addColorStop(0.5, '#ffff00');
        legendGrad.addColorStop(0.75, '#ff8800');
        legendGrad.addColorStop(1, '#ff0000');
        ctx.fillStyle = legendGrad;
        ctx.fillRect(12, 35, 20, 80);
        ctx.strokeStyle = 'rgba(79, 195, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(12, 35, 20, 80);

        ctx.fillStyle = 'rgba(79, 195, 255, 0.3)';
        ctx.font = '9px Arial';
        ctx.textBaseline = 'bottom';
        ctx.fillText('0', 37, 37);
        ctx.textBaseline = 'middle';
        ctx.fillText('300', 37, 75);
        ctx.textBaseline = 'top';
        ctx.fillText('600+', 37, 113);

        ctx.fillStyle = 'rgba(79, 195, 255, 0.2)';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('↑ N', cx, 20);

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(79, 195, 255, 0.15)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.strokeStyle = 'rgba(79, 195, 255, 0.05)';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, W, H);
    }

    // ===== DESENHO DO PLANO =====
    drawMap(showHint = false) {
        const ctx = this.mapCtx;
        const W = this.mapCanvas.width;
        const H = this.mapCanvas.height;
        const cx = this.centerX;
        const cy = this.centerY;

        ctx.clearRect(0, 0, W, H);

        const bgGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 400);
        bgGradient.addColorStop(0, '#0d1f3c');
        bgGradient.addColorStop(1, '#060e1e');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, W, H);

        ctx.strokeStyle = 'rgba(79, 195, 255, 0.06)';
        ctx.lineWidth = 0.5;
        for (let x = 50; x < 700; x += 50) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 700);
            ctx.stroke();
        }
        for (let y = 50; y < 700; y += 50) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(700, y);
            ctx.stroke();
        }

        ctx.strokeStyle = 'rgba(79, 195, 255, 0.08)';
        ctx.lineWidth = 0.8;
        for (let x = 100; x < 700; x += 100) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 700);
            ctx.stroke();
        }
        for (let y = 100; y < 700; y += 100) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(700, y);
            ctx.stroke();
        }

        ctx.strokeStyle = 'rgba(79, 195, 255, 0.04)';
        ctx.lineWidth = 0.3;
        for (let x = 25; x < 700; x += 25) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 700);
            ctx.stroke();
        }
        for (let y = 25; y < 700; y += 25) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(700, y);
            ctx.stroke();
        }

        ctx.strokeStyle = 'rgba(79, 195, 255, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(W, cy);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, H);
        ctx.stroke();

        ctx.fillStyle = 'rgba(79, 195, 255, 0.3)';
        ctx.beginPath();
        ctx.moveTo(W - 12, cy - 6);
        ctx.lineTo(W, cy);
        ctx.lineTo(W - 12, cy + 6);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx - 6, 12);
        ctx.lineTo(cx, 0);
        ctx.lineTo(cx + 6, 12);
        ctx.fill();

        ctx.fillStyle = 'rgba(79, 195, 255, 0.4)';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText('X (metros)', W - 60, cy - 10);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('Y (metros)', cx + 10, 10);

        ctx.fillStyle = 'rgba(79, 195, 255, 0.25)';
        ctx.font = '9px Arial';
        ctx.textBaseline = 'top';
        for (let x = 50; x < 700; x += 50) {
            const val = Math.round((x - cx) / this.scaleFactor);
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(79, 195, 255, 0.3)';
            ctx.fillText(val, x, cy + 5);
        }
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'right';
        for (let y = 50; y < 700; y += 50) {
            const val = Math.round((cy - y) / this.scaleFactor);
            ctx.fillStyle = 'rgba(79, 195, 255, 0.3)';
            ctx.fillText(val, cx - 8, y);
        }

        ctx.fillStyle = 'rgba(79, 195, 255, 0.2)';
        ctx.font = '10px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText('(0, 0)', cx - 8, cy + 8);

        if (this.previewX !== null && this.previewY !== null) {
            const px = this.centerX + this.previewX * this.scaleFactor;
            const py = this.centerY - this.previewY * this.scaleFactor;

            const glow = ctx.createRadialGradient(px, py, 0, px, py, 40);
            glow.addColorStop(0, 'rgba(255, 107, 255, 0.3)');
            glow.addColorStop(1, 'rgba(255, 107, 255, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(px, py, 40, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(px, py, 15, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 107, 255, 0.6)';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.beginPath();
            ctx.arc(px, py, 5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 107, 255, 0.8)';
            ctx.fill();

            ctx.fillStyle = 'rgba(255, 107, 255, 0.7)';
            ctx.font = '10px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'bottom';
            ctx.fillText(`Prévia (${this.previewX}, ${this.previewY})`, px + 18, py - 5);
        }

        if (showHint && this.target) {
            const glow = ctx.createRadialGradient(this.target.x, this.target.y, 0, this.target.x, this.target.y, 70);
            glow.addColorStop(0, 'rgba(79, 195, 255, 0.15)');
            glow.addColorStop(1, 'rgba(79, 195, 255, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(this.target.x, this.target.y, 70, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(this.target.x, this.target.y, 30, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(79, 195, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = 'rgba(79, 195, 255, 0.5)';
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('📍', this.target.x, this.target.y - 40);

            ctx.fillStyle = 'rgba(79, 195, 255, 0.6)';
            ctx.font = '12px Arial';
            ctx.textBaseline = 'top';
            ctx.textAlign = 'left';
            ctx.fillText(`X = ${this.target.xMeters}m`, this.target.x + 35, this.target.y - 18);
            ctx.fillText(`Y = ${this.target.yMeters}m`, this.target.x + 35, this.target.y + 4);

            ctx.strokeStyle = 'rgba(79, 195, 255, 0.08)';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 5]);
            ctx.beginPath();
            ctx.moveTo(this.target.x, 0);
            ctx.lineTo(this.target.x, H);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, this.target.y);
            ctx.lineTo(W, this.target.y);
            ctx.stroke();
            ctx.setLineDash([]);

            if (this.hintActive) {
                const pulseSize = 30 + 10 * Math.sin(Date.now() / 300);
                ctx.beginPath();
                ctx.arc(this.target.x, this.target.y, pulseSize, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(79, 195, 255, ${0.1 + 0.05 * Math.sin(Date.now() / 300)})`;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }

        for (const mark of this.playerMarks) {
            const color = mark.type === 'hit' ? '#00ff88' : '#ffd93d';
            const size = mark.type === 'hit' ? 14 : 10;
            const isLatest = mark === this.playerMarks[this.playerMarks.length - 1];

            ctx.shadowColor = 'rgba(0,0,0,0.4)';
            ctx.shadowBlur = 12;

            const glow = ctx.createRadialGradient(mark.x, mark.y, 0, mark.x, mark.y, size * 3);
            glow.addColorStop(0, `${color}50`);
            glow.addColorStop(1, `${color}00`);
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(mark.x, mark.y, size * 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 0;

            ctx.beginPath();
            ctx.arc(mark.x, mark.y, size, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();

            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            if (isLatest) {
                const pulseSize = size + 8 * Math.sin(Date.now() / 200);
                ctx.beginPath();
                ctx.arc(mark.x, mark.y, pulseSize, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255,255,255,${0.1 + 0.1 * Math.sin(Date.now() / 200)})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(`${Math.round(mark.distance)}px`, mark.x, mark.y - size - 6);
            
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.font = '8px Arial';
            ctx.textBaseline = 'top';
            ctx.fillText(`(${mark.estimatedX}, ${mark.estimatedY})`, mark.x, mark.y + size + 4);

            ctx.fillStyle = color;
            ctx.font = '8px Arial';
            ctx.textBaseline = 'top';
            ctx.fillText(mark.type === 'hit' ? '✓' : '✗', mark.x + 35, mark.y + size + 4);
        }

        if (this.foundTarget && this.target) {
            const pulse = 1 + 0.15 * Math.sin(Date.now() / 300);

            const glow = ctx.createRadialGradient(this.target.x, this.target.y, 0, this.target.x, this.target.y, 50 *
                pulse);
            glow.addColorStop(0, 'rgba(0, 255, 136, 0.25)');
            glow.addColorStop(1, 'rgba(0, 255, 136, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(this.target.x, this.target.y, 50 * pulse, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowColor = 'rgba(0, 255, 136, 0.3)';
            ctx.shadowBlur = 20;
            ctx.font = `${35 * pulse}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#00ff88';
            ctx.fillText('⭐', this.target.x, this.target.y);
            ctx.shadowBlur = 0;

            ctx.fillStyle = 'rgba(0, 255, 136, 0.7)';
            ctx.font = '12px Arial';
            ctx.textBaseline = 'top';
            ctx.textAlign = 'left';
            ctx.fillText(`X = ${this.target.xMeters}m`, this.target.x + 40, this.target.y - 18);
            ctx.fillText(`Y = ${this.target.yMeters}m`, this.target.x + 40, this.target.y + 4);

            for (let i = 0; i < 3; i++) {
                const ringSize = 30 * pulse + i * 15 + 10 * Math.sin(Date.now() / 400 + i);
                ctx.beginPath();
                ctx.arc(this.target.x, this.target.y, ringSize, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(0, 255, 136, ${0.1 - i * 0.03})`;
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
        }

        ctx.strokeStyle = 'rgba(79, 195, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, W, H);
    }
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const game = new SonarGame();
    window.game = game;

    setTimeout(() => {
        game.toast.show('🌊 Bem-vindo ao Mapeamento Oceânico de Marie Tharp!', 'info', 2500);
        setTimeout(() => {
            game.toast.show('🧮 Use a calculadora para converter os dados do sonar!', 'info', 2500);
        }, 2500);
    }, 500);
});