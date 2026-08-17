// Root page - redirect to main layout
// The actual homepage is in (main)/page.tsx
// This file exists to handle the root route

import HomePage from './(main)/page'

export default function RootPage() {
  return <HomePage />
}
