# Readme Wizard CLI 🧙‍♂️

[![Version](https://img.shields.io/badge/version-1.0.1-blue.svg)](https://semver.org)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D%2018.0.0-brightgreen.svg)](https://nodejs.org)

A powerful CLI tool that uses Google's Gemini AI to generate comprehensive, well-structured README files for your projects. Analyzes your project structure and creates beautiful documentation with zero configuration.

## 🚀 Features

- 🤖 AI-powered README generation using Google's Gemini
- 📊 Automatic project analysis (dependencies, frameworks, testing setup)
- 🏗️ Docker and CI/CD configuration detection
- 🎯 Smart badge generation based on your tech stack
- 🔑 Multiple API key management options
- 🎨 Beautiful, standardized formatting
- 📝 Interactive CLI with customization options
- 💾 Saves configuration for future use

## 📦 Installation

```bash
# Install globally
npm install -g @tirth.s/readme-wizard-cli

# Or run directly with npx
npx @tirth.s/readme-wizard-cli
```

## 🛠️ Prerequisites

- Node.js >= 18
- Google Gemini API Key (get one for free at [AI Studio](https://aistudio.google.com/app/apikey))

## 📘 Usage

### Basic Usage

Run in your project directory:

```bash
readme-wizard
```

The tool will:
1. Analyze your project structure
2. Detect frameworks and dependencies
3. Prompt for missing information
4. Generate a comprehensive README.md

### Command Line Options

```bash
Usage: readme-wizard [options]

Options:
  -V, --version          Output the version number
  -k, --api-key <key>    Google Gemini API key
  --clear-config         Clear saved configuration including API key
  -h, --help            Display help

Examples:
  $ readme-wizard                    # Interactive mode
  $ readme-wizard -k YOUR_API_KEY    # Run with API key
  $ readme-wizard --clear-config     # Clear saved configuration
```

### API Key Management

The tool supports multiple ways to provide your Google Gemini API key:

1. **Command Line Flag**:
   ```bash
   readme-wizard -k YOUR_API_KEY
   ```

2. **Environment Variable**:
   ```bash
   export GOOGLE_API_KEY=your_api_key
   readme-wizard
   ```

3. **Interactive Prompt**:
   Run without a key and you'll be prompted to enter it.

4. **Saved Configuration**:
   The tool can save your API key securely for future use.

### Project Analysis

The tool automatically analyzes your project for:

- 📝 Project metadata (name, version, license)
- 🛠️ Dependencies and frameworks
- ⚡ Testing setup and coverage
- 🐳 Docker configuration
- 🔄 CI/CD pipelines
- 📚 Documentation tools
- 🎨 UI libraries
- 🗄️ Database connections
- 📦 State management
- 🌐 API integrations

### Generated README Structure

The generated README follows the [Standard-README](https://github.com/RichardLitt/standard-readme) specification and includes:

1. **Title & Description**
   - Project name and banner
   - Concise description
   - Status badges

2. **Table of Contents**
   - Auto-generated
   - Collapsible sections

3. **Installation**
   - Prerequisites
   - Step-by-step guide
   - Environment setup

4. **Usage**
   - Basic examples
   - Common use cases
   - API documentation

5. **Project Architecture**
   - Structure overview
   - Component interaction
   - Key features

6. **Development**
   - Setup guide
   - Testing
   - Contributing

7. **Maintenance**
   - Issue reporting
   - Troubleshooting
   - Support

8. **License & Credits**
   - License details
   - Contributors
   - Acknowledgments

## 💡 Tips & Tricks

1. **Overwriting Existing README**:
   - The tool will ask before overwriting an existing README
   - You can choose to create a new file instead

2. **Project Analysis**:
   - Run in the root directory of your project
   - Make sure package.json is present for best results

3. **API Key Storage**:
   - Keys are stored in `~/.readme-wizard/config.json`
   - Use `--clear-config` to remove stored keys

4. **Badge Generation**:
   - Automatic framework version detection
   - Test status badges if tests exist
   - License and version badges from package.json

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

```bash
# Clone the repository
git clone https://github.com/tirthshah574/readme-wizard.git

# Install dependencies
cd readme-wizard
npm install

# Make your changes and test
npm test

# Submit a PR
```

## 📃 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Gemini AI](https://deepmind.google/technologies/gemini/) for powering the content generation
- [Shields.io](https://shields.io) for the beautiful badges
- All the amazing contributors who help improve this tool