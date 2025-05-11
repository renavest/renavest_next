clerkMiddleware() | Next.js

The clerkMiddleware() helper integrates Clerk authentication into your Next.js application through Middleware. clerkMiddleware() is compatible with both the App and Pages routers.
Configure clerkMiddleware()

Create a middleware.ts file at the root of your project, or in your src/ directory if you have one.

Note

For more information about Middleware in Next.js, see the Next.js documentation

.
middleware.ts

import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware()

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

By default, clerkMiddleware will not protect any routes. All routes are public and you must opt-in to protection for routes.
createRouteMatcher()

createRouteMatcher() is a Clerk helper function that allows you to protect multiple routes. createRouteMatcher() accepts an array of routes and checks if the route the user is trying to visit matches one of the routes passed to it. The paths provided to this helper can be in the same format as the paths provided to the Next Middleware matcher.

The createRouteMatcher() helper returns a function that, if called with the req object from the Middleware, will return true if the user is trying to access a route that matches one of the routes passed to createRouteMatcher().

In the following example, createRouteMatcher() sets all /dashboard and /forum routes as protected routes.

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/forum(.*)'])

Protect API routes

You can protect routes using either or both of the following:

    Authentication-based protection: Verify if the user is signed in.
    Authorization-based protection: Verify if the user has the required organization roles or custom permissions.

Protect routes based on authentication status

You can protect routes based on a user's authentication status by checking if the user is signed in.

There are two methods that you can use:

    Use auth.protect() if you want to redirect unauthenticated users to the sign-in route automatically.
    Use auth().userId if you want more control over what your app does based on user authentication status.

auth.protect()
auth().userId()
middleware.ts

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/forum(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

Protect routes based on authorization status

You can protect routes based on a user's authorization status by checking if the user has the required roles or permissions.

There are two methods that you can use:

    Use auth.protect() if you want Clerk to return a 404 if the user does not have the role or permission.
    Use auth().has() if you want more control over what your app does based on the authorization status.

auth.protect()
auth().has()
middleware.ts

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/admin(.*)'])

export default clerkMiddleware(async (auth, req) => {
  // Restrict admin routes to users with specific permissions
  if (isProtectedRoute(req)) {
    await auth.protect((has) => {
      return has({ permission: 'org:admin:example1' }) || has({ permission: 'org:admin:example2' })
    })
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

Protect multiple groups of routes

You can use more than one createRouteMatcher() in your application if you have two or more groups of routes.

The following example uses the has() method from the auth() helper.
middleware.ts

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isTenantRoute = createRouteMatcher(['/organization-selector(.*)', '/orgid/(.*)'])

const isTenantAdminRoute = createRouteMatcher(['/orgId/(.*)/memberships', '/orgId/(.*)/domain'])

export default clerkMiddleware(async (auth, req) => {
  // Restrict admin routes to users with specific permissions
  if (isTenantAdminRoute(req)) {
    await auth.protect((has) => {
      return has({ permission: 'org:admin:example1' }) || has({ permission: 'org:admin:example2' })
    })
  }
  // Restrict organization routes to signed in users
  if (isTenantRoute(req)) await auth.protect()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

Protect all routes

To protect all routes in your application and define specific routes as public, you can use any of the above methods and simply invert the if condition.
middleware.ts

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

Debug your Middleware

If you are having issues getting your Middleware dialed in, or are trying to narrow down auth-related issues, you can use the debugging feature in clerkMiddleware(). Add { debug: true } to clerkMiddleware() and you will get debug logs in your terminal.
middleware.ts

import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware(
  (auth, req) => {
    // Add your middleware checks
  },
  { debug: true },
)

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

If you would like to set up debugging for your development environment only, you can use the process.env.NODE_ENV variable to conditionally enable debugging. For example, { debug: process.env.NODE_ENV === 'development' }.
Combine Middleware

You can combine other Middleware with Clerk's Middleware by returning the second Middleware from clerkMiddleware().
middleware.ts

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import createMiddleware from 'next-intl/middleware'

import { AppConfig } from './utils/AppConfig'

const intlMiddleware = createMiddleware({
  locales: AppConfig.locales,
  localePrefix: AppConfig.localePrefix,
  defaultLocale: AppConfig.defaultLocale,
})

const isProtectedRoute = createRouteMatcher(['dashboard/(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()

  return intlMiddleware(req)
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}auth()

The auth() helper returns the Auth object of the currently active user, as well as the redirectToSignIn() method.

    Only available for App Router.
    Only works on the server-side, such as in Server Components, Route Handlers, and Server Actions.
    Requires clerkMiddleware() to be configured.

auth.protect()

auth includes a single property, the protect() method, which you can use in two ways:

    to check if a user is authenticated (signed in)
    to check if a user is authorized (has the correct roles or permissions) to access something, such as a component or a route handler

The following table describes how auth.protect() behaves based on user authentication or authorization status:
Authenticated	Authorized	auth.protect() will
Yes	Yes	Return the Auth object.
Yes	No	Return a 404 error.
No	No	Redirect the user to the sign-in page*.

Important

For non-document requests, such as API requests, auth.protect() returns a 404 error to users who aren't authenticated.

auth.protect() accepts the following parameters:

    role?
    string

    The role to check for.

    permission?
    string

    The permission to check for.

    has?
    (isAuthorizedParams: CheckAuthorizationParamsWithCustomPermissions) => boolean

    A function that checks if the user has an organization role or custom permission. See the reference for more information.

    unauthorizedUrl?
    string

    The URL to redirect the user to if they are not authorized.

    unauthenticatedUrl?
    string

        The URL to redirect the user to if they are not authenticated.

Example

auth.protect() can be used to check if a user is authenticated or authorized to access certain parts of your application or even entire routes. See detailed examples in the dedicated guide.
redirectToSignIn()

The auth() helper returns the redirectToSignIn() method, which you can use to redirect the user to the sign-in page.

redirectToSignIn() accepts the following parameters:

    returnBackUrl?
    string | URL

        The URL to redirect the user back to after they sign in.

Note

auth() on the server-side can only access redirect URLs defined via environment variables or clerkMiddleware dynamic keys.
Example

The following example shows how to use redirectToSignIn() to redirect the user to the sign-in page if they are not authenticated. It's also common to use redirectToSignIn() in clerkMiddleware() to protect entire routes; see the clerkMiddleware() docs for more information.
app/page.tsx

import { auth } from '@clerk/nextjs/server'

export default async function Page() {
  const { userId, redirectToSignIn } = await auth()

  if (!userId) return redirectToSignIn()

  return <h1>Hello, {userId}</h1>
}

auth() usage
Protect pages and routes

You can use auth() to check if a userId exists. If it's null, then there is not an authenticated (signed in) user. See detailed examples in the dedicated guide.
Check roles and permissions

You can use auth() to check if a user is authorized to access certain parts of your application or even entire routes by checking their roles or permissions. See detailed examples in the dedicated guide.
Data fetching with getToken()

If you need to send a JWT along to a server, getToken() retrieves the current user's session token or a custom JWT template. See detailed examples in the Auth reference.currentUser()

The currentUser helper returns the Backend User object of the currently active user. It can be used in Server Components, Route Handlers, and Server Actions.

Under the hood, this helper:

    calls fetch(), so it is automatically deduped per request.
    uses the GET /v1/users/{user_id}

    endpoint.
    counts towards the Backend API request rate limit.

app/page.tsx

import { currentUser } from '@clerk/nextjs/server'

export default async function Page() {
  const user = await currentUser()

  if (!user) return <div>Not signed in</div>

  return <div>Hello {user?.firstName}</div>
}Route Handlers

Clerk provides helpers that allow you to protect your Route Handlers, fetch the current user, and interact with the Clerk Backend API.
Protect your Route Handlers

If you aren't protecting your Route Handler using clerkMiddleware(), you can protect your Route Handler in two ways:

    Use auth.protect() if you want Clerk to return a 404 error when there is no signed in user.
    Use auth().userId if you want to customize the behavior or error message.

auth.protect()
auth().userId()
app/api/route.ts

import { auth } from '@clerk/nextjs/server'

export async function GET() {
  // If there is no signed in user, this will return a 404 error
  await auth.protect()

  // Add your Route Handler logic here

  return Response.json({ message: 'Hello world!' })
}

Retrieve data from external sources

Clerk provides integrations with a number of popular databases.

The following example demonstrates how to use auth().getToken() to retrieve a token from a JWT template and use it to fetch data from the external source.
app/api/route.ts

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
export async function GET() {
  const { userId, getToken } = await auth()

  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  const token = await getToken({ template: 'supabase' })

  // Fetch data from Supabase and return it.
  const data = { supabaseData: 'Hello World' }

  return NextResponse.json({ data })
}

Retrieve the current user

In some cases, you might need the current user in your Route Handler. Clerk provides an asynchronous helper called currentUser() to retrieve the current Backend User object.
app/api/route.ts

import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
export async function GET() {
  const user = await currentUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  return NextResponse.json({ user })
}

Interact with Clerk's Backend API

The JavaScript Backend SDK exposes the Backend API

resources and low-level authentication utilities for JavaScript environments.

clerkClient exposes an instance of the JavaScript Backend SDK for use in server environments.
app/api/route.ts

import { NextResponse, NextRequest } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  const { userId } = await auth()

  if (!userId) return NextResponse.redirect(new URL('/sign-in', req.url))

  const params = { firstName: 'John', lastName: 'Wick' }

  const client = await clerkClient()

  const user = await client.users.updateUser(userId, params)

  return NextResponse.json({ user })
}Implement basic Role Based Access Control (RBAC) with metadata

To control which users can access certain parts of your app, you can use the roles feature. Although Clerk offers roles as part of the organizations feature set, not every app implements organizations. This guide covers a workaround to set up a basic Role Based Access Control (RBAC) system for products that don't use Clerk's organizations or roles.

This guide assumes that you're using Next.js App Router, but the concepts can be adapted to Next.js Pages Router and Remix.
Configure the session token

Clerk provides user metadata, which can be used to store information, and in this case, it can be used to store a user's role. Since publicMetadata can only be read but not modified in the browser, it is the safest and most appropriate choice for storing information.

To build a basic RBAC system, you first need to make publicMetadata available to the application directly from the session token. By attaching publicMetadata to the user's session, you can access the data without needing to make a network request each time.

    In the Clerk Dashboard, navigate to the Sessions

    page.
    Under the Customize session token section, select Edit.
    In the modal that opens, enter the following JSON and select Save. If you have already customized your session token, you may need to merge this with what you currently have.

{
  "metadata": "{{user.public_metadata}}"
}

Warning

This guide is for users who want to build a custom user interface using the Clerk API. To use a prebuilt UI, use the Account Portal pages or prebuilt components.
Create a global TypeScript definition

    In your application's root folder, create a types/ directory.
    Inside this directory, create a globals.d.ts file with the following code. This file will provide auto-completion and prevent TypeScript errors when working with roles. For this guide, only the admin and moderator roles will be defined.

types/globals.d.ts

export {}

// Create a type for the roles
export type Roles = 'admin' | 'moderator'

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles
    }
  }
}

Set the admin role for your user

Later in the guide, you will add a basic admin tool to change a user's role. For now, manually add the admin role to your own user account.

    In the Clerk Dashboard, navigate to the Users

    page.
    Select your own user account.
    Scroll down to the User metadata section and next to the Public option, select Edit.
    Add the following JSON and select Save.

{
  "role": "admin"
}

Create a reusable function to check roles

Create a helper function to simplify checking roles.

    In your application's root directory, create a utils/ folder.
    Inside this directory, create a roles.ts file with the following code. The checkRole() helper uses the auth() helper to access the user's session claims. From the session claims, it accesses the metadata object to check the user's role. The checkRole() helper accepts a role of type Roles, which you created in the Create a global TypeScript definition step. It returns true if the user has that role or false if they do not.

utils/roles.ts

import { Roles } from '@/types/globals'
import { auth } from '@clerk/nextjs/server'

export const checkRole = async (role: Roles) => {
  const { sessionClaims } = await auth()
  return sessionClaims?.metadata.role === role
}

Note

You can customize the behavior of the checkRole() helper function to suit your needs. For example, you could modify it to return the roles a user has or create a protectByRole() function that handles role-based redirects.
Create the admin dashboard

Now, it's time to create an admin dashboard. The first step is to create the /admin route.

    In your app/ directory, create an admin/ folder.
    In the admin/ folder, create a page.tsx file with the following placeholder code.

app/admin/page.tsx

export default function AdminDashboard() {
  return <p>This is the protected admin dashboard restricted to users with the `admin` role.</p>
}

Protect the admin dashboard

To protect the /admin route, choose one of the two following methods:

    Middleware: Apply role-based access control globally at the route level. This method restricts access to all routes matching /admin before the request reaches the actual page.
    Page-level role check: Apply role-based access control directly in the /admin page component. This method protects this specific page. To protect other pages in the admin dashboard, apply this protection to each route.

Important

You only need to follow one of the following methods to secure your /admin route.
Option 1: Protect the /admin route using middleware

    In your app's root directory, create a middleware.ts file with the following code. The createRouteMatcher() function identifies routes starting with /admin. clerkMiddleware() intercepts requests to the /admin route, and checks the user's role in their metadata to verify that they have the admin role. If they don't, it redirects them to the home page.

middleware.ts

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isAdminRoute = createRouteMatcher(['/admin(.*)'])

export default clerkMiddleware(async (auth, req) => {
  // Protect all routes starting with `/admin`
  if (isAdminRoute(req) && (await auth()).sessionClaims?.metadata?.role !== 'admin') {
    const url = new URL('/', req.url)
    return NextResponse.redirect(url)
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

Option 2: Protect the /admin route at the page-level

    Add the following code to the app/admin/page.tsx file. The checkRole() function checks if the user has the admin role. If they don't, it redirects them to the home page.

app/admin/page.tsx

import { checkRole } from '@/utils/roles'
import { redirect } from 'next/navigation'

export default async function AdminDashboard() {
  // Protect the page from users who are not admins
  const isAdmin = await checkRole('admin')
  if (!isAdmin) {
    redirect('/')
  }

  return <p>This is the protected admin dashboard restricted to users with the `admin` role.</p>
}

Create server actions for managing a user's role

    In your app/admin/ directory, create an _actions.ts file with the following code. The setRole() action checks that the current user has the admin role before updating the specified user's role using Clerk's JavaScript Backend SDK. The removeRole() action removes the role from the specified user.

app/admin/_actions.ts

'use server'

import { checkRole } from '@/utils/roles'
import { clerkClient } from '@clerk/nextjs/server'

export async function setRole(formData: FormData) {
  const client = await clerkClient()

  // Check that the user trying to set the role is an admin
  if (!checkRole('admin')) {
    return { message: 'Not Authorized' }
  }

  try {
    const res = await client.users.updateUserMetadata(formData.get('id') as string, {
      publicMetadata: { role: formData.get('role') },
    })
    return { message: res.publicMetadata }
  } catch (err) {
    return { message: err }
  }
}

export async function removeRole(formData: FormData) {
  const client = await clerkClient()

  try {
    const res = await client.users.updateUserMetadata(formData.get('id') as string, {
      publicMetadata: { role: null },
    })
    return { message: res.publicMetadata }
  } catch (err) {
    return { message: err }
  }
}

Create a component for searching for users

    In your app/admin/ directory, create a SearchUsers.tsx file with the following code. The <SearchUsers /> component includes a form for searching for users. When submitted, it appends the search term to the URL as a search parameter. Your /admin route will then perform a query based on the updated URL.

app/admin/SearchUsers.tsx

'use client'

import { usePathname, useRouter } from 'next/navigation'

export const SearchUsers = () => {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const form = e.currentTarget
          const formData = new FormData(form)
          const queryTerm = formData.get('search') as string
          router.push(pathname + '?search=' + queryTerm)
        }}
      >
        <label htmlFor="search">Search for users</label>
        <input id="search" name="search" type="text" />
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

Refactor the admin dashboard

With the server action and the search form set up, it's time to refactor the app/admin/page.tsx.

    Replace the code in your app/admin/page.tsx file with the following code. It checks whether a search parameter has been appended to the URL by the search form. If a search parameter is present, it queries for users matching the entered term. If one or more users are found, the component displays a list of users, showing their first and last names, primary email address, and current role. Each user has Make Admin and Make Moderator buttons, which include hidden inputs for the user ID and role. These buttons use the setRole() server action to update the user's role.

app/admin/page.tsx

import { redirect } from 'next/navigation'
import { checkRole } from '@/utils/roles'
import { SearchUsers } from './SearchUsers'
import { clerkClient } from '@clerk/nextjs/server'
import { removeRole, setRole } from './_actions'

export default async function AdminDashboard(params: {
  searchParams: Promise<{ search?: string }>
}) {
  if (!checkRole('admin')) {
    redirect('/')
  }

  const query = (await params.searchParams).search

  const client = await clerkClient()

  const users = query ? (await client.users.getUserList({ query })).data : []

  return (
    <>
      <p>This is the protected admin dashboard restricted to users with the `admin` role.</p>

      <SearchUsers />

      {users.map((user) => {
        return (
          <div key={user.id}>
            <div>
              {user.firstName} {user.lastName}
            </div>

            <div>
              {
                user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)
                  ?.emailAddress
              }
            </div>

            <div>{user.publicMetadata.role as string}</div>

            <form action={setRole}>
              <input type="hidden" value={user.id} name="id" />
              <input type="hidden" value="admin" name="role" />
              <button type="submit">Make Admin</button>
            </form>

            <form action={setRole}>
              <input type="hidden" value={user.id} name="id" />
              <input type="hidden" value="moderator" name="role" />
              <button type="submit">Make Moderator</button>
            </form>

            <form action={removeRole}>
              <input type="hidden" value={user.id} name="id" />
              <button type="submit">Remove Role</button>
            </form>
          </div>
        )
      })}
    </>
  )
}

Finished 🎉

The foundation of a custom RBAC (Role-Based Access Control) system is now set up. Roles are attached directly to the user's session, allowing your application to access them without the need for additional network requests. The checkRole() helper function simplifies role checks and reduces code complexity. The final component is the admin dashboard, which enables admins to efficiently search for users and manage roles.
Feedback
Implement basic Role Based Access Control (RBAC) with metadata

To control which users can access certain parts of your app, you can use the roles feature. Although Clerk offers roles as part of the organizations feature set, not every app implements organizations. This guide covers a workaround to set up a basic Role Based Access Control (RBAC) system for products that don't use Clerk's organizations or roles.

This guide assumes that you're using Next.js App Router, but the concepts can be adapted to Next.js Pages Router and Remix.
Configure the session token

Clerk provides user metadata, which can be used to store information, and in this case, it can be used to store a user's role. Since publicMetadata can only be read but not modified in the browser, it is the safest and most appropriate choice for storing information.

To build a basic RBAC system, you first need to make publicMetadata available to the application directly from the session token. By attaching publicMetadata to the user's session, you can access the data without needing to make a network request each time.

    In the Clerk Dashboard, navigate to the Sessions

    page.
    Under the Customize session token section, select Edit.
    In the modal that opens, enter the following JSON and select Save. If you have already customized your session token, you may need to merge this with what you currently have.

{
  "metadata": "{{user.public_metadata}}"
}

Warning

This guide is for users who want to build a custom user interface using the Clerk API. To use a prebuilt UI, use the Account Portal pages or prebuilt components.
Create a global TypeScript definition

    In your application's root folder, create a types/ directory.
    Inside this directory, create a globals.d.ts file with the following code. This file will provide auto-completion and prevent TypeScript errors when working with roles. For this guide, only the admin and moderator roles will be defined.

types/globals.d.ts

export {}

// Create a type for the roles
export type Roles = 'admin' | 'moderator'

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles
    }
  }
}

Set the admin role for your user

Later in the guide, you will add a basic admin tool to change a user's role. For now, manually add the admin role to your own user account.

    In the Clerk Dashboard, navigate to the Users

    page.
    Select your own user account.
    Scroll down to the User metadata section and next to the Public option, select Edit.
    Add the following JSON and select Save.

{
  "role": "admin"
}

Create a reusable function to check roles

Create a helper function to simplify checking roles.

    In your application's root directory, create a utils/ folder.
    Inside this directory, create a roles.ts file with the following code. The checkRole() helper uses the auth() helper to access the user's session claims. From the session claims, it accesses the metadata object to check the user's role. The checkRole() helper accepts a role of type Roles, which you created in the Create a global TypeScript definition step. It returns true if the user has that role or false if they do not.

utils/roles.ts

import { Roles } from '@/types/globals'
import { auth } from '@clerk/nextjs/server'

export const checkRole = async (role: Roles) => {
  const { sessionClaims } = await auth()
  return sessionClaims?.metadata.role === role
}

Note

You can customize the behavior of the checkRole() helper function to suit your needs. For example, you could modify it to return the roles a user has or create a protectByRole() function that handles role-based redirects.
Create the admin dashboard

Now, it's time to create an admin dashboard. The first step is to create the /admin route.

    In your app/ directory, create an admin/ folder.
    In the admin/ folder, create a page.tsx file with the following placeholder code.

app/admin/page.tsx

export default function AdminDashboard() {
  return <p>This is the protected admin dashboard restricted to users with the `admin` role.</p>
}

Protect the admin dashboard

To protect the /admin route, choose one of the two following methods:

    Middleware: Apply role-based access control globally at the route level. This method restricts access to all routes matching /admin before the request reaches the actual page.
    Page-level role check: Apply role-based access control directly in the /admin page component. This method protects this specific page. To protect other pages in the admin dashboard, apply this protection to each route.

Important

You only need to follow one of the following methods to secure your /admin route.
Option 1: Protect the /admin route using middleware

    In your app's root directory, create a middleware.ts file with the following code. The createRouteMatcher() function identifies routes starting with /admin. clerkMiddleware() intercepts requests to the /admin route, and checks the user's role in their metadata to verify that they have the admin role. If they don't, it redirects them to the home page.

middleware.ts

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isAdminRoute = createRouteMatcher(['/admin(.*)'])

export default clerkMiddleware(async (auth, req) => {
  // Protect all routes starting with `/admin`
  if (isAdminRoute(req) && (await auth()).sessionClaims?.metadata?.role !== 'admin') {
    const url = new URL('/', req.url)
    return NextResponse.redirect(url)
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

Option 2: Protect the /admin route at the page-level

    Add the following code to the app/admin/page.tsx file. The checkRole() function checks if the user has the admin role. If they don't, it redirects them to the home page.

app/admin/page.tsx

import { checkRole } from '@/utils/roles'
import { redirect } from 'next/navigation'

export default async function AdminDashboard() {
  // Protect the page from users who are not admins
  const isAdmin = await checkRole('admin')
  if (!isAdmin) {
    redirect('/')
  }

  return <p>This is the protected admin dashboard restricted to users with the `admin` role.</p>
}

Create server actions for managing a user's role

    In your app/admin/ directory, create an _actions.ts file with the following code. The setRole() action checks that the current user has the admin role before updating the specified user's role using Clerk's JavaScript Backend SDK. The removeRole() action removes the role from the specified user.

app/admin/_actions.ts

'use server'

import { checkRole } from '@/utils/roles'
import { clerkClient } from '@clerk/nextjs/server'

export async function setRole(formData: FormData) {
  const client = await clerkClient()

  // Check that the user trying to set the role is an admin
  if (!checkRole('admin')) {
    return { message: 'Not Authorized' }
  }

  try {
    const res = await client.users.updateUserMetadata(formData.get('id') as string, {
      publicMetadata: { role: formData.get('role') },
    })
    return { message: res.publicMetadata }
  } catch (err) {
    return { message: err }
  }
}

export async function removeRole(formData: FormData) {
  const client = await clerkClient()

  try {
    const res = await client.users.updateUserMetadata(formData.get('id') as string, {
      publicMetadata: { role: null },
    })
    return { message: res.publicMetadata }
  } catch (err) {
    return { message: err }
  }
}

Create a component for searching for users

    In your app/admin/ directory, create a SearchUsers.tsx file with the following code. The <SearchUsers /> component includes a form for searching for users. When submitted, it appends the search term to the URL as a search parameter. Your /admin route will then perform a query based on the updated URL.

app/admin/SearchUsers.tsx

'use client'

import { usePathname, useRouter } from 'next/navigation'

export const SearchUsers = () => {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const form = e.currentTarget
          const formData = new FormData(form)
          const queryTerm = formData.get('search') as string
          router.push(pathname + '?search=' + queryTerm)
        }}
      >
        <label htmlFor="search">Search for users</label>
        <input id="search" name="search" type="text" />
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

Refactor the admin dashboard

With the server action and the search form set up, it's time to refactor the app/admin/page.tsx.

    Replace the code in your app/admin/page.tsx file with the following code. It checks whether a search parameter has been appended to the URL by the search form. If a search parameter is present, it queries for users matching the entered term. If one or more users are found, the component displays a list of users, showing their first and last names, primary email address, and current role. Each user has Make Admin and Make Moderator buttons, which include hidden inputs for the user ID and role. These buttons use the setRole() server action to update the user's role.

app/admin/page.tsx

import { redirect } from 'next/navigation'
import { checkRole } from '@/utils/roles'
import { SearchUsers } from './SearchUsers'
import { clerkClient } from '@clerk/nextjs/server'
import { removeRole, setRole } from './_actions'

export default async function AdminDashboard(params: {
  searchParams: Promise<{ search?: string }>
}) {
  if (!checkRole('admin')) {
    redirect('/')
  }

  const query = (await params.searchParams).search

  const client = await clerkClient()

  const users = query ? (await client.users.getUserList({ query })).data : []

  return (
    <>
      <p>This is the protected admin dashboard restricted to users with the `admin` role.</p>

      <SearchUsers />

      {users.map((user) => {
        return (
          <div key={user.id}>
            <div>
              {user.firstName} {user.lastName}
            </div>

            <div>
              {
                user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)
                  ?.emailAddress
              }
            </div>

            <div>{user.publicMetadata.role as string}</div>

            <form action={setRole}>
              <input type="hidden" value={user.id} name="id" />
              <input type="hidden" value="admin" name="role" />
              <button type="submit">Make Admin</button>
            </form>

            <form action={setRole}>
              <input type="hidden" value={user.id} name="id" />
              <input type="hidden" value="moderator" name="role" />
              <button type="submit">Make Moderator</button>
            </form>

            <form action={removeRole}>
              <input type="hidden" value={user.id} name="id" />
              <button type="submit">Remove Role</button>
            </form>
          </div>
        )
      })}
    </>
  )
}

Finished 🎉

The foundation of a custom RBAC (Role-Based Access Control) system is now set up. Roles are attached directly to the user's session, allowing your application to access them without the need for additional network requests. The checkRole() helper function simplifies role checks and reduces code complexity. The final component is the admin dashboard, which enables admins to efficiently search for users and manage rol

Implement basic Role Based Access Control (RBAC) with metadata

To control which users can access certain parts of your app, you can use the roles feature. Although Clerk offers roles as part of the organizations feature set, not every app implements organizations. This guide covers a workaround to set up a basic Role Based Access Control (RBAC) system for products that don't use Clerk's organizations or roles.

This guide assumes that you're using Next.js App Router, but the concepts can be adapted to Next.js Pages Router and Remix.
Configure the session token

Clerk provides user metadata, which can be used to store information, and in this case, it can be used to store a user's role. Since publicMetadata can only be read but not modified in the browser, it is the safest and most appropriate choice for storing information.

To build a basic RBAC system, you first need to make publicMetadata available to the application directly from the session token. By attaching publicMetadata to the user's session, you can access the data without needing to make a network request each time.

    In the Clerk Dashboard, navigate to the Sessions

    page.
    Under the Customize session token section, select Edit.
    In the modal that opens, enter the following JSON and select Save. If you have already customized your session token, you may need to merge this with what you currently have.

{
  "metadata": "{{user.public_metadata}}"
}

Warning

This guide is for users who want to build a custom user interface using the Clerk API. To use a prebuilt UI, use the Account Portal pages or prebuilt components.
Create a global TypeScript definition

    In your application's root folder, create a types/ directory.
    Inside this directory, create a globals.d.ts file with the following code. This file will provide auto-completion and prevent TypeScript errors when working with roles. For this guide, only the admin and moderator roles will be defined.

types/globals.d.ts

export {}

// Create a type for the roles
export type Roles = 'admin' | 'moderator'

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles
    }
  }
}

Set the admin role for your user

Later in the guide, you will add a basic admin tool to change a user's role. For now, manually add the admin role to your own user account.

    In the Clerk Dashboard, navigate to the Users

    page.
    Select your own user account.
    Scroll down to the User metadata section and next to the Public option, select Edit.
    Add the following JSON and select Save.

{
  "role": "admin"
}

Create a reusable function to check roles

Create a helper function to simplify checking roles.

    In your application's root directory, create a utils/ folder.
    Inside this directory, create a roles.ts file with the following code. The checkRole() helper uses the auth() helper to access the user's session claims. From the session claims, it accesses the metadata object to check the user's role. The checkRole() helper accepts a role of type Roles, which you created in the Create a global TypeScript definition step. It returns true if the user has that role or false if they do not.

utils/roles.ts

import { Roles } from '@/types/globals'
import { auth } from '@clerk/nextjs/server'

export const checkRole = async (role: Roles) => {
  const { sessionClaims } = await auth()
  return sessionClaims?.metadata.role === role
}

Note

You can customize the behavior of the checkRole() helper function to suit your needs. For example, you could modify it to return the roles a user has or create a protectByRole() function that handles role-based redirects.
Create the admin dashboard

Now, it's time to create an admin dashboard. The first step is to create the /admin route.

    In your app/ directory, create an admin/ folder.
    In the admin/ folder, create a page.tsx file with the following placeholder code.

app/admin/page.tsx

export default function AdminDashboard() {
  return <p>This is the protected admin dashboard restricted to users with the `admin` role.</p>
}

Protect the admin dashboard

To protect the /admin route, choose one of the two following methods:

    Middleware: Apply role-based access control globally at the route level. This method restricts access to all routes matching /admin before the request reaches the actual page.
    Page-level role check: Apply role-based access control directly in the /admin page component. This method protects this specific page. To protect other pages in the admin dashboard, apply this protection to each route.

Important

You only need to follow one of the following methods to secure your /admin route.
Option 1: Protect the /admin route using middleware

    In your app's root directory, create a middleware.ts file with the following code. The createRouteMatcher() function identifies routes starting with /admin. clerkMiddleware() intercepts requests to the /admin route, and checks the user's role in their metadata to verify that they have the admin role. If they don't, it redirects them to the home page.

middleware.ts

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isAdminRoute = createRouteMatcher(['/admin(.*)'])

export default clerkMiddleware(async (auth, req) => {
  // Protect all routes starting with `/admin`
  if (isAdminRoute(req) && (await auth()).sessionClaims?.metadata?.role !== 'admin') {
    const url = new URL('/', req.url)
    return NextResponse.redirect(url)
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

Option 2: Protect the /admin route at the page-level

    Add the following code to the app/admin/page.tsx file. The checkRole() function checks if the user has the admin role. If they don't, it redirects them to the home page.

app/admin/page.tsx

import { checkRole } from '@/utils/roles'
import { redirect } from 'next/navigation'

export default async function AdminDashboard() {
  // Protect the page from users who are not admins
  const isAdmin = await checkRole('admin')
  if (!isAdmin) {
    redirect('/')
  }

  return <p>This is the protected admin dashboard restricted to users with the `admin` role.</p>
}

Create server actions for managing a user's role

    In your app/admin/ directory, create an _actions.ts file with the following code. The setRole() action checks that the current user has the admin role before updating the specified user's role using Clerk's JavaScript Backend SDK. The removeRole() action removes the role from the specified user.

app/admin/_actions.ts

'use server'

import { checkRole } from '@/utils/roles'
import { clerkClient } from '@clerk/nextjs/server'

export async function setRole(formData: FormData) {
  const client = await clerkClient()

  // Check that the user trying to set the role is an admin
  if (!checkRole('admin')) {
    return { message: 'Not Authorized' }
  }

  try {
    const res = await client.users.updateUserMetadata(formData.get('id') as string, {
      publicMetadata: { role: formData.get('role') },
    })
    return { message: res.publicMetadata }
  } catch (err) {
    return { message: err }
  }
}

export async function removeRole(formData: FormData) {
  const client = await clerkClient()

  try {
    const res = await client.users.updateUserMetadata(formData.get('id') as string, {
      publicMetadata: { role: null },
    })
    return { message: res.publicMetadata }
  } catch (err) {
    return { message: err }
  }
}

Create a component for searching for users

    In your app/admin/ directory, create a SearchUsers.tsx file with the following code. The <SearchUsers /> component includes a form for searching for users. When submitted, it appends the search term to the URL as a search parameter. Your /admin route will then perform a query based on the updated URL.

app/admin/SearchUsers.tsx

'use client'

import { usePathname, useRouter } from 'next/navigation'

export const SearchUsers = () => {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const form = e.currentTarget
          const formData = new FormData(form)
          const queryTerm = formData.get('search') as string
          router.push(pathname + '?search=' + queryTerm)
        }}
      >
        <label htmlFor="search">Search for users</label>
        <input id="search" name="search" type="text" />
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

Refactor the admin dashboard

With the server action and the search form set up, it's time to refactor the app/admin/page.tsx.

    Replace the code in your app/admin/page.tsx file with the following code. It checks whether a search parameter has been appended to the URL by the search form. If a search parameter is present, it queries for users matching the entered term. If one or more users are found, the component displays a list of users, showing their first and last names, primary email address, and current role. Each user has Make Admin and Make Moderator buttons, which include hidden inputs for the user ID and role. These buttons use the setRole() server action to update the user's role.

app/admin/page.tsx

import { redirect } from 'next/navigation'
import { checkRole } from '@/utils/roles'
import { SearchUsers } from './SearchUsers'
import { clerkClient } from '@clerk/nextjs/server'
import { removeRole, setRole } from './_actions'

export default async function AdminDashboard(params: {
  searchParams: Promise<{ search?: string }>
}) {
  if (!checkRole('admin')) {
    redirect('/')
  }

  const query = (await params.searchParams).search

  const client = await clerkClient()

  const users = query ? (await client.users.getUserList({ query })).data : []

  return (
    <>
      <p>This is the protected admin dashboard restricted to users with the `admin` role.</p>

      <SearchUsers />

      {users.map((user) => {
        return (
          <div key={user.id}>
            <div>
              {user.firstName} {user.lastName}
            </div>

            <div>
              {
                user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)
                  ?.emailAddress
              }
            </div>

            <div>{user.publicMetadata.role as string}</div>

            <form action={setRole}>
              <input type="hidden" value={user.id} name="id" />
              <input type="hidden" value="admin" name="role" />
              <button type="submit">Make Admin</button>
            </form>

            <form action={setRole}>
              <input type="hidden" value={user.id} name="id" />
              <input type="hidden" value="moderator" name="role" />
              <button type="submit">Make Moderator</button>
            </form>

            <form action={removeRole}>
              <input type="hidden" value={user.id} name="id" />
              <button type="submit">Remove Role</button>
            </form>
          </div>
        )
      })}
    </>
  )
}

Finished 🎉

The foundation of a custom RBAC (Role-Based Access Control) system is now set up. Roles are attached directly to the user's session, allowing your application to access them without the need for additional network requests. The checkRole() helper function simplifies role checks and reduces code complexity. The final component is the admin dashboard, which enables admins to efficiently search for users and manage roles.