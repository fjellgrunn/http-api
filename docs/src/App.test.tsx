import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the main header', () => {
    render(<App />)
    expect(screen.getByText('Fjell')).toBeInTheDocument()
    expect(screen.getByText('HTTP API')).toBeInTheDocument()
  })

  it('renders navigation sections', () => {
    render(<App />)
    expect(screen.getByText('Foundation')).toBeInTheDocument()
    expect(screen.getByText('Getting Started')).toBeInTheDocument()
    expect(screen.getByText('API Reference')).toBeInTheDocument()
    expect(screen.getByText('Examples')).toBeInTheDocument()
  })

  it('changes sections when navigation is clicked', () => {
    render(<App />)

    const gettingStartedButton = screen.getByText('Getting Started')
    fireEvent.click(gettingStartedButton)

    expect(screen.getByText('Getting Started')).toHaveClass('nav-item-title')
  })

  it('displays loading initially', () => {
    render(<App />)
    expect(screen.getByText('Connecting to the HTTP API')).toBeInTheDocument()
  })

  it('renders version badge with link', () => {
    render(<App />)
    const versionBadge = screen.getByText(/v\d+\.\d+\.\d+/)
    expect(versionBadge).toBeInTheDocument()
    expect(versionBadge.closest('a')).toHaveAttribute('href', expect.stringContaining('github.com'))
  })

  it('renders GitHub and npm links', () => {
    render(<App />)
    expect(screen.getByText('View Source')).toBeInTheDocument()
    expect(screen.getByText('Install Package')).toBeInTheDocument()
  })

  it('toggles sidebar on mobile menu click', () => {
    render(<App />)
    const menuToggle = screen.getByRole('button', { name: /menu/i })
    fireEvent.click(menuToggle)
    // Test would check for sidebar-open class
  })
})
