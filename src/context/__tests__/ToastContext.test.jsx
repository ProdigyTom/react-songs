import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ToastProvider, useToast } from '../../context/ToastContext'

const ShowToastButton = ({ message, type }) => {
  const showToast = useToast()
  return <button onClick={() => showToast(message, type)}>Show Toast</button>
}

describe('ToastContext', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders children', () => {
    render(
      <ToastProvider>
        <div data-testid="child">content</div>
      </ToastProvider>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('shows a toast message when showToast is called', () => {
    render(
      <ToastProvider>
        <ShowToastButton message="Something went wrong" />
      </ToastProvider>
    )
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('defaults to error type class', () => {
    render(
      <ToastProvider>
        <ShowToastButton message="Oops" />
      </ToastProvider>
    )
    fireEvent.click(screen.getByRole('button'))
    expect(document.querySelector('.toast-error')).toBeInTheDocument()
  })

  it('applies custom type class', () => {
    render(
      <ToastProvider>
        <ShowToastButton message="Done" type="success" />
      </ToastProvider>
    )
    fireEvent.click(screen.getByRole('button'))
    expect(document.querySelector('.toast-success')).toBeInTheDocument()
  })

  it('auto-dismisses after 4 seconds', () => {
    render(
      <ToastProvider>
        <ShowToastButton message="Temporary" />
      </ToastProvider>
    )
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Temporary')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(4000)
    })
    expect(screen.queryByText('Temporary')).not.toBeInTheDocument()
  })

  it('does not dismiss before 4 seconds', () => {
    render(
      <ToastProvider>
        <ShowToastButton message="Still here" />
      </ToastProvider>
    )
    fireEvent.click(screen.getByRole('button'))
    act(() => {
      vi.advanceTimersByTime(3999)
    })
    expect(screen.getByText('Still here')).toBeInTheDocument()
  })

  it('manually dismisses when dismiss button is clicked', () => {
    render(
      <ToastProvider>
        <ShowToastButton message="Dismiss me" />
      </ToastProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Show Toast' }))
    expect(screen.getByText('Dismiss me')).toBeInTheDocument()

    fireEvent.click(document.querySelector('.toast-dismiss'))
    expect(screen.queryByText('Dismiss me')).not.toBeInTheDocument()
  })

  it('can show multiple toasts at once', () => {
    render(
      <ToastProvider>
        <ShowToastButton message="Alert" />
      </ToastProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Show Toast' }))
    act(() => { vi.advanceTimersByTime(1) })
    fireEvent.click(screen.getByRole('button', { name: 'Show Toast' }))
    expect(screen.getAllByText('Alert')).toHaveLength(2)
  })

  it('useToast throws when used outside ToastProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const BrokenComponent = () => {
      useToast()
      return null
    }
    expect(() => render(<BrokenComponent />)).toThrow(
      'useToast must be used within a ToastProvider'
    )
    consoleError.mockRestore()
  })
})
