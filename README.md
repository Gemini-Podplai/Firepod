# Podplai Studio

An AI development sandbox powered by Google's Gemini models that provides an interactive environment for code generation, chat, and AI experimentation.

## 🌟 Features

- **Multiple AI Model Support**: Integration with Google's Gemini models (2.5 Pro, 2.0 Flash, 1.5 Pro, etc.)
- **Persistent Chat History**: PostgreSQL database integration for saving conversations
- **Code Generation**: AI-powered code creation with syntax highlighting
- **Project Management**: Save and organize multiple AI-assisted coding projects
- **Enhanced Error Handling**: Robust retry logic for API calls
- **User Authentication**: Secure login and registration system
- **Personalized AI Characters**: Create custom AI assistants with specific personas
- **Interactive Model Playground**: Tune AI parameters like temperature and tokens in real-time

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: Google Generative AI SDK (@google/generative-ai)
- **Authentication**: Passport.js with session-based auth
- **State Management**: React Query (TanStack Query)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Google AI API key (for Gemini models)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/podplay

# API Keys
GOOGLE_API_KEY=your_google_ai_key_here

# Session
SESSION_SECRET=your_random_session_secret
```

**IMPORTANT**: Ensure sensitive files like service account JSON keys are NOT committed to the repository. These should be handled securely, preferably via environment variables or a secure key management system. The `.gitignore` file has been updated to help prevent accidental commits of common sensitive file patterns.

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/Gemini-Podplai/Firepod.git
    cd Firepod
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up the database:
    ```bash
    npm run db:push
    ```
4.  If using Firebase Functions:
    *   Navigate to the functions directory: `cd functions`
    *   Install necessary dependencies:
        ```bash
        npm install @google/generative-ai firebase-admin firebase-functions
        ```
    *   If you encounter issues with `@genkit-ai/cli`, you can safely remove it: `npm remove @genkit-ai/cli`

### Running the Application

Start the development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5000` for your application. If using the Firebase emulator, the UI is typically accessible at `http://localhost:4000`.

## 📋 Usage Guide

### Chat Interface

- Select an AI model from the dropdown.
- Adjust parameters like temperature and max tokens.
- Type your message and press Enter to send.
- View the AI's response in the chat window.

### Code Generation

- Describe the code you want to generate.
- Choose the programming language.
- Adjust parameters for different creativity levels.
- View and edit the generated code.

### Project Management

- Save code snippets as projects.
- Organize projects into folders.
- Edit and update projects as needed.
- Share projects with others.

## 🏗️ Project Structure

```
Firepod/
├── client/               # Frontend code (React, TypeScript)
│   ├── public/           # Static assets
│   └── src/              # Source files
│       ├── components/   # UI components
│       ├── context/      # React context providers
│       ├── hooks/        # Custom React hooks
│       ├── lib/          # Utility functions and API integrations
│       └── pages/        # Page components
├── Functions/            # Firebase Cloud Functions
│   └── src/              # Source files
├── config/               # Configuration files
├── migrations/           # Database migration scripts
├── old-project/          # Older project files (can be reviewed/cleaned up)
├── prisma/               # Prisma schema and migrations
├── server/               # Backend code (Node.js, Express)
│   ├── config/           # Server configuration
│   ├── middleware/       # Express middleware
│   ├── routes/           # API routes
│   └── services/         # Backend services
├── src/                  # Shared or root-level source files
└── ...                   # Other project files (.gitignore, package.json, etc.)
```

## 🧠 AI Model Capabilities

The sandbox integrates with Google's Gemini models, providing various capabilities:

- **Gemini 2.5 Pro**: Advanced reasoning, complex instructions, multimodal capabilities.
- **Gemini 2.0 Flash**: Fast responses, good balance of speed and quality.
- **Gemini 1.5 Pro**: Strong general performance, good for code generation.
- **Gemini 1.5 Flash**: Optimized for quick responses and chat.

## ✨ Modernizing AI Integration

This project uses the `@google/generative-ai` SDK. For the latest features and best practices with Gemini models, refer to the [Google Gemini Cookbook](https://github.com/google-gemini/cookbook). Consider exploring advanced techniques like Function Calling and Multimodal support based on your application's needs.

## 🛡️ DevOps & Quality

To enhance the project's robustness and maintainability:

- **CI/CD:** Set up Continuous Integration/Continuous Deployment pipelines (e.g., using GitHub Actions) for automated linting, testing, and deployment.
- **Testing:** Implement unit and integration tests for both frontend and backend logic, as well as AI interaction flows.
- **Security:** Regularly review Firebase security rules and ensure all sensitive information is handled using environment variables or secure secrets management.

## 🌱 Community & Growth

We welcome contributions and feedback!

- **Issues:** Report bugs or suggest features on the [GitHub Issues page](https://github.com/Gemini-Podplai/Firepod/issues).
- **Discussions:** Share ideas and ask questions on the [GitHub Discussions page](https://github.com/Gemini-Podplai/Firepod/discussions).
- **Contributing:** If you'd like to contribute code, please refer to the `CONTRIBUTING.md` file (to be added) for guidelines.
- **Badges:** Consider adding build status, license, and test coverage badges to the README for better visibility.

## ⚠️ Troubleshooting

- **Server Binding Error (ENOTSUP):** If you encounter this error (common on Windows), modify your server file (e.g., `server/server.js` or `server/index.ts`) to bind to IPv4 (`'0.0.0.0'`) instead of IPv6 (`'::'`).
- **Package Installation Issues:** Ensure you have the latest npm (`npm install -g npm`). Try installing packages individually if a bulk install fails.
- **Git Secrets:** If you accidentally commit sensitive files, **do not** just delete them in a new commit. You must rewrite your Git history to remove them completely. Refer to online guides for using `git filter-repo` or `git filter-branch` for this purpose. We have attempted this process previously, and the `.gitignore` has been updated.

## License

This project is licensed under the MIT License.

---

This project is for personal use and experimentation with AI technologies, specifically designed to support neurological needs through AI interactions.
