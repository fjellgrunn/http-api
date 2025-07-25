import { createDocsViteConfig } from '@fjell/docs-template/config'
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs'
import { join, resolve } from 'path'

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

export default createDocsViteConfig({
  basePath: '/http-api/',
  port: 3002,
  plugins: [copyExamplesPlugin()]
})
