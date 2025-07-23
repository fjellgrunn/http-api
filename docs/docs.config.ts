interface DocsConfig {
  projectName: string;
  basePath: string;
  port: number;
  branding: {
    theme: string;
    tagline: string;
    logo?: string;
    backgroundImage?: string;
    primaryColor?: string;
    accentColor?: string;
    github?: string;
    npm?: string;
  };
  sections: Array<{
    id: string;
    title: string;
    subtitle: string;
    file: string;
  }>;
  filesToCopy: Array<{
    source: string;
    destination: string;
  }>;
  plugins?: any[];
  version: {
    source: string;
  };
  customContent?: {
    [key: string]: (content: string) => string;
  };
}

const config: DocsConfig = {
  projectName: 'Fjell HTTP API',
  basePath: '/http-api/',
  port: 3002,
  branding: {
    theme: 'http-api',
    tagline: 'Simple and powerful HTTP client for API requests',
    backgroundImage: '/http-api/pano.png',
    github: 'https://github.com/getfjell/http-api',
    npm: 'https://www.npmjs.com/package/@fjell/http-api'
  },
  sections: [
    {
      id: 'overview',
      title: 'Foundation',
      subtitle: 'Core concepts & philosophy',
      file: '/http-api/README.md'
    },
    {
      id: 'getting-started',
      title: 'Getting Started',
      subtitle: 'Your first HTTP API calls',
      file: '/http-api/GETTING_STARTED.md'
    },
    {
      id: 'api-reference',
      title: 'API Reference',
      subtitle: 'Complete method documentation',
      file: '/http-api/API.md'
    },
    {
      id: 'examples',
      title: 'Examples',
      subtitle: 'Code examples & usage patterns',
      file: '/http-api/examples-README.md'
    }
  ],
  filesToCopy: [
    {
      source: '../README.md',
      destination: 'public/README.md'
    },
    {
      source: '../GETTING_STARTED.md',
      destination: 'public/GETTING_STARTED.md'
    },
    {
      source: '../API.md',
      destination: 'public/API.md'
    },
    {
      source: '../examples/README.md',
      destination: 'public/examples-README.md'
    }
  ],
  plugins: [],
  version: {
    source: 'package.json'
  }
}

export default config
