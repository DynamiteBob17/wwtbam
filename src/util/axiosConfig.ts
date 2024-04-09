import axios from 'axios';

interface TriviaQueryParams {
    amount: number;
    difficulty: 'easy' | 'medium' | 'hard';
}

const apiConfig = (params: TriviaQueryParams) => {
    return axios.create({
        baseURL: 'https://opentdb.com/api.php', // Base URL for Open Trivia DB
        params: {
            ...params,
            // Ensure the question type is always 'multiple'
            type: 'multiple'
        }
    });
};

export default apiConfig;
