// ===== GAMES: TILE MATCH =====
// Self-contained, vanilla JS, follows the init<Feature>() pattern used in script.js

(function () {
    'use strict';

    // ===== Shared modal helper =====
    function bindModal(modalId, backdropId, closeId, openTriggers, onOpen, onClose) {
        const modal = document.getElementById(modalId);
        const backdrop = document.getElementById(backdropId);
        const closeBtn = document.getElementById(closeId);
        if (!modal || !backdrop || !closeBtn) return;

        const open = () => {
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            if (typeof lenis !== 'undefined') lenis.stop();
            if (typeof onOpen === 'function') onOpen();
        };

        const close = () => {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            if (typeof lenis !== 'undefined') lenis.start();
            if (typeof onClose === 'function') onClose();
        };

        openTriggers.forEach((trigger) => {
            if (trigger) trigger.addEventListener('click', open);
        });
        closeBtn.addEventListener('click', close);
        backdrop.addEventListener('click', close);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) close();
        });

        return { open, close };
    }

    // ===== TILE MATCH =====
    const TILE_ICONS = ['fa-star', 'fa-heart', 'fa-bolt', 'fa-moon', 'fa-sun', 'fa-gem', 'fa-feather', 'fa-snowflake'];

    let tileState = null;

    function initTileGame() {
        const openBtn = document.getElementById('openTileGame');
        const board = document.getElementById('tileBoard');
        const movesEl = document.getElementById('tileMoves');
        const matchesEl = document.getElementById('tileMatches');
        const timerEl = document.getElementById('tileTimer');
        const restartBtn = document.getElementById('tileRestartBtn');
        const overlay = document.getElementById('tileGameOverlay');
        const finalMovesEl = document.getElementById('tileFinalMoves');
        const finalTimeEl = document.getElementById('tileFinalTime');
        const playAgainBtn = document.getElementById('tilePlayAgainBtn');

        if (!openBtn || !board) return;

        function shuffle(arr) {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }

        function formatTime(seconds) {
            const m = Math.floor(seconds / 60);
            const s = seconds % 60;
            return `${m}:${s < 10 ? '0' : ''}${s}`;
        }

        function tick() {
            tileState.elapsed += 1;
            timerEl.textContent = formatTime(tileState.elapsed);
        }

        function renderBoard() {
            board.innerHTML = '';
            tileState.deck.forEach((icon, index) => {
                const cell = document.createElement('div');
                cell.className = 'tile-cell';
                cell.dataset.index = index;
                cell.innerHTML = `
                    <div class="tile-cell-inner">
                        <div class="tile-face tile-face-back"><i class="fas fa-question"></i></div>
                        <div class="tile-face tile-face-front"><i class="fas ${icon}"></i></div>
                    </div>
                `;
                cell.addEventListener('click', () => handleTileClick(index, cell));
                board.appendChild(cell);
            });
        }

        function handleTileClick(index, cell) {
            if (!tileState.active) return;
            if (tileState.busy) return;
            if (cell.classList.contains('flipped') || cell.classList.contains('matched')) return;
            if (tileState.selected.length === 2) return;

            cell.classList.add('flipped');
            tileState.selected.push({ index, cell });

            if (tileState.selected.length === 2) {
                tileState.moves += 1;
                movesEl.textContent = tileState.moves;
                const [first, second] = tileState.selected;

                if (tileState.deck[first.index] === tileState.deck[second.index]) {
                    first.cell.classList.add('matched');
                    second.cell.classList.add('matched');
                    tileState.selected = [];
                    tileState.matchedCount += 1;
                    matchesEl.textContent = `${tileState.matchedCount}/8`;
                    if (tileState.matchedCount === 8) endGame();
                } else {
                    tileState.busy = true;
                    first.cell.classList.add('mismatch');
                    second.cell.classList.add('mismatch');
                    setTimeout(() => {
                        first.cell.classList.remove('flipped', 'mismatch');
                        second.cell.classList.remove('flipped', 'mismatch');
                        tileState.selected = [];
                        tileState.busy = false;
                    }, 800);
                }
            }
        }

        function endGame() {
            clearInterval(tileState.intervalId);
            tileState.active = false;
            finalMovesEl.textContent = tileState.moves;
            finalTimeEl.textContent = formatTime(tileState.elapsed);
            overlay.classList.add('active');
        }

        function startGame() {
            const deck = shuffle([...TILE_ICONS, ...TILE_ICONS]);
            tileState = {
                deck,
                selected: [],
                busy: false,
                moves: 0,
                matchedCount: 0,
                elapsed: 0,
                active: true,
                intervalId: null
            };
            movesEl.textContent = '0';
            matchesEl.textContent = '0/8';
            timerEl.textContent = '0:00';
            overlay.classList.remove('active');
            renderBoard();
            clearInterval(tileState.intervalId);
            tileState.intervalId = setInterval(tick, 1000);
        }

        restartBtn.addEventListener('click', startGame);
        playAgainBtn.addEventListener('click', startGame);

        bindModal('tileGameModal', 'tileGameBackdrop', 'tileGameClose', [openBtn], () => {
            if (!tileState || !tileState.active) startGame();
        }, () => {
            if (tileState) clearInterval(tileState.intervalId);
        });
    }

    initTileGame();
})();
