class Card {
    constructor(name, imgSrc) {
        this.name = name;
        this.imgSrc = imgSrc;
        this.isFlipped = false;
        this.cardElement = this.#createCardElement();
    }

    #createCardElement() {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('cell');
        cardDiv.innerHTML = `
            <div class="card" data-name="${this.name}">
                <div class="card-inner">
                    <div class="card-front"></div>
                    <div class="card-back">
                        <img src="${this.imgSrc}" alt="${this.name}">
                    </div>
                </div>
            </div>
        `;
        return cardDiv;
    }

    toggleFlipState() {
        this.isFlipped = !this.isFlipped;
        if (this.isFlipped) {
            this.#flipCard();
        } else {
            this.#unflipCard();
        }
    }

    matches(otherCard) {
        return this.name === otherCard.name;
    }

    #flipCard() {
        this.cardElement.querySelector('.card').classList.add('flipped');
    }

    #unflipCard() {
        this.cardElement.querySelector('.card').classList.remove('flipped');
    }
}

class Board {
    constructor(cards) {
        this.cards = cards;
        this.fixedGridContainer = document.querySelector('.fixed-grid');
        this.gameBoardContainer = document.getElementById('game-board');
    }

    #determineColumnCount() {
        const totalCards = this.cards.length;
        let columnCount = Math.floor(totalCards / 2);
        columnCount = Math.max(2, Math.min(columnCount, 12));
        if (columnCount % 2 !== 0) {
            columnCount = columnCount === 11 ? 12 : columnCount - 1;
        }
        return columnCount;
    }

    #configureGridColumns() {
        const columns = this.#determineColumnCount();
        this.fixedGridContainer.className = `grid grid-has-${columns}-cols`;
    }

    renderCards() {
        this.#configureGridColumns();
        this.gameBoardContainer.innerHTML = '';
        this.cards.forEach(card => {
            card.cardElement.querySelector('.card').addEventListener('click', () => this.handleCardClick(card));
            this.gameBoardContainer.appendChild(card.cardElement);
        });
    }

    handleCardClick(clickedCard) {
        if (typeof this.onCardClick === 'function') {
            this.onCardClick(clickedCard);
        }
    }

    shuffleCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[randomIndex]] = [this.cards[randomIndex], this.cards[i]];
        }
    }

    hideAllCards() {
        this.cards.forEach(card => {
            if (card.isFlipped) {
                card.toggleFlipState();
            }
        });
    }

    resetGame() {
        this.shuffleCards();
        this.hideAllCards();
        this.renderCards();
    }
}

class MemoryGame {
    constructor(gameBoard, flipAnimationDuration = 500) {
        this.gameBoard = gameBoard;
        this.flippedCards = [];
        this.matchedCards = [];
        if (flipAnimationDuration < 350 || isNaN(flipAnimationDuration) || flipAnimationDuration > 3000) {
            flipAnimationDuration = 350;
            alert('La duración de la animación debe estar entre 350 y 3000 ms, se ha establecido a 350 ms');
        }
        this.flipAnimationDuration = flipAnimationDuration;
        this.gameBoard.onCardClick = this.#handleCardClick.bind(this);
        this.resetGame();
    }

    #handleCardClick(clickedCard) {
        if (this.flippedCards.length < 2 && !clickedCard.isFlipped) {
            clickedCard.toggleFlipState();
            this.flippedCards.push(clickedCard);

            if (this.flippedCards.length === 2) {
                setTimeout(() => this.checkForMatches(), this.flipAnimationDuration);
            }
        }
    }

    checkForMatches() {
        const [firstFlippedCard, secondFlippedCard] = this.flippedCards;
        if (firstFlippedCard.matches(secondFlippedCard)) {
            this.matchedCards.push(firstFlippedCard, secondFlippedCard);
        } else {
            firstFlippedCard.toggleFlipState();
            secondFlippedCard.toggleFlipState();
        }
        this.flippedCards = [];
    }

    resetGame() {
        this.flippedCards = [];
        this.matchedCards = [];
        this.gameBoard.resetGame();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const cardsData = [
        { name: 'Python', imgSrc: './img/Python.svg' },
        { name: 'JavaScript', imgSrc: './img/JS.svg' },
        { name: 'Java', imgSrc: './img/Java.svg' },
        { name: 'CSharp', imgSrc: './img/CSharp.svg' },
        { name: 'Go', imgSrc: './img/Go.svg' },
        { name: 'Ruby', imgSrc: './img/Ruby.svg' },
    ];

    const cards = cardsData.flatMap(data => [new Card(data.name, data.imgSrc), new Card(data.name, data.imgSrc)]);
    const gameBoard = new Board(cards);
    const memoryGameInstance = new MemoryGame(gameBoard, 1000);

    document.getElementById('restart-button').addEventListener('click', () => memoryGameInstance.resetGame());
});

