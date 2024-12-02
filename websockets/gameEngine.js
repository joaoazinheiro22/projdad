exports.createGameEngine = () => {
    const initGame = (gameData) => {
        const game = {
            id: gameData.id,
            player1: gameData.player1,
            player2: gameData.player2 || null,
            board: createBoard(gameData.boardSize || 4), // Default to 4x4 board
            status: 'waiting', // waiting, playing, ended
            currentPlayer: gameData.player1.id,
            matchedPairs: 0,
            totalPairs: (gameData.boardSize || 4) * (gameData.boardSize || 4) / 2,
            moves: [],
        };
        return game;
    };

    const createBoard = (size) => {
        const totalCards = size * size;
        const cardValues = Array.from({ length: totalCards / 2 }, (_, i) => i + 1);
        const cards = [...cardValues, ...cardValues];
        return shuffle(cards).map((value, index) => ({
            id: index,
            value,
            isFlipped: false,
            isMatched: false,
        }));
    };

    const shuffle = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const play = (game, cardId, playerId) => {
        if (game.status !== 'playing') {
            return { error: 'Game is not in playing state' };
        }
        if (game.currentPlayer !== playerId) {
            return { error: 'Not your turn' };
        }

        const card = game.board.find(c => c.id === cardId);
        if (!card || card.isFlipped || card.isMatched) {
            return { error: 'Invalid card selection' };
        }

        card.isFlipped = true;
        game.moves.push(card);

        if (game.moves.length === 2) {
            const [firstCard, secondCard] = game.moves;
            if (firstCard.value === secondCard.value) {
                firstCard.isMatched = true;
                secondCard.isMatched = true;
                game.matchedPairs++;
                if (game.matchedPairs === game.totalPairs) {
                    game.status = 'ended';
                    game.winner = playerId;
                }
            } else {
                setTimeout(() => {
                    firstCard.isFlipped = false;
                    secondCard.isFlipped = false;
                }, 1000); // Flip back after 1 second
            }
            game.moves = [];
        }

        game.currentPlayer = game.currentPlayer === game.player1.id ? game.player2.id : game.player1.id;
        return true;
    };

    const gameEnded = (game) => {
        return game.status === 'ended';
    };

    const quit = (game, playerId) => {
        if (game.status !== 'playing') {
            return { error: 'Game is not in playing state' };
        }
        game.status = 'ended';
        game.winner = game.player1.id === playerId ? game.player2.id : game.player1.id;
        return true;
    };

    const close = (game, playerId) => {
        if (game.status !== 'playing') {
            return { error: 'Game is not in playing state' };
        }
        game.status = 'ended';
        game.winner = null;
        return true;
    };

    return {
        initGame,
        play,
        gameEnded,
        quit,
        close,
    };
};