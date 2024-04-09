import React, {useEffect, useState} from 'react';
import he from 'he';
import './QuestionInterface.scss';
import {TriviaQuestion} from '../model/trivia.ts';

interface QuestionInterfaceProps {
    trivia: TriviaQuestion | null,
    questionNumber: number,
    onClick: (index: number, correctAnswerIndex: number) => void,
    lifelineUsed: boolean,
    setLifelineUsed: React.Dispatch<React.SetStateAction<boolean>>
}

const QuestionInterface: React.FC<QuestionInterfaceProps> = (
    {
        trivia,
        questionNumber,
        onClick,
        lifelineUsed,
        setLifelineUsed,
    }
) => {
    const [question, setQuestion] = useState<string>('');
    const [answers, setAnswers] = useState<string[]>([]);
    const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number>(0);
    const [disabledIndices, setDisabledIndices] = useState<number[]>([]);
    const [audienceResults, setAudienceResults] = useState<{[key: string]: number}>({});

    const handleClick = (index: number) => {
        onClick(index, correctAnswerIndex);
    }

    const handleUseLifeline = () => {
        if (lifelineUsed) return;

        generateAudienceResults();
        setLifelineUsed(true);
    };

    const generateAudienceResults = () => {
        const difficulty = questionNumber <= 4
            ? 'easy'
            : questionNumber <= 9
                ? 'medium'
                : 'hard';

        const results = answers.reduce((acc, answer) => {
            acc[answer] = 0; // Initialize all answers with 0
            return acc;
        }, {} as { [answer: string]: number });

        let baseCorrectPercentage = difficulty === 'easy' ? 80 : difficulty === 'medium' ? 65 : 50;

        // Simulate more uncertainty for hard questions
        if (difficulty === 'hard') {
            baseCorrectPercentage -= (5 + Math.random() * 10); // Reduce by 5-15%
        }

        // Distribute votes (this could be made more sophisticated)
        results[answers[correctAnswerIndex]] = baseCorrectPercentage;
        const remainingPercentage = 100 - baseCorrectPercentage;
        let distributed = 0;
        const incorrectAnswers =  answers.filter((_, index) => index !== correctAnswerIndex);

        while (distributed < remainingPercentage) {
            const randomIndex = Math.floor(Math.random() * incorrectAnswers.length);
            const randomVote = Math.min(remainingPercentage - distributed, Math.random() * 10);
            results[incorrectAnswers[randomIndex]] += randomVote;
            distributed += randomVote;
        }

        setAudienceResults(results);
    };

    function shuffleArray<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    useEffect(() => {
        if (trivia) {
            setQuestion(he.decode(trivia.question));

            const correctAnswer = he.decode(trivia.correct_answer);
            const shuffledAnswers = shuffleArray([
                ...trivia.incorrect_answers.map(a => he.decode(a)),
                correctAnswer,
            ]);

            setAnswers(shuffledAnswers);
            setCorrectAnswerIndex(shuffledAnswers.indexOf(correctAnswer));
        }
    }, [trivia]);

    return (
        <div className={'question_interface'}>
            <div className={'question-paragraph'}>
                <p>{questionNumber + 1}. {question}</p>
            </div>
            <div className={'horizontal-line'}></div>
            <div className="answers">
                <div className='answer-row'>
                    {answers.slice(0, 2).map((answer, index) => (
                        <button
                            key={index}
                            disabled={disabledIndices.includes(index)}
                            onClick={() => handleClick(index)}
                        >
                            <span>{String.fromCharCode(65 + index)}.</span> {answer}
                        </button>
                    ))}
                </div>
                <div className='answer-row'>
                    {answers.slice(2, 4).map((answer, index) => (
                        <button
                            key={index + 2}
                            disabled={disabledIndices.includes(index + 2)}
                            onClick={() => handleClick(index + 2)}
                        >
                            <span>{String.fromCharCode(65 + index + 2)}.</span> {answer}
                        </button>
                    ))}
                </div>
            </div>
            {audienceResults && renderAudienceResults(audienceResults)}
            <button onClick={handleUseLifeline} disabled={lifelineUsed}>Ask the Audience</button>
        </div>
    );
}

const renderAudienceResults = (results: { [answer: string]: number }) => (
    <div className="audience-results">
        <h3>Audience Results</h3>
        <table>
            <thead>
            <tr>
                <th>Answer</th>
                <th>Votes</th>
            </tr>
            </thead>
            <tbody>
            {Object.entries(results).map(([answer, percentage]) => (
                <tr key={answer}>
                    <td>{answer}</td>
                    <td>{percentage.toFixed(0)}%</td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
);

export default QuestionInterface;
