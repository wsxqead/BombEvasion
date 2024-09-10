const difficulties = {
  easy: { size: 9, mines: 10 },
  medium: { size: 16, mines: 30 }, // 중급 지뢰 30개
  hard: { size: 24, mines: 80 }, // 고급 지뢰 80개
};

let boardSize;
let mineCount;
let board = [];
let mineLocations = [];
let revealedCells = 0;
let flagCount = 0;
let timer;
let timeElapsed = 0;

const gameBoard = document.getElementById("game-board");
const mineCountDisplay = document.getElementById("mine-count");
const timeDisplay = document.getElementById("time");
const restartButton = document.getElementById("restart");
const difficultySelect = document.getElementById("difficulty");

restartButton.addEventListener("click", startGame);
difficultySelect.addEventListener("change", startGame);

function startGame() {
  const difficulty = difficultySelect.value;
  boardSize = difficulties[difficulty].size;
  mineCount = difficulties[difficulty].mines;

  board = [];
  mineLocations = [];
  revealedCells = 0;
  flagCount = 0;
  timeElapsed = 0;
  clearInterval(timer);
  timeDisplay.textContent = timeElapsed;
  mineCountDisplay.textContent = mineCount;
  gameBoard.innerHTML = "";
  generateBoard();
  placeMines();
  timer = setInterval(() => {
    timeElapsed++;
    timeDisplay.textContent = timeElapsed;
  }, 1000);
}

// 우클릭 이벤트 리스너 추가
function generateBoard() {
  gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, 40px)`;
  gameBoard.style.gridTemplateRows = `repeat(${boardSize}, 40px)`;

  for (let i = 0; i < boardSize; i++) {
    board[i] = [];
    for (let j = 0; j < boardSize; j++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = i;
      cell.dataset.col = j;
      cell.addEventListener("click", () => revealCell(i, j));
      cell.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        if (board[i][j].revealed) {
          revealAdjacentOnRightClick(i, j); // 이미 열린 셀 우클릭 시 주변 자동 열기
        } else {
          flagCell(i, j); // 열리지 않은 셀 우클릭 시 플래그
        }
      });
      gameBoard.appendChild(cell);
      board[i][j] = {
        element: cell,
        mine: false,
        revealed: false,
        flagged: false,
      };
    }
  }
}

function placeMines() {
  let minesPlaced = 0;
  while (minesPlaced < mineCount) {
    const row = Math.floor(Math.random() * boardSize);
    const col = Math.floor(Math.random() * boardSize);
    if (!board[row][col].mine) {
      board[row][col].mine = true;
      mineLocations.push([row, col]);
      minesPlaced++;
    }
  }
}

function revealCell(row, col) {
  const cell = board[row][col];
  if (cell.revealed || cell.flagged) return;
  cell.revealed = true;
  cell.element.classList.add("revealed");

  if (cell.mine) {
    cell.element.classList.add("mine");
    endGame(false);
  } else {
    const adjacentMines = countAdjacentMines(row, col);
    if (adjacentMines > 0) {
      cell.element.textContent = adjacentMines;
    } else {
      revealAdjacentCells(row, col);
    }
    revealedCells++;
    if (revealedCells === boardSize * boardSize - mineCount) {
      endGame(true);
    }
  }
}

function countAdjacentMines(row, col) {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const newRow = row + i;
      const newCol = col + j;
      if (
        newRow >= 0 &&
        newRow < boardSize &&
        newCol >= 0 &&
        newCol < boardSize &&
        board[newRow][newCol].mine
      ) {
        count++;
      }
    }
  }
  return count;
}

// 주변 셀 자동 열기
function revealAdjacentOnRightClick(row, col) {
  const cell = board[row][col];
  if (!cell.revealed) return;

  const adjacentMines = countAdjacentMines(row, col);
  let flaggedCount = 0;

  // 주변 플래그(깃발)의 수를 확인
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const newRow = row + i;
      const newCol = col + j;
      if (
        newRow >= 0 &&
        newRow < boardSize &&
        newCol >= 0 &&
        newCol < boardSize &&
        board[newRow][newCol].flagged
      ) {
        flaggedCount++;
      }
    }
  }

  // 주변 플래그 수가 실제 지뢰 수와 같을 때 주변 자동 열림
  if (flaggedCount === adjacentMines) {
    revealAdjacentCells(row, col);
  }
}

function revealAdjacentCells(row, col) {
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const newRow = row + i;
      const newCol = col + j;
      if (
        newRow >= 0 &&
        newRow < boardSize &&
        newCol >= 0 &&
        newCol < boardSize &&
        !board[newRow][newCol].revealed &&
        !board[newRow][newCol].flagged
      ) {
        revealCell(newRow, newCol);
      }
    }
  }
}

function flagCell(row, col) {
  const cell = board[row][col];
  if (cell.revealed) return;
  cell.flagged = !cell.flagged;
  cell.element.classList.toggle("flagged");
  flagCount += cell.flagged ? 1 : -1;
  mineCountDisplay.textContent = mineCount - flagCount;
}

function endGame(win) {
  clearInterval(timer);
  if (win) {
    alert("승리했습니다!");
  } else {
    alert("패배했습니다. 지뢰를 밟았습니다.");
    mineLocations.forEach(([row, col]) => {
      board[row][col].element.classList.add("mine");
    });
  }
}

startGame();
