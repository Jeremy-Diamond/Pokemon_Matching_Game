const gridContainer = document.querySelector(".game-container");
let cards = [];
let firstCard, secondcard;
let lockBoard = false;
let matches = 0;
let score = 0;
let pokemonObjectList = [];
let difficulty = "";

document.querySelector(".score").textContent = score;
//ask the user how hard they want the game to be using 4 buttons with event listeners

const difficultyContainer = document.createElement("div");
difficultyContainer.classList.add("difficulty-container");

const difficulties = ["easy", "medium", "hard", "insane"];
difficulties.forEach((difficulty) => {
  const button = document.createElement("button");
  button.classList.add("difficulty-button", difficulty);
  button.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  button.addEventListener("click", () => createGame(difficulty));
  difficultyContainer.appendChild(button);
});

gridContainer.appendChild(difficultyContainer);

//console.log("connected")
//create game function
function createGame(difficulty) {
  difficulty = difficulty;
  gridContainer.innerHTML = "";
  const cardCount =
    difficulty === "easy"
      ? 4
      : difficulty === "medium"
      ? 8
      : difficulty === "hard"
      ? 16
      : 50;

  //load the pokemon from the API
  fetch("https://pokeapi.co/api/v2/pokemon?offset=0&limit=15000")
    .then((response) => response.json())
    .then((data) => {
      pokemonObjectList = data;
      //console.log(pokemonObjectList)
      createPokeList(pokemonObjectList);
    });

  //create a list of random pokemon from the API
  function createPokeList(pokemonObjectList) {
    let pokeList = [];
    for (let i = 0; i < cardCount; i++) {
      let randomPoke = Math.floor(
        Math.random() * pokemonObjectList.results.length
      );
      pokeList.push(pokemonObjectList.results[randomPoke]);
    }
    //console.log(pokeList)
    //create duplicates of the cards to make pairs
    let fullCardList = pokeList.concat(pokeList);
    //console.log(`fullCardList`, fullCardList)
    shuffle(fullCardList);
    //console.log(`fullCardList`, fullCardListAfterShuffle)
    createCards(fullCardList);
  }

  //create the cards for the game
  function createCards(pokeList) {
    for (let card of pokeList) {
      const cardElement = document.createElement("div");
      //console.log(card)
      //get the id of the pokemon
      let pokeId = card.url.split("/")[6];
      //console.log(pokeId)
      cardElement.classList.add("card");
      cardElement.setAttribute("data-pokemon", card.name);
      cardElement.innerHTML = `
        <div class="front">
                <div class="cardContent"> 
                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeId}.png" alt="${card.name} Height=195px">
                <div class="pokemon-name">${card.name}</div>
            </div>
        </div>
        <div class="back"> </div>
        `;
      //console.log(cardElement)
      cardElement.addEventListener("click", flipCard);
      gridContainer.appendChild(cardElement);
    }
  }

  //function to shuffel cards before placing them on the board
  function shuffle(array) {
    let currentIndex = array.length,
      tempValue,
      randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      tempValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = tempValue;
    }
    //console.log(array, 'array')
    return array;
  }

  //function to flip the cards

  function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    // Flip the first card immediately
    if (!firstCard) {
      firstCard = this;
      anime({
        targets: firstCard,
        rotateY: "180deg",
        backgroundColor: ["#FFF", "#FFC107"], // Change color to yellow on flip
        duration: 500,
        easing: "easeInOutQuad",
        complete: () => {
          firstCard.classList.add("flip");
        },
      });
      return;
    }

    // Flip the second card
    secondCard = this;
    lockBoard = true; // Prevent further clicking until match check is done
    anime({
      targets: secondCard,
      rotateY: "180deg",
      backgroundColor: ["#FFF", "#FFC107"], // Change color to yellow on flip
      duration: 200,
      easing: "easeInOutQuad",
      complete: () => {
        secondCard.classList.add("flip");
        score++;
        document.querySelector(".score").textContent = score;
        //
        //add delay before checking for match
        setTimeout(() => {
          checkForMatch();
        }, 800);
      },
    });
  }

  //function to check if the cards match
  function checkForMatch() {
    let isMatch = firstCard.dataset.pokemon === secondCard.dataset.pokemon;
    isMatch ? disableCards() : unflipCards();
  }

  //function to disable the cards if they match
  function disableCards() {
    anime({
      targets: [firstCard, secondCard],
      scale: [1, 1.4, 1], // Scale up and back down to make it pop
      backgroundColor: ["#FFC107", "#8BC34A"], // Change color to green on match
      duration: 1200,
      easing: "easeOutElastic(1, .8)",
      complete: () => {
        firstCard.removeEventListener("click", flipCard);
        secondCard.removeEventListener("click", flipCard);
        matches++;
        document.querySelector(".matches").textContent = matches;
        if (matches === cardCount) {
          youWin();
        }
        resetBoard();
      },
    });
  }

  //function to unflip the cards if they do not match
  function unflipCards() {
    anime({
      targets: [firstCard, secondCard],
      translateX: [
        { value: -10, duration: 100 },
        { value: 10, duration: 100 },
        { value: -10, duration: 100 },
        { value: 10, duration: 100 },
        { value: 0, duration: 100 },
      ],
      rotateY: "0deg", // Flip back to original
      duration: 1000,
      easing: "easeInOutQuad",
      complete: () => {
        firstCard.classList.remove("flip");
        secondCard.classList.remove("flip");
        resetBoard();
      },
    });
  }

  //function to reset the board

  function resetBoard() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
  }
}

// you win function that showes uses anime.js to animate the win message in a modal
function youWin() {
  // Create modal container for the win message
  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.innerHTML = `
    <div class="modal-content">
        <h2>You Win!</h2>
        <button id="playAgainButton">Play Again</button>
    </div>
    `;
  document.body.appendChild(modal);

  // Make the modal content pop in with scale, bounce, and rotation
  anime({
    targets: ".modal-content",
    scale: [0.5, 1.5, 1],
    rotate: ["0turn", "2turn"], // Double rotation
    opacity: [0, 1],
    duration: 1200,
    easing: "easeOutBounce", // Bounce effect for extra "pop"
  });

  // Add confetti effect by animating the h2 element with background changes and jitter
  anime({
    targets: ".modal-content h2",
    keyframes: [{ translateY: -40 }, { translateY: 40 }, { translateY: 0 }],
    backgroundColor: ["#FF69B4", "#FFD700", "#FF4500", "#00FF7F"], // Flashy color changes
    color: ["#FFF", "#000"],
    borderRadius: ["0%", "50%"], // Circle and back
    duration: 1500,
    easing: "easeInOutQuad",
    loop: true,
  });

  // Button wobble animation to make the play again button fun
  anime({
    targets: ".modal-content button",
    scale: [1, 1.3, 1],
    rotate: ["0deg", "15deg", "-15deg", "0deg"], // Wobble effect
    duration: 2000,
    easing: "easeInOutElastic(1, .8)",
    loop: true, // Continuous loop to keep the button lively
  });

  // Adding an explosion of confetti across the screen
  const confettiContainer = document.createElement("div");
  confettiContainer.classList.add("confetti-container");
  document.body.appendChild(confettiContainer);

  // Create a lot of confetti pieces for the explosion effect
  for (let i = 0; i < 100; i++) {
    let confetti = document.createElement("div");
    confetti.classList.add("confetti");
    confettiContainer.appendChild(confetti);

    anime({
      targets: confetti,
      translateX: [
        0,
        Math.random() * window.innerWidth - window.innerWidth / 2,
      ], // Random x translation
      translateY: [0, Math.random() * window.innerHeight], // Random y translation
      rotate: Math.random() * 360, // Random spin
      scale: [0.5, 1], // Confetti scaling effect
      duration: 2000 + Math.random() * 1000, // Randomized duration for variety
      easing: "easeOutQuad",
      complete: () => confetti.remove(), // Remove the confetti piece after animation
    });
  }

  // Flash the background in different colors
  anime({
    targets: "body",
    backgroundColor: ["#FFF", "#FF69B4", "#FFD700", "#00FF7F", "#1E90FF"], // Color flash
    duration: 3000,
    easing: "easeInOutSine",
    direction: "alternate",
    loop: 3,
  });

  // Make the modal pulse after everything settles down
  anime({
    targets: ".modal",
    scale: [1, 1.1, 1],
    duration: 1500,
    easing: "easeInOutSine",
    loop: true, // Pulses for a subtle post-win effect
  });

  // Add the event listener to refresh the browser when "Play Again" is clicked
  document.getElementById("playAgainButton").addEventListener("click", () => {
    location.reload(); // Refresh the page when Play Again is clicked
  });
}