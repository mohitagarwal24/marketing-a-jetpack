# Product Sketch Analyser

This project is a React application using Vite, designed to analyze product sketches and generate marketing content using the Google GenAI API.

## Features

- Upload and analyze product sketches
- Generate product names and website headings
- Create HTML and CSS for splash pages
- Toggle between HTML code and preview

## Setup Instructions

### Prerequisites

- Node.js and npm installed

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd marketing-a-jetpack
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your API key:

   ```
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. Use the `.env.example` as a template for environment variables:

   ```
   cp .env.example .env
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### API Key Security

- The API key is stored in a `.env` file and accessed via `import.meta.env.VITE_GEMINI_API_KEY`.
- Ensure `.env` is included in `.gitignore` to prevent it from being committed to version control.

### Usage

- Upload an image to analyze the product sketch.
- Generate product names and select one.
- Generate website headings and select one.
- Generate website copy and HTML.
- Toggle between HTML code and preview.

### Additional Information

- This project uses DOMPurify for HTML sanitization.
- The HTMLPreviewToggle component provides a secure way to preview HTML content.

For more details, refer to the code comments and documentation.
