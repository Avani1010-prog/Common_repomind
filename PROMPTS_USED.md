# Prompts Used During Development

This document records a selection of prompts used to guide the AI assistant in building and refining the application.

## Initial Setup & Configuration
- "Initialize a new Vite project with React and JavaScript."
- "Install Tailwind CSS and configure it with a custom color palette for a modern, dark-themed developer tool."
- "Set up `axios` for API requests with a base URL pointing to `localhost:5000`."

## Component Development
- "Create a `Loader` component using Framer Motion that shows a spinning geometric shape."
- "Build a drag-and-drop file upload component that specifically accepts ZIP files and shows upload progress."
- "Design a Sidebar component that is collapsible on mobile devices using standard Tailwind classes."
- "Implement a Chat interface where messages are displayed in bubbles, differentiating between 'User' and 'AI'."

## Feature Implementation
- "How do I use `prismjs` to highlight code blocks within a markdown message in React?"
- "Create a service function `uploadGithub` that sends a repo URL to the backend."
- "Implement a visually appealing 'Card' component to display a list of previously analyzed codebases with their metadata."
- "Add a button to the chat interface that allows users to copy code blocks to clipboard."

## Debugging & Refinement
- "I'm getting a 'chunk size warning' in Vite build. How do I fix this or increase the limit?"
- "The chat auto-scroll isn't working when a new message arrives. Fix the `useEffect` hook to scroll to bottom."
- "Ensure that the API service handles 500 errors gracefully and displays a toast notification to the user."
- "Optimize the `Loader.jsx` component to prevent re-renders when the parent state changes."

## Workflow & Documentation
- "Generate a README.md file explaining how to run the frontend and what features are currently implemented."
- "Run the build command and verify there are no errors."
