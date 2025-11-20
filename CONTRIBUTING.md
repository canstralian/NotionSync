# Contributing to NotionSync

Thank you for your interest in contributing to NotionSync! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

## Code of Conduct

This project adheres to a code of conduct that we expect all contributors to follow. Please be respectful, inclusive, and constructive in all interactions.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/NotionSync.git
   cd NotionSync
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/canstralian/NotionSync.git
   ```
4. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- PostgreSQL (v15 or higher) or Neon Database access
- A Notion account with API credentials

### Initial Setup

1. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Initialize the database**:
   ```bash
   npm run db:push
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

### Development Environment

The application runs on `http://localhost:5000` by default. The development server includes:

- Hot Module Replacement (HMR) for instant feedback
- TypeScript checking
- Automatic server restart on changes

## How to Contribute

### Types of Contributions

We welcome various types of contributions:

- **Bug fixes**: Fix existing issues
- **New features**: Add new functionality
- **Documentation**: Improve or add documentation
- **Tests**: Add or improve test coverage
- **Code refactoring**: Improve code quality
- **Performance improvements**: Optimize existing code

### Before You Start

1. **Check existing issues**: Look for existing issues or discussions about your proposed change
2. **Create an issue**: If none exists, create one to discuss your proposal
3. **Get feedback**: Wait for maintainer feedback before investing significant time
4. **Start small**: Begin with small, focused contributions

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Avoid using `any` type unless absolutely necessary
- Define proper types and interfaces
- Use type inference where appropriate

### Code Style

We follow these general principles:

1. **Naming Conventions**:
   - Use `camelCase` for variables and functions
   - Use `PascalCase` for components and classes
   - Use `UPPER_SNAKE_CASE` for constants
   - Use descriptive, meaningful names

2. **File Organization**:
   - One component per file
   - Group related files in directories
   - Keep files focused and concise (< 300 lines if possible)

3. **Component Structure**:
   ```typescript
   // Imports
   import React from "react";
   
   // Types
   interface ComponentProps {
     // ...
   }
   
   // Component
   export function Component({ props }: ComponentProps) {
     // hooks
     // state
     // effects
     // handlers
     // render
   }
   ```

4. **Code Formatting**:
   - Use 2 spaces for indentation
   - Use semicolons
   - Use double quotes for strings
   - Max line length: 100 characters (flexible)

### Frontend Guidelines

- Use React hooks instead of class components
- Utilize shadcn/ui components for consistency
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use TanStack Query for server state
- Handle loading and error states appropriately

### Backend Guidelines

- Follow RESTful API conventions
- Use proper HTTP status codes
- Validate input with Zod schemas
- Handle errors gracefully
- Use proper async/await patterns
- Document complex logic with comments

### Database

- Use Drizzle ORM for all database operations
- Define schemas in `shared/schema.ts`
- Create migrations for schema changes
- Use transactions for related operations
- Index frequently queried columns

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(auth): add Notion OAuth integration

- Implement OAuth flow
- Add callback handler
- Store tokens in session

Closes #123
```

```bash
fix(sync): handle empty database responses

Previously crashed when Notion returned empty results.
Now gracefully handles empty arrays.

Fixes #456
```

## Pull Request Process

### Before Submitting

1. **Update from upstream**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run type checking**:
   ```bash
   npm run check
   ```

3. **Test your changes**:
   - Manually test the affected features
   - Ensure no regressions

4. **Update documentation**:
   - Update README.md if needed
   - Add JSDoc comments for new functions
   - Update API documentation if applicable

### Submitting the PR

1. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub

3. **Fill out the PR template** with:
   - Clear description of changes
   - Related issue numbers
   - Testing performed
   - Screenshots (for UI changes)
   - Breaking changes (if any)

### PR Review Process

1. A maintainer will review your PR
2. Address any requested changes
3. Keep the PR updated with main branch
4. Once approved, a maintainer will merge

### PR Guidelines

- Keep PRs focused and reasonably sized
- One feature or fix per PR
- Include relevant tests
- Ensure CI passes
- Respond to review comments promptly
- Be open to feedback and suggestions

## Reporting Bugs

### Before Submitting a Bug Report

- Check if the bug has already been reported
- Collect information about the bug:
  - Stack trace / error messages
  - Steps to reproduce
  - Expected vs actual behavior
  - Your environment (OS, Node version, etc.)

### Submitting a Bug Report

Use the GitHub issue tracker and include:

1. **Clear title**: Summarize the issue
2. **Description**: Detailed explanation of the bug
3. **Steps to reproduce**: Exact steps to reproduce the issue
4. **Expected behavior**: What you expected to happen
5. **Actual behavior**: What actually happened
6. **Screenshots**: If applicable
7. **Environment**: OS, Node version, browser, etc.
8. **Additional context**: Any other relevant information

## Suggesting Enhancements

### Before Submitting an Enhancement

- Check if the enhancement has been suggested
- Consider if it fits the project scope
- Think about how it benefits other users

### Submitting an Enhancement Suggestion

Create an issue with:

1. **Clear title**: Summarize the enhancement
2. **Use case**: Why is this needed?
3. **Proposed solution**: How should it work?
4. **Alternatives**: Other approaches you've considered
5. **Additional context**: Mockups, examples, etc.

## Development Tips

### Useful Commands

```bash
# Type checking
npm run check

# Database operations
npm run db:push        # Push schema changes

# Development
npm run dev           # Start dev server

# Production build
npm run build         # Build for production
npm start            # Start production server
```

### Debugging

- Use browser DevTools for frontend debugging
- Use VS Code debugger for backend debugging
- Check browser console for client errors
- Check server logs for backend errors
- Use React DevTools for component inspection

### Common Issues

**Port already in use**:
```bash
# Change PORT in .env
PORT=3000
```

**Database connection errors**:
- Verify DATABASE_URL in .env
- Ensure PostgreSQL is running
- Check firewall settings

**Type errors**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## Questions?

- Open a [GitHub Discussion](https://github.com/canstralian/NotionSync/discussions)
- Comment on an existing issue
- Reach out to maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to NotionSync! 🎉
