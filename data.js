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
const winModal = document.getElementById("win-modal");
const winMessage = document.getElementById("win-message");
const winCloseButton = document.getElementById("close-win-modal");
const playAgain = document.getElementById("play-again");

let startTime = null;
let timerInterval = null;
let hasShownInstructions = false;
modal.style.display = "flex"; //display the instruction modal
winModal.style.display = "none"; //disable the win modal message

if(closeModal) { //eventlistener for exiting the instruction modal
  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
    hasShownInstructions = true;
    isGameActive = false;
    console.log("closed");
  });
}

winCloseButton.addEventListener("click", () => { //if the OK button in the win modal is clicked
winModal.classList.add("hidden");
winModal.style.display = "none";

if (nextLevel && nextLevel.style.display !== "none") { //scroll to the next level on the screen
  nextLevel.scrollIntoView({ behavior: "smooth", block: "center" });
}
});

playAgain.addEventListener("click", () => { //play again eventlistener when the user is on the last level and wants to replay the game
  currentLevelIndex = 0;
  resetGame();
  playAgain.classList.add("hidden");
  displayLevel();
  setLevelTitle(currentLevelIndex + 1);
});

waterDropSound.load(); //waterdrop sound load
let currentLevelIndex = 0; //the first level starts with 0 index (level 1)
let isGameActive = false; //game is not active 
let lastRow = null; //initialize all variables as null or 0
let lastCol = null;
let score = 0;
let lastTile = null;
let elapsedTime = 0;

let levelData = {
score: score,
time: elapsedTime
};

displayLevel(); //displays every level in the level array

function displayLevel() {
  levels.forEach((level, index) => {
  if(index === 0) {
    level.style.display = "flex";
  }
  else {
     level.style.display = "none";
  }

  const tiles = level.querySelectorAll(".tile"); //loads the gameboard for every level
  setEachTile(tiles);
  tiles.forEach(tile => clickTiles(tile));
  });
}
  
function setLevelTitle(level) { //set the level text for every level
  levelTitle.innerText = `Level ${level}`;
}

function setEachTile(tiles) { //for every tile on a gameboard, store the original classes and assign the images depending on the class name
  tiles.forEach(tile => {
  tile.dataset.originalClasses = tile.className;
  tile.innerHTML = "";
  const icon = document.createElement("span");
  icon.className = "material-symbols-outlined";
  if (tile.classList.contains("correct")) { //if the tile is the correct class, add the waterdrop image
    icon.innerText = "water_drop";
  } 
  else {
    icon.innerText = "landslide"; //if the tile is incorrect, add the rock image
  }
  if(tile.classList.contains("tile-goal")) { //if the tile is the goal endpoint, add the family image
    icon.innerText = "family_group";
  }
  tile.appendChild(icon); 
  });
}

function clickTiles(tile) { //function for when a tile is clicked
  tile.addEventListener("click", () => {
  if (!isGameActive || !hasShownInstructions) return; // ignore clicks when not active
    const row = parseInt(tile.dataset.row); //for that tile, assign the row and column 
    const col = parseInt(tile.dataset.col);
    // Prevent clicking the same tile
    if (tile.classList.contains("tile-correct")) return; //if a user clicks on a tile that is already labeled as correct, then ignore it
    const isAdjacent = Math.abs(row - lastRow) + Math.abs(col - lastCol) === 1; //store the adjacent tile from the one that is currently clicked
    const currentLevel = levels[currentLevelIndex];

    if (tile.classList.contains("correct") && isAdjacent) { //if the tile clicked is correct and is adjacent from the previous tile
      tile.classList.add("tile-correct"); //add the tile-correct class to highlight it green
      waterDropSound.currentTime = 0; //start the sound from the beginning
      waterDropSound.play(); //play the sound when it hits the correct tile
      waterDropSound.volume = 0.5; //set the volume to 0.5
      lastRow = row; //set the lastRow to the row that was just clicked, same for the column
      lastCol = col;
      lastTile = tile;
      score++; //add +1 to the score
      updateScore(); //update the score text
      showScorePopup(tile, "+1"); //add the +1 animation above the tile

      const currentStart = currentLevel.querySelector(".tile-start"); //depending on the level, store the tile which is the starting point
      if(currentStart) { //if this tile exists
        currentStart.classList.remove("tile-start"); //remove the yellow highlight from the start
      }
      tile.classList.add("tile-start"); //add the yellow highlight to the next clicked tile if its correct

        // Win condition
      if (tile.classList.contains("tile-goal") && isGameActive) { //if the player reaches the goal endpoint
        confetti({ //play the confetti animation
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
        });

        clearInterval(timerInterval);
        elapsedTime = Math.floor((Date.now() - startTime) / 1000);

        if(elapsedTime < 5) { //if the players time is less than 5 seconds, add 10 points to their score
          score += 10;
          updateScore();
        }
        timerDisplay.innerText = `Time: ${elapsedTime}s`; //display the players time 

        winMessage.innerText = `Level ${currentLevelIndex + 1} Complete!\nTime: ${elapsedTime}s | Score: ${score}\n Move on to the next level!`; //for the win modal, show the players time and score
        winModal.classList.remove("hidden");
        winModal.style.display = "flex";

        isGameActive = false; //game is now inactive so that players can't press on any other tiles
        if(currentLevelIndex < levels.length - 1) { //if there are still more levels to go, display the next level for the user to continue
          nextLevel.style.display = "inline-block";
        }

        if(currentLevelIndex === levels.length - 1) { //if the current level is the final level, display the play again button so the player can start from level 1
          playAgain.classList.remove("hidden");
          playAgain.style.display("flex");
        }
      }
      } else { //if the player hits the incorrect tile or it's not an adjacent tile
        // Wrong tile
        tile.classList.add("tile-wrong"); //add the red highlight to the tile
        isGameActive = false; //the game is now inactive
        setTimeout(() => { 
          tile.classList.remove("tile-wrong");
          resetGame();
        }, 600);
      }
    });
  }
startButton.addEventListener("click", () => { //when the player starts the game
  if(!hasShownInstructions) return; // prevent starting before instructions read
    const currentLevel = levels[currentLevelIndex]; //set the current level from the starting point 
    const startTile = currentLevel.querySelector(".tile-start"); //store the starting tile
    lastRow = parseInt(startTile.dataset.row); //set the initial row and column as the starting tile row/column
    lastCol = parseInt(startTile.dataset.col);
    startTile.classList.add("tile-correct"); //add the correct tile highlight to the initial tile
    isGameActive = true; //set the game to active when the player presses play
    startButton.style.display = "none"; //get rid of the start button after it's pressed

    startTime = Date.now(); //start the timer once the start button is pressed
    timerDisplay.style.display = "block"; //display the label for the timer
    timerInterval = setInterval(updateTimer, 1000)

  });

nextLevel.addEventListener("click", () => { //when the next level button is pressed
  nextLevel.style.display = "none"; //hide the next level button after it's pressed
  levels[currentLevelIndex].style.display = "none"; //hide the board that was just played 
  currentLevelIndex++; //increase the index of the level to indicate that we are on the next level

  if(currentLevelIndex < levels.length) { //if we haven't reached the final level
    const nextLevelElement = levels[currentLevelIndex]; //store the next level 
    nextLevelElement.style.display = "flex"; //display the next level after hiding the previous one
    nextLevelElement.scrollIntoView({ behavior: 'smooth' }); //scroll to the gameboard of the next level on the screen
    setLevelTitle(currentLevelIndex + 1); //set the title of the next level 
    resetGame(); //reset the tiles
  }
  else {
    resetGame();
  }  
});

function updateScore() { //displays the current score
  scoreDisplay.innerText = `Score: ${score}`;
}

function showScorePopup(tile, text) { //functionality for the +1 above the tile
const popup = document.createElement("span"); //creates a new span element
popup.classList.add("score-popup"); //adds the styling to the popup
popup.innerText = text; //adds the +1 as the text

// Position the popup above the tile
const tileRect = tile.getBoundingClientRect();
const bodyRect = document.body.getBoundingClientRect();
popup.style.left = (tileRect.left - bodyRect.left + tileRect.width / 2) + "px";
popup.style.top = (tileRect.top - bodyRect.top - 10) + "px"; // 10px above

document.body.appendChild(popup);

// remove the popup after animation
setTimeout(() => {
  popup.remove();
  }, 1000); // matches the animation duration
}

function updateTimer() {
  if (!startTime) return;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timerDisplay.innerText = `Time: ${elapsed}s`;
  }
  // --- Core logic ---
function resetGame() {
  levels.forEach(level => { //if the game is reset, store the original classes of every tile
    const tiles = level.querySelectorAll(".tile");
    tiles.forEach(tile => (tile.className = tile.dataset.originalClasses));
  });
  score = 0;
  updateScore();
  lastRow = null;
  lastCol = null;
  lastTile = null;
  startTime = null;
  isGameActive = false; // game waits until start pressed
  clearInterval(timerInterval);
  timerDisplay.style.display = "none";
  timerDisplay.innerText = "Time: 0s";
  startButton.style.display = "inline-block";
  }
  resetGame();
});