document.addEventListener("DOMContentLoaded", () => {
const startButton = document.querySelector(".start-button");
const scoreDisplay = document.getElementById("score-display");
const levelTitle = document.getElementById("level-title");
const nextLevel = document.querySelector(".next-level-button");
const levels = [document.getElementById("level-1"), document.getElementById("level-2"), document.getElementById("level-3")];
const waterDropSound = new Audio("sounds/waterdrop.mp3");
const modal = document.getElementById("instruction-modal");
const closeModal = document.getElementById("close-modal");
const timerDisplay = document.getElementById("timer-display");
let startTime = null;
let timerInterval = null;

modal.style.display = "flex";
if(closeModal) {
  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
    console.log("closed");
  });
}

  

waterDropSound.load();
let currentLevelIndex = 0;

  let isGameActive = false;
  let lastRow = null;
  let lastCol = null;
  let score = 0;
  let lastTile = null;
  
  levels.forEach((level, index) => {
    if(index === 0) {
      level.style.display = "flex";
    }
    else {
      level.style.display = "none";
    }
    const tiles = level.querySelectorAll(".tile");
    setEachTile(tiles);
    tiles.forEach(tile => clickTiles(tile));

  });

  function setLevelTitle(level) {
    levelTitle.innerText = `Level ${level}`;
  }

  function setEachTile(tiles) {
    tiles.forEach(tile => {
      tile.dataset.originalClasses = tile.className;
      tile.innerHTML = "";
      const icon = document.createElement("span");
      icon.className = "material-symbols-outlined";
      if (tile.classList.contains("correct")) {
        icon.innerText = "water_drop";
      } 
      else {
      icon.innerText = "landslide";
      }
      if(tile.classList.contains("tile-goal")) {
        icon.innerText = "family_group";
      }
    tile.appendChild(icon);
    })
  }

  function clickTiles(tile) {
    tile.addEventListener("click", () => {
      if (!isGameActive) return; // ignore clicks when not active

      const row = parseInt(tile.dataset.row);
      const col = parseInt(tile.dataset.col);

      // Prevent clicking the same tile
      if (tile.classList.contains("tile-correct")) return;

      const isAdjacent = Math.abs(row - lastRow) + Math.abs(col - lastCol) === 1;
      const currentLevel = levels[currentLevelIndex];

      if (tile.classList.contains("correct") && isAdjacent) {
        tile.classList.add("tile-correct");
        waterDropSound.currentTime = 0;
        waterDropSound.play();
        waterDropSound.volume = 0.5;
        
        lastRow = row;
        lastCol = col;
        lastTile = tile;
        score++;
        updateScore();
        
        const currentStart = currentLevel.querySelector(".tile-start");
        if(currentStart) {
          currentStart.classList.remove("tile-start");
        }
        tile.classList.add("tile-start");

        // Win condition
        if (tile.classList.contains("tile-goal")) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
        clearInterval(timerInterval);
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        
        timerDisplay.innerText = `Time: ${elapsedTime}s`;
          setTimeout(() => {
            alert(`Congratulations! Final score: ${score}\nTime taken: ${elapsedTime} seconds`);
            // resetGame();
          }, 100);
          if(currentLevelIndex < levels.length - 1) {
            nextLevel.style.display = "inline-block";
          }
          isGameActive = false;
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
  }
 
    startButton.addEventListener("click", () => { 
      const currentLevel = levels[currentLevelIndex];
      const startTile = currentLevel.querySelector(".tile-start");
      lastRow = parseInt(startTile.dataset.row);
      lastCol = parseInt(startTile.dataset.col);
      startTile.classList.add("tile-correct");

      isGameActive = true;
      startButton.style.display = "none";

      startTime = Date.now();
      timerDisplay.style.display = "block";
      timerInterval = setInterval(updateTimer, 1000)

  });
    nextLevel.addEventListener("click", () => {
      nextLevel.style.display = "none";
      levels[currentLevelIndex].style.display = "none";
      currentLevelIndex++;

      if(currentLevelIndex < levels.length) {
        const nextLevel = levels[currentLevelIndex];
        nextLevel.style.display = "flex";
        nextLevel.scrollIntoView({ behavior: 'smooth' });
        setLevelTitle(currentLevelIndex + 1);
        resetGame();
      }
      else {
        resetGame();
      }  
  });

  function updateScore() {
    scoreDisplay.innerText = `Score: ${score}`;
  }

  function updateTimer() {
    if (!startTime) return;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timerDisplay.innerText = `Time: ${elapsed}s`;
  }
  // --- Core logic ---
  function resetGame() {
    levels.forEach(level => {
      const tiles = level.querySelectorAll(".tile");
      tiles.forEach(tile => (tile.className = tile.dataset.originalClasses));
    });
    score = 0;
    updateScore();
    lastRow = null;
    lastCol = null;
    lastTile = null;
    isGameActive = false; // game waits until start pressed
    clearInterval(timerInterval);
    timerDisplay.style.display = "none";
    timerDisplay.innerText = "Time: 0s";
    startTime = null;
    startButton.style.display = "inline-block";
  }

  resetGame();
});