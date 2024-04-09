interface TriviaQuestion {
    type: 'multiple';
    difficulty: 'easy' | 'medium' | 'hard';
    category: string;
    question: string;
    correct_answer: string;
    incorrect_answers: string[];
}

interface TriviaAPIResponse {
    response_code: number;
    results: TriviaQuestion[];
}

export type { TriviaQuestion, TriviaAPIResponse };
