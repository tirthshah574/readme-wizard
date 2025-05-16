#!/usr/bin/env node

import dotenv from 'dotenv';
import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { promises as fs } from 'fs';
import path from 'path';
import { glob } from 'glob';
import { GoogleGenAI } from '@google/genai';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
const program = new Command();

// API key management functions
async function getConfigPath() {
  const homedir = process.env.HOME || process.env.USERPROFILE;
  const configDir = path.join(homedir, '.readme-wizard');
  await fs.mkdir(configDir, { recursive: true });
  return path.join(configDir, 'config.json');
}

async function saveApiKey(apiKey) {
  const configPath = await getConfigPath();
  await fs.writeFile(configPath, JSON.stringify({ apiKey }, null, 2));
}

async function loadApiKey() {
  try {
    const configPath = await getConfigPath();
    const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
    return config.apiKey;
  } catch {
    return null;
  }
}

async function clearApiKey() {
  const configPath = await getConfigPath();
  await fs.unlink(configPath).catch(() => {});
}

async function getApiKey(options) {
  // Check command line flag
  if (options.apiKey) {
    await saveApiKey(options.apiKey);
    return options.apiKey;
  }

  // Check environment variable
  if (process.env.GOOGLE_API_KEY) {
    return process.env.GOOGLE_API_KEY;
  }

  // Check saved configuration
  const savedKey = await loadApiKey();
  if (savedKey) {
    return savedKey;
  }

  // Prompt user for API key with improved messaging
  console.log(chalk.yellow('\nNo API key found. You need a Google Gemini API key to use this tool.'));
  console.log(chalk.gray('You can get one for free at: https://aistudio.google.com/app/apikey\n'));

  const { apiKey } = await inquirer.prompt([{
    type: 'input',
    name: 'apiKey',
    message: 'Please enter your Google Gemini API key:',
    validate: input => {
      if (!input) return 'API key is required';
      if (input.length < 10) return 'This doesn\'t look like a valid API key';
      return true;
    }
  }]);

  // Ask if they want to save the key
  const { saveKey } = await inquirer.prompt([{
    type: 'confirm',
    name: 'saveKey',
    message: 'Would you like to save this API key for future use?',
    default: true
  }]);

  if (saveKey) {
    await saveApiKey(apiKey);
    console.log(chalk.green('\nAPI key saved successfully! You won\'t need to enter it again.\n'));
  }

  return apiKey;
}

// Configuration for the CLI prompt questions
const questions = {
  projectName: {
    type: 'input',
    name: 'projectName',
    message: 'What is your project name?',
    default: path.basename(process.cwd())
  },
  description: {
    type: 'input',
    name: 'description',
    message: 'Please provide a brief description of your project (press Enter to let AI generate it):',
  }
};

// Helper function to generate common badges
async function generateBadges(projectInfo) {
  const badges = [];
  
  // Version badge from package.json
  try {
    const packageJson = JSON.parse(await fs.readFile(path.join(process.cwd(), 'package.json'), 'utf8'));
    if (packageJson.version) {
      badges.push(`![Version](https://img.shields.io/badge/version-${packageJson.version}-blue.svg)`);
    }
  } catch (error) {
    // Skip if no package.json
  }

  // License badge
  if (projectInfo.license) {
    badges.push(`![License](https://img.shields.io/badge/license-${projectInfo.license}-green.svg)`);
  }

  // Node.js version badge if it's a Node.js project
  if (projectInfo.dependencies.length > 0 || projectInfo.devDependencies.length > 0) {
    badges.push('![Node.js](https://img.shields.io/badge/node-%3E%3D%2014.0.0-brightgreen.svg)');
  }

  // Test badge if tests exist
  if (projectInfo.hasTests) {
    badges.push('![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)');
  }

  return badges.join(' ');
}

// Helper function to analyze project type and add specific badges
async function analyzeProjectType(projectInfo) {
  const frameworkBadges = [];
  
  // Frontend Frameworks
  if (projectInfo.dependencies.includes('react')) {
    frameworkBadges.push('![React](https://img.shields.io/badge/react-%5E18.0.0-blue.svg)');
  }
  if (projectInfo.dependencies.includes('next')) {
    frameworkBadges.push('![Next.js](https://img.shields.io/badge/next.js-%5E13.0.0-black.svg)');
  }
  if (projectInfo.dependencies.includes('vue')) {
    frameworkBadges.push('![Vue.js](https://img.shields.io/badge/vue.js-%5E3.0.0-green.svg)');
  }
  if (projectInfo.dependencies.includes('angular')) {
    frameworkBadges.push('![Angular](https://img.shields.io/badge/angular-%5E15.0.0-red.svg)');
  }

  // Backend Frameworks
  if (projectInfo.dependencies.includes('express')) {
    frameworkBadges.push('![Express.js](https://img.shields.io/badge/express-%5E4.0.0-green.svg)');
  }
  if (projectInfo.dependencies.includes('@nestjs/core')) {
    frameworkBadges.push('![NestJS](https://img.shields.io/badge/nestjs-%5E9.0.0-red.svg)');
  }
  if (projectInfo.dependencies.includes('fastify')) {
    frameworkBadges.push('![Fastify](https://img.shields.io/badge/fastify-%5E4.0.0-black.svg)');
  }

  // Languages & Tools
  if (projectInfo.dependencies.includes('typescript')) {
    frameworkBadges.push('![TypeScript](https://img.shields.io/badge/typescript-%5E4.0.0-blue.svg)');
  }
  if (projectInfo.devDependencies.includes('jest')) {
    frameworkBadges.push('![Jest](https://img.shields.io/badge/jest-%5E29.0.0-orange.svg)');
  }
  if (projectInfo.dependencies.includes('prisma')) {
    frameworkBadges.push('![Prisma](https://img.shields.io/badge/prisma-%5E4.0.0-blue.svg)');
  }
  if (projectInfo.dependencies.includes('typeorm')) {
    frameworkBadges.push('![TypeORM](https://img.shields.io/badge/typeorm-%5E0.3.0-red.svg)');
  }

  // Databases (inferred from dependencies)
  if (projectInfo.dependencies.includes('mongoose')) {
    frameworkBadges.push('![MongoDB](https://img.shields.io/badge/mongodb-%5E5.0.0-green.svg)');
  }
  if (projectInfo.dependencies.includes('pg')) {
    frameworkBadges.push('![PostgreSQL](https://img.shields.io/badge/postgresql-%5E8.0-blue.svg)');
  }

  return frameworkBadges.join(' ');
}

// Tech stack detection helpers
function detectFramework(projectInfo) {
  const { dependencies = {}, devDependencies = {} } = projectInfo;
  const allDeps = [...dependencies, ...devDependencies];
  
  return {
    frontend: allDeps.includes('react') ? 'React' :
             allDeps.includes('vue') ? 'Vue.js' :
             allDeps.includes('@angular/core') ? 'Angular' :
             allDeps.includes('svelte') ? 'Svelte' : null,
    backend: allDeps.includes('express') ? 'Express.js' :
             allDeps.includes('@nestjs/core') ? 'NestJS' :
             allDeps.includes('fastify') ? 'Fastify' :
             allDeps.includes('koa') ? 'Koa' : null,
    meta: allDeps.includes('next') ? 'Next.js' :
          allDeps.includes('@nuxt/core') ? 'Nuxt.js' :
          allDeps.includes('@sveltejs/kit') ? 'SvelteKit' : null
  };
}

function detectTestingSetup(projectInfo) {
  const { dependencies = {}, devDependencies = {} } = projectInfo;
  const allDeps = [...dependencies, ...devDependencies];
  
  return {
    framework: allDeps.includes('jest') ? 'Jest' :
               allDeps.includes('mocha') ? 'Mocha' :
               allDeps.includes('vitest') ? 'Vitest' :
               allDeps.includes('@playwright/test') ? 'Playwright' : null,
    e2e: allDeps.includes('cypress') ? 'Cypress' :
         allDeps.includes('@playwright/test') ? 'Playwright' :
         allDeps.includes('puppeteer') ? 'Puppeteer' : null,
    coverage: allDeps.includes('nyc') || allDeps.includes('@istanbul/core') ? true : false
  };
}

function detectDatabase(projectInfo) {
  const { dependencies = {} } = projectInfo;
  
  return {
    orm: dependencies.includes('prisma') ? 'Prisma' :
         dependencies.includes('typeorm') ? 'TypeORM' :
         dependencies.includes('sequelize') ? 'Sequelize' :
         dependencies.includes('mongoose') ? 'Mongoose' : null,
    database: dependencies.includes('pg') ? 'PostgreSQL' :
              dependencies.includes('mysql2') ? 'MySQL' :
              dependencies.includes('mongodb') ? 'MongoDB' :
              dependencies.includes('sqlite3') ? 'SQLite' : null
  };
}

function detectDeployment(projectInfo) {
  const hasDocker = projectInfo.docker;
  const hasCI = projectInfo.ci;
  
  return {
    containerization: hasDocker ? 'Docker' : null,
    ci: hasCI,
    pm: projectInfo.dependencies.includes('pm2') ? 'PM2' : null
  };
}

function detectDocumentation(projectInfo) {
  const { dependencies = {}, devDependencies = {} } = projectInfo;
  const allDeps = [...dependencies, ...devDependencies];
  
  return {
    api: projectInfo.apiDocs ? 'OpenAPI/Swagger' : null,
    docs: allDeps.includes('typedoc') ? 'TypeDoc' :
          allDeps.includes('jsdoc') ? 'JSDoc' : null
  };
}

function detectUILibraries(projectInfo) {
  const { dependencies = {} } = projectInfo;
  
  return {
    component: dependencies.includes('@mui/material') ? 'Material UI' :
               dependencies.includes('@chakra-ui/react') ? 'Chakra UI' :
               dependencies.includes('tailwindcss') ? 'Tailwind CSS' :
               dependencies.includes('@mantine/core') ? 'Mantine' : null,
    styling: dependencies.includes('styled-components') ? 'styled-components' :
             dependencies.includes('@emotion/react') ? 'Emotion' :
             dependencies.includes('sass') ? 'Sass' : null
  };
}

function detectStateManagement(projectInfo) {
  const { dependencies = {} } = projectInfo;
  
  return {
    global: dependencies.includes('redux') ? 'Redux' :
            dependencies.includes('recoil') ? 'Recoil' :
            dependencies.includes('mobx') ? 'MobX' :
            dependencies.includes('zustand') ? 'Zustand' : null,
    server: dependencies.includes('react-query') ? 'React Query' :
            dependencies.includes('@tanstack/react-query') ? 'TanStack Query' :
            dependencies.includes('swr') ? 'SWR' : null
  };
}

function detectAPILayer(projectInfo) {
  const { dependencies = {} } = projectInfo;
  
  return {
    rest: dependencies.includes('axios') ? 'Axios' :
          dependencies.includes('got') ? 'Got' : null,
    graphql: dependencies.includes('graphql') ? 'GraphQL' :
             dependencies.includes('@apollo/client') ? 'Apollo Client' : null
  };
}

// Docker analysis helpers
async function analyzeDockerSetup(projectInfo) {
  try {
    const dockerFiles = await glob('**/Dockerfile*', { ignore: 'node_modules/**' });
    const dockerComposeFiles = await glob('**/docker-compose*.{yml,yaml}', { ignore: 'node_modules/**' });
    const dockerIgnoreExists = await fs.access('.dockerignore').then(() => true).catch(() => false);

    if (dockerFiles.length === 0 && dockerComposeFiles.length === 0) {
      return null;
    }

    const setup = {
      hasDockerfile: dockerFiles.length > 0,
      hasCompose: dockerComposeFiles.length > 0,
      hasDockerIgnore: dockerIgnoreExists,
      services: [],
      volumes: [],
      networks: [],
      buildStages: []
    };

    // Analyze Dockerfile if exists
    if (setup.hasDockerfile) {
      const dockerfile = await fs.readFile(dockerFiles[0], 'utf8');
      setup.buildStages = dockerfile.match(/^FROM .+ (as|AS) .+$/gm)?.map(line => {
        const match = line.match(/^FROM .+ (?:as|AS) (.+)$/);
        return match ? match[1] : null;
      }).filter(Boolean) || [];
      
      setup.baseImage = dockerfile.match(/^FROM ([^\s]+)/m)?.[1];
      setup.exposedPorts = dockerfile.match(/^EXPOSE (\d+)/gm)?.map(line => line.match(/^EXPOSE (\d+)/)[1]) || [];
    }

    // Analyze docker-compose if exists
    if (setup.hasCompose) {
      const composeContent = await fs.readFile(dockerComposeFiles[0], 'utf8');
      try {
        const { parse } = await import('yaml');
        const compose = parse(composeContent);
        setup.services = Object.keys(compose.services || {});
        setup.volumes = Object.keys(compose.volumes || {});
        setup.networks = Object.keys(compose.networks || {});
      } catch (e) {
        // Skip silently if compose file can't be parsed
        setup.hasCompose = false;
      }
    }

    return setup;
  } catch (error) {
    return null;
  }
}

// CI/CD analysis helpers
async function analyzeCICD(projectInfo) {
  const ciConfig = {
    provider: null,
    workflows: [],
    features: {
      testing: false,
      building: false,
      deployment: false,
      dockerBuild: false,
      codeQuality: false,
      security: false
    }
  };

  try {
    // Import yaml module
    let yamlParser;
    try {
      yamlParser = await import('yaml');
    } catch (e) {
      console.warn(chalk.yellow('Warning: yaml module not available, skipping CI/CD analysis'));
      return ciConfig;
    }

    // Check GitHub Actions
    const githubWorkflows = await glob('.github/workflows/*.{yml,yaml}');
    if (githubWorkflows.length > 0) {
      ciConfig.provider = 'GitHub Actions';
      for (const workflow of githubWorkflows) {
        const content = await fs.readFile(workflow, 'utf8');
        try {
          const parsed = yamlParser.parse(content);
          ciConfig.workflows.push({
            name: path.basename(workflow, path.extname(workflow)),
            triggers: Object.keys(parsed.on || {})
          });
          
          // Detect features
          const jobs = Object.values(parsed.jobs || {});
          const steps = jobs.flatMap(job => job.steps || []);
          const stepNames = steps.map(step => step.name?.toLowerCase() || '');
          
          ciConfig.features.testing = stepNames.some(name => name.includes('test'));
          ciConfig.features.building = stepNames.some(name => name.includes('build'));
          ciConfig.features.deployment = stepNames.some(name => name.includes('deploy'));
          ciConfig.features.dockerBuild = stepNames.some(name => name.includes('docker'));
          ciConfig.features.codeQuality = stepNames.some(name => 
            name.includes('lint') || name.includes('sonar') || name.includes('quality')
          );
          ciConfig.features.security = stepNames.some(name => 
            name.includes('security') || name.includes('scan') || name.includes('snyk')
          );
        } catch (e) {
          // Skip this workflow if it can't be parsed
          console.warn(chalk.yellow(`Warning: Could not parse workflow file: ${workflow}`));
        }
      }
    }

    // Check GitLab CI
    const gitlabCI = await fs.access('.gitlab-ci.yml').then(() => true).catch(() => false);
    if (gitlabCI) {
      ciConfig.provider = 'GitLab CI';
      const content = await fs.readFile('.gitlab-ci.yml', 'utf8');
      try {
        const parsed = yamlParser.parse(content);
        ciConfig.workflows = Object.keys(parsed).filter(key => !key.startsWith('.'));
      } catch (e) {
        console.warn(chalk.yellow('Warning: Could not parse .gitlab-ci.yml'));
      }
    }

    // Check Circle CI
    const circleCI = await fs.access('.circleci/config.yml').then(() => true).catch(() => false);
    if (circleCI) {
      ciConfig.provider = 'Circle CI';
      const content = await fs.readFile('.circleci/config.yml', 'utf8');
      try {
        const parsed = yamlParser.parse(content);
        ciConfig.workflows = Object.keys(parsed.workflows || {});
      } catch (e) {
        console.warn(chalk.yellow('Warning: Could not parse CircleCI config'));
      }
    }

    return ciConfig;
  } catch (error) {
    return ciConfig;
  }
}

async function analyzeProject() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  let projectInfo = {
    dependencies: [],
    devDependencies: [],
    scripts: {},
    hasTests: false,
    mainFile: '',
    projectType: 'Unknown',
    contribution: false,
    ci: false,
    docker: false,
    git: false,
    coverage: false,
    apiDocs: false,
    testFramework: null,
    bundler: null,
    linter: null,
    formatter: null,
    commitlint: false,
    roadmap: false,
    changelog: false,
    testFiles: [],
    features: [],
    folders: [],
    isMonorepo: false,
    security: false,
    techStack: {},
    performance: {},
  };

  try {
    // Read package.json for deep analysis
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
    projectInfo.dependencies = Object.keys(packageJson.dependencies || {});
    projectInfo.devDependencies = Object.keys(packageJson.devDependencies || {});
    projectInfo.scripts = packageJson.scripts || {};
    projectInfo.mainFile = packageJson.main;
    projectInfo.projectName = packageJson.name || path.basename(process.cwd());
    projectInfo.version = packageJson.version;
    projectInfo.license = packageJson.license;
    projectInfo.author = packageJson.author;
    projectInfo.description = packageJson.description;
    projectInfo.repository = packageJson.repository;
    projectInfo.bugs = packageJson.bugs;
    projectInfo.homepage = packageJson.homepage;
    projectInfo.engines = packageJson.engines;

    // Detect monorepo
    projectInfo.isMonorepo = await fs.access('lerna.json').then(() => true).catch(() => false) ||
                            await fs.access('pnpm-workspace.yaml').then(() => true).catch(() => false);

    // Analyze project structure
    const allFiles = await glob('**/*', { 
      ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**'],
      nodir: true
    });
    
    // Get folder structure for better context
    const folders = [...new Set(allFiles.map(file => path.dirname(file)))];
    projectInfo.folders = folders.filter(f => f !== '.' && f !== '');

    // Check for common files
    projectInfo.contribution = allFiles.some(f => /contributing/i.test(f));
    projectInfo.changelog = allFiles.some(f => /changelog/i.test(f));
    projectInfo.docker = allFiles.some(f => /dockerfile|docker-compose/i.test(f));
    projectInfo.security = allFiles.some(f => /security/i.test(f));
    projectInfo.roadmap = allFiles.some(f => /roadmap/i.test(f));
    
    // Check for CI/CD
    projectInfo.ci = await fs.access('.github/workflows').then(() => true).catch(() => false) ||
                    await fs.access('.gitlab-ci.yml').then(() => true).catch(() => false) ||
                    await fs.access('.circleci').then(() => true).catch(() => false);

    // Git analysis
    try {
      projectInfo.git = await fs.access('.git').then(() => true).catch(() => false);
      if (projectInfo.git) {
        const gitConfig = await fs.readFile('.git/config', 'utf8');
        projectInfo.remoteUrl = gitConfig.match(/url = (.+)/)?.[1];
      }
    } catch {}

    // Determine project type and tech stack
    projectInfo.techStack = {
      framework: detectFramework(projectInfo),
      testing: detectTestingSetup(projectInfo),
      database: detectDatabase(projectInfo),
      deployment: detectDeployment(projectInfo),
      documentation: detectDocumentation(projectInfo),
      ui: detectUILibraries(projectInfo),
      stateManagement: detectStateManagement(projectInfo),
      api: detectAPILayer(projectInfo)
    };

    // Deep analysis of project setup
    projectInfo.dockerSetup = await analyzeDockerSetup(projectInfo);
    projectInfo.cicd = await analyzeCICD(projectInfo);
    
    // Check for tests and coverage
    const testFiles = await glob('**/*{test,spec}.*', { ignore: 'node_modules/**' });
    projectInfo.hasTests = testFiles.length > 0;
    projectInfo.testFiles = testFiles;
    projectInfo.coverage = await fs.access('coverage').then(() => true).catch(() => false);

    // Enhanced API documentation detection
    projectInfo.apiDocs = allFiles.some(f => 
      /swagger|openapi|api\.json|api\.yaml|postman/i.test(f)
    );

    // Analyze Docker setup
    projectInfo.dockerSetup = await analyzeDockerSetup(projectInfo);

    // Analyze CI/CD setup
    projectInfo.ciSetup = await analyzeCICD(projectInfo);

    return projectInfo;
  } catch (error) {
    console.warn(chalk.yellow('No package.json found, continuing with limited analysis'));
    return projectInfo;
  }
}

async function generateAIContent(projectInfo) {
  try {
    // Get API key through the unified API key management
    const apiKey = await getApiKey(program.opts());

    if (!apiKey) {
      console.error(chalk.red('\nError: No API key provided.'));
      console.log(chalk.gray('You can get a free API key at: https://aistudio.google.com/app/apikey'));
      process.exit(1);
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Generate badges
    let commonBadges, frameworkBadges;
    try {
      commonBadges = await generateBadges(projectInfo);
      frameworkBadges = await analyzeProjectType(projectInfo);
    } catch (error) {
      console.warn(chalk.yellow('\nWarning: Could not generate some badges, continuing with minimal badges.'));
      commonBadges = '';
      frameworkBadges = '';
    }
    
    // Add badges to project info
    projectInfo.badges = `${commonBadges}\n${frameworkBadges}`;
  
    const techStackInfo = JSON.stringify(projectInfo.techStack, null, 2);
    const prompt = `Generate a beautiful, modern, and comprehensive README.md that follows best practices for a ${projectInfo.projectType} project named "${projectInfo.projectName}". Make it visually appealing with strategic use of badges, emojis, and formatting.

Project Analysis:
${JSON.stringify({
  name: projectInfo.projectName,
  version: projectInfo.version,
  description: projectInfo.description,
  author: projectInfo.author,
  license: projectInfo.license,
  isMonorepo: projectInfo.isMonorepo,
  hasTests: projectInfo.hasTests,
  hasCoverage: projectInfo.coverage,
  hasCI: projectInfo.ci,
  hasDocker: projectInfo.docker,
  hasContribution: projectInfo.contribution,
  hasChangelog: projectInfo.changelog,
  hasAPIDoc: projectInfo.apiDocs,
  techStack: projectInfo.techStack,
  projectStructure: projectInfo.folders
}, null, 2)}

Structure Requirements (Standard-README Specification):
1. Title & Description
   - Clear project name with logo/banner (if available)
   - Concise description of the project's purpose
   - Essential badges (build status, version, license)

2. Table of Contents
   - Automatically generated, collapsible ToC
   - Links to all major sections

3. Background/Security (if applicable)
   - Context and problem the project solves
   - Security considerations and warnings

4. Installation & Prerequisites
   - System requirements and dependencies
   - Step-by-step installation guide
   - Environment setup with .env example

5. Usage/Examples
   - Basic usage examples with code blocks
   - Common use cases and examples
   - API documentation if applicable

6. Project Architecture
   - High-level architecture overview
   - Project structure with explanations
   - Key components and their interactions

7. Development
   - Setting up the development environment
   - Running tests and code coverage
   - Contribution guidelines
   - Code style and standards

8. Maintenance & Support
   - Issue reporting guidelines
   - Troubleshooting common issues
   - Support channels and community

9. License & Credits
   - License information
   - Acknowledgments and contributors
   - Third-party licenses

Style Guidelines:
- Use semantic emojis for section headers (📦 Installation, 🚀 Usage, etc.)
- Include code blocks with proper language tags
- Use tables for structured information
- Include collapsible sections for lengthy content
- Add relevant screenshots/GIFs for UI components
- Use badges from shields.io for status indicators
- Follow proper Markdown heading hierarchy
- Include inline comments for clarity
- Add direct links to important files/folders
- Add quick links at the top for key resources (docs, live demo, issues)
- Include a "Quick Start" section for experienced developers
- Add status badges for CI/CD pipelines if applicable
- Include compatibility matrix for supported versions
- Add a "Features" section with key highlights
- Include performance metrics and benchmarks if available

Make the README professional, comprehensive, and maintainable while following the Standard-README specification and modern documentation best practices.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt
      });
      
      // Clean up the response text:
      // 1. Remove any ```markdown blocks
      // 2. Remove any extra backtick blocks at the start/end
      // 3. Preserve actual code blocks within the content
      let cleanedText = response.text
        .replace(/^```markdown\n/, '') // Remove opening ```markdown
        .replace(/\n```$/, '') // Remove closing ```
        .replace(/^````markdown\n/, '') // Remove opening ````markdown
        .replace(/\n````$/, ''); // Remove closing ````
      
      if (!cleanedText || cleanedText.trim().length === 0) {
        throw new Error('Generated content is empty');
      }

      return cleanedText;
    } catch (error) {
      console.error(chalk.red('\nError generating README content:'), error.message);
      if (error.response?.status === 401) {
        console.log(chalk.yellow('\nThis might be due to an invalid API key. Please try clearing your saved configuration:'));
        console.log(chalk.gray('readme-wizard --clear-config'));
        console.log(chalk.gray('Then run the tool again with a valid API key.'));
      } else {
        console.log(chalk.yellow('\nPlease try again. If the problem persists, you can:'));
        console.log(chalk.gray('1. Check your internet connection'));
        console.log(chalk.gray('2. Verify your API key at https://aistudio.google.com/app/apikey'));
        console.log(chalk.gray('3. Try running with a new API key using: readme-wizard -k YOUR_NEW_API_KEY'));
      }
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red('\nFatal error:'), error.message);
    console.log(chalk.yellow('\nPlease try again with a valid Google Gemini API key:'));
    console.log(chalk.gray('readme-wizard -k YOUR_API_KEY'));
    process.exit(1);
  }
}

async function checkExistingReadme() {
  try {
    const readmePath = path.join(process.cwd(), 'README.md');
    await fs.access(readmePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  try {
    console.log(chalk.blue('Welcome to README Wizard! 📚'));
    console.log(chalk.gray('Analyzing your project...\n'));

    // Check for existing README
    const hasReadme = await checkExistingReadme();
    let shouldContinue = true;

    if (hasReadme) {
      const { overwrite } = await inquirer.prompt([{
        type: 'confirm',
        name: 'overwrite',
        message: 'A README.md already exists. Would you like to overwrite it?',
        default: false
      }]);

      if (!overwrite) {
        const { newName } = await inquirer.prompt([{
          type: 'input',
          name: 'newName',
          message: 'Enter a new name for the README file (without .md extension):',
          default: 'README.new'
        }]);
        global.readmeFileName = `${newName}.md`;
      } else {
        global.readmeFileName = 'README.md';
      }
    } else {
      global.readmeFileName = 'README.md';
    }

    // Analyze project
    const projectInfo = await analyzeProject();
    console.log(chalk.gray('Project analysis complete!\n'));

    // Get user input for any missing information
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'What is your project name?',
        default: path.basename(process.cwd())
      },
      {
        type: 'input',
        name: 'description',
        message: 'Please provide a brief description of your project (press Enter to let AI generate it):',
      }
    ]);

    console.log(chalk.gray('\nGenerating README content using AI...\n'));
    
    // Generate content using OpenAI
    const readmeContent = await generateAIContent({
      ...projectInfo,
      projectName: answers.projectName,
      description: answers.description
    });

    // Write the file
    await fs.writeFile(global.readmeFileName, readmeContent);
    
    console.log(chalk.green(`\n✨ ${global.readmeFileName} has been successfully created!`));
    console.log(chalk.gray('\nFeel free to edit it further to match your needs.'));
  } catch (error) {
    console.error(chalk.red('An error occurred:'), error.message);
    process.exit(1);
  }
}

program
  .name('readme-wizard')
  .description('An interactive CLI tool to generate README files for your projects using AI')
  .version('1.0.0')
  .option('-k, --api-key <key>', 'Google AI (Gemini) API key')
  .option('--clear-config', 'Clear saved configuration including API key')
  .action(async (options) => {
    if (options.clearConfig) {
      try {
        await clearApiKey();
        console.log(chalk.green('Configuration cleared successfully!'));
        process.exit(0);
      } catch (error) {
        console.error(chalk.red('Error clearing configuration:', error.message));
        process.exit(1);
      }
    }

    await main();
  });

program.parse();
