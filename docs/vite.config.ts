import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs'
import { join, resolve } from 'path'

// Read version from the main package.json
const packageJson = JSON.parse(
  readFileSync(resolve(__dirname, '../package.json'), 'utf-8')
)

// Plugin to copy examples to public directory
const copyExamplesPlugin = () => {
  return {
    name: 'copy-examples',
    buildStart() {
      const examplesDir = resolve(__dirname, '../examples')
      const publicExamplesDir = resolve(__dirname, 'public/examples')

      // Create public/examples directory if it doesn't exist
      try {
        mkdirSync(publicExamplesDir, { recursive: true })
      } catch {
        // Directory might already exist
      }

      // Copy all files from examples directory
      try {
        const files = readdirSync(examplesDir)
        files.forEach(file => {
          const sourcePath = join(examplesDir, file)
          const destPath = join(publicExamplesDir, file)

          if (statSync(sourcePath).isFile()) {
            const content = readFileSync(sourcePath, 'utf-8')
            writeFileSync(destPath, content, 'utf-8')
            console.log(`Copied ${file} to public/examples/`)
          }
        })
      } catch (error) {
        console.error('Error copying examples:', error)
      }
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), copyExamplesPlugin()],
  base: '/http-api/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3002
  },
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version)
  }
})
