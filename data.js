document.addEventListener("DOMContentLoaded", () => {
  const tiles = document.querySelectorAll(".tile");
  const startButton = document.querySelector(".start-button");
  const scoreDisplay = document.getElementById("score-display");
   const correctTiles = document.querySelectorAll(".tile.correct").length;

  let isGameActive = false;
  let lastRow = null;
  let lastCol = null;
  let score = 0;
  let lastTile = null;

  tiles.forEach(tile => {
    tile.dataset.originalClasses = tile.className;
  });

  function updateScore() {
    scoreDisplay.innerText = `Score: ${score}`;
  }

  // --- Core logic ---
  function resetGame() {
    tiles.forEach(tile => {
      tile.className = tile.dataset.originalClasses;
    });
    score = 0;
    updateScore();
    lastRow = null;
    lastCol = null;
    lastTile = null;
    isGameActive = false; // game waits until start pressed
    startButton.style.display = "inline-block";
  }
  
  startButton.addEventListener("click", () => {
    isGameActive = true;
    startButton.style.display = "none";
    const startTile = document.querySelector(".tile-start");
    lastRow = parseInt(startTile.dataset.row);
    lastCol = parseInt(startTile.dataset.col);
    startTile.classList.add("tile-correct");

    tiles.forEach(tile => {
    tile.addEventListener("click", () => {
      if (!isGameActive) return; // ignore clicks when not active

      const row = parseInt(tile.dataset.row);
      const col = parseInt(tile.dataset.col);

      // Prevent clicking the same tile
      if (tile.classList.contains("tile-correct")) return;

      const isAdjacent = Math.abs(row - lastRow) + Math.abs(col - lastCol) === 1;

      if (tile.classList.contains("correct") && isAdjacent) {
        tile.classList.add("tile-correct");
        lastRow = row;
        lastCol = col;
        lastTile = tile;
        score++;
        updateScore();

        // Move the active visual to the new tile
        document.querySelector(".tile-start").classList.remove("tile-start");
        tile.classList.add("tile-start");

        // Win condition
        if (tile.classList.contains("tile-goal")) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
          setTimeout(() => {
            alert(`Congratulations! Final score: ${score}`);
            resetGame();
          }, 100);
        }
      } else {
        // Wrong tile
        tile.classList.add("tile-wrong");
        isGameActive = false;
        setTimeout(() => {
          tile.classList.remove("tile-wrong");
          resetGame();
        }, 600);
      }
    });
  });
  });

  // --- UI updates ---

  resetGame();
});