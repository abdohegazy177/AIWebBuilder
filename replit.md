# Arabic AI Chat Assistant

## Overview

This is a full-stack chat application built with React and Express that provides an AI-powered conversational interface in Arabic. The application integrates with OpenAI's GPT-4o model to deliver intelligent responses while maintaining chat history through session management. The interface is designed with Arabic language support and uses a modern, responsive design system built with shadcn/ui components and Tailwind CSS.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom Arabic-friendly color scheme and typography
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for form handling

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API with structured endpoints for chat sessions and messages
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Session Management**: Chat sessions with message history persistence
- **Error Handling**: Centralized error handling middleware with structured error responses

### Data Storage Solutions
- **Database**: PostgreSQL configured through Drizzle ORM
- **Schema Design**: 
  - Users table for authentication (username/password)
  - Chat sessions table for conversation management
  - Messages table for storing conversation history with role-based messages (user/assistant)
- **Migrations**: Drizzle Kit for database schema management and migrations

### Authentication and Authorization
- **Current State**: Basic user schema defined but authentication not fully implemented
- **Storage**: In-memory storage implementation available as fallback
- **Session Management**: Chat sessions can be associated with user IDs

### External Service Integrations
- **OpenAI Integration**: GPT-4o model integration for generating chat responses
- **Configuration**: Environment-based API key management
- **Response Handling**: Structured chat response format with error handling
- **Conversation Context**: Maintains conversation history for contextual responses

### Development and Build Process
- **Development**: Vite dev server with hot module replacement
- **Build**: Vite for frontend build, esbuild for backend bundling
- **TypeScript**: Full TypeScript support across frontend and backend
- **Monorepo Structure**: Shared schema definitions between client and server

### UI/UX Design Decisions
- **Arabic Language Support**: Interface designed for Arabic text with appropriate RTL considerations
- **Responsive Design**: Mobile-first approach with desktop enhancements
- **Component System**: Modular chat components (MessageList, MessageInput, Sidebar)
- **Theme**: Custom color scheme optimized for Arabic text readability
- **Accessibility**: Built on Radix UI primitives for accessibility compliance