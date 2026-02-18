# AI Implementation Notes

## AI Features & Usage
The application leverages Artificial Intelligence to analyze codebases and provide intelligent answers to user queries.

- **RAG Architecture**: The core logic (backend) uses Retrieval-Augmented Generation (RAG). When a code repository is uploaded, it is processed, chunked, and stored (likely in a vector store). When a user asks a question, relevant chunks are retrieved and sent to the LLM to generate an accurate response based on the actual code.
- **Code Analysis**: The AI is used to understand code structure, dependencies, and logic, capable of explaining complex functions or suggesting refactors.
- **Diagram Generation**: The AI is prompted to generate Mermaid code blocks, which the frontend then renders as visual diagrams.

## LLM and Provider
- **Provider**: **OpenAI**
- **Model**: Likely **GPT-3.5-turbo** or **GPT-4** (configurable in backend).
- **Why**: OpenAI's models currently offer the best balance of code understanding, instruction following (crucial for generating specific formats like JSON or Mermaid syntax), and speed. The integration via `langchain` allows for robust chain management.

## Human Verification vs. AI Generation
While AI powers the core analysis features, the application development itself involved a mix of AI assistance and manual engineering.

### What AI Was Used For
- **Component Scaffolding**: Generating the initial structure of React components (e.g., `Loader.jsx`, Chat interfaces).
- **Styling**: Suggesting Tailwind utility classes for consistent design and responsive layouts.
- **Regular Expressions**: Creating complex regex patterns for parsing code blocks or validating inputs.
- **Debugging**: Analyzing stack traces and suggesting fixes for build errors.

### What Was Checked/Built Manually
- **Application Architecture**: Deciding on the component hierarchy, state management strategy, and service layer abstraction.
- **API Integration**: Manually implementing `axios` interceptors and ensuring correct endpoint usage (`uploadZip`, `askQuestion`).
- **User Experience (UX)**: Fine-tuning animations, error handling flows, and loading states to ensure the app feels responsive and robust.
- **Security**: Verifying that sensitive keys (like API tokens) are handled via environment variables (`.env`) and not hardcoded.
- **Build Configuration**: Adjusting Vite settings (e.g., `chunkSizeWarningLimit`) to optimize the production build.
