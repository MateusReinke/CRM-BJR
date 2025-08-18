# BJR Centro Automotivo Management System

## Overview

BJR Centro Automotivo is a responsive web application designed to manage an automotive service business with multiple units (São Paulo SP1, São Paulo SP2, and Sorocaba SOR). The system provides comprehensive management capabilities for clients, vehicles, service orders, appointments, inventory, financials, and employees across all locations. Each unit operates with color-coded branding and separate data management while maintaining a unified dashboard view for consolidated reporting.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React.js with TypeScript for type safety and modern development
- **Styling**: Tailwind CSS with custom CSS variables for theme management and unit-specific color schemes
- **UI Components**: Shadcn/ui component library built on Radix UI primitives for consistent, accessible interface elements
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Theme System**: Custom theme provider supporting light/dark modes with unit-specific color branding

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Database ORM**: Drizzle ORM for type-safe database operations and schema management
- **Authentication**: Passport.js with local strategy and session-based authentication using JWT tokens
- **Session Storage**: PostgreSQL-backed session store for persistent user sessions
- **API Design**: RESTful endpoints with standardized error handling and request/response patterns

### Database Design
- **Primary Database**: PostgreSQL with multi-unit data separation using unit enum fields
- **Schema Management**: Drizzle Kit for migrations and schema versioning
- **Data Models**: Separate tables for users, clients, vehicles, service orders, appointments, inventory, and financial transactions
- **Multi-tenancy**: Unit-based data segregation (SP1, SP2, SOR) with role-based access control

### Authentication & Authorization
- **Strategy**: Session-based authentication with encrypted password storage using scrypt
- **Role System**: Four-tier role hierarchy (admin, manager, mechanic, seller) with unit-specific permissions
- **Session Management**: Secure session handling with PostgreSQL session store and configurable session secrets

### Development Tooling
- **Build System**: Vite for fast development and optimized production builds
- **Type System**: TypeScript throughout the stack with shared type definitions
- **Code Quality**: ESM modules with strict TypeScript configuration
- **Development Server**: Hot module replacement and error overlay for efficient development

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with WebSocket support for real-time connections
- **Connection Pooling**: @neondatabase/serverless for optimized database connection management

### UI Framework Dependencies
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives for complex components
- **Lucide React**: Icon library providing consistent iconography throughout the application
- **TailwindCSS**: Utility-first CSS framework with custom configuration for automotive branding

### Development & Build Tools
- **Vite**: Modern build tool with TypeScript support and React plugin integration
- **PostCSS**: CSS processing with Tailwind and Autoprefixer plugins
- **ESBuild**: Fast JavaScript bundler for production builds

### Authentication & Session Management
- **Passport.js**: Authentication middleware with local strategy implementation
- **Connect-PG-Simple**: PostgreSQL session store adapter for Express sessions

### Form & Data Validation
- **Zod**: TypeScript-first schema validation for API endpoints and form data
- **React Hook Form**: Performant form library with Zod resolver integration
- **Drizzle-Zod**: Integration between Drizzle ORM and Zod for consistent validation

### Specialized Libraries
- **Date-fns**: Date manipulation and formatting utilities
- **Class Variance Authority**: Type-safe utility for creating component variants
- **CLSX**: Utility for constructing className strings conditionally