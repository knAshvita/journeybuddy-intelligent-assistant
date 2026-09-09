# Module 1: Next.js Frontend Architecture

## Architectural Deliverable: Client-Server Boundary
This implementation isolates dynamic user interaction logic from the static structural shell using Next.js React Server Components (RSC) and Client Components (`"use client"`):

1. **Static Server Shell (`src/app/page.tsx`)**:
   - Pre-renders core layout, metadata, and non-interactive sections on the server.
   - Minimizes client-side JavaScript payload to ensure rapid First Contentful Paint (FCP).

2. **Interactive Client Boundaries (`src/components/SearchBar.tsx`, `src/components/StatusCard.tsx`)**:
   - Isolated with the `"use client"` directive.
   - Handles localized browser state (`useState`), user input, and reactive telemetry interactions without converting the entire application into a heavy client-side bundle.

## Reference Documentation
- [Next.js Documentation](https://nextjs.org/docs)