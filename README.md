# QA Report Generator

## About This Project

The QA Report Generator is a web application created to simplify, standardize, and expedite the creation of Quality Assurance test reports. It replaces the traditional, manual process of formatting documents in word processors with a dynamic, highly interactive interface. By using this tool, analysts can focus entirely on describing test scenarios and registering technical evidence, relying on the platform to handle the layout, formatting, and file generation automatically.

It was developed with the main objective of creating a unified corporate standard for QA reports, reducing the overhead of manual document formatting and enabling rapid, professional exports ready to be shared with corporate teams and stakeholders.

## Core Features

- **Dynamic Interactive Editor:** Features a block-based editor allowing users to construct test scenarios using topics, steps, lists, code snippets, and image uploading.
- **Advanced Drag-and-Drop:** Built-in drag-and-drop system to reorder entire test scenarios or individual items within a scenario in real-time.
- **Bilingual Support & Auto-Translation:** Supports both Portuguese and English interfaces, equipped with an automated translation engine to convert report contents with one click.
- **Direct Export Capabilities:** Robust native export mechanics capable of generating high-fidelity PDF documents and formatted DOCX files directly from the browser.
- **Session Management and Security:** Integrates user profiles and authentication flows to securely manage analyst data and personalize the exported documentation.

## Technology Stack

The application is built using modern web development standards and a component-driven architecture:

- **Frontend Framework:** React.js
- **Styling:** Tailwind CSS (utility-first framework for rapid and consistent UI development)
- **Drag and Drop Engine:** @dnd-kit (used for flexible, accessible, and performant drag-and-drop interactions)
- **State Management:** React Hooks (custom implementations such as `useReportData` for robust local state handling and persistence)
- **Build Tool:** Vite

## APIs and External Integrations

This software relies on specific backend services and APIs to enable its full functionality:

1. **Supabase API (Authentication & Database)**
   Used to handle the application's authentication flow. It secures route access, manages user sessions, and retrieves analyst profile metadata (like name, position, department) from a PostgreSQL database deployed via Supabase to automatically fill report headers.

2. **Translation API Service**
   An integrated translation layer (managed via `translationService.js`) responsible for providing the auto-translation features. It intercepts text elements from the active state, queries the translation provider, and returns localized content dynamically.

3. **Client-Side Export Libraries**
   Takes the active DOM references and state objects to generate output files without relying on a dedicated backend formatting server. Uses established JavaScript export libraries wrapped under the `exportPdf.js` and `exportDocx.js` service files to compile the final binary documents.

## Local Setup and Dependencies

To execute the project locally, ensure you have Node.js installed in your environment, then run the following commands:

1. Install all required dependencies:
   ```bash
   npm install
   ```

2. Start the local development server:
   ```bash
   npm run dev
   ```

3. Configure environment variables mapping to the specific Supabase project endpoints and Translation API keys in your local `.env` file for all services to authenticate correctly.
