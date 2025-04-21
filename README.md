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

### Installation

1. Clone the repository
2. Install dependencies (`npm install`)
3. Set up the database (`npm run db:push`)
4. If using Firebase:
   - Create a Firestore database in Native mode:
     ```bash
     firebase firestore:databases:create --project=your-project-id
     ```
   - Make sure the database location matches your function location (e.g., europe-west1)
   - In the functions directory, install necessary dependencies:
     ```bash
     cd functions
     npm install @google/generative-ai firebase-admin firebase-functions
     # Remove problematic dependency if you encounter errors
     npm remove @genkit-ai/cli
     ```
5. Start the development server (`npm run dev`)
6. Open your browser and navigate to `http://localhost:5000` for your application 
   - Firebase Hosting emulator will also run on this port
   - Access Firebase emulator UI at `http://localhost:4000` for monitoring

### Troubleshooting

#### Server Binding Error (ENOTSUP)
If you encounter the `ENOTSUP` error when trying to run your server, which is a common issue on Windows with binding to IPv6 addresses, you can resolve it by modifying your `server.ts` file to bind to IPv4 instead. Replace the following line:

```javascript
server.listen(port, '::', () => {
  console.log(`Server is running on port ${port}`);
});
```

with:

```javascript
server.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
```

#### Package Installation Issues
If you see errors like `404 Not Found` when installing packages:
1. Ensure you have the latest npm: `npm install -g npm`
2. Try installing packages individually instead of all at once
3. For `@genkit-ai/cli` error, you can safely remove this dependency as it's not essential

## 📋 Usage Guide

### Chat Interface

- Select an AI model from the dropdown
- Adjust parameters like temperature and max tokens
- Type your message and press Enter to send
- View the AI's response in the chat window

### Code Generation

- Describe the code you want to generate
- Choose the programming language
- Adjust parameters for different creativity levels
- View and edit the generated code

### Project Management

- Save code snippets as projects
- Organize projects into folders
- Edit and update projects as needed
- Share projects with others

## 🏗️ Project Structure

```
podplay-pen/
├── client/               # Frontend code
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── context/      # React context providers
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   ├── pages/        # Page components
│   │   └── ...
├── server/               # Backend code
│   ├── auth.ts           # Authentication logic
│   ├── db.ts             # Database connection
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data storage interface
│   └── ...
├── shared/               # Shared code
│   └── schema.ts         # Database schema
└── ...
```

## 🧠 AI Model Capabilities

The sandbox integrates with Google's Gemini models, providing various capabilities:

- **Gemini 2.5 Pro**: Advanced reasoning, complex instructions, multimodal capabilities
- **Gemini 2.0 Flash**: Fast responses, good balance of speed and quality
- **Gemini 1.5 Pro**: Strong general performance, good for code generation
- **Gemini 1.5 Flash**: Optimized for quick responses and chat

---

This project is for personal use and experimentation with AI technologies, specifically designed to support neurological needs through AI interactions.

## Project Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your own credentials

3. **IMPORTANT**: Service Account Setup
   - Download your Google Cloud service account JSON file
   - Rename it to `service-account.json`
   - Place it in the project root directory
   - **DO NOT COMMIT THIS FILE** (it's already in `.gitignore`)

4. Start the development server:
   ```
   npm run dev
   ```

## Database Setup

The application uses PostgreSQL for data storage. Database migrations are automatically run when needed.

### Configuration

1. Create a `.env` file based on `.env.example` and configure your database connection:

```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=podplai
DB_PASSWORD=yourpassword
DB_PORT=5432
```

### Database Commands

- `npm run db:push` - Run database migrations manually
- `npm run db:check` - Check if required database tables exist

The database will be automatically configured when you run the application with `npm start`.

### Creating Migrations

To add new database structures:

1. Create a new SQL file in the `migrations/` directory
2. Name it with a sequential number prefix (e.g., `002-add-settings-table.sql`)
3. Write your SQL migration code
4. Run `npm run db:push` to apply the migration

## Troubleshooting

If you're having issues with Git because you accidentally committed credentials:

1. Read the `CREDENTIALS_GUIDE.md` file
2. Run one of the scripts in the `scripts` directory to clean your Git history

## Project Structure

- `/public` - Static assets
- `/src` - Source code
- `/routes` - API routes
- `/config` - Configuration files
- `/utils` - Utility functions
