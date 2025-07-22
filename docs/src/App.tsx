import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import './App.css'

interface DocumentSection {
  id: string;
  title: string;
  subtitle: string;
  file: string;
  content?: string;
}

const documentSections: DocumentSection[] = [
  { id: 'overview', title: 'Foundation', subtitle: 'Core concepts & philosophy', file: '' },
  { id: 'getting-started', title: 'Getting Started', subtitle: 'Your first HTTP API calls', file: '' },
  { id: 'api-reference', title: 'API Reference', subtitle: 'Complete method documentation', file: '' },
  { id: 'examples', title: 'Examples', subtitle: 'Code examples & usage patterns', file: '/http-api/examples/README.md' }
];

const App: React.FC = () => {
  const [currentSection, setCurrentSection] = useState('overview')
  const [documents, setDocuments] = useState<{ [key: string]: string }>({})
  const [examples, setExamples] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [version] = useState<string>(__APP_VERSION__) // Automatically injected from package.json at build time

  useEffect(() => {
    const loadDocuments = async () => {
      const loadedDocs: { [key: string]: string } = {}

      for (const section of documentSections) {
        if (section.file) {
          try {
            const response = await fetch(section.file)

            if (response.ok) {
              loadedDocs[section.id] = await response.text()
            } else {
              // Fallback content for missing files
              loadedDocs[section.id] = getFallbackContent(section.id)
            }
          } catch (error) {
            console.error(`Error loading ${section.file}:`, error)
            loadedDocs[section.id] = getFallbackContent(section.id)
          }
        } else {
          // Use fallback content directly when no file is specified
          loadedDocs[section.id] = getFallbackContent(section.id)
        }
      }

      // Load example files
      const loadedExamples: { [key: string]: string } = {}
      const exampleFiles = [
        'basic-http-methods.ts',
        'authentication-example.ts',
        'file-upload-example.ts',
        'error-handling-example.ts',
        'advanced-configuration-example.ts'
      ]

      for (const filename of exampleFiles) {
        try {
          const response = await fetch(`/http-api/examples/${filename}`)
          if (response.ok) {
            loadedExamples[filename] = await response.text()
          }
        } catch (error) {
          console.error(`Error loading example ${filename}:`, error)
        }
      }

      setDocuments(loadedDocs)
      setExamples(loadedExamples)
      setLoading(false)
    }

    loadDocuments()
  }, [])

  const getFallbackContent = (sectionId: string): string => {
    switch (sectionId) {
      case 'overview':
        return `# Fjell HTTP API

A comprehensive HTTP client library for the Fjell ecosystem. The HTTP API provides
a complete set of HTTP methods with advanced features including file uploads,
logging integration, and error handling.

## Installation

\`\`\`bash
npm install @fjell/http-api
\`\`\`

## Quick Start

\`\`\`typescript
import { get, post } from '@fjell/http-api'

// Simple GET request
const response = await get('https://api.example.com/users')

// POST request with data
const newUser = await post('https://api.example.com/users', {
  name: 'John Doe',
  email: 'john@example.com'
})
\`\`\`

## Core Features

- **Complete HTTP Methods**: GET, POST, PUT, DELETE, and more
- **File Upload Support**: Handle multipart form data and file uploads
- **Logging Integration**: Built-in logging with @fjell/logging
- **Error Handling**: Comprehensive error handling and response validation
- **TypeScript Support**: Full TypeScript definitions for better development experience
- **Configurable**: Flexible configuration options for different use cases`

      case 'getting-started':
        return `# Getting Started

## Basic Usage

\`\`\`typescript
import { get, post, put, deleteMethod } from '@fjell/http-api'

// GET request
const users = await get('https://api.example.com/users')

// POST request with JSON data
const newUser = await post('https://api.example.com/users', {
  name: 'John Doe',
  email: 'john@example.com'
})

// PUT request for updates
const updatedUser = await put('https://api.example.com/users/1', {
  name: 'Jane Doe'
})

// DELETE request
await deleteMethod('https://api.example.com/users/1')
\`\`\`

## Configuration

Configure the HTTP client with default options:

\`\`\`typescript
import { configure } from '@fjell/http-api'

configure({
  baseURL: 'https://api.example.com',
  headers: {
    'Authorization': 'Bearer your-token-here'
  },
  timeout: 5000
})
\`\`\`

## Error Handling

Handle HTTP errors gracefully:

\`\`\`typescript
try {
  const response = await get('https://api.example.com/protected')
} catch (error) {
  if (error.status === 401) {
    console.log('Unauthorized - check your token')
  } else if (error.status === 404) {
    console.log('Resource not found')
  } else {
    console.error('HTTP Error:', error.message)
  }
}
\`\`\``

      case 'api-reference':
        return `# API Reference

## HTTP Methods

### GET Request
\`\`\`typescript
get(url: string, options?: RequestOptions): Promise<Response>
\`\`\`

### POST Request
\`\`\`typescript
post(url: string, data?: any, options?: RequestOptions): Promise<Response>
\`\`\`

### PUT Request
\`\`\`typescript
put(url: string, data?: any, options?: RequestOptions): Promise<Response>
\`\`\`

### DELETE Request
\`\`\`typescript
deleteMethod(url: string, options?: RequestOptions): Promise<Response>
\`\`\`

## File Upload Methods

### Upload File
\`\`\`typescript
postFileMethod(url: string, file: File, options?: FileUploadOptions): Promise<Response>
\`\`\`

### Upload Async
\`\`\`typescript
uploadAsyncMethod(url: string, file: File, options?: AsyncUploadOptions): Promise<Response>
\`\`\`

## Configuration Types

### RequestOptions
\`\`\`typescript
interface RequestOptions {
  headers?: Record<string, string>
  timeout?: number
  retries?: number
  validateStatus?: (status: number) => boolean
}
\`\`\`

### FileUploadOptions
\`\`\`typescript
interface FileUploadOptions extends RequestOptions {
  fieldName?: string
  additionalFields?: Record<string, string>
  onProgress?: (progress: number) => void
}
\`\`\``

      case 'examples':
        return `# HTTP API Examples

This section contains examples demonstrating how to use the HTTP API with different patterns and configurations.

## Basic Examples

### Simple REST Operations
Basic CRUD operations with a REST API.

### File Upload
Handling file uploads with progress tracking.

### Authentication
Working with authentication tokens and headers.

### Error Handling
Comprehensive error handling patterns.

## Advanced Examples

### Custom Configuration
Setting up custom HTTP client configurations.

### Retry Logic
Implementing retry mechanisms for failed requests.

### Logging Integration
Using the HTTP API with @fjell/logging for comprehensive request/response logging.

*Note: Complete examples are available in the examples directory.*`

      default:
        return `# ${sectionId}\n\nDocumentation section not found.`
    }
  }

  const currentContent = documents[currentSection] || ''
  const currentSectionData = documentSections.find(s => s.id === currentSection)

  return (
    <div className="app">
      <header className="header" style={{
        backgroundImage: 'url(/http-api/pano2.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="header-container">
          <div className="brand">
            <h1 className="brand-title">
              <span className="brand-fjell">Fjell</span>
              <span className="brand-http-api">HTTP API</span>
            </h1>
            <p className="brand-tagline">
              HTTP client that
              <span className="gradient-text"> conquers any endpoint</span>
            </p>
          </div>

          <div className="header-actions">
            <a
              href={`https://github.com/getfjell/http-api/releases/tag/v${version}`}
              target="_blank"
              rel="noopener noreferrer"
              className="version-badge"
              title={`Release v${version}`}
            >
              v{version}
            </a>
            <a
              href="https://github.com/getfjell/http-api"
              target="_blank"
              rel="noopener noreferrer"
              className="header-link"
            >
              <span>View Source</span>
            </a>
            <a
              href="https://www.npmjs.com/package/@fjell/http-api"
              target="_blank"
              rel="noopener noreferrer"
              className="header-link"
            >
              <span>Install Package</span>
            </a>
            <button
              className="menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span className="menu-line"></span>
              <span className="menu-line"></span>
              <span className="menu-line"></span>
            </button>
          </div>
        </div>
      </header>

      <div className="layout">
        <nav className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="nav-content">
            <div className="nav-sections">
              {documentSections.map((section) => (
                <button
                  key={section.id}
                  className={`nav-item ${currentSection === section.id ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentSection(section.id)
                    setSidebarOpen(false)
                  }}
                >
                  <div className="nav-item-content">
                    <div className="nav-item-title">{section.title}</div>
                    <div className="nav-item-subtitle">{section.subtitle}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Artistic Logo Placement */}
            <img
              src="/http-api/icon2.png"
              alt="Fjell HTTP API"
              className="fjell-logo"
              title="Fjell HTTP API - HTTP client that conquers any endpoint"
              onError={(e) => {
                // Prevent infinite loop by checking if we've already tried the fallback
                if (e.currentTarget.src.endsWith('/icon2.png')) {
                  console.log('Icon failed to load, trying alternative path');
                  e.currentTarget.src = '/http-api/icon.png';
                } else {
                  console.log('Both icon paths failed, hiding image');
                  e.currentTarget.style.display = 'none';
                }
              }}
              onLoad={() => console.log('Fjell HTTP API logo loaded successfully')}
            />
          </div>
        </nav>

        <main className="main">
          <div className="content-container">
            {loading ? (
              <div className="loading">
                <div className="loading-animation">
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                </div>
                <p className="loading-text">Connecting to the HTTP API</p>
              </div>
            ) : (
              <div className="content-wrapper">
                <div className="content-header">
                  <div className="breadcrumb">
                    <span className="breadcrumb-home">Fjell HTTP API</span>
                    <span className="breadcrumb-separator">›</span>
                    <span className="breadcrumb-current">{currentSectionData?.title}</span>
                  </div>
                </div>

                <div className="section-header">
                  <h1 className="content-title">
                    {currentSectionData?.title}
                  </h1>
                  <p className="content-subtitle">
                    {currentSectionData?.subtitle}
                  </p>
                </div>

                <div className="content">
                  {currentSection === 'api-reference' ? (
                    <div className="api-reference-content">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '')
                            return !props.inline && match ? (
                              <SyntaxHighlighter
                                style={oneLight as { [key: string]: React.CSSProperties }}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            )
                          },
                          h1({ children }) {
                            return <h1 className="content-h1">{children}</h1>
                          },
                          h2({ children }) {
                            return <h2 className="content-h2">{children}</h2>
                          },
                          h3({ children }) {
                            return <h3 className="content-h3">{children}</h3>
                          }
                        }}
                      >
                        {currentContent}
                      </ReactMarkdown>

                      <div className="api-methods-grid">
                        <div className="method-card">
                          <h3>
                            <span className="method-badge get">GET</span>
                            GET Request
                          </h3>
                          <p>Retrieve data from a server endpoint.</p>
                          <details>
                            <summary>View Example</summary>
                            <div className="code-block">
                              <SyntaxHighlighter
                                style={oneLight as { [key: string]: React.CSSProperties }}
                                language="typescript"
                                PreTag="div"
                              >
{`import { get } from '@fjell/http-api'

// Simple GET request
const users = await get('https://api.example.com/users')

// GET with headers
const response = await get('https://api.example.com/protected', {
  headers: {
    'Authorization': 'Bearer token'
  }
})`}
                              </SyntaxHighlighter>
                            </div>
                          </details>
                        </div>

                        <div className="method-card">
                          <h3>
                            <span className="method-badge post">POST</span>
                            POST Request
                          </h3>
                          <p>Send data to create new resources.</p>
                          <details>
                            <summary>View Example</summary>
                            <div className="code-block">
                              <SyntaxHighlighter
                                style={oneLight as { [key: string]: React.CSSProperties }}
                                language="typescript"
                                PreTag="div"
                              >
{`import { post } from '@fjell/http-api'

// POST with JSON data
const newUser = await post('https://api.example.com/users', {
  name: 'John Doe',
  email: 'john@example.com'
})

// POST with custom headers
const response = await post('https://api.example.com/data', data, {
  headers: {
    'Content-Type': 'application/json'
  }
})`}
                              </SyntaxHighlighter>
                            </div>
                          </details>
                        </div>

                        <div className="method-card">
                          <h3>
                            <span className="method-badge put">PUT</span>
                            PUT Request
                          </h3>
                          <p>Update existing resources completely.</p>
                          <details>
                            <summary>View Example</summary>
                            <div className="code-block">
                              <SyntaxHighlighter
                                style={oneLight as { [key: string]: React.CSSProperties }}
                                language="typescript"
                                PreTag="div"
                              >
{`import { put } from '@fjell/http-api'

// Update user
const updatedUser = await put('https://api.example.com/users/123', {
  name: 'Jane Doe',
  email: 'jane@example.com'
})

// PUT with validation
const response = await put(url, data, {
  validateStatus: (status) => status < 400
})`}
                              </SyntaxHighlighter>
                            </div>
                          </details>
                        </div>

                        <div className="method-card">
                          <h3>
                            <span className="method-badge delete">DELETE</span>
                            DELETE Request
                          </h3>
                          <p>Remove resources from the server.</p>
                          <details>
                            <summary>View Example</summary>
                            <div className="code-block">
                              <SyntaxHighlighter
                                style={oneLight as { [key: string]: React.CSSProperties }}
                                language="typescript"
                                PreTag="div"
                              >
{`import { deleteMethod } from '@fjell/http-api'

// Delete a user
await deleteMethod('https://api.example.com/users/123')

// Delete with confirmation
await deleteMethod('https://api.example.com/users/123', {
  headers: {
    'X-Confirm': 'true'
  }
})`}
                              </SyntaxHighlighter>
                            </div>
                          </details>
                        </div>

                        <div className="method-card">
                          <h3>File Upload</h3>
                          <p>Upload files with progress tracking.</p>
                          <details>
                            <summary>View Example</summary>
                            <div className="code-block">
                              <SyntaxHighlighter
                                style={oneLight as { [key: string]: React.CSSProperties }}
                                language="typescript"
                                PreTag="div"
                              >
{`import { postFileMethod } from '@fjell/http-api'

// Upload a file
const file = document.getElementById('file').files[0]
const response = await postFileMethod('https://api.example.com/upload', file, {
  fieldName: 'file',
  onProgress: (progress) => {
    console.log(\`Upload progress: \${progress}%\`)
  }
})`}
                              </SyntaxHighlighter>
                            </div>
                          </details>
                        </div>

                        <div className="method-card">
                          <h3>Async Upload</h3>
                          <p>Handle large file uploads asynchronously.</p>
                          <details>
                            <summary>View Example</summary>
                            <div className="code-block">
                              <SyntaxHighlighter
                                style={oneLight as { [key: string]: React.CSSProperties }}
                                language="typescript"
                                PreTag="div"
                              >
{`import { uploadAsyncMethod } from '@fjell/http-api'

// Async file upload
const file = document.getElementById('file').files[0]
const uploadId = await uploadAsyncMethod('https://api.example.com/upload-async', file, {
  chunkSize: 1024 * 1024, // 1MB chunks
  onProgress: (progress) => {
    console.log(\`Upload progress: \${progress}%\`)
  }
})`}
                              </SyntaxHighlighter>
                            </div>
                          </details>
                        </div>
                      </div>
                    </div>
                  ) : currentSection === 'examples' ? (
                    <div className="examples-content">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '')
                            return !props.inline && match ? (
                              <SyntaxHighlighter
                                style={oneLight as { [key: string]: React.CSSProperties }}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            )
                          },
                          h1({ children }) {
                            return <h1 className="content-h1">{children}</h1>
                          },
                          h2({ children }) {
                            return <h2 className="content-h2">{children}</h2>
                          },
                          h3({ children }) {
                            return <h3 className="content-h3">{children}</h3>
                          }
                        }}
                      >
                        {currentContent}
                      </ReactMarkdown>

                      {Object.keys(examples).length > 0 && (
                        <div className="examples-grid">
                          <h2 className="content-h2">Example Files</h2>
                          {Object.entries(examples).map(([filename, content]) => (
                            <div key={filename} className="example-card">
                              <h3 className="example-title">
                                {filename.replace(/\.ts$/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </h3>
                              <details>
                                <summary>View Source Code</summary>
                                <div className="code-block">
                                  <SyntaxHighlighter
                                    style={oneLight as { [key: string]: React.CSSProperties }}
                                    language="typescript"
                                    PreTag="div"
                                  >
                                    {content}
                                  </SyntaxHighlighter>
                                </div>
                              </details>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '')
                          return !props.inline && match ? (
                            <SyntaxHighlighter
                              style={oneLight as { [key: string]: React.CSSProperties }}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          )
                        },
                        h1({ children }) {
                          return <h1 className="content-h1">{children}</h1>
                        },
                        h2({ children }) {
                          return <h2 className="content-h2">{children}</h2>
                        },
                        h3({ children }) {
                          return <h3 className="content-h3">{children}</h3>
                        }
                      }}
                    >
                      {currentContent}
                    </ReactMarkdown>
                  )}
                </div>

                <div className="content-navigation">
                  {documentSections.map((section) => {
                    if (section.id === currentSection) return null
                    return (
                      <button
                        key={section.id}
                        className="nav-suggestion"
                        onClick={() => setCurrentSection(section.id)}
                      >
                        <span className="nav-suggestion-label">Next</span>
                        <span className="nav-suggestion-title">{section.title}</span>
                      </button>
                    )
                  }).filter(Boolean).slice(0, 1)}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <p className="footer-text">
              Crafted with intention for the Fjell ecosystem
            </p>
            <p className="footer-license">
              Licensed under Apache-2.0 &nbsp;•&nbsp; 2024
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
