# RepoMind Frontend

RepoMind is an intelligent codebase Q&A platform that allows developers to upload their projects (via ZIP or GitHub URL) and ask questions about the code, architecture, and logic using AI.

## How to Run

### Prerequisites
- Node.js (v16 or higher)
- Backend server running on `http://localhost:5000` (refer to the backend repository)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Avani1010-prog/repomind-frontend.git
   cd repomind-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally
To start the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

### Building for Production
To build the application for deployment:
```bash
npm run build
```
The output will be in the `dist` directory.

## What is Done (Features)
- **Codebase Ingestion**: Support for uploading ZIP files or connecting directly to GitHub repositories.
- **Interactive Chat**: A chat interface to ask questions about the ingested codebase.
- **Syntax Highlighting**: Code blocks in chat responses are beautifully highlighted using PrismJS.
- **Diagram Support**: Integrated Mermaid.js for rendering diagrams (flowcharts, class diagrams) directly in the chat.
- **History & Management**: View and manage previously analyzed codebases.
- **Responsive Design**: Built with Tailwind CSS for a modern, mobile-friendly interface.
- **Animations**: Smooth transitions and effects using Framer Motion.
- **Refactoring Tools**: Options to generate refactoring suggestions for specific code blocks.

## What is Not Done / Future Improvements
- **User Authentication**: Currently, the system is open and does not support user accounts or private sessions.
- **Advanced Context Selection**: Users cannot yet manually select specific files to include/exclude from the context window for a query.
- **Real-time Collaboration**: No multi-user sessions or shared workspaces.
- **Streaming Responses**: The chat currently waits for the full response; streaming token generation would improve UX.
- **Unit Tests**: comprehensive frontend test coverage is pending.
