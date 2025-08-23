import type { Position, WordPlacement, Cell, Direction, GameSettings } from '../types/game';
import { WORD_LISTS, WORD_COLORS, CATEGORY_WORD_LISTS } from '../types/game';

export class WordSearchGenerator {
    private grid: string[][];
    private size: number;
    private words: WordPlacement[];

    constructor(size: number) {
        this.size = size;
        this.grid = Array(size).fill(null).map(() => Array(size).fill(''));
        this.words = [];
    }

    generateGame(settings: GameSettings): { grid: Cell[][], words: WordPlacement[] } {
        this.resetGrid();

        const wordList = this.getWordList(settings);
        const shuffledWords = this.shuffleArray([...wordList]);

        // Place words in grid
        for (let i = 0; i < shuffledWords.length && this.words.length < Math.min(15, shuffledWords.length); i++) {
            const word = shuffledWords[i].toUpperCase();
            if (this.placeWord(word)) {
                // Word placed successfully
            }
        }

        // Fill empty cells with random letters
        this.fillEmptyCells();

        // Convert to Cell grid
        const cellGrid: Cell[][] = this.grid.map(row =>
            row.map(letter => ({
                letter,
                isSelected: false,
                isHighlighted: false,
                wordIds: [],
                color: undefined
            }))
        );

        return { grid: cellGrid, words: this.words };
    }

    private getWordList(settings: GameSettings): string[] {
        // If custom difficulty with custom words, use those
        if (settings.difficulty === 'custom' && settings.customWords) {
            return settings.customWords;
        }

        // If a specific category is selected, use that category's word list
        if (settings.wordCategory && settings.wordCategory !== 'custom') {
            // Use type assertion to handle all WordCategory types
            const categoryLists = CATEGORY_WORD_LISTS[settings.wordCategory as keyof typeof CATEGORY_WORD_LISTS];
            if (categoryLists) {
                return categoryLists[settings.difficulty as keyof typeof categoryLists] || categoryLists.easy;
            }
        }

        // Default to general word lists
        return WORD_LISTS[settings.difficulty as keyof typeof WORD_LISTS] || WORD_LISTS.easy;
    }

    private resetGrid(): void {
        this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(''));
        this.words = [];
    }

    private placeWord(word: string): boolean {
        const directions: Direction[] = ['horizontal', 'vertical', 'diagonal-down', 'diagonal-up'];
        const shuffledDirections = this.shuffleArray([...directions]);

        for (const direction of shuffledDirections) {
            const placement = this.tryPlaceWord(word, direction);
            if (placement) {
                this.words.push({
                    ...placement,
                    found: false,
                    color: WORD_COLORS[this.words.length % WORD_COLORS.length]
                });
                return true;
            }
        }
        return false;
    }

    private tryPlaceWord(word: string, direction: Direction): WordPlacement | null {
        const maxAttempts = 100;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const start = this.getRandomPosition();
            const end = this.calculateEndPosition(start, word.length - 1, direction);

            if (!end || !this.isValidPlacement(start, end, word, direction)) {
                continue;
            }

            // Place the word
            this.placeWordInGrid(start, word, direction);

            return {
                word,
                start,
                end,
                direction,
                found: false,
                color: ''
            };
        }

        return null;
    }

    private getRandomPosition(): Position {
        return {
            row: Math.floor(Math.random() * this.size),
            col: Math.floor(Math.random() * this.size)
        };
    }

    private calculateEndPosition(start: Position, length: number, direction: Direction): Position | null {
        let endRow = start.row;
        let endCol = start.col;

        switch (direction) {
            case 'horizontal':
                endCol += length;
                break;
            case 'vertical':
                endRow += length;
                break;
            case 'diagonal-down':
                endRow += length;
                endCol += length;
                break;
            case 'diagonal-up':
                endRow -= length;
                endCol += length;
                break;
        }

        if (endRow < 0 || endRow >= this.size || endCol < 0 || endCol >= this.size) {
            return null;
        }

        return { row: endRow, col: endCol };
    }

    private isValidPlacement(start: Position, _end: Position, word: string, direction: Direction): boolean {
        const positions = this.getWordPositions(start, word.length, direction);

        for (let i = 0; i < positions.length; i++) {
            const pos = positions[i];
            const currentCell = this.grid[pos.row][pos.col];

            if (currentCell !== '' && currentCell !== word[i]) {
                return false;
            }
        }

        return true;
    }

    private getWordPositions(start: Position, length: number, direction: Direction): Position[] {
        const positions: Position[] = [];

        for (let i = 0; i < length; i++) {
            let row = start.row;
            let col = start.col;

            switch (direction) {
                case 'horizontal':
                    col += i;
                    break;
                case 'vertical':
                    row += i;
                    break;
                case 'diagonal-down':
                    row += i;
                    col += i;
                    break;
                case 'diagonal-up':
                    row -= i;
                    col += i;
                    break;
            }

            positions.push({ row, col });
        }

        return positions;
    }

    private placeWordInGrid(start: Position, word: string, direction: Direction): void {
        const positions = this.getWordPositions(start, word.length, direction);

        for (let i = 0; i < positions.length; i++) {
            const pos = positions[i];
            this.grid[pos.row][pos.col] = word[i];
        }
    }

    private fillEmptyCells(): void {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.grid[row][col] === '') {
                    this.grid[row][col] = letters[Math.floor(Math.random() * letters.length)];
                }
            }
        }
    }

    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

export function checkWordSelection(
    selection: Position[],
    words: WordPlacement[]
): WordPlacement | null {
    if (selection.length < 2) return null;

    const start = selection[0];
    const end = selection[selection.length - 1];

    for (const word of words) {
        if (word.found) continue;

        // Check if selection matches word (forward or backward)
        if (
            (positionsEqual(start, word.start) && positionsEqual(end, word.end)) ||
            (positionsEqual(start, word.end) && positionsEqual(end, word.start))
        ) {
            // Verify all positions in selection match the word
            const wordPositions = getWordPositions(word.start, word.word.length, word.direction);
            const selectionSet = new Set(selection.map(pos => `${pos.row},${pos.col}`));
            const wordSet = new Set(wordPositions.map(pos => `${pos.row},${pos.col}`));

            if (selectionSet.size === wordSet.size &&
                [...selectionSet].every(pos => wordSet.has(pos))) {
                return word;
            }
        }
    }

    return null;
}

function positionsEqual(pos1: Position, pos2: Position): boolean {
    return pos1.row === pos2.row && pos1.col === pos2.col;
}

function getWordPositions(start: Position, length: number, direction: Direction): Position[] {
    const positions: Position[] = [];

    for (let i = 0; i < length; i++) {
        let row = start.row;
        let col = start.col;

        switch (direction) {
            case 'horizontal':
                col += i;
                break;
            case 'vertical':
                row += i;
                break;
            case 'diagonal-down':
                row += i;
                col += i;
                break;
            case 'diagonal-up':
                row -= i;
                col += i;
                break;
        }

        positions.push({ row, col });
    }

    return positions;
}

export function calculateScore(
    foundWords: Set<string>,
    timeElapsed: number,
    difficulty: string
): number {
    const baseScore = foundWords.size * 100;
    const difficultyMultiplier = {
        easy: 1,
        medium: 1.5,
        hard: 2,
        custom: 1.2
    }[difficulty] || 1;

    const timeBonus = Math.max(0, 1000 - timeElapsed);

    return Math.round(baseScore * difficultyMultiplier + timeBonus);
}

export const shouldUseKidsDescription = (word: string, kidsMode: boolean): boolean => {
  return kidsMode && word.length < 8;
};

export const getKidsDescription = (word: string): string => {
  return `This is about ${word}`;
};