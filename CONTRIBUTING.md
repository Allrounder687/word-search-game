# Contributing to Word Search Game

Thank you for considering contributing to the Word Search Game! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and considerate of others when contributing to this project. We aim to foster an inclusive and welcoming community.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with the following information:

- A clear, descriptive title
- Steps to reproduce the bug
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Your environment (browser, OS, device)

### Suggesting Features

We welcome feature suggestions! Please create an issue with:

- A clear, descriptive title
- Detailed description of the proposed feature
- Any relevant mockups or examples
- Explanation of why this feature would be useful

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/word-search-game.git
cd word-search-game
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

## Coding Standards

- Follow the existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation when necessary
- Write and update tests for your changes

## File Structure Conventions

- React Components: PascalCase (e.g., `WordGrid.tsx`, `SettingsModal.tsx`)
- Utility Functions: camelCase (e.g., `gameLogic.ts`, `wordGenerator.ts`)
- Custom Hooks: camelCase with 'use' prefix (e.g., `useGameState.ts`)
- Type Definitions: PascalCase in dedicated files (e.g., `game.ts`)

## Testing

Please ensure your code passes all tests before submitting a pull request:

```bash
npm run lint
npm run test
```

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.