# ✨ readme-forge

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

readme-forge is an innovative, AI-powered tool designed to streamline the creation of professional and comprehensive README files for your GitHub repositories. Leveraging a modern tech stack, it combines rich-text editing capabilities with intelligent content generation to ensure your projects are perfectly documented.

## Features

*   **AI-Powered Content Generation**: Quickly generate README sections, descriptions, and suggestions using advanced AI models (via Google's AI SDK).
*   **Rich-Text Markdown Editor**: An intuitive and powerful editor (powered by Lexical) to write, preview, and refine your READMEs with full markdown support.
*   **Real-time Markdown Preview**: See exactly how your README will look as you type, ensuring perfect formatting.
*   **Modern User Interface**: Built with Next.js, React, Tailwind CSS, and Shadcn UI for a seamless, responsive, and aesthetically pleasing user experience.
*   **Supabase Integration**: Securely store and manage your generated READMEs and project configurations with a robust backend.
*   **GitHub Flavored Markdown Support**: Ensures compatibility and accurate rendering across GitHub.

## Installation

To get readme-forge up and running locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/patrickl2901/readme-forge.git
    cd readme-forge
    ```

2.  **Install dependencies:**
    This project uses `pnpm` as its package manager. If you don't have it, you can install it globally with `npm install -g pnpm`.
    ```bash
    pnpm install
    # or npm install
    # or yarn install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file in the root directory and add your environment variables. You'll need Supabase credentials and a Google AI API key.
    ```dotenv
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    GOOGLE_API_KEY=YOUR_GOOGLE_GEMINI_API_KEY
    ```
    *   **Supabase**: Obtain your project URL and `anon` key from your Supabase project settings.
    *   **Google AI**: Get an API key from Google AI Studio or Google Cloud for models like Gemini.

4.  **Run the development server:**
    ```bash
    pnpm dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser to start using readme-forge.

## Usage

Once readme-forge is running, navigate to the local development server in your browser.

1.  **Input Repository Details**: Provide basic information about your GitHub repository, such as its name, owner, and a brief description.
2.  **Generate Initial Draft**: Utilize the AI suggestions to quickly generate a foundational README structure and content.
3.  **Refine with the Editor**: Use the rich-text markdown editor to customize, expand, and perfect your README. Leverage the real-time preview to ensure everything looks exactly as intended.
4.  **Save or Export**: Once satisfied, you can save your README (if Supabase is configured for persistence) or copy the generated markdown directly to your clipboard for use in your GitHub repository.

### Example Configuration (for `.env.local`)

```dotenv
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1pZCIsInJvbGUiOiJhbm9uIiwiZXhwIjoxOTAwMDAwMDAwfQ.YOUR_ACTUAL_ANON_KEY"

# Google AI Configuration
GOOGLE_API_KEY="AIzaSyC0f_YOUR_GOOGLE_API_KEY"
```

## Contributing

We welcome contributions to readme-forge! If you have suggestions for improvements, new features, or bug fixes, please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name` or `bugfix/issue-description`).
3.  Make your changes and ensure they adhere to the project's coding style.
4.  Commit your changes (`git commit -m 'feat: Add new feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request describing your changes.

Please ensure your code is well-tested and documented.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
