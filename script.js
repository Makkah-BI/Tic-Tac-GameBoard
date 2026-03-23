// Gameboard module
const Gameboard = (function () {
  const board = Array(9).fill(null);
  const getIndex = (r, c) => r * 3 + c;

  return {
    getBoard: () => [...board],
    placeMarker: (r, c, marker) => {
      const idx = getIndex(r, c);
      if (board[idx] !== null) return false;
      board[idx] = marker;
      return true;
    },
    isSpotAvailable: (r, c) => board[getIndex(r, c)] === null,
    resetBoard: () => board.fill(null),
  };
})();

// Player factory
const Player = (name, marker) => ({ name, marker });

// Game Controller module
const GameController = (function () {
  let players = [];
  let currentIdx = 0;
  let active = false;

  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const checkWin = () => {
    const b = Gameboard.getBoard();
    for (let p of winPatterns) {
      if (b[p[0]] && b[p[0]] === b[p[1]] && b[p[0]] === b[p[2]]) {
        return b[p[0]];
      }
    }
    return null;
  };

  const checkTie = () => Gameboard.getBoard().every((cell) => cell !== null);

  return {
    startGame: (name1, name2) => {
      players = [Player(name1, "X"), Player(name2, "O")];
      currentIdx = 0;
      active = true;
      Gameboard.resetBoard();
      return true;
    },
    playTurn: (row, col) => {
      if (!active) return false;
      const marker = players[currentIdx].marker;
      if (!Gameboard.placeMarker(row, col, marker)) return false;

      const winner = checkWin();
      if (winner) {
        active = false;
        return true;
      }
      if (checkTie()) {
        active = false;
        return true;
      }
      currentIdx = currentIdx === 0 ? 1 : 0;
      return true;
    },
    resetGame: () => {
      if (!players.length) return false;
      active = true;
      currentIdx = 0;
      Gameboard.resetBoard();
      return true;
    },
    getCurrentPlayer: () => active && players[currentIdx],
    isGameActive: () => active,
    getWinner: () => {
      const m = checkWin();
      return m ? players.find((p) => p.marker === m) : null;
    },
    isTie: () => !active && !checkWin() && checkTie(),
  };
})();

// Display Controller – connects UI to game logic
const DisplayController = (function () {
  // DOM elements
  const boardDiv = document.getElementById("board");
  const statusDiv = document.getElementById("game-status");
  const startBtn = document.getElementById("start-btn");
  const restartBtn = document.getElementById("restart-btn");
  const player1Input = document.getElementById("player1-name");
  const player2Input = document.getElementById("player2-name");

  // Render the board based on Gameboard state
  function renderBoard() {
    const board = Gameboard.getBoard();
    boardDiv.innerHTML = "";
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      if (board[i] !== null) cell.classList.add("taken");
      cell.textContent = board[i] || "";
      const row = Math.floor(i / 3);
      const col = i % 3;
      cell.addEventListener("click", () => handleCellClick(row, col));
      boardDiv.appendChild(cell);
    }
  }

  // Update status text (current player, winner, tie)
  function updateStatus() {
    if (!GameController.isGameActive()) {
      const winner = GameController.getWinner();
      if (winner) {
        statusDiv.textContent = `${winner.name} wins!`;
      } else if (GameController.isTie()) {
        statusDiv.textContent = "It's a tie!";
      } else {
        statusDiv.textContent = "Game not started";
      }
    } else {
      const player = GameController.getCurrentPlayer();
      statusDiv.textContent = `${player.name}'s turn (${player.marker})`;
    }
  }

  // Handle a click on a cell
  function handleCellClick(row, col) {
    if (!GameController.isGameActive()) return;
    const success = GameController.playTurn(row, col);
    if (success) {
      renderBoard();
      updateStatus();
    }
  }

  // Start a new game from UI
  function startGame() {
    const p1Name = player1Input.value.trim() || "Player X";
    const p2Name = player2Input.value.trim() || "Player O";
    GameController.startGame(p1Name, p2Name);
    renderBoard();
    updateStatus();
  }

  // Restart current game
  function restartGame() {
    if (GameController.resetGame()) {
      renderBoard();
      updateStatus();
    } else {
      // If no game running, just start a new one
      startGame();
    }
  }

  // Initialize event listeners
  function init() {
    startBtn.addEventListener("click", startGame);
    restartBtn.addEventListener("click", restartGame);
    // Initial render (empty board, no game active)
    renderBoard();
    updateStatus();
  }

  return { init };
})();

// Start the display when page loads
DisplayController.init();
