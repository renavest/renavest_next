# Docs

- [Renavest Linting](/docs/eslint.md)

# Next.js Vertical Slice Project

## Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── (auth)/              # Auth-required route group
│   ├── api/                 # API routes
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
│
├── features/                # Feature slices
│   ├── auth/               # Example feature
│   │   ├── api/           # API layer (server actions, API routes)
│   │   ├── domain/        # Domain logic, validations, types
│   │   └── ui/            # Components specific to auth
│   └── [other-features]/
│
├── shared/                 # Shared code across features
│   ├── api/               # Shared API utilities
│   ├── components/        # Shared UI components
│   ├── config/           # App configuration
│   ├── db/              # Database (Drizzle)
│   ├── lib/            # Shared utilities
│   ├── styles/         # Global styles
│   └── types/          # Shared TypeScript types
│
└── public/             # Static assets

```

## Coding Standards

### File Naming

- React Components: PascalCase (`UserProfile.tsx`)
- Utils/Helpers: camelCase (`formatDate.ts`)
- API Routes/Actions: camelCase (`createUser.ts`)
- Types/Interfaces: PascalCase (`UserType.ts`)
- CSS Modules: kebab-case (`button-styles.css`)

### Component Structure

```tsx
// Example component structure
export default function ProductCard({ product }: ProductCardProps) {
  // State/hooks at the top
  const [isLoading, setIsLoading] = useState(false);

  // Handlers after state
  const handleClick = () => {
    setIsLoading(true);
    // ...
  };

  // JSX last
  return <div className='font-[family-name:var(--font-geist-sans)]'>{/* Component content */}</div>;
}
```

### ESLint Rules
We enforce consistent code style using ESLint:

- Max 100 lines per function
- PascalCase for components
- camelCase for variables/functions
- Proper import ordering
- No unused variables
- No console.logs in production
- Vertical slice architecture boundaries

### Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Drizzle ORM
- Vertical Slice Architecture
- Geist Font

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Lint code
npm run lint

# Format code
npm run format
```

### VS Code Setup

Install recommended extensions:

- ESLint
- Prettier
- Tailwind CSS IntelliSense

VS Code will automatically:

- Format on save
- Fix ESLint issues
- Show real-time linting errors

### Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

## Vertical Slice Architecture

Each feature contains:

- `api/` - Server actions, API routes
- `domain/` - Business logic, types, validations
- `ui/` - Components specific to the feature
- `types.ts` - types specific to the feature

  Key principles:

- Features are isolated
- No cross-feature imports
- Shared code goes in `shared/`
- Domain layer never imports from UI/API, business logic shouldn't have external dependencies

## Style Guide

### Tailwind Usage

- Use semantic color variables (`bg-background` not `bg-white`)
- Maintain consistent spacing scale
- Use Geist font through CSS variables
- Group common patterns with @apply

### Component Guidelines

- Keep components focused and small
- Use TypeScript for all props
- Handle loading and error states
- Follow React best practices

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)
