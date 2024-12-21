exports.createGameEngine = () => {

    const initGame = (gameFromDB) => {
        gameFromDB.gameStatus = 0;
        // null -> game has not started yet  
        // 0 -> game has started and running 
        // 1 -> player 1 is the winner 
        // 2 -> player 2 is the winner 
        // 3 -> draw (if applicable, e.g., time runs out with no winner)
        gameFromDB.theBoard = gridConfig(gameFromDB.boardId)
        gameFromDB.size = gameFromDB.theBoard.rows * gameFromDB.theBoard.cols;
        gameFromDB.currentPlayer = 1; // Player 1 starts
        gameFromDB.board = createCardPairs(gameFromDB.size); // Randomized deck of cards
        gameFromDB.flippedCards = []; // Store indices of flipped cards in the current turn
        gameFromDB.matchedCards = []; // Store indices of matched pairs
        gameFromDB.turns = { 1: 0, 2: 0 };
        gameFromDB.pairsDiscovered = { 1: 0, 2: 0 };

        return gameFromDB;
    };

    const gridConfig = (id) => {
        switch (id) {
            case 1: return { rows: 3, cols: 4 }
            case 2: return { rows: 4, cols: 4 }
            case 3: return { rows: 6, cols: 6 }
            default: return { rows: 0, cols: 0 }
        }
    }

    const pairsDiscoveredFor = (game, player_id) => {
        game.pairsDiscovered[player_id] += 1;
    };
    const gameEnded = (game) => game.gameStatus !== 0;
    const createGame = (gameId, player1Id, player2Id) => {
        const gameState = {
            board: this.generateBoard(),
            currentPlayer: player1Id,
            player1: {
                id: player1Id,
                score: 0,
                selectedCards: []
            },
            player2: {
                id: player2Id,
                score: 0,
                selectedCards: []
            },
            matchedCards: [],
            flippedCards: []
        };
        this.games.set(gameId, gameState);
        return gameState;
    }


    const createCardPairs = (boardSize) => {
        const cardTypes = ["e", "o", "p", "c"];
        const cardValues = [1, 2, 3, 4, 5, 6, 7, 11, 12, 13];

        const cardCombinations = cardTypes.flatMap((type) =>
            cardValues.map((value) => `${type}${value}`)
        );

        const selectedCombinations = cardCombinations
            .sort(() => Math.random() - 0.5)
            .slice(0, boardSize / 2);

        const shuffledCards = [...selectedCombinations, ...selectedCombinations]
            .sort(() => Math.random() - 0.5)
            .map((cardCode, index) => ({
                id: index,
                value: cardCode,
                isFlipped: false,
                isMatched: false,
            }));

        return shuffledCards;
    };

    const isBoardComplete = (game) => game.matchedCards.length === game.size / 2;

    const changeGameStatus = (game) => {
        if (isBoardComplete(game)) {
            if (game.pairsDiscovered[1] !== game.pairsDiscovered[2]) {
                game.gameStatus = game.pairsDiscovered[1] > game.pairsDiscovered[2] ? 1 : 2;
            } else {
                // "Empate" 
                if (game.currentPlayer === 1) {
                    game.gameStatus = 2; // jogador 2 alcançou primeiro os pares
                } else {
                    game.gameStatus = 1;
                }
            }
        } else {
            game.gameStatus = 0;
        }
    };


    const play = (game, index, playerSocketId, roomName, io) => {
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

        if (index < 0 || index >= game.board.length || game.flippedCards.includes(index) || game.matchedCards.includes(index)) {
            return {
                errorCode: 13,
                errorMessage: 'Invalid play: card cannot be flipped!'
            };
        }
        const card = game.board[index];
        card.isFlipped = true;
        game.flippedCards.push(card);
        io.to(roomName).emit("gameChanged", game);
        if (game.flippedCards.length === 2) {
            game.turns[game.currentPlayer] += 1;

            const [firstCard, secondCard] = game.flippedCards;

            if (firstCard.value === secondCard.value) {
                firstCard.isMatched = true;
                secondCard.isMatched = true;
                game.matchedCards.push(firstCard.value);

                game.flippedCards = [];
                pairsDiscoveredFor(game, game.currentPlayer);
                changeGameStatus(game);
                io.to(roomName).emit("gameChanged", game);
            } else {
                setTimeout(() => {
                    firstCard.isFlipped = false;
                    secondCard.isFlipped = false;

                    // Clear flipped cards and change the current player
                    game.flippedCards = [];
                    game.currentPlayer = game.currentPlayer === 1 ? 2 : 1;

                    // Emit the updated game state after flipping the cards back down
                    io.to(roomName).emit("gameChanged", game);
                }, 1000);
            }
        }

        return true;
    };

    const handleCardFlip = (gameId, playerId, cardIndex) => {
        const game = this.games.get(gameId);
        if (!game) return null;

        const currentPlayer = playerId === game.player1.id ? game.player1 : game.player2;

        // Validate turn
        if (game.currentPlayer !== playerId || game.flippedCards.includes(cardIndex)) {
            return null;
        }

        // Flip card
        game.flippedCards.push(cardIndex);
        currentPlayer.selectedCards.push(cardIndex);

        // Check for match if two cards are flipped
        if (currentPlayer.selectedCards.length === 2) {
            const [firstIndex, secondIndex] = currentPlayer.selectedCards;
            const isMatch = game.board[firstIndex] === game.board[secondIndex];

            if (isMatch) {
                game.matchedCards.push(firstIndex, secondIndex);
                currentPlayer.score += 1;
            } else {
                // Switch turns
                game.currentPlayer = game.currentPlayer === game.player1.id ?
                    game.player2.id : game.player1.id;
            }

            // Reset selected cards
            currentPlayer.selectedCards = [];
            if (!isMatch) {
                setTimeout(() => {
                    game.flippedCards = game.flippedCards.filter(
                        index => game.matchedCards.includes(index)
                    );
                }, 1000);
            }
        }

        return {
            board: game.board,
            currentPlayer: game.currentPlayer,
            flippedCards: game.flippedCards,
            matchedCards: game.matchedCards,
            player1Score: game.player1.score,
            player2Score: game.player2.score,
            isGameOver: game.matchedCards.length === game.board.length
        };
    }

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
        createGame,
        gameEnded,
        handleCardFlip,
        play,
        quit,
        close
    };
};
