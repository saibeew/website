import { render, screen } from '@testing-library/react'
import FeaturesSection from '../src/components/landing/FeaturesSection'
import '@testing-library/jest-dom'

describe('FeaturesSection', () => {
  it('renders heading', () => {
    render(<FeaturesSection />)
    const heading = screen.getByText('What Makes It Legendary')
    expect(heading).toBeInTheDocument()
  })

  it('renders all features', () => {
    render(<FeaturesSection />)
    expect(screen.getByText('AI Strategy Builder')).toBeInTheDocument()
    expect(screen.getByText('Real-Time Market Engine')).toBeInTheDocument()
  })
})
