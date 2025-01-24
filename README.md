# Next.js Vertical Slice Project

## Architecture & Style Guide

### Project Structure

```
src/
  features/           # Business domain slices
    auth/
      components/
        LoginForm.tsx
        password-input.tsx
      api/
        login.ts
      hooks/
        useAuth.ts
      types/
        auth.types.ts
      index.ts
    [other-features]/
  shared/
    components/
    hooks/
    utils/
```

### File Naming

- **Components**

  - PascalCase for pages/complex (`UserProfile.tsx`)
  - Kebab-case for simple (`user-avatar.tsx`)

- **API/Utils**

  - Kebab-case (`get-user.ts`)
  - HTTP verb prefix for API

- **Hooks/Exports**
  - camelCase with 'use' prefix (`useAuth.ts`)
  - index.ts for exports

### Component Guidelines

```tsx
// Proper component structure
export function LoginForm() {
  const { login } = useAuth();
  return (
    <form className="card w-96 bg-base-100">
      <input className="input input-bordered" />
    </form>
  );
}
```

### Styling

- Use Tailwind utilities directly
- Follow DaisyUI patterns
- Group with @apply for repeated styles
- Maintain consistent spacing scale

### API/Data

- React Query for fetching
- TypeScript for all API responses
- Error boundaries per feature
- Loading states handled consistently

### Development

```bash
npm run dev
npm run lint
npm run test
```

### Best Practices

- Unit test business logic
- Document complex functions
- Follow Git commit conventions
- Keep components under 150 lines
- Export through index.ts
- Handle errors gracefully

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- DaisyUI
- React Query

## Resources

- [Next.js](https://nextjs.org/docs)
- [Tailwind](https://tailwindcss.com/docs)
- [DaisyUI](https://daisyui.com/components)

## Deployment

Deploy on [Vercel](https://vercel.com/new).
