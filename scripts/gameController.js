const gridContainer = document.querySelector('.game-container');
let cards =[];
let firstCard,secondcard;
let lockBoard = false;
let matches = 0;
let score = 0;
let pokemonObjectList = [];
let difficulty = '';


document .querySelector('.score').textContent = score;
//ask the user how hard they want the game to be using 4 buttons with event listeners

const difficultyContainer = document.createElement('div');
difficultyContainer.classList.add('difficulty-container');

const difficulties = ['easy', 'medium', 'hard', 'insane'];
difficulties.forEach(difficulty => {
    const button = document.createElement('button');
    button.classList.add('difficulty-button', difficulty);
    button.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    button.addEventListener('click', () => createGame(difficulty));
    difficultyContainer.appendChild(button);
});

gridContainer.appendChild(difficultyContainer);

//console.log("connected")
//create game function
function createGame(difficulty){
    difficulty = difficulty;
gridContainer.innerHTML = '';
const cardCount = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 8 : difficulty === 'hard' ? 16 : 50;

fetch("https://pokeapi.co/api/v2/pokemon?offset=0&limit=15000")
.then(response => response.json())
.then(data => {
    pokemonObjectList = data
    //console.log(pokemonObjectList)
    createPokeList(pokemonObjectList)
})

//create a list of random pokemon from the API
function createPokeList(pokemonObjectList){
    let pokeList = [];
    for(let i = 0; i < cardCount; i++){
        let randomPoke = Math.floor(Math.random() * pokemonObjectList.results.length)
        pokeList.push(pokemonObjectList.results[randomPoke])
    }
    //console.log(pokeList)
    //create duplicates of the cards to make pairs
    let fullCardList = pokeList.concat(pokeList)
    //console.log(`fullCardList`, fullCardList)
    shuffle(fullCardList)
    //console.log(`fullCardList`, fullCardListAfterShuffle)
    createCards(fullCardList)

}

//create the cards for the game
function createCards(pokeList){
    for(let card of pokeList){
        const cardElement = document.createElement('div')
        //console.log(card)
        //get the id of the pokemon
        let pokeId = card.url.split('/')[6]
        //console.log(pokeId)
        cardElement.classList.add('card')
        cardElement.setAttribute('data-pokemon', card.name)
        cardElement.innerHTML = `
        <div class="front">
                <div class="cardContent"> 
                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeId}.png" alt="${card.name} Height=195px">
                <div class="pokemon-name">${card.name}</div>
            </div>
        </div>
        <div class="back"> </div>
        `;
        console.log(cardElement)
        cardElement.addEventListener('click', flipCard)
        gridContainer.appendChild(cardElement)
    }
}

//function to shuffel cards before placing them on the board
function shuffle(array){
    let currentIndex = array.length, tempValue, randomIndex;
    while(currentIndex !== 0){
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        tempValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = tempValue;
    }
    console.log(array, 'array')
    return array;
}

//function to flip the cards

function flipCard(){
    if(lockBoard) return;
    if(this === firstCard) return;

    this.classList.add('flip')

    if(!firstCard){
        firstCard = this;
        return;
    }
    secondCard = this;
    score++;
    document.querySelector('.score').textContent = score;
    lockBoard = true;
    checkForMatch();
}

//function to check if the cards match
function checkForMatch(){
    let isMatch = firstCard.dataset.pokemon === secondCard.dataset.pokemon;
    isMatch ? disableCards() : unflipCards();
}

//function to disable the cards if they match
function disableCards(){
    firstCard.removeEventListener('click', flipCard)
    secondCard.removeEventListener('click', flipCard)
    matches++;
    document.querySelector('.matches').textContent = matches;
    if(matches === cardCount){
        alert('You win!')
    }
    resetBoard();
}

//function to unflip the cards if they do not match
function unflipCards(){
    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');
        resetBoard();
    }, 1500)
}

//function to reset the board

function resetBoard(){
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
}


}

//create functon to reset the game
function restart(){
    gridContainer.innerHTML = '';
    score = 0;
    matches = 0;
    document.querySelector('.score').textContent = score;
    document.querySelector('.matches').textContent = matches;
    createGame(difficulty)
}

