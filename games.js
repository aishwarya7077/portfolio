// ===== GAMES: ARCADE (Tile Match + Sudoku) =====
// Self-contained, vanilla JS, follows the init<Feature>() pattern used in script.js

(function () {
    'use strict';

    // ===== Shared scroll lock =====
    // Ref-counted so handing off from one modal to another (the arcade picker
    // launching a game) can't leave Lenis stopped or the body unlocked.
    let scrollLocks = 0;

    function lockScroll() {
        scrollLocks += 1;
        if (scrollLocks > 1) return;
        document.body.style.overflow = 'hidden';
        if (typeof lenis !== 'undefined') lenis.stop();
    }

    function unlockScroll() {
        scrollLocks = Math.max(0, scrollLocks - 1);
        if (scrollLocks > 0) return;
        document.body.style.overflow = '';
        if (typeof lenis !== 'undefined') lenis.start();
    }

    // ===== Shared modal helper =====
    function bindModal(modalId, backdropId, closeId, openTriggers, onOpen, onClose) {
        const modal = document.getElementById(modalId);
        const backdrop = document.getElementById(backdropId);
        const closeBtn = document.getElementById(closeId);
        if (!modal || !backdrop || !closeBtn) return;

        const panel = modal.querySelector('.game-modal-content');

        // Lenis swallows wheel events document-wide, so the modal's own
        // overflow never receives them. Scroll the panel manually and stop
        // the event before Lenis sees it.
        if (panel) {
            panel.addEventListener('wheel', (e) => {
                const canScroll = panel.scrollHeight > panel.clientHeight;
                if (!canScroll) return;
                e.stopPropagation();
                e.preventDefault();
                panel.scrollTop += e.deltaY;
            }, { passive: false });

            // Touch drags need the same treatment on mobile.
            let touchY = 0;
            panel.addEventListener('touchstart', (e) => {
                touchY = e.touches[0].clientY;
            }, { passive: true });
            panel.addEventListener('touchmove', (e) => {
                if (panel.scrollHeight <= panel.clientHeight) return;
                const y = e.touches[0].clientY;
                panel.scrollTop += touchY - y;
                touchY = y;
                e.stopPropagation();
            }, { passive: true });
        }

        let isOpen = false;

        const open = () => {
            if (isOpen) return;
            isOpen = true;
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            if (panel) panel.scrollTop = 0;
            lockScroll();
            if (typeof onOpen === 'function') onOpen();
        };

        const close = () => {
            if (!isOpen) return;
            isOpen = false;
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            unlockScroll();
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
        const board = document.getElementById('tileBoard');
        const movesEl = document.getElementById('tileMoves');
        const matchesEl = document.getElementById('tileMatches');
        const timerEl = document.getElementById('tileTimer');
        const restartBtn = document.getElementById('tileRestartBtn');
        const overlay = document.getElementById('tileGameOverlay');
        const finalMovesEl = document.getElementById('tileFinalMoves');
        const finalTimeEl = document.getElementById('tileFinalTime');
        const playAgainBtn = document.getElementById('tilePlayAgainBtn');

        // The Games section was removed from the page flow, so there is no
        // in-page play button; the arcade picker launches this game instead.
        if (!board) return null;

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

        return bindModal('tileGameModal', 'tileGameBackdrop', 'tileGameClose', [], () => {
            if (!tileState || !tileState.active) startGame();
        }, () => {
            if (tileState) clearInterval(tileState.intervalId);
        });
    }


    // ===== SUDOKU =====
    // Generates a full valid grid by randomized backtracking, then removes
    // clues while a uniqueness check keeps the puzzle single-solution.

    const DIFFICULTY = {
        easy:   { holes: 40 },
        medium: { holes: 48 },
        hard:   { holes: 54 }
    };

    let sudokuState = null;

    function shuffled(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    // Can `val` go at index `pos` of a flat 81-cell grid?
    function isSafe(grid, pos, val) {
        const row = Math.floor(pos / 9);
        const col = pos % 9;
        for (let i = 0; i < 9; i++) {
            if (grid[row * 9 + i] === val) return false;
            if (grid[i * 9 + col] === val) return false;
        }
        const boxRow = row - (row % 3);
        const boxCol = col - (col % 3);
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                if (grid[(boxRow + r) * 9 + boxCol + c] === val) return false;
            }
        }
        return true;
    }

    function fillGrid(grid, pos) {
        if (pos === 81) return true;
        if (grid[pos] !== 0) return fillGrid(grid, pos + 1);
        for (const val of shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
            if (isSafe(grid, pos, val)) {
                grid[pos] = val;
                if (fillGrid(grid, pos + 1)) return true;
                grid[pos] = 0;
            }
        }
        return false;
    }

    // Counts solutions but bails early — we only care whether it is unique.
    function countSolutions(grid, limit) {
        let best = -1;
        let bestOptions = null;
        for (let pos = 0; pos < 81; pos++) {
            if (grid[pos] !== 0) continue;
            const options = [];
            for (let val = 1; val <= 9; val++) {
                if (isSafe(grid, pos, val)) options.push(val);
            }
            if (options.length === 0) return 0;
            if (best === -1 || options.length < bestOptions.length) {
                best = pos;
                bestOptions = options;
                if (options.length === 1) break;
            }
        }
        if (best === -1) return 1;

        let total = 0;
        for (const val of bestOptions) {
            grid[best] = val;
            total += countSolutions(grid, limit - total);
            grid[best] = 0;
            if (total >= limit) return total;
        }
        return total;
    }

    function generatePuzzle(difficulty) {
        const solution = new Array(81).fill(0);
        fillGrid(solution, 0);

        const puzzle = solution.slice();
        const target = (DIFFICULTY[difficulty] || DIFFICULTY.easy).holes;
        let removed = 0;

        for (const pos of shuffled(Array.from({ length: 81 }, (_, i) => i))) {
            if (removed >= target) break;
            const backup = puzzle[pos];
            if (backup === 0) continue;
            puzzle[pos] = 0;
            if (countSolutions(puzzle.slice(), 2) === 1) {
                removed++;
            } else {
                puzzle[pos] = backup;
            }
        }

        return { puzzle, solution };
    }

    function initSudokuGame() {
        const board = document.getElementById('sudokuBoard');
        if (!board) return null;

        const pad = document.getElementById('sudokuPad');
        const filledEl = document.getElementById('sudokuFilled');
        const timerEl = document.getElementById('sudokuTimer');
        const notesBtn = document.getElementById('sudokuNotesBtn');
        const hintBtn = document.getElementById('sudokuHintBtn');
        const newBtn = document.getElementById('sudokuNewBtn');
        const overlay = document.getElementById('sudokuGameOverlay');
        const overlayTitle = document.getElementById('sudokuOverlayTitle');
        const overlayText = document.getElementById('sudokuOverlayText');
        const playAgainBtn = document.getElementById('sudokuPlayAgainBtn');
        const diffBtns = Array.from(document.querySelectorAll('.sudoku-diff-btn'));

        function formatTime(seconds) {
            const m = Math.floor(seconds / 60);
            const s = seconds % 60;
            return `${m}:${s < 10 ? '0' : ''}${s}`;
        }

        function tick() {
            if (!sudokuState || !sudokuState.active) return;
            sudokuState.elapsed += 1;
            timerEl.textContent = formatTime(sudokuState.elapsed);
        }

        function buildBoard() {
            board.innerHTML = '';
            sudokuState.cells = [];
            for (let pos = 0; pos < 81; pos++) {
                const cell = document.createElement('button');
                cell.type = 'button';
                cell.className = 'sudoku-cell';
                cell.dataset.pos = pos;

                const row = Math.floor(pos / 9);
                const col = pos % 9;
                if (col % 3 === 2 && col !== 8) cell.classList.add('edge-right');
                if (row % 3 === 2 && row !== 8) cell.classList.add('edge-bottom');

                const value = document.createElement('span');
                value.className = 'sudoku-value';
                const notes = document.createElement('span');
                notes.className = 'sudoku-notes';
                for (let n = 1; n <= 9; n++) {
                    const dot = document.createElement('span');
                    dot.dataset.note = n;
                    notes.appendChild(dot);
                }
                cell.appendChild(value);
                cell.appendChild(notes);

                cell.addEventListener('click', () => selectCell(pos));
                board.appendChild(cell);
                sudokuState.cells.push(cell);
            }
        }

        function paintCell(pos) {
            const cell = sudokuState.cells[pos];
            const value = sudokuState.grid[pos];
            const valueEl = cell.querySelector('.sudoku-value');
            const noteEls = cell.querySelectorAll('.sudoku-notes span');

            cell.classList.toggle('given', sudokuState.given[pos]);
            cell.classList.toggle('wrong', sudokuState.wrong.has(pos));
            valueEl.textContent = value === 0 ? '' : value;
            cell.classList.toggle('has-notes', value === 0 && sudokuState.notes[pos].size > 0);

            noteEls.forEach((el) => {
                const n = Number(el.dataset.note);
                el.textContent = (value === 0 && sudokuState.notes[pos].has(n)) ? n : '';
            });
        }

        function refreshHighlights() {
            const sel = sudokuState.selected;
            const selRow = sel === null ? -1 : Math.floor(sel / 9);
            const selCol = sel === null ? -1 : sel % 9;
            const selBox = sel === null ? -1 : Math.floor(selRow / 3) * 3 + Math.floor(selCol / 3);
            const selValue = sel === null ? 0 : sudokuState.grid[sel];

            sudokuState.cells.forEach((cell, pos) => {
                const row = Math.floor(pos / 9);
                const col = pos % 9;
                const box = Math.floor(row / 3) * 3 + Math.floor(col / 3);
                cell.classList.toggle('selected', pos === sel);
                cell.classList.toggle('peer', sel !== null && pos !== sel &&
                    (row === selRow || col === selCol || box === selBox));
                cell.classList.toggle('same-value', selValue !== 0 && pos !== sel &&
                    sudokuState.grid[pos] === selValue);
            });
        }

        function refreshCounts() {
            const placed = sudokuState.grid.filter((v) => v !== 0).length;
            filledEl.textContent = `${placed}/81`;

            // Grey out a pad key once all nine of that digit are correctly placed.
            for (let n = 1; n <= 9; n++) {
                let used = 0;
                for (let i = 0; i < 81; i++) {
                    if (sudokuState.grid[i] === n && !sudokuState.wrong.has(i)) used++;
                }
                const key = pad.querySelector(`.sudoku-key[data-num="${n}"]`);
                const badge = pad.querySelector(`[data-count-for="${n}"]`);
                if (badge) badge.textContent = used >= 9 ? '' : String(9 - used);
                if (key) key.classList.toggle('exhausted', used >= 9);
            }
        }

        function selectCell(pos) {
            if (!sudokuState.active) return;
            sudokuState.selected = pos;
            refreshHighlights();
        }

        function enterValue(num) {
            const pos = sudokuState.selected;
            if (!sudokuState.active || pos === null) return;
            if (sudokuState.given[pos]) return;

            if (num === 0) {
                sudokuState.grid[pos] = 0;
                sudokuState.notes[pos].clear();
                sudokuState.wrong.delete(pos);
                paintCell(pos);
                refreshCounts();
                refreshHighlights();
                return;
            }

            if (sudokuState.noteMode) {
                if (sudokuState.grid[pos] !== 0) return;
                if (sudokuState.notes[pos].has(num)) sudokuState.notes[pos].delete(num);
                else sudokuState.notes[pos].add(num);
                paintCell(pos);
                return;
            }

            sudokuState.grid[pos] = num;
            sudokuState.notes[pos].clear();

            if (sudokuState.solution[pos] === num) {
                sudokuState.wrong.delete(pos);
                // A correct entry invalidates that pencil mark for its peers.
                clearPeerNotes(pos, num);
            } else {
                // Free play: a wrong digit is flagged so it can be spotted and
                // corrected, but it costs nothing and never ends the game.
                sudokuState.wrong.add(pos);
                cellShake(pos);
            }

            paintCell(pos);
            refreshCounts();
            refreshHighlights();

            if (isSolved()) finishGame();
        }

        function clearPeerNotes(pos, num) {
            const row = Math.floor(pos / 9);
            const col = pos % 9;
            const boxRow = row - (row % 3);
            const boxCol = col - (col % 3);
            const peers = new Set();
            for (let i = 0; i < 9; i++) {
                peers.add(row * 9 + i);
                peers.add(i * 9 + col);
            }
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) peers.add((boxRow + r) * 9 + boxCol + c);
            }
            peers.forEach((p) => {
                if (p !== pos && sudokuState.notes[p].delete(num)) paintCell(p);
            });
        }

        function cellShake(pos) {
            const cell = sudokuState.cells[pos];
            cell.classList.remove('shake');
            void cell.offsetWidth;
            cell.classList.add('shake');
        }

        function isSolved() {
            for (let pos = 0; pos < 81; pos++) {
                if (sudokuState.grid[pos] !== sudokuState.solution[pos]) return false;
            }
            return true;
        }

        function useHint() {
            if (!sudokuState.active) return;
            const empties = [];
            for (let pos = 0; pos < 81; pos++) {
                if (sudokuState.grid[pos] !== sudokuState.solution[pos]) empties.push(pos);
            }
            if (empties.length === 0) return;

            // Prefer the selected cell when it still needs solving.
            const sel = sudokuState.selected;
            const pos = (sel !== null && empties.indexOf(sel) !== -1)
                ? sel
                : empties[Math.floor(Math.random() * empties.length)];

            sudokuState.grid[pos] = sudokuState.solution[pos];
            sudokuState.notes[pos].clear();
            sudokuState.wrong.delete(pos);
            sudokuState.given[pos] = true;
            sudokuState.hints += 1;
            clearPeerNotes(pos, sudokuState.solution[pos]);

            const cell = sudokuState.cells[pos];
            cell.classList.add('hinted');
            setTimeout(() => cell.classList.remove('hinted'), 900);

            paintCell(pos);
            refreshCounts();
            sudokuState.selected = pos;
            refreshHighlights();

            if (isSolved()) finishGame(true);
        }

        function finishGame() {
            sudokuState.active = false;
            clearInterval(sudokuState.intervalId);
            overlayTitle.textContent = 'Puzzle Solved!';
            const h = sudokuState.hints;
            overlayText.innerHTML =
                `Finished in <span>${formatTime(sudokuState.elapsed)}</span>` +
                (h ? ` with <span>${h}</span> hint${h === 1 ? '' : 's'}` : '') + '.';
            overlay.classList.add('active');
        }

        function startGame(difficulty) {
            const level = difficulty || (sudokuState && sudokuState.difficulty) || 'easy';

            if (sudokuState) clearInterval(sudokuState.intervalId);
            board.classList.add('generating');

            // Let the "generating" state paint before the solver blocks the thread.
            setTimeout(() => {
                const { puzzle, solution } = generatePuzzle(level);

                sudokuState = {
                    difficulty: level,
                    grid: puzzle.slice(),
                    solution,
                    given: puzzle.map((v) => v !== 0),
                    notes: Array.from({ length: 81 }, () => new Set()),
                    wrong: new Set(),
                    cells: [],
                    selected: null,
                    noteMode: false,
                    hints: 0,
                    elapsed: 0,
                    active: true,
                    intervalId: null
                };

                diffBtns.forEach((b) => b.classList.toggle('active', b.dataset.difficulty === level));
                notesBtn.classList.remove('active');
                notesBtn.setAttribute('aria-pressed', 'false');
                timerEl.textContent = '0:00';
                overlay.classList.remove('active');

                buildBoard();
                for (let pos = 0; pos < 81; pos++) paintCell(pos);
                refreshCounts();
                refreshHighlights();
                board.classList.remove('generating');
                sudokuState.intervalId = setInterval(tick, 1000);
            }, 20);
        }

        function moveSelection(dRow, dCol) {
            if (sudokuState.selected === null) return selectCell(0);
            const row = Math.floor(sudokuState.selected / 9);
            const col = sudokuState.selected % 9;
            const nextRow = Math.min(8, Math.max(0, row + dRow));
            const nextCol = Math.min(8, Math.max(0, col + dCol));
            selectCell(nextRow * 9 + nextCol);
        }

        pad.addEventListener('click', (e) => {
            const key = e.target.closest('.sudoku-key');
            if (key) enterValue(Number(key.dataset.num));
        });

        diffBtns.forEach((btn) => {
            btn.addEventListener('click', () => startGame(btn.dataset.difficulty));
        });

        notesBtn.addEventListener('click', () => {
            if (!sudokuState) return;
            sudokuState.noteMode = !sudokuState.noteMode;
            notesBtn.classList.toggle('active', sudokuState.noteMode);
            notesBtn.setAttribute('aria-pressed', String(sudokuState.noteMode));
        });

        hintBtn.addEventListener('click', useHint);
        newBtn.addEventListener('click', () => startGame());
        playAgainBtn.addEventListener('click', () => startGame());

        // Keyboard play, only while the sudoku modal is on screen.
        document.addEventListener('keydown', (e) => {
            const modal = document.getElementById('sudokuGameModal');
            if (!modal || !modal.classList.contains('active') || !sudokuState) return;

            if (e.key >= '1' && e.key <= '9') { e.preventDefault(); enterValue(Number(e.key)); return; }
            if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') { e.preventDefault(); enterValue(0); return; }
            if (e.key === 'ArrowUp')    { e.preventDefault(); moveSelection(-1, 0); return; }
            if (e.key === 'ArrowDown')  { e.preventDefault(); moveSelection(1, 0); return; }
            if (e.key === 'ArrowLeft')  { e.preventDefault(); moveSelection(0, -1); return; }
            if (e.key === 'ArrowRight') { e.preventDefault(); moveSelection(0, 1); return; }
            if (e.key.toLowerCase() === 'n') { e.preventDefault(); notesBtn.click(); }
        });

        return bindModal('sudokuGameModal', 'sudokuGameBackdrop', 'sudokuGameClose', [], () => {
            if (!sudokuState || !sudokuState.active) startGame();
            else sudokuState.intervalId = setInterval(tick, 1000);
        }, () => {
            if (sudokuState) clearInterval(sudokuState.intervalId);
        });
    }

    // ===== ARCADE PICKER =====
    // The nav links and the Extras card all point here; the picker then
    // hands off to whichever game was chosen.
    function initArcade() {
        const tile = initTileGame();
        const sudoku = initSudokuGame();

        const triggers = Array.from(document.querySelectorAll('[data-open-game]'));
        // Several triggers are anchors to a section id that no longer exists,
        // so suppress the jump and close the mobile drawer on the way through.
        triggers.forEach((el) => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const drawer = document.getElementById('mobileNav');
                if (drawer && drawer.classList.contains('active')) {
                    drawer.classList.remove('active');
                    drawer.setAttribute('aria-hidden', 'true');
                    const toggle = document.getElementById('navMenuToggle');
                    if (toggle) toggle.setAttribute('aria-expanded', 'false');
                }
            });
        });

        const arcade = bindModal('arcadeModal', 'arcadeBackdrop', 'arcadeClose', triggers);
        if (!arcade) return;

        const games = { tile, sudoku };
        document.querySelectorAll('.arcade-card').forEach((card) => {
            card.addEventListener('click', () => {
                const game = games[card.dataset.launch];
                if (!game) return;
                arcade.close();
                game.open();
            });
        });
    }

    initArcade();
})();
