import { CELL_VALUE, GAME_STATUS, TURN } from "./constants.js";
import {
  getCellElementAtIdx,
  getCellElementList,
  getCellListElement,
  getCurrentTurnElement,
  getGameStatusElement,
  getRePlayButtonElement,
} from "./selectors.js";
import { checkGameStatus } from "./utils.js";

// console.log(checkGameStatus(["X", "O", "O", "", "X", "", "", "O", "X"]));
// console.log(checkGameStatus(["X", "O", "X", "X", "O", "X", "O", "X", "O"]));
// console.log(checkGameStatus(["X", "O", "X", "X", "O", "X", "O", "X", ""]));

// console.log(getCellElementList());
// console.log(getCurrentTurnElement());
// console.log(getGameStatusElement());
// console.log(getCellElementAtIdx(4));
/**
 * Global variables
 */
let currentTurn = TURN.CROSS;
let gameStatus = GAME_STATUS.PLAYING;
let cellValues = new Array(9).fill("");

function toggleTurn() {
  // toggle turn
  currentTurn = currentTurn === TURN.CROSS ? TURN.CIRCLE : TURN.CROSS;

  // update turn on DOM element
  const currentTurnElement = getCurrentTurnElement();
  if (currentTurnElement) {
    currentTurnElement.classList.remove(TURN.CIRCLE, TURN.CROSS);
    currentTurnElement.classList.add(currentTurn);
  }
}

function updateGameStatus(newGameStatus) {
  gameStatus = newGameStatus;
  const gameStatusElement = getGameStatusElement();
  if (gameStatusElement) gameStatusElement.textContent = newGameStatus;
}

function showReplayButton() {
  const replayButton = getRePlayButtonElement();
  if (replayButton) replayButton.classList.add("show");
}
function hideReplayButton() {
  const replayButton = getRePlayButtonElement();
  if (replayButton) replayButton.classList.remove("show");
}

function highlightWinCells(winPositions) {
  if (!Array.isArray(winPositions) || winPositions.length !== 3) {
    throw new Error("Invalid win positions");
  }

  for (const position of winPositions) {
    const cell = getCellElementAtIdx(position);
    if (cell) cell.classList.add("win");
  }
}

function handleCellClick(cell, index) {
  const isClicked =
    cell.classList.contains(TURN.CROSS) || cell.classList.contains(TURN.CIRCLE);
  const isEndGame = gameStatus !== GAME_STATUS.PLAYING;

  // Only allow click if game is playing and that cell is not clicked yet
  if (isClicked || isEndGame) return;

  // set selected cell
  cell.classList.add(currentTurn);

  // update cellValues - to mustn't query on DOM more
  cellValues[index] =
    currentTurn === TURN.CIRCLE ? CELL_VALUE.CIRCLE : CELL_VALUE.CROSS;

  // toggle turn
  toggleTurn();

  // check game status
  const game = checkGameStatus(cellValues);
  switch (game.status) {
    case GAME_STATUS.ENDED:
      {
        // update game status
        updateGameStatus(game.status);
        // show replay button
        showReplayButton();
      }
      break;

    case GAME_STATUS.X_WIN:
    case GAME_STATUS.O_WIN:
      {
        // update game status
        updateGameStatus(game.status);
        // show replay button
        showReplayButton();
        // highlight win cells
        highlightWinCells(game.winPositions);
      }
      break;

    default:
    // Playing
  }
}

function initCellElementList() {
  // set index for each li element
  const liList = getCellElementList();
  liList.forEach((cell, index) => {
    // cell.addEventListener("click", () => handleCellClick(cell, index));
    cell.dataset.idx = index;
  });

  // attach event click for ul element
  const ulElement = getCellListElement();
  if (ulElement) {
    ulElement.addEventListener("click", (event) => {
      if (event.target.tagName !== "LI") return;

      const index = Number.parseInt(event.target.dataset.idx);
      handleCellClick(event.target, index);
    });
  }
}

function resetGame() {
  // --- reset temp global var ---
  currentTurn = TURN.CROSS;
  gameStatus = GAME_STATUS.PLAYING;
  cellValues = cellValues.map(() => "");

  //  --- reset dom element ---

  // reset game status
  updateGameStatus(GAME_STATUS.PLAYING);

  // reset current turn
  const currentTurnElement = getCurrentTurnElement();
  if (currentTurnElement) {
    currentTurnElement.classList.remove(TURN.CIRCLE, TURN.CROSS);
    currentTurnElement.classList.add(TURN.CROSS);
  }

  // reset game broard
  const cellElementList = getCellElementList();
  for (const cellElement of cellElementList) {
    cellElement.className = "";
  }

  // hide replay button
  hideReplayButton();
}

function initPlayButton() {
  const replayButton = getRePlayButtonElement();
  if (replayButton) replayButton.addEventListener("click", resetGame);
}
/**
 * TODOs
 *
 * 1. Bind click event for all cells
 *
 * 2. On cell click, do the following:
 *    - Toggle current turn
 *    - Mark current turn to the selected cell
 *    - Check game state: win, ended or playing
 *    - If game is win, highlight win cells
 *    - Not allow to re-click the cell having value.
 *
 * 3. If game is win or ended --> show replay button.
 * 4. On replay button click --> reset game to play again.
 *
 */

(() => {
  // bimd click event for all li elements
  initCellElementList();

  // boind click event for replay button
  initPlayButton();
})();
