declare module 'react-toastify' {
  import * as React from 'react'

  export interface ToastOptions {
    type?: 'info' | 'success' | 'warning' | 'error' | 'default'
    autoClose?: number | false
    position?: string
    [key: string]: any
  }

  export interface ToastContainerProps {
    position?: string
    autoClose?: number | false
    newestOnTop?: boolean
    closeOnClick?: boolean
    rtl?: boolean
    pauseOnFocusLoss?: boolean
    draggable?: boolean
    pauseOnHover?: boolean
    theme?: 'light' | 'dark' | 'colored'
    [key: string]: any
  }

  export const ToastContainer: React.ComponentType<ToastContainerProps>

  export function toast(message: string, options?: ToastOptions): void
  export namespace toast {
    function success(message: string, options?: ToastOptions): void
    function error(message: string, options?: ToastOptions): void
    function info(message: string, options?: ToastOptions): void
    function warn(message: string, options?: ToastOptions): void
  }
}
