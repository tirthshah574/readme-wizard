```markdown
# ✨ readme-wizard-cli

[![npm version](https://img.shields.io/npm/v/@tirth.s/readme-wizard-cli.svg)](https://www.npmjs.com/package/@tirth.s/readme-wizard-cli)
[![Node version](https://img.shields.io/node/v/@tirth.s/readme-wizard-cli.svg)](https://www.npmjs.com/package/@tirth.s/readme-wizard-cli)
[![License](https://img.shields.io/npm/l/@tirth.s/readme-wizard-cli.svg)](https://github.com/tirthshah574/readme-wizard/blob/main/LICENSE)

An AI-powered CLI tool that automatically generates high-quality README files for your projects using Google's Gemini AI. This tool analyzes your project structure, dependencies, and configuration to create comprehensive, well-structured documentation.

🔗 [View on npm](https://www.npmjs.com/package/@tirth.s/readme-wizard-cli)

---

## 📁 Project Structure

```
readme-creator/
├── .env                # Environment variable configuration
├── .gitignore          # Specifies intentionally untracked files that Git should ignore
├── index.js            # Main entry point of the application
├── package.json        # Project dependencies and scripts
├── README.md           # This file!
└── src/
    ├── commands/     # Command-line interface commands (if any)
    ├── lib/          # Core libraries and functions
    └── utils/         # Utility functions
```

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js:** Version 18 or higher.  ([https://nodejs.org/](https://nodejs.org/))
*   **npm:** Version 8 or higher (usually comes with Node.js)
*   **Git:** For version control.  ([https://git-scm.com/](https://git-scm.com/))

---

## 🚀 Getting Started

You can use this tool in two ways:

### Using npx (Recommended)

Run it directly without installation:

```bash
npx @tirth.s/readme-wizard-cli
```

Or with your API key:

```bash
npx @tirth.s/readme-wizard-cli -k "YOUR_API_KEY"
```

### Global Installation

If you prefer, you can install it globally:

```bash
npm install -g @tirth.s/readme-wizard-cli
```

Then run it from anywhere:

```bash
readme-wizard
```

3.  **Set up environment variables:** (See 🔑 Environment Variables)

4.  **Run the application:**

    While this program does not provide a command-line interface, the exact execution will require knowing the exact workings.  The following is hypothetical.

    ```bash
    node index.js <arguments-here>
    ```
    *Replace `<arguments-here>` with the appropriate arguments for your use case.*  Check the `package.json` or the source code for specific CLI arguments.

---

## 🔑 API Key Setup

The tool requires a Google AI (Gemini) API key. You can provide it in several ways:

1. **Command Line Flag:**
   ```bash
   readme-wizard --api-key "your-api-key"
   ```

2. **Environment Variable:**
   Create a `.env` file in your project or set the environment variable:
   ```bash
   export GOOGLE_API_KEY=your-api-key
   ```

3. **Interactive Prompt:**
   If no API key is provided, the tool will prompt you to enter it and optionally save it for future use.

4. **Saved Configuration:**
   If you choose to save your API key, it will be stored in `~/.readme-wizard/config.json`.
   To clear saved configuration:
   ```bash
   readme-wizard --clear-config
   ```

To get an API key, visit: https://aistudio.google.com/app/apikey

**Note:** Replace `your_google_api_key` and `your_huggingface_api_key` with your actual API keys.  Ensure that the `.env` file is added to your `.gitignore` to prevent accidental commit of secrets.

---

## 📦 Dependencies

This project relies on the following dependencies:

*   `@google/genai`: For interacting with Google AI models.
*   `@huggingface/inference`: For using Hugging Face Inference API.
*   `chalk`: For adding colors to the console output.
*   `commander`: For building command-line interfaces.
*   `dotenv`: For loading environment variables from a `.env` file.
*   `glob`: For matching file paths using wildcard patterns.
*   `inquirer`: For creating interactive command-line prompts.
*   `node-fetch`: For making HTTP requests.

---

## 🛠️ Troubleshooting

**Issue:**  `Error: Cannot find module '...'`

**Solution:**  Ensure you have installed all dependencies by running `npm install`.  If the issue persists, try deleting `node_modules` and `package-lock.json` and then running `npm install` again.

**Issue:** API requests are failing.

**Solution:** Double-check that your API keys in the `.env` file are correct and that you have enabled the necessary APIs in your cloud provider account.

---

## 📜 Available Scripts

The following scripts are defined in `package.json`:

*   `test`: Runs the test suite.  *(Note: This project does not appear to have tests set up.)*

    ```bash
    npm run test
    ```

---

## 🌐 API Endpoints (Hypothetical)

*(As no API endpoints are documented in the project information, this section is intentionally left blank. If the project exposes any API endpoints, they should be documented here with details like URL, method, request parameters, and response format.)*

---

## ❤️ Contributing

While no formal contributing guidelines are present, you can contact the project owners if you're interested.
