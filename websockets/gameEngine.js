exports.createGameEngine = () => {

    const initGame = (gameFromDB) => {
        gameFromDB.gameStatus = null; 
        // null -> game has not started yet  
        // 0 -> game has started and running 
        // 1 -> player 1 is the winner 
        // 2 -> player 2 is the winner 
        // 3 -> draw (if applicable, e.g., time runs out with no winner)
        
        gameFromDB.currentPlayer = 1; // Player 1 starts
        gameFromDB.board = shuffleCards(); // Randomized deck of cards
        gameFromDB.flippedCards = []; // Store indices of flipped cards in the current turn
        gameFromDB.matchedPairs = []; // Store indices of matched pairs
        return gameFromDB;
    };

    const shuffleCards = () => {
        const deck = [...Array(16).keys()].map(i => Math.floor(i / 2)); // Generate pairs of card values
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    };

    const isBoardComplete = (game) => game.matchedPairs.length === game.board.length / 2;

    const changeGameStatus = (game) => {
        if (isBoardComplete(game)) {
            game.gameStatus = game.player1Score === game.player2Score ? 3 : (game.player1Score > game.player2Score ? 1 : 2);
        } else {
            game.gameStatus = 0;
        }
    };

    const gameEnded = (game) => game.gameStatus > 0;

    const flipCard = (game, index, playerSocketId) => {
        if ((playerSocketId != game.player1SocketId) && (playerSocketId != game.player2SocketId)) {
            return {
                errorCode: 10,
                errorMessage: 'You are not playing this game!'
            };
        }

        if (gameEnded(game)) {
            return {
                errorCode: 11,
                errorMessage: 'Game has already ended!'
            };
        }

        if (index < 0 || index >= game.board.length || game.flippedCards.includes(index) || game.matchedPairs.includes(index)) {
            return {
                errorCode: 13,
                errorMessage: 'Invalid play: card cannot be flipped!'
            };
        }

        game.flippedCards.push(index);

        if (game.flippedCards.length === 2) {
            const [first, second] = game.flippedCards;
            if (game.board[first] === game.board[second]) {
                game.matchedPairs.push(first, second);
                game.currentPlayer === 1 ? game.player1Score++ : game.player2Score++;
            } else {
                game.currentPlayer = game.currentPlayer === 1 ? 2 : 1;
            }
            game.flippedCards = [];
        }

        changeGameStatus(game);
        return true;
    };

    const quit = (game, playerSocketId) => {
        if ((playerSocketId != game.player1SocketId) && (playerSocketId != game.player2SocketId)) {
            return {
                errorCode: 10,
                errorMessage: 'You are not playing this game!'
            };
        }

        if (gameEnded(game)) {
            return {
                errorCode: 11,
                errorMessage: 'Game has already ended!'
            };
        }

        game.gameStatus = playerSocketId == game.player1SocketId ? 2 : 1;
        return true;
    };

    const close = (game, playerSocketId) => {
        if ((playerSocketId != game.player1SocketId) && (playerSocketId != game.player2SocketId)) {
            return {
                errorCode: 10,
                errorMessage: 'You are not playing this game!'
            };
        }

        if (!gameEnded(game)) {
            return {
                errorCode: 14,
                errorMessage: 'Cannot close a game that has not ended!'
            };
        }

        return true;
    };

    return {
        initGame,
        gameEnded,
        flipCard,
        quit,
        close
    };
};
