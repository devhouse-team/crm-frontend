export default defineAppConfig({
  ui: {
    colors: {
      primary: 'emerald',
      secondary: 'indigo',
      success: 'emerald',
      info: 'sky',
      warning: 'amber',
      error: 'rose',
      neutral: 'slate'
    },
    badge: {
      slots: {
        base: 'font-medium inline-flex items-center whitespace-nowrap'
      },
      variants: {
        size: {
          xs: {
            base: 'text-xs/4 px-1.5 py-0.5 gap-1 rounded-sm'
          },
          sm: {
            base: 'text-xs/4 px-2 py-0.5 gap-1 rounded-sm'
          }
        }
      },
      compoundVariants: [
        { color: 'primary', variant: 'subtle', class: 'text-primary-800 dark:text-primary-300' },
        { color: 'secondary', variant: 'subtle', class: 'text-secondary-800 dark:text-secondary-300' },
        { color: 'success', variant: 'subtle', class: 'text-success-800 dark:text-success-300' },
        { color: 'info', variant: 'subtle', class: 'text-info-800 dark:text-info-300' },
        { color: 'warning', variant: 'subtle', class: 'text-warning-800 dark:text-warning-300' },
        { color: 'error', variant: 'subtle', class: 'text-error-800 dark:text-error-300' },
        { color: 'primary', variant: 'soft', class: 'text-primary-800 dark:text-primary-300' },
        { color: 'secondary', variant: 'soft', class: 'text-secondary-800 dark:text-secondary-300' },
        { color: 'success', variant: 'soft', class: 'text-success-800 dark:text-success-300' },
        { color: 'info', variant: 'soft', class: 'text-info-800 dark:text-info-300' },
        { color: 'warning', variant: 'soft', class: 'text-warning-800 dark:text-warning-300' },
        { color: 'error', variant: 'soft', class: 'text-error-800 dark:text-error-300' }
      ],
      defaultVariants: {
        size: 'sm',
        variant: 'subtle'
      }
    },
    alert: {
      compoundVariants: [
        { color: 'primary', variant: 'subtle', class: { root: 'text-primary-800 dark:text-primary-200' } },
        { color: 'secondary', variant: 'subtle', class: { root: 'text-secondary-800 dark:text-secondary-200' } },
        { color: 'success', variant: 'subtle', class: { root: 'text-success-800 dark:text-success-200' } },
        { color: 'info', variant: 'subtle', class: { root: 'text-info-800 dark:text-info-200' } },
        { color: 'warning', variant: 'subtle', class: { root: 'text-warning-800 dark:text-warning-200' } },
        { color: 'error', variant: 'subtle', class: { root: 'text-error-700 dark:text-error-200' } }
      ]
    },
    button: {
      compoundVariants: [
        { color: 'primary', variant: 'soft', class: 'text-primary-800 dark:text-primary-300' },
        { color: 'secondary', variant: 'soft', class: 'text-secondary-800 dark:text-secondary-300' },
        { color: 'success', variant: 'soft', class: 'text-success-800 dark:text-success-300' },
        { color: 'warning', variant: 'soft', class: 'text-warning-800 dark:text-warning-300' },
        { color: 'error', variant: 'soft', class: 'text-error-800 dark:text-error-300' },
        { color: 'primary', variant: 'subtle', class: 'text-primary-800 dark:text-primary-300' },
        { color: 'secondary', variant: 'subtle', class: 'text-secondary-800 dark:text-secondary-300' },
        { color: 'success', variant: 'subtle', class: 'text-success-800 dark:text-success-300' },
        { color: 'warning', variant: 'subtle', class: 'text-warning-800 dark:text-warning-300' },
        { color: 'error', variant: 'subtle', class: 'text-error-800 dark:text-error-300' }
      ]
    },
    card: {
      slots: {
        root: 'rounded-lg',
        header: 'px-4 py-3',
        body: 'p-4'
      }
    }
  }
})
