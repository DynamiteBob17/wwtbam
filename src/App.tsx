import React, { useState, useEffect } from 'react';
import QuestionInterface from './components/QuestionInterface';
import {TriviaAPIResponse, TriviaQuestion} from './model/trivia.ts';
import apiConfig from './util/axiosConfig';
import './App.scss';

interface GameState {
    questionNumber: number;
    victory: boolean;
}

const App: React.FC = () => {
    const [trivia, setTrivia] = useState<TriviaQuestion | null>(null);
    const [gameState, setGameState] = useState<GameState>({
        questionNumber: 0,
        victory: false
    });
    const [lifelineUsed, setLifelineUsed] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchTrivia = async () => {
        setLoading(true);

        try {
            let difficulty: 'easy' | 'medium' | 'hard';
            if (gameState.questionNumber <= 4) {
                difficulty = 'easy';
            } else if (gameState.questionNumber >= 5 && gameState.questionNumber <= 9) {
                difficulty = 'medium';
            } else {
                difficulty = 'hard';
            }
            const {data} = await apiConfig({amount: 1, difficulty}).get<TriviaAPIResponse>('');
            setTrivia(data.results[0]);
            setLoading(false);
        } catch (e) {
            console.error(e);
            await fetchTrivia();
        }
    }

    useEffect(() => {
        fetchTrivia().then().catch();
    }, []);

    const handleClick = (index: number, correctAnswerIndex: number) => {
        const isCorrectAnswer = index === correctAnswerIndex;

        setGameState((prev) => ({
            ...prev,
            questionNumber: isCorrectAnswer ? prev.questionNumber + 1 : 0,
            victory: isCorrectAnswer && prev.questionNumber >= 14,
        }));

        if (!isCorrectAnswer) setLifelineUsed(false);
        if (isCorrectAnswer && gameState.questionNumber >= 14) return;

        fetchTrivia().then().catch();
    }

    return (
        <>
            {
                gameState.victory &&
                <div>
                    <p>VICTORY</p>
                    <button onClick={() => window.location.reload()}>NEW GAME</button>
                </div>
            }
            {
                loading
                    ? <div className="lds-facebook">
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                    : <QuestionInterface
                        trivia={trivia}
                        questionNumber={gameState.questionNumber}
                        onClick={handleClick}
                        lifelineUsed={lifelineUsed}
                        setLifelineUsed={setLifelineUsed}
                    />
            }
        </>
    );
}

export default App;
