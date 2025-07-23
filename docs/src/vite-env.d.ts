/// <reference types="vite/client" />

declare const __APP_VERSION__: string

declare module '@fjell/docs-template' {
  export interface DocsConfig {
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

  export interface DocsAppProps {
    config: DocsConfig;
  }

  export function DocsApp(props: DocsAppProps): JSX.Element;
}
