auth()

The auth() helper returns the Auth object of the currently active user, as well as the redirectToSignIn() method.

    Only available for App Router.
    Only works on the server-side, such as in Server Components, Route Handlers, and Server Actions.
    Requires clerkMiddleware() to be configured.

auth.protect()

auth includes a single property, the protect() method, which you can use in two ways:

    to check if a user is authenticated (signed in)
    to check if a user is authorized (has the cuorrect roles or permissions) to access something, such as a component or a route handler

The following table describes how auth.protect() behaves based on user authentication or authorization status:
Authenticated	Authorized	auth.protect() will
Yes	Yes	Return the Auth object.
Yes	No	Return a 404 error.
No	No	Redirect the user to the login page*.

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

The auth() helper returns the redirectToSignIn() method, which you can use to redirect the user to the login page.

redirectToSignIn() accepts the following parameters:

    returnBackUrl?
    string | URL

        The URL to redirect the user back to after they sign in.

Note

auth() on the server-side can only access redirect URLs defined via environment variables or clerkMiddleware dynamic keys.
Example

The following example shows how to use redirectToSignIn() to redirect the user to the login page if they are not authenticated. It's also common to use redirectToSignIn() in clerkMiddleware() to protect entire routes; see the clerkMiddleware() docs for more information.
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

If you need to send a JWT along to a server, getToken() retrieves the current user's session token or a custom JWT template. See detailed examples in the Auth reference.

currentUser()

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
}

Feedback


Route Handlers

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

  if (!userId) return NextResponse.redirect(new URL('/login', req.url))

  const params = { firstName: 'John', lastName: 'Wick' }

  const client = await clerkClient()

  const user = await client.users.updateUser(userId, params)

  return NextResponse.json({ user })
}

Server Actions

Clerk provides helpers to allow you to protect your Server Actions, fetch the current user, and interact with the Clerk API.

The following guide provides examples for using Server Actions in Server Components and in Client Components.
With Server Components
Protect your Server Actions

You can use the auth() helper to protect your server actions. This helper will return the current user's ID if they are signed in, or null if they are not.
actions.ts

import { auth } from '@clerk/nextjs/server'

export default function AddToCart() {
  async function addItem(formData: FormData) {
    'use server'

    const { userId } = await auth()

    if (!userId) {
      throw new Error('You must be signed in to add an item to your cart')
    }

    console.log('add item server action', formData)
  }

  return (
    <form action={addItem}>
      <input value={'test'} type="text" name="name" />
      <button type="submit">Add to Cart</button>
    </form>
  )
}

When performing organization-related operations, you can use auth().orgId to check a user's organization ID before performing an action.
actions.ts

import { auth } from '@clerk/nextjs/server'

export default function AddVerifiedDomain() {
  async function addVerifiedDomain(formData: FormData) {
    'use server'

    const { userId, orgId } = await auth()

    if (!userId) {
      throw new Error('You must be signed in to add a verified domain')
    }

    if (!orgId) {
      throw new Error('No active organization found. Set one as active or create/join one')
    }

    const domain = formData.get('domain')?.toString()
    if (!domain) {
      throw new Error('Domain is required')
    }

    await clerkClient().organizations.createOrganizationDomain({
      organizationId: orgId,
      name: domain,
      enrollmentMode: 'automatic_invitation',
    })

    console.log(`Added domain ${domain} to organization ${orgId}`)
  }

  return (
    <form action={addVerifiedDomain}>
      <input placeholder="example.com" type="text" name="domain" />
      <button type="submit">Add Domain</button>
    </form>
  )
}

Accessing the current user

Current user data is important for data enrichment. You can use the currentUser() helper to fetch the current user's data in your server actions.
app/page.tsx

import { currentUser } from '@clerk/nextjs/server'

export default function AddHobby() {
  async function addHobby(formData: FormData) {
    'use server'

    const user = await currentUser()

    if (!user) {
      throw new Error('You must be signed in to use this feature')
    }

    const serverData = {
      usersHobby: formData.get('hobby'),
      userId: user.id,
      profileImage: user.imageUrl,
    }

    console.log('add item server action completed with user details ', serverData)
  }

  return (
    <form action={addHobby}>
      <input value={'soccer'} type="text" name="hobby" />
      <button type="submit">Submit your hobby</button>
    </form>
  )
}

With Client Components

When using Server Actions in Client Components, you need to make sure you use prop drilling to ensure that headers are available.
Protect your Server Actions

Use the following tabs to see an example of how to protect a Server Action that is used in a Client Component.
Server Action
Client Component
Page
app/actions.ts

'use server'
import { auth } from '@clerk/nextjs/server'

export async function addItem(formData: FormData) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('You must be signed in to add an item to your cart')
  }

  console.log('add item server action', formData)
}

Accessing the current user

Use the following tabs to see an example of how to access the current user in a Server Action that is used in a Client Component.
Server Action
Client Component
Page
app/actions.ts

'use server'
import { currentUser } from '@clerk/nextjs/server'

export async function addHobby(formData: FormData) {
  const user = await currentUser()

  if (!user) {
    throw new Error('You must be signed in to use this feature')
  }

  const serverData = {
    usersHobby: formData.get('hobby'),
    userId: user.id,
    profileImage: user.imageUrl,
  }

  console.log('add Hobby completed with user details ', serverData)
}

Read session and user data in your Next.js app with Clerk

Clerk provides a set of hooks and helpers that you can use to access the active session and user data in your Next.js application. Here are examples of how to use these helpers in both the client and server-side to get you started.
Server-side
App Router

auth() and currentUser() are App Router-specific helpers that you can use inside of your Route Handlers, Middleware, Server Components, and Server Actions.

    The auth() helper will return the Auth object of the currently active user.
    The currentUser() helper will return the Backend User object of the currently active user. This is helpful if you want to render information, like their first and last name, directly from the server. Under the hood, currentUser() uses the clerkClient wrapper to make a call to the Backend API. This does count towards the Backend API request rate limit. This also uses fetch() so it is automatically deduped per request.

The following example uses the auth() helper to validate an authenticated user and the currentUser() helper to access the Backend User object for the authenticated user.

Note

Any requests from a Client Component to a Route Handler will read the session from cookies and will not need the token sent as a Bearer token.
Server components and actions
Route Handler
app/page.tsx

import { auth, currentUser } from '@clerk/nextjs/server'

export default async function Page() {
  // Get the userId from auth() -- if null, the user is not signed in
  const { userId } = await auth()

  // Protect the route by checking if the user is signed in
  if (!userId) {
    return <div>Sign in to view this page</div>
  }

  // Get the Backend API User object when you need access to the user's information
  const user = await currentUser()

  // Use `user` to render user details or create UI elements
  return <div>Welcome, {user.firstName}!</div>
}
Client-side
useAuth()

The following example uses the useAuth() hook to access the current auth state, as well as helper methods to manage the current active session.
example.tsx

export default function Example() {
  const { isLoaded, isSignedIn, userId, sessionId, getToken } = useAuth()

  const fetchExternalData = async () => {
    // Use `getToken()` to get the current user's session token
    const token = await getToken()

    // Use `token` to fetch data from an external API
    const response = await fetch('https://api.example.com/data', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.json()
  }

  // Use `isLoaded` to check if Clerk is loaded
  if (!isLoaded) {
    return <div>Loading...</div>
  }

  // Use `isSignedIn` to check if the user is signed in
  if (!isSignedIn) {
    // You could also add a redirect to the login page here
    return <div>Sign in to view this page</div>
  }

  return (
    <div>
      Hello, {userId}! Your current active session is {sessionId}.
    </div>
  )
}

useUser()

The following example uses the useUser() hook to access the User object, which contains the current user's data such as their full name. The isLoaded and isSignedIn properties are used to handle the loading state and to check if the user is signed in, respectively.
src/Example.tsx

export default function Example() {
  const { isSignedIn, user, isLoaded } = useUser()

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (!isSignedIn) {
    return <div>Sign in to view this page</div>
  }

  return <div>Hel


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
ow

Onboarding is a crucial part of many authentication flows. Sometimes you need to make sure certain criteria is met and collected before allowing access to parts of your application. With Clerk, you can leverage customizable session tokens, public metadata, and Middleware to create a custom onboarding experience.

This guide demonstrates how to create a custom onboarding flow that requires users to complete a form before they can access the application. After a user authenticates using the Account Portal, the user is prompted to fill out a form with an application name and type. Once the user has completed the form, they are redirected to the application's homepage.

In this guide, you will learn how to:

    Add custom claims to your session token
    Configure your Middleware to read session data
    Update the user’s onboarding state

For the sake of this guide, examples are written for Next.js App Router, but can be used with Next.js Pager Router as well. The examples have been pared down to the bare minimum to enable you to easily customize them to your needs.

Note

To see this guide in action, see the repository

.
Add custom claims to your session token

Session tokens are JWTs that are generated by Clerk on behalf of your instance, and contain claims that allow you to store data about a user's session. With Clerk, when a session token exists for a user, it indicates that the user is authenticated, and the associated claims can be retrieved at any time.

For this guide, you will use an onboardingComplete property in the user's public metadata to track their onboarding status. But first, you need to add a custom claim to the session token that will allow you to access the user's public metadata in your Middleware.

To edit the session token:

    In the Clerk Dashboard, navigate to the Sessions

page.

In the Customize session token section, select the Edit button.

In the modal that opens, you can add any claim to your session token that you need. For this guide, add the following:

    {
      "metadata": "{{user.public_metadata}}"
    }

    Select Save.

To get auto-complete and prevent TypeScript errors when working with custom session claims, you can define a global type.

    In your application's root folder, add a types directory.
    Inside of the types directory, add a globals.d.ts file.
    Create the CustomJwtSessionClaims interface and declare it globally.
    Add the custom claims to the CustomJwtSessionClaims interface.

For this guide, your globals.d.ts file should look like this:
types/globals.d.ts

export {}

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      onboardingComplete?: boolean
    }
  }
}

Configure your Middleware to read session data

clerkMiddleware() allows you to configure access to your routes with fine grained control. It also allows you to retrieve claims directly from the session and redirect your user accordingly.

The following example demonstrates how to use clerkMiddleware() to redirect users based on their onboarding status. If the user is signed in and has not completed onboarding, they will be redirected to the onboarding page.

Note that the following example protects all routes except one. This is so that any user visiting your application is forced to authenticate, and then forced to onboard. You can customize the array in the createRouteMatcher() function assigned to isPublicRoute to include any routes that should be accessible to all users, even unauthenticated ones.
src/middleware.ts

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

const isOnboardingRoute = createRouteMatcher(['/onboarding'])
const isPublicRoute = createRouteMatcher(['/public-route-example'])

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth()

  // For users visiting /onboarding, don't try to redirect
  if (userId && isOnboardingRoute(req)) {
    return NextResponse.next()
  }

  // If the user isn't signed in and the route is private, redirect to login
  if (!userId && !isPublicRoute(req)) return redirectToSignIn({ returnBackUrl: req.url })

  // Catch users who do not have `onboardingComplete: true` in their publicMetadata
  // Redirect them to the /onboarding route to complete onboarding
  if (userId && !sessionClaims?.metadata?.onboardingComplete) {
    const onboardingUrl = new URL('/onboarding', req.url)
    return NextResponse.redirect(onboardingUrl)
  }

  // If the user is logged in and the route is protected, let them view.
  if (userId && !isPublicRoute(req)) return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

Create a layout for the /onboarding route

You will need a layout for the /onboarding route that will redirect users to the homepage if they have already completed onboarding.

    In your /app directory, create an /onboarding folder.
    In your /onboarding directory, create a layout.tsx file and add the following code to the file. This file could also be expanded to handle multiple steps, if multiple steps are required for an onboarding flow.

src/app/onboarding/layout.tsx

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  if ((await auth()).sessionClaims?.metadata.onboardingComplete === true) {
    redirect('/')
  }

  return <>{children}</>
}

Add fallback and force redirect URLs

To ensure a smooth onboarding flow, add redirect URL's to your environment variables. The fallback redirect URL is used when there is no redirect_url in the path. The force redirect URL will always be used after a successful sign up.
.env

NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/onboarding

Use publicMetadata to track user onboarding state

Each Clerk user has a User object that contains a publicMetadata property, which can be used to store custom data about the user. This information can be accessed on the client-side and can be used to drive application state. For more information, see the guide on metadata.

You can use the user's publicMetadata to track the user's onboarding state. To do this, you will create:

    A process in your frontend with logic to collect and submit all the information for onboarding. In this guide, you will create a simple form.
    A method in your backend to securely update the user's publicMetadata

Collect user onboarding information

To collect the user's onboarding information, create a form that will be displayed on the /onboarding page. This form will collect the user's application name and application type. This is a very loose example — you can use this step to capture information from the user, sync user data to your database, have the user sign up to a course or subscription, or more.

    In your /onboarding directory, create a page.tsx file.
    Add the following code to the file.

'use client'

import * as React from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { completeOnboarding } from './_actions'

export default function OnboardingComponent() {
  const [error, setError] = React.useState('')
  const { user } = useUser()
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    const res = await completeOnboarding(formData)
    if (res?.message) {
      // Reloads the user's data from the Clerk API
      await user?.reload()
      router.push('/')
    }
    if (res?.error) {
      setError(res?.error)
    }
  }
  return (
    <div>
      <h1>Welcome</h1>
      <form action={handleSubmit}>
        <div>
          <label>Application Name</label>
          <p>Enter the name of your application.</p>
          <input type="text" name="applicationName" required />
        </div>

        <div>
          <label>Application Type</label>
          <p>Describe the type of your application.</p>
          <input type="text" name="applicationType" required />
        </div>
        {error && <p className="text-red-600">Error: {error}</p>}
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

Update the user's publicMetadata in your backend

Now that there is a form to collect the user's onboarding information, you need to create a method in your backend to update the user's publicMetadata with this information. This method will be called when the user submits the form.

    In your /onboarding directory, create an _actions.ts file.
    Add the following code to the file. This file includes a method that will be called on form submission and will update the user's publicMetadata accordingly. The following example uses the clerkClient wrapper to interact with the Backend API and update the user's publicMetadata.

'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'

export const completeOnboarding = async (formData: FormData) => {
  const { userId } = await auth()

  if (!userId) {
    return { message: 'No Logged In User' }
  }

  const client = await clerkClient()

  try {
    const res = await client.users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
        applicationName: formData.get('applicationName'),
        applicationType: formData.get('applicationType'),
      },
    })
    return { message: res.publicMetadata }
  } catch (err) {
    return { error: 'There was an error updating the user metadata.' }
  }
}

Wrap up

Your onboarding flow is now complete! 🎉 Users who have not onboarded yet will now land on your /onboarding page. New users signing up or signing in to your application will have to complete the onboarding process before they can access your application. By using Clerk, you have streamlined the user authentication and onboarding process, ensuring a smooth and efficient experience for your new users.
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

    Use auth.protect() if you want to redirect unauthenticated users to the login route automatically.
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

const isPublicRoute = createRouteMatcher(['/login(.*)', '/sign-up(.*)'])

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
}

clerkMiddleware() options

The clerkMiddleware() function accepts an optional object. The following options are available:

    audience?
    string | string[]

A string or list of audiences

    . If passed, it is checked against the aud claim in the token.

    authorizedParties?
    string[]

    An allowlist of origins to verify against, to protect your application from the subdomain cookie leaking attack. For example: ['http://localhost:3000', 'https://example.com']

    clockSkewInMs?
    number

    Specifies the allowed time difference (in milliseconds) between the Clerk server (which generates the token) and the clock of the user's application server when validating a token. Defaults to 5000 ms (5 seconds).

    domain?
    string

    The domain used for satellites to inform Clerk where this application is deployed.

    isSatellite?
    boolean

    When using Clerk's satellite feature, this should be set to true for secondary domains.

    jwtKey
    string

Used to verify the session token in a networkless manner. Supply the JWKS Public Key from the API keys

    page in the Clerk Dashboard. It's recommended to use the environment variable instead. For more information, refer to Manual JWT verification.

    organizationSyncOptions?
    OrganizationSyncOptions | undefined

    Used to activate a specific organization or personal account based on URL path parameters. If there's a mismatch between the active organization in the session (e.g., as reported by auth()) and the organization indicated by the URL, the middleware will attempt to activate the organization specified in the URL.

    proxyUrl?
    string

    Specify the URL of the proxy, if using a proxy.

    signInUrl
    string

    The full URL or path to your login page. Needs to point to your primary application on the client-side. Required for a satellite application in a development instance. It's recommended to use the environment variable instead.

    signUpUrl
    string

    The full URL or path to your sign-up page. Needs to point to your primary application on the client-side. Required for a satellite application in a development instance. It's recommended to use the environment variable instead.

    publishableKey
    string

The Clerk Publishable Key for your instance. This can be found on the API keys

    page in the Clerk Dashboard.

    secretKey?
    string

The Clerk Secret Key for your instance. This can be found on the API keys

        page in the Clerk Dashboard. The CLERK_ENCRYPTION_KEY environment variable must be set when providing secretKey as an option, refer to Dynamic keys.

It's also possible to dynamically set options based on the incoming request:
middleware.ts

import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware(
  (auth, req) => {
    // Add your middleware checks
  },
  (req) => ({
    // Provide `domain` based on the request host
    domain: req.nextUrl.host,
  }),
)

Dynamic keys

Note

Dynamic keys are not accessible on the client-side.

The following options, known as "Dynamic Keys," are shared to the Next.js application server through clerkMiddleware, enabling access by server-side helpers like auth():

    signUpUrl
    signInUrl
    secretKey
    publishableKey

Dynamic keys are encrypted and shared during request time using a AES encryption algorithm

. When providing a secretKey, the CLERK_ENCRYPTION_KEY environment variable is mandatory and used as the encryption key. If no secretKey is provided to clerkMiddleware, the encryption key defaults to CLERK_SECRET_KEY.

When providing CLERK_ENCRYPTION_KEY, it is recommended to use a 32-byte (256-bit), pseudorandom value. You can use openssl to generate a key:
terminal

openssl rand --hex 32

For multi-tenant applications, you can dynamically define Clerk keys depending on the incoming request. Here's an example:
middleware.ts

import { clerkMiddleware } from '@clerk/nextjs/server'

// You would typically fetch these keys from a external store or environment variables.
const tenantKeys = {
  tenant1: { publishableKey: 'pk_tenant1...', secretKey: 'sk_tenant1...' },
  tenant2: { publishableKey: 'pk_tenant2...', secretKey: 'sk_tenant2...' },
}

export default clerkMiddleware(
  (auth, req) => {
    // Add your middleware checks
  },
  (req) => {
    // Resolve tenant based on the request
    const tenant = getTenant(req)
    return tenantKeys[tenant]
  },
)

OrganizationSyncOptions

The organizationSyncOptions property on the clerkMiddleware() options object has the type OrganizationSyncOptions, which has the following properties:

    organizationPatterns
    Pattern[]

Specifies URL patterns that are organization-specific, containing an organization ID or slug as a path parameter. If a request matches this path, the organization identifier will be used to set that org as active.

If the route also matches the personalAccountPatterns prop, this prop takes precedence.

Patterns must have a path parameter named either :id (to match a Clerk organization ID) or :slug (to match a Clerk organization slug).

    Warning

    If the organization can't be activated—either because it doesn't exist or the user lacks access—the previously active organization will remain unchanged. Components must detect this case and provide an appropriate error and/or resolution pathway, such as calling notFound() or displaying an <OrganizationSwitcher />.

    Common examples:

        ["/orgs/:slug", "/orgs/:slug/(.*)"]
        ["/orgs/:id", "/orgs/:id/(.*)"]
        ["/app/:any/orgs/:slug", "/app/:any/orgs/:slug/(.*)"]

    personalAccountPatterns
    Pattern[]

        URL patterns for resources that exist within the context of a Clerk Personal Account (user-specific, outside any organization).

        If the route also matches the organizationPattern prop, the organizationPattern prop takes precedence.

        Common examples:
            ["/me", "/me/(.*)"]
            ["/user/:any", "/user/:any/(.*)"]

Pattern

A Pattern is a string that represents the structure of a URL path. In addition to any valid URL, it may include:

    Named path parameters prefixed with a colon (e.g., :id, :slug, :any).
    Wildcard token, (.*), which matches the remainder of the path.

Examples

    /orgs/:slug

URL	Matches	:slug value
/orgs/acmecorp	✅	acmecorp
/orgs	❌	n/a
/orgs/acmecorp/settings	❌	n/a

    /app/:any/orgs/:id

URL	Matches	:id value
/app/petstore/orgs/org_123	✅	org_123
/app/dogstore/v2/orgs/org_123	❌	n/a

    /personal-account/(.*)

URL	Matches
/personal-account/settings	✅
/personal-account


Sign-up and sign-in options

Clerk provides multiple options for configuring a sign-up and sign-in flow for your application, such as identifiers and authentication strategies. This guide will walk you through each option.

You can modify your authentication options after your application has been created by navigating to the Clerk Dashboard

and selecting any of the options under User & Authentication.
Identifiers

Identifiers are how your application recognizes an individual user. There are three primary identifiers:

    Email address
    Phone number
    Username

In the application configuration screen, you can select multiple identifiers, but at least one is required.

Email address is the most common primary identifier. When it is the only enabled identifier, users are required to supply an email address during sign-up and keep one on their account at all times. The email address that was supplied during sign-up can be later changed from the user's profile page.

When phone number is selected as the identifier, a user can sign up with their phone number and receive a code via SMS to verify it. SMS functionality is restricted to phone numbers from countries enabled on your SMS allowlist.

Note

SMS authentication is a premium feature and not available on the Free plan. Upgrade your plan

to enable this feature.

Choosing username as the identifier enables users to sign up without requiring personal contact information. A username should be from 4 to 64 characters in length and can contain alphanumeric characters, underscores (_), and dashes (-).

Note

If you choose not to collect any contact information, you can enable Username authentication and later disable it in settings, opting to authenticate only with a social provider.

To update your identifiers after your application has been created:

    In the Clerk Dashboard, navigate to the Email, phone, username

    page.
    In the Contact information section, you can select Email address and Phone number as identifiers. In the Username section, you can select Username as an identifier.

Personal information

Personal information is extra information that you can collect from users during the sign-up process. Currently, the only personal information that you can collect is a first name and last name. By default, this information is not collected. To configure this feature:

    In the Clerk Dashboard, navigate to the Email, phone, username

    page.
    In the Personal information section, enable Name. By default, providing a first name and last name is optional. To make it required, select the settings icon next to Name and enable Required.

Authentication strategies

Authentication strategies are methods that users can use to sign up and sign in to your application.

There are two kinds of authentication strategies: password and passwordless.

Choosing the password strategy requires users to set a password during the sign up process. Passwords are required to be at least 8 characters long, and have built-in protection against weak and compromised passwords.

Note

Passwordless authentication remains available to users, even if the password strategy is enabled.

The passwordless strategy provides a more secure and convenient sign-in method, as users don't need to remember complex passwords.

Passwordless authentication strategies include:

    Passkeys
    One-time password (OTP)
    Email link

To configure authentication strategies:

    In the Clerk Dashboard, navigate to the Email, phone, username

    page.
    In the Authentication strategies section, toggle on the authentication strategies you would like to enable. Note that disabling Password will only affect new users. Existing users will still be able to sign in with their existing password.

Passkeys

A passkey is a type of sign-in credential that requires one user action, but uses two authentication factors:

    A pin number or biometric data
    A physical device

Users can only create passkeys after signing up, so you'll need to enable another authentication strategy for the sign-up process. After signing in, users can create a passkey.
Manage user passkeys

The easiest way to allow your users to create and manage their passkeys is to use the prebuilt <UserProfile> component, which includes passkey management in the Security tab.

If you're building a custom user interface, refer to the passkeys custom flow guide to learn how to create a custom passkey management flow using the Clerk API.
Passkey limitations

    Passkeys are not currently available as an MFA option.
    Not all devices and browsers are compatible with passkeys. Passkeys are built on WebAuthn technology and you should check the Browser Compatibility docs

    for an up-to-date list.
    Passkey related APIs will not work with Expo.
    Your users can have a max of 10 passkeys per account.

Domain restrictions for passkeys in development

Passkeys are tied to the domain they are created on and cannot be used across different domains. For example:

    Passkeys created on localhost will only work on localhost.
    Passkeys created on your Account Portal (e.g., your-app.accounts.dev) will only work on that domain.

To work around this in development, you can either:

    Use Clerk's Components, Elements, or custom flows, instead of using Account Portal.
    Create the passkey directly through Account Portal instead of your local application.

This issue does not affect production environments, as your Account Portal will be hosted on a subdomain of your main domain (e.g., accounts.your-domain.com), enabling passkeys to work seamlessly across your application.
One-time password (OTP)

When one of the OTP options is selected as an authentication strategy, users receive a one-time code to complete the sign-in process. OTPs are more secure than passwords, as they allow user verification without storing passwords in your database.

There are two one-time password (OTP), or one-time code, strategies to choose from:

    Email verification code
    SMS verification code

When email address is chosen as the identifier, Email verification code is set as the default authentication option.

Note

SMS authentication is a premium feature and is not available on the Free plan. Upgrade your plan

to enable this feature.
SMS allowlist

SMS functionality, including SMS OTPs, is restricted to phone numbers from countries that are enabled on your SMS allowlist. This can be useful for avoiding extraneous SMS fees from countries from which your app is not expected to attract traffic.

Every instance starts off with a default set of enabled SMS country tiers. To tailor it to your needs:

    In the Clerk Dashboard, navigate to the SMS

    page.
    Select the Settings tab.
    Enable or disable countries as needed.

If a country is disabled, then phone numbers starting with the corresponding country calling code:

    Cannot receive OTPs and a request to receive an OTP will be rejected with an error
    Cannot receive notifications for password or passkey modifications
    Cannot be used upon sign-up
    Cannot be added to an existing user profile

Email link

When the Email verification link option is selected as an authentication strategy, users receive an email message with a link to complete the authentication process. Email links can be used to sign up new users, sign in existing ones, or allow existing users to verify newly entered email addresses to user profiles.

As a security measure, email links expire after 10 minutes to prevent the use of compromised or stale links.
Require the same device and browser

By default, the Require the same device and browser setting is enabled. This means that email links are required to be verified from the same device and browser on which the sign-up or sign-in was initiated. For example:

    A user tries to sign in from their desktop browser.
    They open the email link on their mobile phone to verify their email address.
    The user's sign-in on the desktop browser gets an error, because the link was verified on a different device and browser.

To configure this setting:

    In the Clerk Dashboard, navigate to the Email, phone, username

    page.
    In the Authentication strategies section, next to Email verification link, select the settings icon.
    Enable or disable the Require the same device and browser setting.

Verification methods

Verification methods are the methods that users can use to verify their identifier during the sign-up process, or to verify a new identifier that they add to their profile.

Clerk offers three verification methods:

    Email verification link
    Email verification code
    SMS verification code

These methods work similarly to their authentication strategy counterparts but are used for verifying identifiers rather than authentication. For example, when a user adds an email address to their profile, they can receive an Email verification link or Email verification code to verify the new email address.

To configure verification methods:

    In the Clerk Dashboard, navigate to the Email, phone, username

    page.
    Select the settings icon next to the identifier, such as Email address or Phone number, to open the configuration settings.
    Under the Verification methods section, toggle on the verification methods you would like to enable.
    Select Continue to save your changes.

Social connections (OAuth)

Clerk offers several social providers for use during sign-up and sign-in. This authentication option is appealing because users often don't need to enter additional contact information since the provider already has it.

Clerk's OAuth process is designed to be seamless. If an existing user attempts to sign up with a social provider, the system automatically switches to sign-in. Similarly, if a user tries to sign in with a social provider but doesn't have an account, Clerk will automatically create one.

Users can link multiple social providers to their account, depending on your application's setup. You can configure your application to use the Account Portal User Profile page, the prebuilt <UserProfile /> component, or build your own custom user interface using the Clerk API..

To enable social connections:

    In the Clerk Dashboard, navigate to the SSO connections

    page.
    Select the Add connection button, and select For all users.
    For development instances, simply select the social providers that you would like to enable. For production instances, you'll need to configure credentials for each social provider. See the social provider's dedicated guide to learn how to configure credentials.

Web3 authentication

Clerk provides Web3 authentication with either MetaMask, Coinbase Wallet, or OKX Wallet. As part of validating the accuracy of the returned Web3 account address, Clerk handles the signing of a message and verifying the signature. Because sign-in with Web3 uses the same abstraction as our other authentication factors, like passwords or email links, other Clerk features like multi-factor authentication and profile enrichment work for Web3 users out-of-the-box.

To enable Web3 authentication:

    In the Clerk Dashboard, navigate to the Web3

    page.
    Enable your preferred Web3 provider.

Multi-factor authentication

Clerk supports multi-factor authentication (MFA), also known as two-factor authentication (2FA). If a user enables MFA for their account, they are required to complete a second verification step during sign-in. This enhances security by enforcing two different types of verification. Many websites offer this as an optional step, giving users control over their own security.

MFA is not available on the new application screen, but it can be enabled in the Clerk Dashboard.

    In the Clerk Dashboard, navigate to the Multi-factor

    page.
    Toggle on the MFA strategies you would like to enable.

The following MFA strategies are currently available:

    SMS verification code
    Authenticator application (also known as TOTP - Time-based One-time Password)
    Backup codes

Enabling MFA allows users of your app to turn it on for their own accounts through their User Profile page. Enabling MFA does not automatically turn on MFA for all users.

If you're building a custom user interface instead of using the Account Portal or prebuilt components, you can use elements or the Clerk API to build a custom sign-in flow that allows users to sign in with MFA.
Reset a user's MFA

You can reset a user's MFA by deleting their MFA enrollments. This will remove all of their MFA methods and they will have to enroll in MFA again.

To reset a user's MFA:

    At the top of the Clerk Dashboard

    , select Users.
    Select the user from the list.
    Select the Reset MFA enrollments button.

Restrictions

Clerk provides a set of restriction options designed to provide you with enhanced control over who can gain access to your application. Restrictions can limit sign-ups or prevent accounts with specific identifiers, such as email addresses, phone numbers, and even entire domains, from accessing your application. Learn more about restrictions.

Webhooks overview

A webhook is an event-driven method of communication between applications.

Unlike typical APIs where you would need to poll for data very frequently to get it "real-time", webhooks only send data when there is an event to trigger the webhook. This makes webhooks seem "real-time", but it's important to note that they are asynchronous.

For example, if you are onboarding a new user, you can't rely on the webhook delivery as part of that flow. Typically the delivery will happen quickly, but it's not guaranteed to be delivered immediately or at all. Webhooks are best used for things like sending a notification or updating a database, but not for synchronous flows where you need to know the webhook was delivered before moving on to the next step. If you need a synchronous flow, see the onboarding guide for an example.
Clerk webhooks

Clerk webhooks allow you to receive event notifications from Clerk, such as when a user is created or updated. When an event occurs, Clerk will send an HTTP POST request to your webhook endpoint configured for the event type. The payload carries a JSON object. You can then use the information from the request's JSON payload to trigger actions in your app, such as sending a notification or updating a database.

Clerk uses Svix

to send our webhooks.

You can find the Webhook signing secret when you select the endpoint you created on the Webhooks

page in the Clerk Dashboard.
Supported webhook events

To find a list of all the events Clerk supports:

    In the Clerk Dashboard, navigate to the Webhooks

    page.
    Select the Event Catalog tab.

Payload structure

The payload of a webhook is a JSON object that contains the following properties:

    data: contains the actual payload sent by Clerk. The payload can be a different object depending on the event type. For example, for user.* events, the payload will always be the User object.
    object: always set to event.
    type: the type of event that triggered the webhook.
    timestamp: timestamp in milliseconds of when the event occurred.
    instance_id: the identifier of your Clerk instance.

The following example shows the payload of a user.created event:

{
  "data": {
    "birthday": "",
    "created_at": 1654012591514,
    "email_addresses": [
      {
        "email_address": "example@example.org",
        "id": "idn_29w83yL7CwVlJXylYLxcslromF1",
        "linked_to": [],
        "object": "email_address",
        "verification": {
          "status": "verified",
          "strategy": "ticket"
        }
      }
    ],
    "external_accounts": [],
    "external_id": "567772",
    "first_name": "Example",
    "gender": "",
    "id": "user_29w83sxmDNGwOuEthce5gg56FcC",
    "image_url": "https://img.clerk.com/xxxxxx",
    "last_name": "Example",
    "last_sign_in_at": 1654012591514,
    "object": "user",
    "password_enabled": true,
    "phone_numbers": [],
    "primary_email_address_id": "idn_29w83yL7CwVlJXylYLxcslromF1",
    "primary_phone_number_id": null,
    "primary_web3_wallet_id": null,
    "private_metadata": {},
    "profile_image_url": "https://www.gravatar.com/avatar?d=mp",
    "public_metadata": {},
    "two_factor_enabled": false,
    "unsafe_metadata": {},
    "updated_at": 1654012591835,
    "username": null,
    "web3_wallets": []
  },
  "instance_id": "ins_123",
  "object": "event",
  "timestamp": 1654012591835,
  "type": "user.created"
}

The payload should always be treated as unsafe until you validate the incoming webhook. Webhooks will originate from another server and be sent to your application as a POST request. A bad actor would fake a webhook event to try and gain access to your application or data.
How Clerk handles delivery issues
Retry

Svix will use a set schedule and retry any webhooks that fail. To see the up-to-date schedule, see the Svix Retry Schedule

.

If Svix is attempting and failing to send a webhook, and that endpoint is removed or disabled from the Webhooks

page in the Clerk Dashboard, then the attempts will also be disabled.
Replay

If a webhook message or multiple webhook messages fail to send, you have the option to replay the webhook messages. This protects against your service having downtime or against a misconfigured endpoint.

To replay webhook messages:

    In the Clerk Dashboard, navigate to the Webhooks

    page.
    Select the affected endpoint.
    In the Message Attempts section, next to the message you want to replay, select the menu icon on the right side, and then select Replay.
    The Replay Messages menu will appear. You can choose to:

    Resend the specific message you selected.
    Resend all failed messages since the first failed message in that date range.
    Resend all missing messages since the first failed message in that date range.

Sync data to your database

You can find a guide on how to use webhooks to sync your data to your database here.
Protect your webhooks from abuse

To ensure that the API route receiving the webhook can only be hit by your app, there are a few protections you can put in place:

    Verify the request signature: Svix webhook requests are signed

and can be verified to ensure the request is not malicious. To learn more, see Svix's guide on how to verify webhooks with the svix libraries or how to verify webhooks manually

.

Only accept requests coming from Svix's webhook IPs
: To further prevent attackers from flooding your servers or wasting your compute, you can ensure that your webhook-receiving api routes only accept requests coming from Svix's webhook IPs, rejecting all other requests.

---
useSignIn()

The useSignIn() hook provides access to the SignIn object, which allows you to check the current state of a sign-in attempt and manage the sign-in flow. You can use this to create a custom sign-in flow.
Returns

This function returns a discriminated union type. There are multiple variants of this type available which you can select by clicking on one of the tabs.
Initialization
Loaded

    isLoaded
    false

    A boolean that indicates whether Clerk has completed initialization. Initially false, becomes true once Clerk loads.

    setActive
    undefined

    A function that sets the active session.

    signIn
    undefined

        An object that contains the current sign-in attempt status and methods to create a new sign-in attempt.

Examples
Check the current state of a sign-in

The following example uses the useSignIn() hook to access the SignIn object, which contains the current sign-in attempt status and methods to create a new sign-in attempt. The isLoaded property is used to handle the loading state.
React
Next.js
app/sign-in/page.tsx

"use client";

import { useSignIn } from "@clerk/nextjs";

export default function SignInPage() {
  const { isLoaded, signIn } = useSignIn();

  if (!isLoaded) {
    // Handle loading state
    return null;
  }

  return <div>The current sign-in attempt status is {signIn?.status}.</div>;
}

Create a custom sign-in flow with useSignIn()

The useSignIn() hook can also be used to build fully custom sign-in flows, if Clerk's prebuilt components don't meet your specific needs or if you require more control over the authentication flow. Different sign-in flows include email and password, email and phone codes, email links, and multifactor (MFA). To learn more about using the useSignIn() hook to create custom flows, see the custom flow guides.

useSignUp()

The useSignUp() hook provides access to the SignUp object, which allows you to check the current state of a sign-up attempt and manage the sign-up flow. You can use this to create a custom sign-up flow.
Returns

This function returns a discriminated union type. There are multiple variants of this type available which you can select by clicking on one of the tabs.
Initialization
Loaded

    isLoaded
    false

    A boolean that indicates whether Clerk has completed initialization. Initially false, becomes true once Clerk loads.

    setActive
    undefined

    A function that sets the active session.

    signUp
    undefined

        An object that contains the current sign-up attempt status and methods to create a new sign-up attempt.

Examples
Check the current state of a sign-up

The following example uses the useSignUp() hook to access the SignUp object, which contains the current sign-up attempt status and methods to create a new sign-up attempt. The isLoaded property is used to handle the loading state.
React
Next.js
app/sign-up/page.tsx

"use client";

import { useSignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  const { isLoaded, signUp } = useSignUp();

  if (!isLoaded) {
    // Handle loading state
    return null;
  }

  return <div>The current sign-up attempt status is {signUp?.status}.</div>;
}

Create a custom sign-up flow with useSignUp()

The useSignUp() hook can also be used to build fully custom sign-up flows, if Clerk's prebuilt components don't meet your specific needs or if you require more control over the authentication flow. Different sign-up flows include email and password, email and phone codes, email links, and multifactor (MFA). To learn more about using the useSignUp() hook to create custom flows, see the custom flow guides.
Feedback

useSession()

The useSession() hook provides access to the current user's Session object, as well as helpers for setting the active session.
Parameters

    options?
    { treatPendingAsSignedOut?: boolean; }

    An object containing options for the useSession() hook.

    options.treatPendingAsSignedOut?
    boolean

        A boolean that indicates whether pending sessions are considered as signed out or not. Defaults to true.

Returns

This function returns a discriminated union type. There are multiple variants of this type available which you can select by clicking on one of the tabs.
Initialization
Signed out
Signed in

    isLoaded
    false

    A boolean that indicates whether Clerk has completed initialization. Initially false, becomes true once Clerk loads.

    isSignedIn
    undefined

    A boolean that indicates whether a user is currently signed in.

    session
    undefined

        The current active session for the user.

Example
Access the Session object

The following example uses the useSession() hook to access the Session object, which has the lastActiveAt property. The lastActiveAt property is a Date object used to show the time the session was last active.
React
Next.js
app/page.tsx

"use client";

import { useSession } from "@clerk/nextjs";

export default function HomePage() {
  const { isLoaded, session, isSignedIn } = useSession();

  if (!isLoaded) {
    // Handle loading state
    return null;
  }
  if (!isSignedIn) {
    // Handle signed out state
    return null;
  }

  return (
    <div>
      <p>
        This session has been active since{" "}
        {session.lastActiveAt.toLocaleString()}
      </p>
    </div>
  );
}
useOrganization()

The useOrganization() hook retrieves attributes of the currently active organization.
Parameters

useOrganization() accepts a single object with the following optional properties:

    domains?
    true | { initialPage?: number; pageSize?: number; } & { enrollmentMode?: "manual_invitation" | "automatic_invitation" | "automatic_suggestion"; } & { infinite?: boolean; keepPreviousData?: boolean; }

    If set to true, all default properties will be used.
    Otherwise, accepts an object with the following optional properties:

        enrollmentMode: A string that filters the domains by the provided enrollment mode.
        Any of the properties described in Shared properties.

    .

    invitations?
    true | { initialPage?: number; pageSize?: number; } & { status?: ("expired" | "revoked" | "pending" | "accepted")[]; } & { infinite?: boolean; keepPreviousData?: boolean; }

    If set to true, all default properties will be used.
    Otherwise, accepts an object with the following optional properties:

        status: A string that filters the invitations by the provided status.
        Any of the properties described in Shared properties.

    .

    membershipRequests?
    true | { initialPage?: number; pageSize?: number; } & { status?: "expired" | "revoked" | "pending" | "accepted"; } & { infinite?: boolean; keepPreviousData?: boolean; }

    If set to true, all default properties will be used.
    Otherwise, accepts an object with the following optional properties:

        status: A string that filters the membership requests by the provided status.
        Any of the properties described in Shared properties.

    .

    memberships?
    true | { initialPage?: number; pageSize?: number; } & { query?: string; role?: string[]; } & { infinite?: boolean; keepPreviousData?: boolean; }

    If set to true, all default properties will be used.
    Otherwise, accepts an object with the following optional properties:

        role: An array of OrganizationCustomRoleKey.
        query: A string that filters the memberships by the provided string.
        Any of the properties described in Shared properties.

    .

    subscriptions?
    true | { initialPage?: number; pageSize?: number; } & object & { orgId?: string; } & { infinite?: boolean; keepPreviousData?: boolean; }

        If set to true, all default properties will be used.
        Otherwise, accepts an object with the following optional properties:
            orgId: A string that filters the subscriptions by the provided organization ID.
            Any of the properties described in Shared properties.

        .

Warning

By default, the memberships, invitations, membershipRequests, and domains attributes aren't populated. To fetch and paginate the data, you must pass true or an object with the desired properties.
Shared properties

Optional properties that are shared across the invitations, membershipRequests, memberships, and domains properties.

    initialPage?
    number

    A number that specifies which page to fetch. For example, if initialPage is set to 10, it will skip the first 9 pages and fetch the 10th page. Defaults to 1.

    pageSize?
    number

        A number that specifies the maximum number of results to return per page. Defaults to 10.

    infinite?
    boolean

    If true, newly fetched data will be appended to the existing list rather than replacing it. Useful for implementing infinite scroll functionality. Defaults to false.

    keepPreviousData?
    boolean

        If true, the previous data will be kept in the cache until new data is fetched. Defaults to false.

Note

These attributes are updating automatically and will re-render their respective components whenever you set a different organization using the setActive({ organization }) method or update any of the memberships or invitations. No need for you to manage updating anything manually.
Returns

    domains
    null | PaginatedResourcesWithDefault<OrganizationDomainResource> | PaginatedResources<OrganizationDomainResource, T["membershipRequests"] extends { infinite: true; } ? true : false>

    Includes a paginated list of the organization's domains.

    invitations
    null | PaginatedResourcesWithDefault<OrganizationInvitationResource> | PaginatedResources<OrganizationInvitationResource, T["invitations"] extends { infinite: true; } ? true : false>

    Includes a paginated list of the organization's invitations.

    isLoaded
    boolean

    A boolean that indicates whether Clerk has completed initialization. Initially false, becomes true once Clerk loads.

    membership
    undefined | null | OrganizationMembershipResource

    The current organization membership.

    membershipRequests
    null | PaginatedResourcesWithDefault<OrganizationMembershipRequestResource> | PaginatedResources<OrganizationMembershipRequestResource, T["membershipRequests"] extends { infinite: true; } ? true : false>

    Includes a paginated list of the organization's membership requests.

    memberships
    null | PaginatedResourcesWithDefault<OrganizationMembershipResource> | PaginatedResources<OrganizationMembershipResource, T["memberships"] extends { infinite: true; } ? true : false>

    Includes a paginated list of the organization's memberships.

    organization
    undefined | null | OrganizationResource

    The currently active organization.

    subscriptions
    null | PaginatedResourcesWithDefault<CommerceSubscriptionResource> | PaginatedResources<CommerceSubscriptionResource, T["subscriptions"] extends { infinite: true; } ? true : false>

        Includes a paginated list of the organization's subscriptions.

PaginatedResources

    count
    number

    The total count of data that exist remotely.

    data
    T[]

    An array that contains the fetched data. For example, for the memberships attribute, data will be an array of OrganizationMembership objects.

    error
    null | ClerkAPIResponseError

    Clerk's API response error object.

    fetchNext
    () => void

    A function that triggers the next page to be loaded. This is the same as fetchPage(page => Math.min(pageCount, page + 1)).

    fetchPage
    ValueOrSetter<number>

    A function that triggers a specific page to be loaded.

    fetchPrevious
    () => void

    A function that triggers the previous page to be loaded. This is the same as fetchPage(page => Math.max(0, page - 1)).

    hasNextPage
    boolean

    A boolean that indicates if there are available pages to be fetched.

    hasPreviousPage
    boolean

    A boolean that indicates if there are available pages to be fetched.

    isError
    boolean

    A boolean that indicates the request failed.

    isFetching
    boolean

    A boolean that is true if there is an ongoing request or a revalidation.

    isLoading
    boolean

    A boolean that is true if there is an ongoing request and there is no fetched data.

    page
    number

    The current page.

    pageCount
    number

    The total amount of pages. It is calculated based on count, initialPage, and pageSize.

    revalidate
    () => Promise<void>

    A function that triggers a revalidation of the current page.

    setData
    Infinite extends true ? CacheSetter<(undefined | ClerkPaginatedResponse<T>)[]> : CacheSetter<undefined | ClerkPaginatedResponse<T>>

        A function that allows you to set the data manually.

Examples
Expand and paginate attributes

To keep network usage to a minimum, developers are required to opt-in by specifying which resource they need to fetch and paginate through. By default, the memberships, invitations, membershipRequests, and domains attributes are not populated. You must pass true or an object with the desired properties to fetch and paginate the data.

// invitations.data will never be populated.
const { invitations } = useOrganization()

// Use default values to fetch invitations, such as initialPage = 1 and pageSize = 10
const { invitations } = useOrganization({
  invitations: true,
})

// Pass your own values to fetch invitations
const { invitations } = useOrganization({
  invitations: {
    pageSize: 20,
    initialPage: 2, // skips the first page
  },
})

// Aggregate pages in order to render an infinite list
const { invitations } = useOrganization({
  invitations: {
    infinite: true,
  },
})

Infinite pagination

The following example demonstrates how to use the infinite property to fetch and append new data to the existing list. The memberships attribute will be populated with the first page of the organization's memberships. When the "Load more" button is clicked, the fetchNext helper function will be called to append the next page of memberships to the list.
React
Next.js
app/users/page.tsx

'use client'

import { useOrganization } from '@clerk/nextjs'

export default function MemberListPage() {
  const { memberships } = useOrganization({
    memberships: {
      infinite: true, // Append new data to the existing list
      keepPreviousData: true, // Persist the cached data until the new data has been fetched
    },
  })

  if (!memberships) {
    // Handle loading state
    return null
  }

  return (
    <div>
      <h2>Organization members</h2>
      <ul>
        {memberships.data?.map((membership) => (
          <li key={membership.id}>
            {membership.publicUserData.firstName} {membership.publicUserData.lastName} &lt;
            {membership.publicUserData.identifier}&gt; :: {membership.role}
          </li>
        ))}
      </ul>

      <button
        disabled={!memberships.hasNextPage} // Disable the button if there are no more available pages to be fetched
        onClick={memberships.fetchNext}
      >
        Load more
      </button>
    </div>
  )
}

Simple pagination

The following example demonstrates how to use the fetchPrevious and fetchNext helper functions to paginate through the data. The memberships attribute will be populated with the first page of the organization's memberships. When the "Previous page" or "Next page" button is clicked, the fetchPrevious or fetchNext helper function will be called to fetch the previous or next page of memberships.

Notice the difference between this example's pagination and the infinite pagination example above.
React
Next.js
app/users/page.tsx

'use client'

import { useOrganization } from '@clerk/nextjs'

export default function MemberListPage() {
  const { memberships } = useOrganization({
    memberships: {
      keepPreviousData: true, // Persist the cached data until the new data has been fetched
    },
  })

  if (!memberships) {
    // Handle loading state
    return null
  }

  return (
    <div>
      <h2>Organization members</h2>
      <ul>
        {memberships.data?.map((membership) => (
          <li key={membership.id}>
            {membership.publicUserData.firstName} {membership.publicUserData.lastName} &lt;
            {membership.publicUserData.identifier}&gt; :: {membership.role}
          </li>
        ))}
      </ul>

      <button disabled={!memberships.hasPreviousPage} onClick={memberships.fetchPrevious}>
        Previous page
      </button>

      <button disabled={!memberships.hasNextPage} onClick={memberships.fetchNext}>
        Next page
      </button>
    </div>
  )
}

To see the different organization features integrated into one application, take a look at our organizations demo repository
.
useAuth()

The useAuth() hook provides access to the current user's authentication state and methods to manage the active session.

Note

To access auth data server-side, see the Auth object reference doc.

By default, Next.js opts all routes into static rendering. If you need to opt a route or routes into dynamic rendering because you need to access the authentication data at request time, you can create a boundary by passing the dynamic prop to <ClerkProvider>. See the guide on rendering modes for more information, including code examples.
Parameters

    initialAuthStateOrOptions?
    null | { treatPendingAsSignedOut?: boolean; } | Record<string, any>

        An object containing the initial authentication state or options for the useAuth() hook. If not provided, the hook will attempt to derive the state from the context. treatPendingAsSignedOut is a boolean that indicates whether pending sessions are considered as signed out or not. Defaults to true.

Returns

This function returns a discriminated union type. There are multiple variants of this type available which you can select by clicking on one of the tabs.
Initialization
Signed out
Signed in (no active organization)
Signed in (with active organization)

    actor
    undefined

    The JWT actor for the session. Holds identifier for the user that is impersonating the current user. Read more about impersonation.

    getToken()
    (options?) => Promise<null | string>

    A function that retrieves the current user's session token or a custom JWT template. Returns a promise that resolves to the token. See the reference doc.

    has
    undefined

    A function that checks if the user has specific permissions or roles. See the reference doc.

    isLoaded
    false

    A boolean that indicates whether Clerk has completed initialization. Initially false, becomes true once Clerk loads.

    isSignedIn
    undefined

    A boolean that indicates whether a user is currently signed in.

    orgId
    undefined

    The ID of the user's active organization.

    orgRole
    undefined

    The current user's role in their active organization.

    orgSlug
    undefined

    The URL-friendly identifier of the user's active organization.

    sessionClaims
    undefined

    The current user's session claims.

    sessionId
    undefined

    The ID for the current session.

    signOut()
    { (options?): Promise<void>; (signOutCallback?, options?): Promise<void>; }

    A function that signs out the current user. Returns a promise that resolves when complete. See the reference doc.

    userId
    undefined

        The ID of the current user.

Example

The following example demonstrates how to use the useAuth() hook to access the current auth state, like whether the user is signed in or not. It also includes a basic example for using the getToken() method to retrieve a session token for fetching data from an external resource.
React
Next.js
app/external-data/page.tsx

"use client";

import { useAuth } from "@clerk/nextjs";

export default function ExternalDataPage() {
  const { userId, sessionId, getToken, isLoaded, isSignedIn } = useAuth();

  const fetchExternalData = async () => {
    const token = await getToken();

    // Fetch data from an external API
    const response = await fetch("https://api.example.com/data", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.json();
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <div>Sign in to view this page</div>;
  }

  return (
    <div>
      <p>
        Hello, {userId}! Your current active session is {sessionId}.
      </p>
      <button onClick={fetchExternalData}>Fetch Data</button>
    </div>
  );
}

Feedback

useClerk()

Warning

This hook should only be used for advanced use cases, such as building a completely custom OAuth flow or as an escape hatch to access to the Clerk object.

The useClerk() hook provides access to the Clerk object, allowing you to build alternatives to any Clerk Component.
Returns

Clerk — The useClerk() hook returns the Clerk object, which includes all the methods and properties listed in the Clerk reference.
Example

The following example uses the useClerk() hook to access the clerk object. The clerk object is used to call the openSignIn() method to open the sign-in modal.
React
Next.js
app/page.tsx

"use client";

import { useClerk } from "@clerk/nextjs";

export default function HomePage() {
  const clerk = useClerk();

  return <button onClick={() => clerk.openSignIn({})}>Sign in</button>;
}

Verified domains

Verified domains can be used to streamline enrollment into an organization. For example, if the domain @clerk.com is verified, any user with an email address ending in @clerk.com can be automatically invited or be suggested to join an organization with that domain. The role assigned to this user will be the role set as the Default role in the organization settings page. The verified domains feature is useful for organizations that want to restrict membership to users with specific email domains.

A verified domain cannot be a disposable domain or common email provider. For example, you cannot create a verified domain for @gmail.com.

Warning

A verified domain can't be added if it's already in use for the organization's SSO.

The easiest way to add and verify domains, and manage all settings related to verified domains is to use Clerk's <OrganizationSwitcher /> component.
Enable verified domains

Enabling verified domains applies to all organizations and cannot currently be managed on a per-organization basis.

In order to enable this feature:

    In the Clerk Dashboard, navigate to the Organizations Settings

    page.
    In the Verified domains section, enable Enable verified domains.
    The following setting will appear:
        Enrollment mode - Automatic invitation and Automatic suggestion.

Enrollment mode

You can enable the following enrollment modes to be available for your application:

    Automatic invitation - Users are automatically invited to join the organization when they sign-up and can join anytime.
    Automatic suggestion - Users receive a suggestion to request to join, but must be approved by an admin before they are able to join the organization.

Then, in your application, when a user with the org:sys_domains:manage permission has added and verified a domain, they can enable an enrollment mode. Only one enrollment mode can be enabled for a verified domain at a time.
Automatic invitations

After sign-up, a user will receive an invitation for the organization if their email's domain matches the verified domain. If your app uses the <OrganizationSwitcher /> component, the user will see a notification on the component. When they open the component, they will see a Join button next to the organization they were invited to. Selecting the button will accept the invitation and the user will instantly be added as a member of the organization.
Automatic suggestions

After sign-up, a user will receive a suggestion for the organization if their email's domain matches the verified domain. If your app uses the <OrganizationSwitcher /> component, the user will see a Request to join button next to the organization. Selecting the button will send a membership request to the organization.
Membership requests

Membership requests are requests from users who saw an organization suggestion and requested to join an organization. Membership requests are only available for organizations that have the Verified domains feature enabled and the Automatic suggestions feature enabled in both the Dashboard and for the specific domain.

When a user sends an organization membership request, users with the org:sys_memberships:manage permission (by default, admins) will see a notification on their <OrganizationSwitcher /> component. They will need to accept the request before the user can join the organization.
Add and verify domains

Domains can be added and verified under an organization by any user with the org:sys_domains:manage permission. By default, admins have this permission. To add and verify domains in the <OrganizationSwitcher /> component, select the General tab. There will be a Verified domains section.

Domains can be verified through an email verification code sent to an email that matches the domain. If the user adding the domain already has a verified email using that domain in their account, the domain will be automatically verified.

An application instance may only have one verified domain of the same name, and an organization may only have one domain of the same name (verified or unverified).

You can create up to 10 domains per organization to meet your needs. If you need more than 10 domains, contact support

.
Custom flow

If Clerk's <OrganizationSwitcher /> does not meet your specific needs or if you require more control over the logic, you can use the Clerk API to add and verify a domain and update the domain's enrollment mode. Here's an example of how you can do this:

const { organization, domains } = useOrganization()

// create domain
const domain = await organization.createDomain('example.com')

// prepare email verification
domain.prepareAffiliationVerification({ affiliationEmailAddress: 'foo@example.com' })

// attempt email verification
domain.attemptAffiliationVerification({ code: '123456' })

// update domain enrollment mode
domain.updateEnrollmentMode({ enrollmentMode: 'automatic_invitation' })

Organization-level enterprise SSO

Clerk supports enabling enterprise SSO connections for specific organizations. When users sign up or sign in using an organization's enterprise connection, they're automatically added as members of that organization and assigned the default role, which can be either member or admin.
Add an enterprise SSO connection for an organization

Clerk supports enterprise SSO via SAML or via the OpenID Connect (OIDC) protocol, either through EASIE or by integrating with any OIDC-compatible provider.

To add an enterprise SSO connection for an organization, follow the appropriate guide based on the platform you want to use, such as the Google SAML guide. When configuring the connection in the Clerk Dashboard, there will be an option to select the Organization for which you want to enable this connection. If you don't select an organization, the connection will be added for your entire application.

Warning

A domain used for enterprise SSO can't be used as a verified domain for the same organization.
Onboarding flows

The two common onboarding flows for organizations with enterprise SSO are to either create an organization first or to have users initiate the setup themselves.
Organization created first (top-down approach)

This flow is common for enterprise sales where the relationship is established before users access the application.

    Create an organization for your customer through the Clerk Dashboard.
    Collaborate with the customer's IT administrator to obtain the necessary configuration details.
    Configure the enterprise SSO connection for the organization.
    Invite users to the organization, who can then sign in using enterprise SSO.

User-initiated setup (bottom-up approach)

This flow is common when individual users try the product before company-wide adoption.

    An end user signs up to evaluate your application, starting with an individual account.
    After adopting the application, the user creates an organization for their company.
    Configure enterprise SSO for the organization through the Clerk Dashboard.
    All subsequent users from that organization can now sign in using enterprise SSO.

Enforce enterprise SSO by domain

Enterprise SSO connections are enforced on a per-domain basis in organizations, enabling flexible access management:

    Configure enterprise SSO for your primary domain (e.g., company.com) to enforce enterprise SSO authentication for employees.
    Add additional domains without enterprise SSO for external collaborators (e.g., contractors, consultants).
    Each domain in an organization can have different authentication requirements.

Manage memberships
Remove a member from your organization

When a user is tied to an organization through their enterprise connection, they cannot leave the organization themselves, but they can be removed either in the Clerk Dashboard, using Clerk's Backend API endpoint, or by another organization member with the manage members permission (org:sys_memberships:manage). However, the user will be added back to the organization on next sign-in, unless they are removed from the IdP or the enterprise connection is no longer associated with the organization.
Update an organization from an existing enterprise connection

When transitioning an enterprise connection to a new organization, existing members will remain part of the original organization. However, they will automatically join the new organization upon their next sign-in.

To remove members from the original organization, you have two options: utilize Clerk's Backend API or manage memberships directly through the Clerk Dashboard.
Feedback


Organization workspaces in the Clerk Dashboard

In the Clerk Dashboard, there are two types of workspaces:

    Personal account: A personal account/workspace is a user's unique, individual space, independent of any organization.
    Organization workspace: An organization workspace is owned and managed by an organization, which can have multiple members, also known as collaborators. The organization workspace that a user is currently viewing is called the active organization.

This guide will walk you through how to use the Clerk Dashboard to create an organization workspace, invite collaborators, and transfer your apps between workspaces.
Create an organization workspace

    In the top-left of the Clerk Dashboard

    , select the workspace dropdown.
    Select Create organization. A modal will open.
    Complete the form. Organization slugs are unique across all instances, so common naming conventions might already be in use by another instance.
    Select Create organization. The newly created organization will be set the active organization.

Invite collaborators to your organization workspace

    In the top-left of the Clerk Dashboard

    , select the workspace dropdown.
    Select Manage. A modal will open showing the organization's information.
    In the left nav, select Members.
    Select Invite.
    In the Invite new members form, enter the email of the user you want to invite and select the role to assign.
    Select Send invitations.

Transfer ownership of an application

    In the top-left of the Clerk Dashboard

, select the workspace dropdown.
Select the workspace that has the application you want to transfer.
In the navigation sidenav, select Settings

    .
    Select Transfer ownership. A modal will open.
    Complete the form and select Transfer ownership. The page will redirect to the Applications page and show the transferred application.

Transfer to an org without billing information

An application with an existing paid subscription can only be transferred to an organization with active billing information. You can set up billing information on the receiving organization without being charged.

To set up a payment method without being charged:

    In the top-left of the Clerk Dashboard

    , select the workspace dropdown.
    Select the workspace that you want to transfer the application to.
    Select the workspace dropdown again, and select Manage.
    In the sidenav, select Billing, then select Upgrade to unlimited members.
    Add your billing information. You will not be charged immediately. Doing this just ensures billing information is added to the organization.
    Once that billing information is added, you will be able to transfer your Clerk app to the receiving organization.

Note

This is a temporary solution for this issue. Clerk is actively working to improve this process.
Feedback

Build a custom flow for managing a user's organization invitations

Warning

This guide is for users who want to build a custom user interface using the Clerk API. To use a prebuilt UI, use the Account Portal pages or prebuilt components.

This guide will demonstrate how to use the Clerk API to build a custom flow for managing a user's organization invitations.
Next.js
JavaScript

The following example:

    Uses the useOrganizationList() hook to get userInvitations, which is a list of the user's organization invitations.
        userInvitations is an object with data that contains an array of UserOrganizationInvitation objects.
        Each UserOrganizationInvitation object has an accept() method that accepts the invitation to the organization.
    Maps over the data array to display the invitations in a table, providing an "Accept" button for each invitation that calls the accept() method.

This example is written for Next.js App Router but can be adapted for any React-based framework.
app/components/UserInvitationsList.tsx

'use client'

import { useOrganizationList } from '@clerk/clerk-react'
import React from 'react'

export default function UserInvitationsList() {
  const { isLoaded, userInvitations } = useOrganizationList({
    userInvitations: {
      infinite: true,
      keepPreviousData: true,
    },
  })

  if (!isLoaded || userInvitations.isLoading) {
    return <>Loading</>
  }

  return (
    <>
      <h1>Organization invitations</h1>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Organization name</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {userInvitations.data?.map((invitation) => (
            <tr key={invitation.id}>
              <td>{invitation.emailAddress}</td>
              <td>{invitation.publicOrganizationData.name}</td>
              <td>{invitation.role}</td>
              <td>
                <button onClick={() => invitation.accept()}>Accept</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button disabled={!userInvitations.hasNextPage} onClick={userInvitations.fetchNext}>
        Load more
      </button>
    </>
  )
}
Build a custom flow for managing organization membership requests

Warning

This guide is for users who want to build a custom user interface using the Clerk API. To use a prebuilt UI, use the Account Portal pages or prebuilt components.

This guide will demonstrate how to use the Clerk API to build a custom flow for managing organization membership requests.
Next.js
JavaScript

The following example:

    Uses the useOrganization() hook to get membershipRequests, which is a list of the active organization's membership requests.
        membershipRequests is an object with data that contains an array of OrganizationMembershipRequest objects.
        Each OrganizationMembershipRequest object has an accept() and reject() method to accept or reject the membership request, respectively.
    Maps over the data array to display the membership requests in a table, providing an "Accept" and "Reject" button for each request that calls the accept() and reject() methods, respectively.

This example is written for Next.js App Router but can be adapted for any React-based framework.
app/components/MembershipRequests.tsx

'use client'

import { useOrganization } from '@clerk/nextjs'

export const MembershipRequestsParams = {
  membershipRequests: {
    pageSize: 5,
    keepPreviousData: true,
  },
}

// List of organization membership requests.
export const MembershipRequests = () => {
  const { isLoaded, membershipRequests } = useOrganization(MembershipRequestsParams)

  if (!isLoaded) {
    return <>Loading</>
  }

  return (
    <>
      <h1>Membership requests</h1>
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Date requested</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {membershipRequests?.data?.map((mem) => (
            <tr key={mem.id}>
              <td>{mem.publicUserData.identifier}</td>
              <td>{mem.createdAt.toLocaleDateString()}</td>
              <td>
                <button
                  onClick={async () => {
                    await mem.accept()
                  }}
                >
                  Accept
                </button>
                <button
                  onClick={async () => {
                    await mem.reject()
                  }}
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <button
          disabled={!membershipRequests?.hasPreviousPage || membershipRequests?.isFetching}
          onClick={() => membershipRequests?.fetchPrevious?.()}
        >
          Previous
        </button>

        <button
          disabled={!membershipRequests?.hasNextPage || membershipRequests?.isFetching}
          onClick={() => membershipRequests?.fetchNext?.()}
        >
          Next
        </button>
      </div>
    </>
  )
}

Build a custom flow for handling user impersonation

Warning

This guide is for users who want to build a custom user interface using the Clerk API. To use a prebuilt UI, use the Account Portal pages or prebuilt components.

Clerk's user impersonation feature allows you to sign in to your application as one of your users, enabling you to directly reproduce and remedy any issues they're experiencing. It's a helpful feature for customer support and debugging.

This guide will walk you through how to build a custom flow that handles user impersonation.
Next.js
Expo

The following example builds a dashboard that is only accessible to users with the org:admin:impersonate permission. To use this example, you must first create the custom org:admin:impersonate permission. Or you can modify the authorization checks to fit your use case.

In the dashboard, the user will see a list of the application's users. When the user chooses to impersonate a user, they will be signed in as that user and redirected to the homepage.

Use the following tabs to view the code for:

    The main page that gets the list of the application's users using the JavaScript Backend SDK
    The Client Component that has the UI for displaying the users and the ability to impersonate them
    The Server Action that generates the actor token using the Backend API

Main page
Client Component
Server Action
app/dashboard/page.tsx

import { auth, clerkClient } from '@clerk/nextjs/server'
import ImpersonateUsers from './_components'

export default async function AccountPage() {
  const { has } = await auth()

  // Protect the page
  if (!has({ permission: 'org:admin:impersonate' })) {
    return <p>You do not have permission to access this page.</p>
  }

  const client = await clerkClient()

  // Fetch list of application's users using Clerk's Backend SDK
  const users = await client.users.getUserList()

  // This page needs to be a server component to use clerkClient.users.getUserList()
  // You must pass the list of users to the client for the rest of the logic
  // But you cannot pass the entire User object to the client,
  // because its too complex. So grab the data you need, like so:
  const parsedUsers = []
  for (const user of users.data) {
    parsedUsers.push({
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress,
    })
  }

  // Pass the parsed users to the Client Component
  return <ImpersonateUsers users={parsedUsers} />
}

SignIn

The SignIn object holds the state of the current sign-in and provides helper methods to navigate and complete the sign-in process. It is used to manage the sign-in lifecycle, including the first and second factor verification, and the creation of a new session.

The following steps outline the sign-in process:

    Initiate the sign-in process by collecting the user's authentication information and passing the appropriate parameters to the create() method.
    Prepare the first factor verification by calling SignIn.prepareFirstFactor(). Users must complete a first factor verification. This can be something like providing a password, an email link, a one-time code (OTP), a Web3 wallet address, or providing proof of their identity through an external social account (SSO/OAuth).
    Attempt to complete the first factor verification by calling SignIn.attemptFirstFactor().
    Optionally, if you have enabled multi-factor for your application, you will need to prepare the second factor verification by calling SignIn.prepareSecondFactor().
    Attempt to complete the second factor verification by calling SignIn.attemptSecondFactor().
    If verification is successful, set the newly created session as the active session by passing the SignIn.createdSessionId to the setActive() method on the Clerk object.

Properties

    status
    SignInStatus

    The current status of the sign-in. SignInStatus supports the following values:

        'complete': The user is signed in and the custom flow can proceed to setActive() to create a session.
        'needs_identifier': The user's identifier (e.g., email address, phone number, username) hasn't been provided.
        'needs_first_factor': One of the following first factor verification strategies is missing: 'email_link', 'email_code', 'phone_code', 'web3_metamask_signature', 'web3_coinbase_wallet_signature' or 'oauth_provider'.
        'needs_second_factor': One of the following second factor verification strategies is missing: 'phone_code' or 'totp'.
        'needs_new_password': The user needs to set a new password.

    supportedIdentifiers
    SignInIdentifier[]

    Array of all the authentication identifiers that are supported for this sign in. SignInIdentifier supports the following values:

        'email_address'
        'phone_number'
        'web3_wallet'
        'username'

    identifier
    string | null

    Optional if the strategy is set to 'oauth_<provider>' or 'enterprise_sso'. Required otherwise. The authentication identifier value for the current sign-in.

    supportedFirstFactors
    SignInFirstFactor[]

    Array of the first factors that are supported in the current sign-in. Each factor contains information about the verification strategy that can be used. See the SignInFirstFactor type reference for more information.

    supportedSecondFactors
    SignInSecondFactor[]

    Array of the second factors that are supported in the current sign-in. Each factor contains information about the verification strategy that can be used. This property is populated only when the first factor is verified. See the SignInSecondFactor type reference for more information.

    firstFactorVerification
    Verification

    The state of the verification process for the selected first factor. Initially, this property contains an empty verification object, since there is no first factor selected. You need to call the prepareFirstFactor method in order to start the verification process.

    secondFactorVerification
    Verification

    The state of the verification process for the selected second factor. Initially, this property contains an empty verification object, since there is no second factor selected. For the phone_code strategy, you need to call the prepareSecondFactor method in order to start the verification process. For the totp strategy, you can directly attempt.

    userData
    UserData

    An object containing information about the user of the current sign-in. This property is populated only once an identifier is given to the SignIn object.

    createdSessionId
    string | null

        The identifier of the session that was created upon completion of the current sign-in. The value of this property is null if the sign-in status is not 'complete'.

Methods
attemptFirstFactor()

Attempts to complete the first factor verification process. This is a required step in order to complete a sign in, as users should be verified at least by one factor of authentication.

Make sure that a SignIn object already exists before you call this method, either by first calling SignIn.create() or SignIn.prepareFirstFactor(). The only strategy that does not require a verification to have already been prepared before attempting to complete it is the password strategy.

Depending on the strategy that was selected when the verification was prepared, the method parameters will be different.

Returns a SignIn object. Check the firstFactorVerification attribute for the status of the first factor verification process.

function attemptFirstFactor(params: AttemptFirstFactorParams): Promise<SignIn>

AttemptFirstFactorParams

    strategy
    'email_code' | 'phone_code' | 'password' | 'web3_metamask_signature' | 'web3_coinbase_wallet_signature' | 'web3_okx_wallet_signature' | 'passkey' | 'reset_password_phone_code' | 'reset_password_email_code'

The strategy value depends on the SignIn.identifier value. Each authentication identifier supports different verification strategies. The following strategies are supported:

    'email_code': User will receive a one-time authentication code via email. At least one email address should be on file for the user.
    'phone_code': User will receive a one-time code via SMS. At least one phone number should be on file for the user.
    'password': The verification will attempt to be completed with the user's password.
    'web3_metamask_signature': The verification will attempt to be completed using the user's Web3 wallet address via Metamask

.
'web3_coinbase_wallet_signature': The verification will attempt to be completed using the user's Web3 wallet address via Coinbase Wallet
.
'web3_okx_wallet_signature': The verification will attempt to be completed using the user's Web3 wallet address via OKX Wallet

        .
        'passkey': The verification will attempt to be completed using the user's passkey.
        'reset_password_phone_code': Used when the user is trying to reset their password. The user will receive a one-time code via SMS.
        'reset_password_email_code': Used when the user is trying to reset their password. The user will receive a one-time code via email.

    code?
    string

    Required if strategy is set to 'email_code', 'phone_code', 'reset_password_phone_code', or 'reset_password_email_code'. The one-time code that was sent to the user.

    password?
    string

    Required if strategy is set to 'password'. The user's password string to be verified.

    signature?
    string

        Required if strategy is set to web3_metamask_signature, web3_coinbase_wallet_signature, or web3_okx_wallet_signature. The Web3 wallet generated signature to be verified.

Example

const signIn = await clerk.signIn.attemptFirstFactor({
  strategy: 'email_code',
  code: '123456',
})

For comprehensive examples, see the custom flow guides.
attemptSecondFactor()

Attempts to complete the second factor (2FA) verification process, also known as 2FA, or multi-factor authentication.

Note

For the phone_code strategy, make sure that a verification has already been prepared before you call this method, by first calling SignIn.prepareSecondFactor.

Returns a SignIn object. Check the secondFactorVerification attribute for the status of the second factor verification process.

function attemptSecondFactor(params: AttemptSecondFactorParams): Promise<SignIn>

AttemptSecondFactorParams

    strategy
    'phone_code' | 'totp'

    The strategy to be used for second factor verification. Possible strategy values are

        'phone_code': User will receive a one-time authentication code via SMS. At least one phone number should be on file for the user.
        'totp': User must provide a 6-digit TOTP code generated by their authenticator app. The user must have previously created a TOTP secret and registered it in their authenticator app using a QR code, URI, or by manually entering the secret.

    code
    string

            For the 'phone_code' strategy: The one-time code that was sent to the user as part of the prepareSecondFactor() step.
            For the 'totp' strategy: The TOTP generated by the user's authenticator app.

Example

const signIn = await clerk.signIn.attemptSecondFactor({
  strategy: 'phone_code',
  code: '123456',
})

For a comprehensive example, see the custom flow for multi-factor authentication.
authenticateWithCoinbaseWallet()

Initiates an authentication flow using the Coinbase Wallet browser extension, allowing users to authenticate via their Web3 wallet address. This method prompts the user to connect their Coinbase Wallet and sign a message to verify ownership of the wallet address.

function authenticateWithCoinbaseWallet(): Promise<SignInResource>

Example

const signIn = await clerk.signIn.authenticateWithCoinbaseWallet()

authenticateWithMetamask()

Initiates an authentication flow using the MetaMask browser extension, allowing users to authenticate via their Ethereum wallet address. This method prompts the user to connect their MetaMask wallet and sign a message to verify ownership of the wallet address.

function authenticateWithMetamask(): Promise<SignInResource>

Example

const signIn = await clerk.signIn.authenticateWithMetamask()

authenticateWithOKXWallet()

Initiates an authentication flow using the OKX Wallet browser extension, allowing users to authenticate via their Web3 wallet address. This method prompts the user to connect their OKX Wallet and sign a message to verify ownership of the wallet address.

function authenticateWithOKXWallet(): Promise<SignInResource>

Example

const signIn = await clerk.signIn.authenticateWithOKXWallet()

authenticateWithPasskey()

Initiates a passkey-based authentication flow, enabling users to authenticate using a previously registered passkey. When called without parameters, this method requires a prior call to SignIn.create({ strategy: 'passkey' }) to initialize the sign-in context. This pattern is particularly useful in scenarios where the authentication strategy needs to be determined dynamically at runtime.

function authenticateWithPasskey(params?: AuthenticateWithPasskeyParams): Promise<SignInResource>

AuthenticateWithPasskeyParams

    flow
    'autofill' | 'discoverable'

        The flow to use for the passkey sign-in.
            'autofill': The client prompts your users to select a passkey before they interact with your app.
            'discoverable': The client requires the user to interact with the client.

Example

const signIn = await clerk.signIn.authenticateWithPasskey({ flow: 'discoverable' })

authenticateWithRedirect()

Signs in a user via a Single Sign On (SSO) connection, such as OAuth or SAML, where an external account is used for verifying the user's identity.

function authenticateWithRedirect(params: AuthenticateWithRedirectParams): Promise<void>

AuthenticateWithRedirectParams

    strategy
    OAuthStrategy | 'saml' | 'enterprise_sso'

    The strategy to use for authentication. The following strategies are supported:

        'oauth_<provider>': The user will be authenticated with their social connection account. See a list of supported values for <provider>.
        'saml' (deprecated): Deprecated in favor of 'enterprise_sso'. The user will be authenticated with their SAML account.
        'enterprise_sso': The user will be authenticated either through SAML or OIDC depending on the configuration of their enterprise SSO account.

    redirectUrl
    string

    The full URL or path that the OAuth provider should redirect to, on successful authorization on their part. Typically, this will be a simple /sso-callback route that calls Clerk.handleRedirectCallback or mounts the <AuthenticateWithRedirectCallback /> component. See the custom flow for implementation details.

    redirectUrlComplete
    string

    The full URL or path that the user will be redirected to once the sign-in is complete.

    identifier
    string | undefined

    emailAddress
    string | undefined

    The email address used to target an enterprise connection during sign-in.

    legalAccepted
    boolean | undefined

        A boolean indicating whether the user has agreed to the legal compliance documents.

Example

For OAuth connections, see the custom flow for OAuth connections. For enterprise connections, see the custom flow for enterprise connections.
authenticateWithPopup()

Opens a popup window to allow a user to sign in via a Single Sign On (SSO) connection, such as OAuth or SAML, where an external account is used for verifying the user's identity.

function authenticateWithPopup(params: AuthenticateWithPopupParams): Promise<void>

AuthenticateWithPopupParams

    continueSignUp?
    boolean | undefined

    Whether to continue (i.e. PATCH) an existing SignUp (if present) or create a new SignUp.

    emailAddress?
    string | undefined

    The email address used to target an enterprise connection during sign-in.

    identifier?
    string | undefined

    legalAccepted?
    boolean | undefined

    A boolean indicating whether the user has agreed to the legal compliance documents.

    popup?
    Window | null

    A reference to a popup window opened via window.open().

    redirectUrl
    string

    The full URL or path that the OAuth provider should redirect to after successful authorization on their part. Typically, this will be a simple /sso-callback route that calls Clerk.handleRedirectCallback or mounts the <AuthenticateWithRedirectCallback /> component. See the custom flow for implementation details.

    redirectUrlComplete
    string

    The full URL or path that the user will be redirected to once the sign-in is complete.

    strategy
    OAuthStrategy | 'saml' | 'enterprise_sso'

        The strategy to use for authentication. The following strategies are supported:
            'oauth_<provider>': The user will be authenticated with their social connection account. See a list of supported values for <provider>.
            'saml' (deprecated): Deprecated in favor of 'enterprise_sso'. The user will be authenticated with their SAML account.
            'enterprise_sso': The user will be authenticated either through SAML or OIDC depending on the configuration of their enterprise SSO account.

authenticateWithWeb3()

Initiates a Web3 authentication flow by verifying the user's ownership of a blockchain wallet address through cryptographic signature verification. This method enables decentralized authentication without requiring traditional credentials.

function authenticateWithWeb3(params: AuthenticateWithWeb3Params): Promise<SignInResource>

AuthenticateWithWeb3Params

    identifier
    string

    The user's Web3 ID.

    generateSignature
    (opts: GenerateSignatureParams) => Promise<string>

    The method of how to generate the signature for the Web3 sign-in. See GenerateSignatureParams for more information.

    strategy?
    Web3Strategy

        The Web3 verification strategy.

GenerateSignatureParams

    identifier
    string

    The user's Web3 wallet address.

    nonce
    string

The cryptographic nonce

    used in the sign-in.

    provider?
    Web3Provider

Example

const signIn = await clerk.signIn.authenticateWithWeb3({
  identifier: '0x1234567890123456789012345678901234567890',
})

create()

Creates and returns a new SignIn instance initialized with the provided parameters. The instance maintains the sign-in lifecycle state through its status property, which updates as the authentication flow progresses. This method serves as the entry point for initiating a sign-in flow.

What you must pass to params depends on which sign-in options you have enabled in your app's settings in the Clerk Dashboard.

You can complete the sign-in process in one step if you supply the required fields to create(). Otherwise, Clerk's sign-in process provides great flexibility and allows users to easily create multi-step sign-in flows.

Warning

Once the sign-in process is complete, pass the createdSessionId to the setActive() method on the Clerk object. This will set the newly created session as the active session.

function create(params: SignInCreateParams): Promise<SignIn>

SignInCreateParams

    strategy?
    'password' | 'email_link' | 'email_code' | 'phone_code' | 'oauth_<provider>' | 'saml' | 'enterprise_sso' | 'passkey' | 'web3_metamask_signature' | 'web3_coinbase_wallet_signature' | 'web3_okx_wallet_signature' | 'ticket' | 'google_one_tap'

    The first factor verification strategy to use in the sign-in flow. Depends on the SignIn.identifier value. Each authentication identifier supports different verification strategies. The following strategies are supported:

        'password': The verification will attempt to be completed using the user's password.
        'email_link': User will receive an email magic link via email. The identifier parameter can also be specified to select one of the user's known email addresses. The redirectUrl parameter can also be specified.
        'email_code': User will receive a one-time authentication code via email. The identifier parameter can also be specified to select one of the user's known email addresses.
        'phone_code': User will receive a one-time authentication code via SMS. The identifier parameter can also be specified to select one of the user's known phone numbers.
        'oauth_<provider>': The user will be authenticated with their social connection account. See a list of supported values for <provider>.
        'saml' (deprecated): Deprecated in favor of 'enterprise_sso'. The user will be authenticated with their SAML account.
        'enterprise_sso': The user will be authenticated either through SAML or OIDC depending on the configuration of their enterprise SSO account.
        'passkey': The user will be authenticated with their passkey.
        'web3_metamask_signature': The verification will attempt to be completed using the user's Web3 wallet address via Metamask. The identifier parameter can also be specified to select which of the user's known Web3 wallets will be used.
        'web3_coinbase_wallet_signature': The verification will attempt to be completed using the user's Web3 wallet address via Coinbase Wallet. The identifier parameter can also be specified to select which of the user's known Web3 wallets will be used.
        'web3_okx_wallet_signature': The verification will attempt to be completed using the user's Web3 wallet address via OKX Wallet. The identifier parameter can also be specified to select which of the user's known Web3 wallets will be used.
        'ticket': The user will be authenticated via the ticket or token generated from the Backend API.
        'google_one_tap': The user will be authenticated with the Google One Tap UI. It's recommended to use authenticateWithGoogleOneTap() instead, as it will also set the user's current session as active for you.

    identifier
    string

    The authentication identifier for the sign-in. This can be the value of the user's email address, phone number, username, or Web3 wallet address.

    password?
    string

    The user's password. Only supported if strategy is set to 'password' and password is enabled.

    ticket?
    string

    Required if strategy is set to 'ticket'. The ticket or token generated from the Backend API.

    redirectUrl?
    string

    If strategy is set to 'oauth_<provider>' or 'enterprise_sso', this specifies the full URL or path that the OAuth provider should redirect to after successful authorization on their part. Typically, this will be a simple /sso-callback route that either calls Clerk.handleRedirectCallback or mounts the <AuthenticateWithRedirectCallback /> component. See the custom flow for implementation details.

    If strategy is set to 'email_link', this specifies the URL that the user will be redirected to when they visit the email link. See the custom flow for implementation details.

    actionCompleteRedirectUrl?
    string

    Optional if strategy is set to 'oauth_<provider>' or 'enterprise_sso'. The URL that the user will be redirected to, after successful authorization from the OAuth provider and Clerk sign-in.

    transfer?
    boolean

    When set to true, the SignIn will attempt to retrieve information from the active SignUp instance and use it to complete the sign-in process. This is useful when you want to seamlessly transition a user from a sign-up attempt to a sign-in attempt.

    oidcPrompt?
    string

Optional if strategy is set to 'oauth_<provider>' or 'enterprise_sso'. The value to pass to the OIDC prompt parameter

    in the generated OAuth redirect URL.

    oidcLoginHint?
    string

Optional if strategy is set to 'oauth_<provider>' or 'enterprise_sso'. The value to pass to the OIDC login_hint parameter

        in the generated OAuth redirect URL.

Example

await clerk.signIn.create({
  strategy: 'email_link',
  identifier: 'test@example.com',
})

For comprehensive examples, see the custom flow guides.
createEmailLinkFlow()

Creates a flow for authenticating users via email links. This method returns functions for initiating and canceling the email link verification process; see the returns section for more information.

function createEmailLinkFlow(): {
  startEmailLinkFlow: (params: SignInStartEmailLinkFlowParams) => Promise<SignIn>
  cancelEmailLinkFlow: () => void
}

Returns

createEmailLinkFlow returns an object with two functions:

    startEmailLinkFlow
    (params: SignInStartEmailLinkFlowParams) => Promise<SignIn>

    Function to start the email link flow. It prepares an email link verification and polls for the verification result.

    cancelEmailLinkFlow
    () => void

        Function to cleanup the email link flow. Stops waiting for verification results.

SignInStartEmailLinkFlowParams

    emailAddressId
    string

    The ID of the user's email address that's going to be used as the first factor identification for verification.

    redirectUrl
    string

        The full URL that the user will be redirected to when they visit the email link.

Example

const { startEmailLinkFlow, cancelEmailLinkFlow } = clerk.signIn.createEmailLinkFlow()

For a comprehensive example, see the custom flow for email links.
prepareFirstFactor()

Begins the first factor verification process. This is a required step in order to complete a sign in, as users should be verified at least by one factor of authentication.

Common scenarios are one-time code (OTP) or social account (SSO) verification. This is determined by the accepted strategy parameter values. Each authentication identifier supports different strategies.

Returns a SignIn object. Check the firstFactorVerification attribute for the status of the first factor verification process.

function prepareFirstFactor(params: PrepareFirstFactorParams): Promise<SignIn>

PrepareFirstFactorParams

    strategy
    'email_link' | 'email_code' | 'phone_code' | 'web3_metamask_signature' | 'web3_coinbase_wallet_signature' | 'web3_okx_wallet_signature' | 'passkey' | 'oauth_<provider>' | 'saml' | 'enterprise_sso' | 'reset_password_phone_code' | 'reset_password_email_code'

The strategy value depends on the SignIn.identifier value. Each authentication identifier supports different verification strategies. The following strategies are supported:

    'email_link': User will receive an email magic link via email.
    'email_code': User will receive a one-time authentication code via email. Requires emailAddressId parameter to be set.
    'phone_code': User will receive a one-time authentication code via SMS. Requires phoneNumberId parameter to be set.
    'web3_metamask_signature': The verification will attempt to be completed using the user's Web3 wallet address via Metamask

. Requires web3WalletId parameter to be set.
'web3_coinbase_wallet_signature': The verification will attempt to be completed using the user's Web3 wallet address via Coinbase Wallet
. Requires web3WalletId parameter to be set.
'web3_okx_wallet_signature': The verification will attempt to be completed using the user's Web3 wallet address via OKX Wallet

        . Requires web3WalletId parameter to be set.
        'passkey': The verification will attempt to be completed using the user's passkey.
        'oauth_<provider>': The user will be authenticated with their social connection account. See a list of supported values for <provider>.
        'saml' (deprecated): Deprecated in favor of 'enterprise_sso'. The user will be authenticated with their SAML account.
        'enterprise_sso': The user will be authenticated either through SAML or OIDC depending on the configuration of their enterprise SSO account.
        'reset_password_phone_code': Used when the user is trying to reset their password. The user will receive a one-time code via SMS. Requires phoneNumberId parameter to be set.
        'reset_password_email_code': Used when the user is trying to reset their password. The user will receive a one-time code via email. Requires emailAddressId parameter to be set.

    emailAddressId?
    string

    Required if strategy is set to 'email_code' or 'reset_password_email_code'. The ID for the user's email address that will receive an email with the one-time authentication code.

    phoneNumberId?
    string

    Required if strategy is set to 'phone_code' or 'reset_password_phone_code'. The ID for the user's phone number that will receive an SMS message with the one-time authentication code.

    web3WalletId?
    string

    Required if strategy is set to 'web3_metamask_signature', 'web3_coinbase_wallet_signature', or 'web3_okx_wallet_signature'. The ID for the user's Web3 wallet address.

    redirectUrl?
    string

    Required if strategy is set to 'oauth_<provider>' or 'enterprise_sso'. The full URL or path that the OAuth provider should redirect to after successful authorization on their part. Typically, this will be a simple /sso-callback route that either calls Clerk.handleRedirectCallback() or mounts the <AuthenticateWithRedirectCallback /> component. See the custom flow for implementation details.

    Required if strategy is set to 'email_link'. The full URL that the user will be redirected to when they visit the email link. See the custom flow for implementation details.

    actionCompleteRedirectUrl?
    string

        Required if strategy is set to 'oauth_<provider>' or 'enterprise_sso'. The URL that the user will be redirected to once the first factor verification is complete.

Example

const signIn = await clerk.signIn.prepareFirstFactor({
  strategy: 'email_link',
  identifier: 'test@example.com',
})

For comprehensive examples, see the custom flow guides.
prepareSecondFactor()

Begins the second factor (2FA) verification process. Clerk calls this multi-factor authentication (MFA).

Note

If the strategy was set to totp (e.g. SignIn.create({ strategy: 'totp' })), it does not require preparation. You can directly attempt the second factor verification by calling SignIn.attemptSecondFactor.

Returns a SignIn object. Check the secondFactorVerification attribute for the status of the second factor verification process.

function prepareSecondFactor(params: PrepareSecondFactorParams): Promise<SignIn>

PrepareSecondFactorParams

    strategy
    'phone_code'

    The strategy used for second factor verification. Supported strategies are:

        'phone_code': User will receive a one-time authentication code via SMS. At least one phone number should be on file for the user.

    phoneNumberId
    string

        The ID for the user's phone number that will receive an SMS message with the one-time authentication code.

Example

const signIn = await clerk.signIn.prepareSecondFactor({
  strategy: 'phone_code',
  phoneNumberId: '123',
})

For a comprehensive example, see the custom flow for multi-factor authentication.
resetPassword()

Resets a user's password. It's recommended to use the custom flow for resetting a user's password instead.

function resetPassword(params: ResetPasswordParams): Promise<SignIn>

ResetPasswordParams

    password
    string

    The user's current password.

    signOutOfOtherSessions?
    boolean | undefined

        If true, signs the user out of all other authenticated sessions.

Example

await clerk.signIn.resetPassword({
  password: 'new-password',
})

Feedback


SignUp

The SignUp object holds the state of the current sign-up and provides helper methods to navigate and complete the sign-up process. Once a sign-up is complete, a new user is created.

The following steps outline the sign-up process:

    Initiate the sign-up process by collecting the user's authentication information and passing the appropriate parameters to the create() method.
    Prepare the verification.
    Attempt to complete the verification.
    If the verification is successful, set the newly created session as the active session by passing the SignIn.createdSessionId to the setActive() method on the Clerk object.

Properties

    id
    string | undefined

    The unique identifier of the current sign-up.

    status
    'missing_requirements' | 'complete' | 'abandoned' | null

The status of the current sign-up. The following values are supported:

    complete: The user has been created and the custom flow can proceed to setActive() to create session.
    missing_requirements: A requirement is unverified or missing from the Email, Phone, Username

        settings. For example, in the Clerk Dashboard, the Password setting is required but a password wasn't provided in the custom flow.
        abandoned: The sign-up has been inactive for over 24 hours.

    requiredFields
    string[]

    An array of all the required fields that need to be supplied and verified in order for this sign-up to be marked as complete and converted into a user.

    optionalFields
    string[]

    An array of all the fields that can be supplied to the sign-up, but their absence does not prevent the sign-up from being marked as complete.

    missingFields
    string[]

    An array of all the fields whose values are not supplied yet but they are mandatory in order for a sign-up to be marked as complete.

    unverifiedFields
    string[]

    An array of all the fields whose values have been supplied, but they need additional verification in order for them to be accepted. Examples of such fields are emailAddress and phoneNumber.

    verifications
    SignUpVerifications

    An object that contains information about all the verifications that are in-flight.

    username
    string | null

    The username supplied to the current sign-up. Only supported if username is enabled in the instance settings.

    emailAddress
    string | null

    The email address supplied to the current sign-up. Only supported if email address is enabled in the instance settings.

    phoneNumber
    string | null

The user's phone number in E.164 format

    . Only supported if phone number is enabled in the instance settings.

    web3Wallet
    string | null

    The Web3 wallet address, made up of 0x + 40 hexadecimal characters. Only supported if Web3 authentication is enabled in the instance settings.

    hasPassword
    boolean

    The value of this attribute is true if a password was supplied to the current sign-up. Only supported if password is enabled in the instance settings.

    firstName
    string | null

    The first name supplied to the current sign-up. Only supported if name is enabled in the instance settings.

    lastName
    string | null

    The last name supplied to the current sign-up. Only supported if name is enabled in the instance settings.

    unsafeMetadata
    SignUpUnsafeMetadata

    Metadata that can be read and set from the frontend. Once the sign-up is complete, the value of this field will be automatically copied to the newly created user's unsafe metadata. One common use case for this attribute is to use it to implement custom fields that can be collected during sign-up and will automatically be attached to the created User object.

    createdSessionId
    string | null

    The identifier of the newly-created session. This attribute is populated only when the sign-up is complete.

    createdUserId
    string | null

    The identifier of the newly-created user. This attribute is populated only when the sign-up is complete.

    abandonAt
    number | null

        The epoch numerical time when the sign-up was abandoned by the user.

Methods
attemptEmailAddressVerification()

Attempts to verify an email address by validating the one-time verification code provided by the user against the code sent during the prepare verification step. This is a convenience method that wraps SignUp.attemptVerification() with the 'email_code' strategy.

By default, this method is equivalent to calling SignUp.attemptVerification({ strategy: 'email_code', code }). The verification attempt will fail if the code is invalid or has expired.

function attemptEmailAddressVerification(
  params: AttemptEmailAddressVerificationParams,
): Promise<SignUpResource>

AttemptEmailAddressVerificationParams

    code
    string

        The code that was sent to the user via email.

attemptPhoneNumberVerification()

Attempts to verify a phone number by validating the one-time verification code provided by the user against the code sent during the prepare verification step. This is a convenience method that wraps SignUp.attemptVerification() with the 'phone_code' strategy.

By default, this method is equivalent to calling SignUp.attemptVerification({ strategy: 'phone_code', code }). The verification attempt will fail if the code is invalid or has expired.

function attemptPhoneNumberVerification(
  params: AttemptPhoneNumberVerificationParams,
): Promise<SignUpResource>

AttemptPhoneNumberVerificationParams

    code
    string

        The code that was sent to the user via SMS.

attemptVerification()

Attempts to complete a pending verification process for the specified verification strategy. This method must be called after initiating verification via SignUp.prepareVerification(). The verification attempt will validate the provided verification parameters (code, signature, etc.) against the pending verification request.

Depending on the strategy, the method parameters could differ.

function attemptVerification(params: AttemptVerificationParams): Promise<SignUp>

AttemptVerificationParams

    strategy
    'phone_code' | 'email_code' | 'web3_metamask_signature' | 'web3_coinbase_wallet_signature' | 'web3_okx_wallet_signature'

The verification strategy to complete the user's sign-up request against. The following strategies are supported:

    'phone_code': Validates an SMS with a unique token to input.
    'email_code': Validates an email with a unique token to input.
    'web3_metamask_signature': The verification will attempt to be completed using the user's Web3 wallet address via Metamask

. The web3_wallet_id parameter can also be specified to select which of the user's known Web3 wallets will be used.
'web3_coinbase_wallet_signature': The verification will attempt to be completed using the user's Web3 wallet address via Coinbase Wallet
. The web3_wallet_id parameter can also be specified to select which of the user's known Web3 wallets will be used.
'web3_okx_wallet_signature': The verification will attempt to be completed using the user's Web3 wallet address via OKX Wallet

        . The web3_wallet_id parameter can also be specified to select which of the user's known Web3 wallets will be used.

    code
    string

    Required if strategy is set to 'phone_code' or 'email_code'. The code that was sent to the user.

    signature
    string

        Required if strategy is set to 'web3_metamask_signature', 'web3_coinbase_wallet_signature', or 'web3_okx_wallet_signature'. The signature that was sent to the user via the Web3 verification strategy.

attemptWeb3WalletVerification()

Attempts to verify a Web3 wallet address by validating the cryptographic signature generated by the wallet against the nonce provided during the prepare verification step. This is a convenience method that wraps SignUp.attemptVerification() with Web3 wallet strategies.

By default, this method is equivalent to calling SignUp.attemptVerification({ strategy: 'web3_metamask_signature', signature }). The verification attempt will fail if the signature is invalid or the nonce has expired.

function attemptWeb3WalletVerification(params: AttemptWeb3WalletVerificationParams): Promise<SignUp>

AttemptWeb3WalletVerificationParams

    signature
    string

        The signature that was generated after prepareVerification was called.

authenticateWithCoinbaseWallet()

Initiates an authentication flow using the Coinbase Wallet browser extension, allowing users to authenticate via their Web3 wallet address. This method prompts the user to connect their Coinbase Wallet and sign a message to verify ownership of the wallet address.

function authenticateWithCoinbaseWallet(
  params?: SignUpAuthenticateWithWeb3Params,
): Promise<SignUpResource>

Example

const signUp = await clerk.signUp.authenticateWithCoinbaseWallet()

authenticateWithMetamask()

Initiates an authentication flow using the MetaMask browser extension, allowing users to authenticate via their Ethereum wallet address. This method prompts the user to connect their MetaMask wallet and sign a message to verify ownership of the wallet address.

function authenticateWithMetamask(
  params?: SignUpAuthenticateWithWeb3Params,
): Promise<SignUpResource>

Example

const signUp = await clerk.signUp.authenticateWithMetamask()

authenticateWithOKXWallet()

Initiates an authentication flow using the OKX Wallet browser extension, allowing users to authenticate via their Web3 wallet address. This method prompts the user to connect their OKX Wallet and sign a message to verify ownership of the wallet address.

function authenticateWithOKXWallet(
  params?: SignUpAuthenticateWithWeb3Params,
): Promise<SignUpResource>

SignUpAuthenticateWithWeb3Params

    unsafeMetadata
    SignUpUnsafeMetadata

        Metadata that can be read and set from the frontend and the backend. Once the sign-up is complete, the value of this field will be automatically copied to the created user's unsafe metadata (User.unsafeMetadata). One common use case is to collect custom information about the user during the sign-up process and store it in this property. Read more about unsafe metadata.

Example

const signUp = await clerk.signUp.authenticateWithOKXWallet()

authenticateWithRedirect()

Signs up a user via a Single Sign On (SSO) connection, such as OAuth or SAML, where an external account is used for verifying the user's identity.

function authenticateWithRedirect(params: AuthenticateWithRedirectParams): Promise<void>

AuthenticateWithRedirectParams

    redirectUrl
    string

    The full URL or path that the OAuth provider should redirect to after successful authorization on their part. Typically, this will be a simple /sso-callback route that either calls Clerk.handleRedirectCallback or mounts the <AuthenticateWithRedirectCallback /> component. See the custom flow for implementation details.

    redirectUrlComplete
    string

    The full URL or path to navigate to after the OAuth or SAML flow completes.

    continueSignUp
    boolean | undefined

    Whether to continue (i.e. PATCH) an existing SignUp (if present) or create a new SignUp.

    strategy
    'oauth_<provider>' | 'saml' | 'enterprise_sso'

    The strategy to use for authentication. The following strategies are supported:

        'oauth_<provider>': The user will be authenticated with their social connection account. See a list of supported values for <provider>.
        'saml' (deprecated): Deprecated in favor of 'enterprise_sso'. The user will be authenticated with their SAML account.
        'enterprise_sso': The user will be authenticated either through SAML or OIDC depending on the configuration of their enterprise SSO account.

    identifier
    string | undefined

    Identifier to use for targeting an enterprise connection at sign-up.

    emailAddress
    string | undefined

    Email address to use for targeting an enterprise connection at sign-up.

    legalAccepted?
    boolean

        A boolean indicating whether the user has agreed to the legal compliance documents.

Example

For OAuth connections, see the custom flow for OAuth connections. For enterprise connections, see the custom flow for enterprise connections.
authenticateWithPopup()

Opens a popup window to allow a user to sign up via a Single Sign On (SSO) connection, such as OAuth or SAML, where an external account is used for verifying the user's identity.

function authenticateWithPopup(params: AuthenticateWithPopupParams): Promise<void>

AuthenticateWithPopupParams

    redirectUrl
    string

    The full URL or path that the OAuth provider should redirect to after successful authorization on their part. Typically, this will be a simple /sso-callback route that either calls Clerk.handleRedirectCallback or mounts the <AuthenticateWithRedirectCallback /> component. See the custom flow for implementation details.

    redirectUrlComplete
    string

    The full URL or path to navigate to after the OAuth or SAML flow completes.

    strategy
    'oauth_<provider>' | 'saml' | 'enterprise_sso'

    The strategy to use for authentication. The following strategies are supported:

        'oauth_<provider>': The user will be authenticated with their social connection account. See a list of supported values for <provider>.
        'saml' (deprecated): Deprecated in favor of 'enterprise_sso'. The user will be authenticated with their SAML account.
        'enterprise_sso': The user will be authenticated either through SAML or OIDC depending on the configuration of their enterprise SSO account.

    continueSignUp?
    boolean | undefined

    Whether to continue (i.e. PATCH) an existing SignUp (if present) or create a new SignUp.

    emailAddress?
    string | undefined

    Email address to use for targeting an enterprise connection at sign-up.

    identifier?
    string | undefined

    Identifier to use for targeting an enterprise connection at sign-up.

    legalAccepted?
    boolean

    A boolean indicating whether the user has agreed to the legal compliance documents.

    popup?
    Window

        A reference to a popup window opened via window.open().

Example

For OAuth connections, see the custom flow for OAuth connections. For enterprise connections, see the custom flow for enterprise connections.
authenticateWithWeb3()

Initiates a Web3 authentication flow by verifying the user's ownership of a blockchain wallet address through cryptographic signature verification. This method enables decentralized authentication without requiring traditional credentials.

function authenticateWithWeb3(params: AuthenticateWithWeb3Params): Promise<SignUpResource>

AuthenticateWithWeb3Params

    identifier
    string

    The user's Web3 ID

    generateSignature
    (opts: GenerateSignatureParams) => Promise<string>

    The method of how to generate the signature for the Web3 sign-in. See GenerateSignatureParams for more information.

    strategy?
    Web3Strategy

    The Web3 verification strategy.

    legalAccepted?
    boolean

        A boolean indicating whether the user has agreed to the legal compliance documents.

GenerateSignatureParams

    identifier
    string

    The user's Web3 wallet address.

    nonce
    string

The cryptographic nonce

    used in the sign-in.

    provider?
    Web3Provider

    The Web3 provider to generate the signature with.

    legalAccepted?
    boolean

        A boolean indicating whether the user has agreed to the legal compliance documents.

Example

const signUp = await clerk.signUp.authenticateWithWeb3({
  identifier: '0x1234567890123456789012345678901234567890',
})

create()

Returns a new SignUp object based on the params you pass to it, stores the sign-up lifecycle state in the status property, and deactivates any existing sign-up process the client may already have in progress. Use this method to initiate a new sign-up process.

What you must pass to params depends on which sign-up options you have enabled in your Clerk application instance.

Optionally, you can complete the sign-up process in one step if you supply the required fields to create(). Otherwise, Clerk's sign-up process provides great flexibility and allows users to easily create multi-step sign-up flows.

Warning

Once the sign-up process is complete, pass the createdSessionId to the setActive() method on the Clerk object. This will set the newly created session as the active session.

function create(params: SignUpCreateParams): Promise<SignUpResource>

SignUpCreateParams

    strategy
    'oauth_<provider>' | 'saml' | 'enterprise_sso' | 'ticket' | 'google_one_tap'

    The strategy to use for the sign-up flow. The following strategies are supported:

        'oauth_<provider>': The user will be authenticated with their social connection account. See a list of supported values for <provider>.
        'saml' (deprecated): Deprecated in favor of 'enterprise_sso'. The user will be authenticated with their SAML account.
        'enterprise_sso': The user will be authenticated either through SAML or OIDC depending on the configuration of their enterprise SSO account.
        'ticket': The user will be authenticated via the ticket or token generated from the Backend API.
        'google_one_tap': The user will be authenticated with the Google One Tap UI. It's recommended to use authenticateWithGoogleOneTap() instead, as it will also set the user's current session as active for you.

    firstName
    string | null

The user's first name. Only supported if name

    is enabled.

    lastName
    string | null

The user's last name. Only supported if name

    is enabled.

    password
    string | null

    The user's password. Only supported if password is enabled.

    emailAddress
    string | null

    The user's email address. Only supported if email address is enabled. Keep in mind that the email address requires an extra verification process.

    phoneNumber
    string | null

The user's phone number in E.164 format

    . Only supported if phone number is enabled. Keep in mind that the phone number requires an extra verification process.

    web3Wallet
    string | null

    Required if Web3 authentication is enabled. The Web3 wallet address, made up of 0x + 40 hexadecimal characters.

    username
    string | null

    The user's username. Only supported if usernames are enabled.

    unsafeMetadata
    SignUpUnsafeMetadata

    Metadata that can be read and set from the frontend. Once the sign-up is complete, the value of this field will be automatically copied to the newly created user's unsafe metadata. One common use case for this attribute is to use it to implement custom fields that can be collected during sign-up and will automatically be attached to the created User object.

    redirectUrl
    string

    If strategy is set to 'oauth_<provider>' or 'enterprise_sso', this specifies full URL or path that the OAuth provider should redirect to after successful authorization on their part. Typically, this will be a simple /sso-callback route that either calls Clerk.handleRedirectCallback() or mounts the <AuthenticateWithRedirectCallback /> component. See the custom flow for implementation details.

    If strategy is set to 'email_link', this specifies The full URL that the user will be redirected to when they visit the email link. See the custom flow for implementation details.

    actionCompleteRedirectUrl
    string

    Optional if strategy is set to 'oauth_<provider>' or 'enterprise_sso'. The full URL or path that the user will be redirected to after successful authorization from the OAuth provider and Clerk sign-in.

    ticket
    string

    Required if strategy is set to 'ticket'. The ticket or token generated from the Backend API.

    transfer
    boolean

    When set to true, the SignUp will attempt to retrieve information from the active SignIn instance and use it to complete the sign-up process. This is useful when you want to seamlessly transition a user from a sign-in attempt to a sign-up attempt.

    legalAccepted
    boolean

    A boolean indicating whether the user has agreed to the legal compliance documents.

    oidcPrompt
    string

Optional if strategy is set to 'oauth_<provider>' or 'enterprise_sso'. The value to pass to the OIDC prompt parameter

    in the generated OAuth redirect URL.

    oidcLoginHint
    string

Optional if strategy is set to 'oauth_<provider>' or 'enterprise_sso'. The value to pass to the OIDC login_hint parameter

        in the generated OAuth redirect URL.

createEmailLinkFlow()

function createEmailLinkFlow(): {
  startEmailLinkFlow: (params: StartEmailLinkFlowParams) => Promise<SignUp>
  cancelEmailLinkFlow: () => void
}

Sets up a sign-up with email link flow. Calling createEmailLinkFlow() will return two functions.

The first function is async and starts the email link flow, preparing an email link verification. It sends the email link email and starts polling for verification results. The signature is startEmailLinkFlow({ redirectUrl: string }) => Promise<SignUpResource>.

The second function can be used to stop polling at any time, allowing for full control of the flow and cleanup. The signature is cancelEmailLinkFlow() => void.

function createEmailLinkFlow(): {
  startEmailLinkFlow: (params: StartEmailLinkFlowParams) => Promise<SignUpResource>
  cancelEmailLinkFlow: () => void
}

createEmailLinkFlow() returns

createEmailLinkFlow returns an object with two functions:

    startEmailLinkFlow
    (params: StartEmailLinkFlowParams) => Promise<SignUp>

        Function to start the email link flow. It prepares an email link verification and polls for the verification result.

StartEmailLinkFlowParams

    redirectUrl
    string

        The full URL that the user will be redirected to when they visit the email link.

prepareEmailAddressVerification()

Initiates an email verification process by sending a one-time verification code to the email address associated with the current sign-up attempt. This is a convenience method that wraps SignUp.prepareVerification() with the 'email_code' strategy.

By default, this method is equivalent to calling SignUp.prepareVerification({ strategy: 'email_code' }). It can be customized via the PrepareEmailAddressVerificationParams to use alternative verification strategies like email links.

function prepareEmailAddressVerification(
  params?: PrepareEmailAddressVerificationParams,
): Promise<SignUpResource>

PrepareEmailAddressVerificationParams

    strategy
    'email_code' | 'email_link'

    The verification strategy to validate the user's sign-up request. The following strategies are supported:

        'email_code': Send an email with a unique token to input.
        'email_link': Send an email with a link which validates sign-up.

    redirectUrl
    string

        Required if strategy is set to 'email_link'. The full URL that the user will be redirected to when they visit the email link. See the custom flow for implementation details.

preparePhoneNumberVerification()

Initiates a phone number verification process by sending a one-time verification code (OTP) via SMS to the phone number associated with the current sign-up attempt. This is a convenience method that wraps SignUp.prepareVerification() with the 'phone_code' strategy.

By default, this method is equivalent to calling SignUp.prepareVerification({ strategy: 'phone_code' }). The verification process will fail if the phone number is invalid, unreachable, or has already been verified. The sent verification code has a limited validity period and can only be used once.

function preparePhoneNumberVerification(
  params?: PreparePhoneNumberVerificationParams,
): Promise<SignUpResource>

PreparePhoneNumberVerificationParams

    strategy
    'phone_code'

        The verification strategy to validate the user's sign-up request. The following strategies are supported:
            'phone_code': Send an SMS with a unique token to input.

prepareVerification()

Initiates the verification process for a field that requires validation during sign-up. This method prepares the necessary verification flow based on the specified strategy, such as sending verification codes, generating OAuth URLs, or preparing Web3 wallet signatures.

function prepareVerification(params: PrepareVerificationParams): Promise<SignUpResource>

PrepareVerificationParams

    strategy
    'phone_code' | 'email_code' | 'email_link' | 'oauth_<provider>' | 'saml' | 'enterprise_sso' | 'web3_metamask_signature' | 'web3_coinbase_wallet_signature' | 'web3_okx_wallet_signature'

The verification strategy to validate the user's sign-up request. The following strategies are supported:

    'phone_code': User will receive a one-time authentication code via SMS.
    'email_code': Send an email with a unique token to input.
    'email_link': Send an email with a link which validates sign-up.
    'oauth_<provider>': The user will be authenticated with their social connection account. See a list of supported values for <provider>.
    'saml' (deprecated): Deprecated in favor of 'enterprise_sso'. The user will be authenticated with their SAML account.
    'enterprise_sso': The user will be authenticated either through SAML or OIDC depending on the configuration of their enterprise SSO account.
    'web3_metamask_signature': The verification will attempt to be completed using the user's Web3 wallet address via Metamask

. The web3_wallet_id parameter can also be specified to select which of the user's known Web3 wallets will be used.
'web3_coinbase_wallet_signature': The verification will attempt to be completed using the user's Web3 wallet address via Coinbase Wallet
. The web3_wallet_id parameter can also be specified to select which of the user's known Web3 wallets will be used.
'web3_okx_wallet_signature': The verification will attempt to be completed using the user's Web3 wallet address via OKX Wallet

        . The web3_wallet_id parameter can also be specified to select which of the user's known Web3 wallets will be used.

    redirectUrl
    string

    If strategy is set to 'oauth_<provider>' or 'enterprise_sso', this specifies the full URL or path that the OAuth provider should redirect to after successful authorization. Typically, this will be a simple /sso-callback route that either calls Clerk.handleRedirectCallback() or mounts the <AuthenticateWithRedirectCallback /> component. See the custom flow for implementation details.

    If strategy is set to 'email_link', this specifies The full URL that the user will be redirected to when they visit the email link. See the custom flow for implementation details.

    actionCompleteRedirectUrl?
    string

    The full URL or path that the user will be redirected to after successful authorization from the OAuth provider and Clerk sign-in.

    oidcPrompt?
    string

Optional if strategy is set to 'oauth_<provider>' or 'enterprise_sso'. The value to pass to the OIDC prompt parameter

    in the generated OAuth redirect URL.

    oidcLoginHint?
    string

Optional if strategy is set to 'oauth_<provider>' or 'enterprise_sso'. The value to pass to the OIDC login_hint parameter

        in the generated OAuth redirect URL.

prepareWeb3WalletVerification()

Initiates a verification process for a Web3 wallet by sending the wallet address to the server and retrieving a nonce that must be cryptographically signed by the wallet. This is a convenience method that wraps SignUp.prepareVerification() with Web3 wallet strategies.

By default, this method is equivalent to calling SignUp.prepareVerification({ strategy: 'web3_metamask_signature' }). The verification process will fail if the wallet address is invalid or has already been verified. The returned nonce has a limited validity period and can only be used once.

function prepareWeb3WalletVerification(
  params?: PrepareWeb3WalletVerificationParams,
): Promise<SignUpResource>

PrepareWeb3WalletVerificationParams

    strategy
    'web3_metamask_signature' | 'web3_coinbase_wallet_signature' | 'web3_okx_wallet_signature'

        The verification strategy to validate the user's sign-up request. The following strategies are supported:
            'web3_metamask_signature': User will need to sign a message and generate a signature using MetaMask browser extension.
            'web3_coinbase_wallet_signature': User will need to sign a message and generate a signature using Coinbase Wallet.
            'web3_okx_wallet_signature': User will need to sign a message and generate a signature using OKX Wallet.

update()

Updates the current SignUp.

function update(params: SignUpUpdateParams): Promise<SignUpResource>

SignUpUpdateParams

SignUpUpdateParams is a mirror of SignUpCreateParams with the same fields and types, depending on the configuration of the instance.

Organization object

The Organization object holds information about an organization, as well as methods for managing it.

To use these methods, you must have the Organizations feature enabled in your app's settings in the Clerk Dashboard.
Properties

    id
    string

    The unique identifier of the related organization.

    name
    string

    The name of the related organization.

    slug
    string | null

    The organization slug. If supplied, it must be unique for the instance.

    imageUrl
    string

    Holds the organization logo or default logo. Compatible with Clerk's Image Optimization.

    hasImage
    boolean

    A getter boolean to check if the organization has an uploaded image. Returns false if Clerk is displaying an avatar for the organization.

    membersCount
    number

    The number of members the associated organization contains.

    pendingInvitationsCount
    number

    The number of pending invitations to users to join the organization.

    adminDeleteEnabled
    boolean

    A getter boolean to check if the admin of the organization can delete it.

    maxAllowedMemberships
    number

    The maximum number of memberships allowed for the organization.

    createdAt
    Date

    The date when the organization was created.

    updatedAt
    Date

    The date when the organization was last updated.

    publicMetadata
    OrganizationPublicMetadata

Metadata that can be read from the Frontend API and Backend API

        and can be set only from the Backend API.

Methods
addMember()

Adds a user as a member to an organization. A user can only be added to an organization if they are not already a member of it and if they already exist in the same instance as the organization. Only administrators can add members to an organization.

Returns an OrganizationMembership object.

function addMember(params: AddMemberParams): Promise<OrganizationMembership>

AddMemberParams

    userId
    string

    The ID of the user to be added as a member to the organization.

    role
    string

        The role that the user will have in the organization.

Example

await organization.addMember({ userId: 'user_123', role: 'org:admin' })

createDomain()

Creates a new domain for the currently active organization. Returns an OrganizationDomain object.

Warning

You must have Verified domains enabled in your app's settings in the Clerk Dashboard.

function createDomain(domainName: string): Promise<OrganizationDomainResource>

Parameters

    domainName
    string

        The domain name that will be added to the organization.

Example

await clerk.organization.createDomain('test-domain.com')

destroy()

Deletes the organization. Only administrators can delete an organization.

Deleting an organization will also delete all memberships and invitations. This is not reversible.

function destroy(): Promise<void>

Example

await clerk.organization.destroy()

getDomain()

Retrieves a domain for an organization based on the given domain ID. Returns an OrganizationDomain object.

Warning

You must have Verified domains enabled in your app's settings in the Clerk Dashboard.

function getDomain(params: GetDomainParams): Promise<OrganizationDomain>

GetDomainParams

    domainId
    string

        The ID of the domain that will be fetched.

Example

await clerk.organization.getDomain({ domainId: 'domain_123' })

getDomains()

Retrieves the list of domains for the currently active organization. Returns a ClerkPaginatedResponse of OrganizationDomain objects.

Warning

You must have Verified domains enabled in your app's settings in the Clerk Dashboard.

function getDomains(params?: GetDomainsParams): Promise<ClerkPaginatedResponse<OrganizationDomain>>

GetDomainsParams

    initialPage?
    number

    A number that can be used to skip the first n-1 pages. For example, if initialPage is set to 10, it is will skip the first 9 pages and will fetch the 10th page.

    pageSize?
    number

    A number that indicates the maximum number of results that should be returned for a specific page.

    enrollmentMode?
    'manual_invitation' | 'automatic_invitation' | 'automatic_suggestion'

        An enrollment mode will change how new users join an organization.

Example

await clerk.organization.getDomains()

getInvitations()

Retrieves the list of invitations for the currently active organization. Returns a ClerkPaginatedResponse of OrganizationInvitation objects.

function getInvitations(
  params?: GetInvitationsParams,
): Promise<ClerkPaginatedResponse<OrganizationInvitation>>

GetInvitationsParams

    initialPage?
    number

    A number that can be used to skip the first n-1 pages. For example, if initialPage is set to 10, it is will skip the first 9 pages and will fetch the 10th page.

    pageSize?
    number

    A number that indicates the maximum number of results that should be returned for a specific page.

    status?
    'pending' | 'accepted' | 'revoked'

        The status an invitation can have.

Example

await clerk.organization.getInvitations()

getMemberships()

Retrieves the list of memberships for the currently active organization. Returns a ClerkPaginatedResponse of OrganizationMembership objects.

function getMemberships(
  params?: GetMembersParams,
): Promise<ClerkPaginatedResponse<OrganizationMembership>>

GetMembersParams

    initialPage?
    number

    A number that can be used to skip the first n-1 pages. For example, if initialPage is set to 10, it is will skip the first 9 pages and will fetch the 10th page.

    pageSize?
    number

    A number that indicates the maximum number of results that should be returned for a specific page.

    role?
    OrganizationCustomRoleKey[]

        The roles of memberships that will be included in the response.

Example

For an example on how to use getMemberships(), see the custom flow on managing organization roles.
getMembershipRequests()

Retrieve the list of membership requests for the currently active organization. Returns a ClerkPaginatedResponse of OrganizationMembershipRequest-request) objects.

Warning

You must have Organizations, and Verified domains and Automatic suggestion enabled in your app's settings in the Clerk Dashboard.

function getMembershipRequests(
  params?: GetMembershipRequestParams,
): Promise<ClerkPaginatedResponse<OrganizationMembershipRequestResource>>

GetMembershipRequestParams

    initialPage?
    number

    A number that can be used to skip the first n-1 pages. For example, if initialPage is set to 10, it is will skip the first 9 pages and will fetch the 10th page.

    pageSize?
    number

    A number that indicates the maximum number of results that should be returned for a specific page.

    status?
    string

        The status of the membership requests that will be included in the response.

Example

For an example on how to use getMembershipRequests(), see the custom flow guide on managing membership requests.
getRoles()

Returns a paginated list of roles in the organization. Returns a ClerkPaginatedResponse of RoleResource objects.

function getRoles(params?: GetRolesParams): Promise<ClerkPaginatedResponse<RoleResource>>

GetRolesParams

    initialPage?
    number

    A number that can be used to skip the first n-1 pages. For example, if initialPage is set to 10, it is will skip the first 9 pages and will fetch the 10th page.

    pageSize?
    number

        A number that indicates the maximum number of results that should be returned for a specific page.

Example

await clerk.organization.getRoles()

inviteMember()

Creates and sends an invitation to the target email address for becoming a member with the role passed on the function parameters. Returns an OrganizationInvitation object.

function inviteMember(params: InviteMemberParams): Promise<OrganizationInvitation>

InviteMemberParams

    emailAddress
    string

    The email address to invite.

    role
    string

        The role of the new member.

Example

await clerk.organization.inviteMember({ emailAddress: 'test@test.com', role: 'org:member' })

inviteMembers()

Creates and sends an invitation to the target email addresses for becoming a member with the role passed in the parameters. Returns an array of OrganizationInvitation objects.

function inviteMembers(params: InviteMembersParams): Promise<OrganizationInvitation[]>

InviteMembersParams

    emailAddresses
    string[]

    The email addresses to invite.

    role
    string

        The role of the new members.

Example

await clerk.organization.inviteMembers({
  emailAddresses: ['test@test.com', 'test2@test.com'],
  role: 'org:member',
})

removeMember()

Removes a member from the organization based on the userId. Returns an OrganizationMembership object.

function removeMember(userId: string): Promise<OrganizationMembership>

Parameters

    userId
    string

        The ID of the user to remove from the organization.

Example

await organization.removeMember('user_123')

setLogo()

Sets or replaces an organization's logo. The logo must be an image and its size cannot exceed 10MB. Returns an Organization object.

function setLogo(params: SetOrganizationLogoParams): Promise<Organization>

SetOrganizationLogoParams

    file
    File | Blob | null

        An image file or blob which cannot exceed 10MB. Passing null will delete the organization's current logo.

Example

await clerk.organization.setLogo({ file })

update()

Updates an organization's attributes. Returns an Organization object.

function update(params: UpdateOrganizationParams): Promise<Organization>

UpdateOrganizationParams

    name
    string

    The organization name.

    slug?
    string | undefined

    The organization slug.

    maxAllowedMemberships?
    number | undefined

    The maximum number of memberships allowed for the organization.

    publicMetadata?
    OrganizationPublicMetadata

Metadata that can be read from both the Frontend API and Backend API

    , but can be set only from the Backend API.

    privateMetadata?
    OrganizationPrivateMetadata

Metadata that is only visible to your Backend API

        .

Example

await clerk.organization.update({ name: 'New Name' })

updateMember()

Updates a member. Currently, only a user's role can be updated. Returns an OrganizationMembership object.

function updateMember(params: UpdateMembershipParams): Promise<OrganizationMembership>

UpdateMembershipParams

    userId
    string

    The ID of the user to update.

    role
    string

        The role of the new member.

Example

await organization.updateMember({ userId: 'user_123', role: 'org:admin' })

Server Actions

Clerk provides helpers to allow you to protect your Server Actions, fetch the current user, and interact with the Clerk API.

The following guide provides examples for using Server Actions in Server Components and in Client Components.
With Server Components
Protect your Server Actions

You can use the auth() helper to protect your server actions. This helper will return the current user's ID if they are signed in, or null if they are not.
actions.ts

import { auth } from '@clerk/nextjs/server'

export default function AddToCart() {
  async function addItem(formData: FormData) {
    'use server'

    const { userId } = await auth()

    if (!userId) {
      throw new Error('You must be signed in to add an item to your cart')
    }

    console.log('add item server action', formData)
  }

  return (
    <form action={addItem}>
      <input value={'test'} type="text" name="name" />
      <button type="submit">Add to Cart</button>
    </form>
  )
}

When performing organization-related operations, you can use auth().orgId to check a user's organization ID before performing an action.
actions.ts

import { auth } from '@clerk/nextjs/server'

export default function AddVerifiedDomain() {
  async function addVerifiedDomain(formData: FormData) {
    'use server'

    const { userId, orgId } = await auth()

    if (!userId) {
      throw new Error('You must be signed in to add a verified domain')
    }

    if (!orgId) {
      throw new Error('No active organization found. Set one as active or create/join one')
    }

    const domain = formData.get('domain')?.toString()
    if (!domain) {
      throw new Error('Domain is required')
    }

    await clerkClient().organizations.createOrganizationDomain({
      organizationId: orgId,
      name: domain,
      enrollmentMode: 'automatic_invitation',
    })

    console.log(`Added domain ${domain} to organization ${orgId}`)
  }

  return (
    <form action={addVerifiedDomain}>
      <input placeholder="example.com" type="text" name="domain" />
      <button type="submit">Add Domain</button>
    </form>
  )
}

Accessing the current user

Current user data is important for data enrichment. You can use the currentUser() helper to fetch the current user's data in your server actions.
app/page.tsx

import { currentUser } from '@clerk/nextjs/server'

export default function AddHobby() {
  async function addHobby(formData: FormData) {
    'use server'

    const user = await currentUser()

    if (!user) {
      throw new Error('You must be signed in to use this feature')
    }

    const serverData = {
      usersHobby: formData.get('hobby'),
      userId: user.id,
      profileImage: user.imageUrl,
    }

    console.log('add item server action completed with user details ', serverData)
  }

  return (
    <form action={addHobby}>
      <input value={'soccer'} type="text" name="hobby" />
      <button type="submit">Submit your hobby</button>
    </form>
  )
}

With Client Components

When using Server Actions in Client Components, you need to make sure you use prop drilling to ensure that headers are available.
Protect your Server Actions

Use the following tabs to see an example of how to protect a Server Action that is used in a Client Component.
Server Action
Client Component
Page
app/actions.ts

'use server'
import { auth } from '@clerk/nextjs/server'

export async function addItem(formData: FormData) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('You must be signed in to add an item to your cart')
  }

  console.log('add item server action', formData)
}

Accessing the current user

Use the following tabs to see an example of how to access the current user in a Server Action that is used in a Client Component.
Server Action
Client Component
Page
app/actions.ts

'use server'
import { currentUser } from '@clerk/nextjs/server'

export async function addHobby(formData: FormData) {
  const user = await currentUser()

  if (!user) {
    throw new Error('You must be signed in to use this feature')
  }

  const serverData = {
    usersHobby: formData.get('hobby'),
    userId: user.id,
    profileImage: user.imageUrl,
  }

  console.log('add Hobby completed with user details ', serverData)
}

JavaScript Backend SDK

Clerk's JavaScript Backend SDK exposes the Backend API

resources and low-level authentication utilities for JavaScript environments.

For example, if you wanted to get a list of all users in your application, instead of creating a fetch to https://api.clerk.com/v1/users

endpoint, you can use the users.getUserList() method provided by the JavaScript Backend SDK.
Installation
Backend SDK
With other SDKs

If you are using the JavaScript Backend SDK on its own, you can install it using the following command:
npm
yarn
pnpm
bun
terminal

npm install @clerk/backend

Usage

All resource operations are mounted as sub-APIs on the clerkClient object. For example, if you would like to get a list of all of your application's users, you can use the getUserList() method on the users sub-API. You can find the full list of available sub-APIs and their methods in the sidenav.

To access a resource, you must first instantiate a clerkClient instance.
Backend SDK
With other SDKs

To instantiate a clerkClient instance, you must call createClerkClient() and pass in options.

Note

This example uses process.env to import environment variables. You may need to use an alternative method, such as import.meta.env, to set environment variables for your project.

import { createClerkClient } from '@clerk/backend'

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

Error handling

Backend SDK functions throw errors (ClerkAPIResponseError) when something goes wrong. You'll need to catch them in a try/catch block and handle them gracefully. For example:
example.ts

try {
  const res = await someBackendApiCall()
} catch (error) {
  // Error handling
}

createClerkClient({ options })

The createClerkClient() function requires an options object. It is recommended to set these options as environment variables where possible, and then pass them to the function. For example, you can set the secretKey option using the CLERK_SECRET_KEY environment variable, and then pass it to the function like this: createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY }).

The following options are available:

    secretKey (required)
    string

The Clerk Secret Key from the API keys

    page in the Clerk Dashboard.

    jwtKey?
    string

The JWKS Public Key from the API keys

    in the Clerk Dashboard. For more information, refer to Manual JWT verification.

    publishableKey?
    string

The Clerk Publishable Key from the API keys

    page in the Clerk Dashboard.

    domain?
    string

    The domain of a satellite application in a multi-domain setup.

    isSatellite?
    boolean

    Whether the instance is a satellite domain in a multi-domain setup. Defaults to false.

    proxyUrl?
    string

    The proxy URL from a multi-domain setup.

    sdkMetadata?
    { name: string, version: string }

    Metadata about the SDK.

    telemetry?
    { disabled: boolean, debug: boolean }

    Telemetry configuration.

    userAgent?
    string

    The User-Agent request header passed to the Clerk API.

    apiUrl?
    string

The Clerk Backend API

    endpoint. Defaults to 'https://api.clerk.com'.

    apiVersion?
    string

    The version passed to the Clerk API. Defaults to 'v1'.

    audience?
    string | string[]

A string or list of audiences

        .

Get the userId and other properties

The Auth object contains important information like the current user's session ID, user ID, and organization ID.

The Auth object is available on the request object in server contexts. Some frameworks provide a helper that returns the Auth object. See the following table for more information.
Framework	How to access the Auth object
Next.js App Router	auth()
Next.js Pages Router	getAuth()
Astro	locals.auth()
Express	req.auth
React Router	getAuth()
Remix	getAuth()
Tanstack React Start	getAuth()
Other	request.auth

For example, in a Next.js App Router route handler, you can use the auth() helper to get the user's ID, and then use the Backend SDK's getUser() method to get the Backend User object.
app/api/example/route.ts

import { auth, clerkClient } from '@clerk/nextjs/server'

export async function GET() {
  // Use `auth()` to get the user's ID
  const { userId } = await auth()

  // Protect the route by checking if the user is signed in
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const client = await clerkClient()

  // Use the Backend SDK's `getUser()` method to get the Backend User object
  const user = await client.users.getUser(userId)

  // Return the Backend User object
  return NextResponse.json({ user: user }, { status: 200 })
}

<SignUpButton>

The <SignUpButton> component is a button that links to the sign-up page or displays the sign-up modal.
Properties

    asChild?
    boolean

    For Astro only: If true, the <SignUpButton> component will render its children as a child of the component.

    forceRedirectUrl?
    string

    If provided, this URL will always be redirected to after the user signs up. It's recommended to use the environment variable instead.

    fallbackRedirectUrl?
    string

    The fallback URL to redirect to after the user signs up, if there's no redirect_url in the path already. Defaults to /. It's recommended to use the environment variable instead.

    oauthFlow
    "redirect" | "popup" | "auto"

    Determines how OAuth authentication is performed. Accepts the following properties:

        "redirect": Redirect to the OAuth provider on the current page.
        "popup": Open a popup window.
        "auto": Choose the best method based on whether the current domain typically requires the "popup" flow to correctly perform authentication.

    Defaults to "auto".

    signInForceRedirectUrl?
    string

    If provided, this URL will always be redirected to after the user signs in. It's recommended to use the environment variable instead.

    signInFallbackRedirectUrl?
    string

    The fallback URL to redirect to after the user signs in, if there's no redirect_url in the path already. Defaults to /. It's recommended to use the environment variable instead.

    mode?
    'redirect' | 'modal'

    Determines what happens when a user clicks on the <SignUpButton>. Setting this to 'redirect' will redirect the user to the sign-up route. Setting this to 'modal' will open a modal on the current route. Defaults to 'redirect'

    children?
    React.ReactNode

    Children you want to wrap the <SignUpButton> in.

    initialValues
    SignUpInitialValues

    The values used to prefill the sign-up fields with.

    unsafeMetadata
    SignUpUnsafeMetadata

        Metadata that can be read and set from the frontend and the backend. Once the sign-up is complete, the value of this field will be automatically copied to the created user's unsafe metadata (User.unsafeMetadata). One common use case is to collect custom information about the user during the sign-up process and store it in this property. Read more about unsafe metadata.

Usage
Basic usage
Next.js
React
Astro
Remix
Tanstack React Start
Vue
app/page.tsx

import { SignUpButton } from '@clerk/nextjs'

export default function Home() {
  return <SignUpButton />
}

Custom usage

You can create a custom button by wrapping your own button, or button text, in the <SignUpButton> component.
Next.js
React
Astro
Remix
Vue
app/page.tsx

import { SignUpButton } from '@clerk/nextjs'

export default function Home() {
  return (
    <SignUpButton>
      <button>Custom sign up button</button>
    </SignUpButton>
  )
}
<CreateOrganization /> component
The <CreateOrganization /> component renders an organization creation UI that allows users to create brand new organizations within your application.

The <CreateOrganization /> component is used to render an organization creation UI that allows users to create brand new organizations in your application.
Properties

All props are optional.

    appearance
    Appearance | undefined

    Optional object to style your components. Will only affect Clerk components and not Account Portal pages.

    afterCreateOrganizationUrl
    string

    Full URL or path to navigate to after creating a new organization.

    routing
    'hash' | 'path'

    The routing strategy for your pages. Defaults to 'path' for frameworks that handle routing, such as Next.js and Remix. Defaults to hash for all other SDK's, such as React.

    path
    string

    The path where the component is mounted on when routing is set to path. It is ignored in hash-based routing. For example: /create-organization.

    skipInvitationScreen
    boolean

    Hides the screen for sending invitations after an organization is created. When left undefined, Clerk will automatically hide the screen if the number of max allowed members is equal to 1

    hideSlug
    boolean

    Hides the optional slug field in the organization creation screen.

    fallback?
    ReactNode

        An optional element to be rendered while the component is mounting.

Usage with frameworks

The following example includes a basic implementation of the <CreateOrganization /> component. You can use this as a starting point for your own implementation.
Next.js
React
Astro
Remix
Tanstack React Start
Vue
app/create-organization/[[...create-organization]]/page.tsx

import { CreateOrganization } from '@clerk/nextjs'

export default function CreateOrganizationPage() {
  return <CreateOrganization />
}

Usage with JavaScript

The following methods available on an instance of the Clerk class are used to render and control the <CreateOrganization /> component:

    mountCreateOrganization
    unmountCreateOrganization
    openCreateOrganization
    closeCreateOrganization

The following examples assume that you have followed the quickstart in order to add Clerk to your JavaScript application.
mountCreateOrganization()

Render the <CreateOrganization /> component to an HTML <div> element.

function mountCreateOrganization(node: HTMLDivElement, props?: CreateOrganizationProps): void

mountCreateOrganization() params

    nodeHTMLDivElement

    The <div> element used to render in the <CreateOrganization /> component

    props?
    CreateOrganizationProps

        The properties to pass to the <CreateOrganization /> component

mountCreateOrganization() usage
main.js

import { Clerk } from '@clerk/clerk-js'

// Initialize Clerk with your Clerk Publishable Key
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const clerk = new Clerk(clerkPubKey)
await clerk.load()

document.getElementById('app').innerHTML = `
  <div id="create-organization"></div>
`

const createOrgDiv = document.getElementById('create-organization')

clerk.mountCreateOrganization(createOrgDiv)

unmountCreateOrganization()

Unmount and run cleanup on an existing <CreateOrganization /> component instance.

function unmountCreateOrganization(node: HTMLDivElement): void

unmountCreateOrganization() params

    nodeHTMLDivElement

        The container <div> element with a rendered <CreateOrganization /> component instance

unmountCreateOrganization() usage
main.js

import { Clerk } from '@clerk/clerk-js'

// Initialize Clerk with your Clerk Publishable Key
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const clerk = new Clerk(clerkPubKey)
await clerk.load()

document.getElementById('app').innerHTML = `
  <div id="create-organization"></div>
`

const createOrgDiv = document.getElementById('create-organization')

clerk.mountCreateOrganization(createOrgDiv)

// ...

clerk.unmountCreateOrganization(createOrgDiv)

openCreateOrganization()

Opens the <CreateOrganization /> component as an overlay at the root of your HTML body element.

function openCreateOrganization(props?: CreateOrganizationProps): void

openCreateOrganization() params

    props?
    CreateOrganizationProps

        The properties to pass to the <CreateOrganization /> component

openCreateOrganization() usage
main.js

import { Clerk } from '@clerk/clerk-js'

// Initialize Clerk with your Clerk Publishable Key
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const clerk = new Clerk(clerkPubKey)
await clerk.load()

document.getElementById('app').innerHTML = `
  <div id="create-organization"></div>
`

const createOrgDiv = document.getElementById('create-organization')

clerk.openCreateOrganization(createOrgDiv)

closeCreateOrganization()

Closes the organization profile overlay.

function closeCreateOrganization(): void

closeCreateOrganization() usage
main.js

import { Clerk } from '@clerk/clerk-js'

// Initialize Clerk with your Clerk Publishable Key
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const clerk = new Clerk(clerkPubKey)
await clerk.load()

document.getElementById('app').innerHTML = `
  <div id="create-organization"></div>
`

const createOrgDiv = document.getElementById('create-organization')

clerk.openCreateOrganization(createOrgDiv)

// ...

clerk.closeCreateOrganization(createOrgDiv)

Customization

To learn about how to customize Clerk components, see the customization documentation.
Feedback
The <SignUp /> component renders a UI for signing up users. The functionality of the <SignUp /> component is controlled by the instance settings you specify in the Clerk Dashboard

, such as sign-in and sign-up options and social connections. You can further customize your <SignUp /> component by passing additional properties at the time of rendering.

Note

The <SignUp/> and <SignIn/> components cannot render when a user is already signed in, unless the application allows multiple sessions. If a user is already signed in and the application only allows a single session, Clerk will redirect the user to the Home URL instead.
Properties

All props are optional.

    appearance
    Appearance | undefined

    Optional object to style your components. Will only affect Clerk components and not Account Portal pages.

    fallback
    ReactNode

    An optional element to be rendered while the component is mounting.

    fallbackRedirectUrl
    string

    The fallback URL to redirect to after the user signs up, if there's no redirect_url in the path already. Defaults to /. It's recommended to use the environment variable instead.

    forceRedirectUrl
    string

    If provided, this URL will always be used as the redirect destination after the user signs up. It's recommended to use the environment variable instead.

    initialValues
    SignUpInitialValues

    The values used to prefill the sign-up fields with.

    oauthFlow
    "redirect" | "popup" | "auto"

    Determines how OAuth authentication is performed. Accepts the following properties:

        "redirect": Redirect to the OAuth provider on the current page.
        "popup": Open a popup window.
        "auto": Choose the best method based on whether the current domain typically requires the "popup" flow to correctly perform authentication.

    Defaults to "auto".

    path
    string

    The path where the component is mounted on when routing is set to path. It is ignored in hash-based routing. For example: /sign-up.

    routing
    'hash' | 'path'

    The routing strategy for your pages. Defaults to 'path' for frameworks that handle routing, such as Next.js and Remix. Defaults to hash for all other SDK's, such as React.

    signInFallbackRedirectUrl
    string

    The fallback URL to redirect to after the user signs in, if there's no redirect_url in the path already. Used for the 'Already have an account? Sign in' link that's rendered. Defaults to /. It's recommended to use the environment variable instead.

    signInForceRedirectUrl?
    string

    If provided, this URL will always be redirected to after the user signs in. Used for the 'Already have an account? Sign in' link that's rendered. It's recommended to use the environment variable instead.

    signInUrl
    string

    The full URL or path to the sign-in page. Used for the 'Already have an account? Sign in' link that's rendered. It's recommended to use the environment variable instead.

    unsafeMetadata
    SignUpUnsafeMetadata

        Metadata that can be read and set from the frontend and the backend. Once the sign-up is complete, the value of this field will be automatically copied to the created user's unsafe metadata (User.unsafeMetadata). One common use case is to collect custom information about the user during the sign-up process and store it in this property. Read more about unsafe metadata.

Usage with frameworks

The following example includes basic implementation of the <SignUp /> component. You can use this as a starting point for your own implementation.
Next.js
Astro
React
React Router
Remix
Tanstack React Start
Vue

The following example demonstrates how you can use the <SignUp /> component on a public page.

If you would like to create a dedicated /sign-up page in your Next.js application, there are a few requirements you must follow. See the dedicated guide for more information.
app/page.tsx

'use client'

import { SignUp, useUser } from '@clerk/nextjs'

export default function Home() {
  const { user } = useUser()

  if (!user) return <SignUp />

  return <div>Welcome!</div>
}

Customization

To learn about how to customize Clerk components, see the customization documentation.

If Clerk's prebuilt components don't meet your specific needs or if you require more control over the logic, you can rebuild the existing Clerk flows using the Clerk API. For more information, see the custom flow guides.
Feedback
The <SignIn /> component renders a UI to allow users to sign in or sign up by default. The functionality of the <SignIn /> component is controlled by the instance settings you specify in the Clerk Dashboard

, such as sign-in and sign-up options and social connections. You can further customize your <SignIn /> component by passing additional properties at the time of rendering.

Note

The <SignUp/> and <SignIn/> components cannot render when a user is already signed in, unless the application allows multiple sessions. If a user is already signed in and the application only allows a single session, Clerk will redirect the user to the Home URL instead.
Properties

All props are optional.

    appearance
    Appearance | undefined

    Optional object to style your components. Will only affect Clerk components and not Account Portal pages.

    fallback
    ReactNode

    An optional element to be rendered while the component is mounting.

    fallbackRedirectUrl
    string

    The fallback URL to redirect to after the user signs in, if there's no redirect_url in the path already. Defaults to /. It's recommended to use the environment variable instead.

    forceRedirectUrl
    string

    If provided, this URL will always be redirected to after the user signs in. It's recommended to use the environment variable instead.

    initialValues
    SignInInitialValues

    The values used to prefill the sign-in fields with.

    oauthFlow
    "redirect" | "popup" | "auto"

    Determines how OAuth authentication is performed. Accepts the following properties:

        "redirect": Redirect to the OAuth provider on the current page.
        "popup": Open a popup window.
        "auto": Choose the best method based on whether the current domain typically requires the "popup" flow to correctly perform authentication.

    Defaults to "auto".

    path
    string

    The path where the component is mounted on when routing is set to path. It is ignored in hash-based routing. For example: /sign-in.

    routing
    'hash' | 'path'

    The routing strategy for your pages. Defaults to 'path' for frameworks that handle routing, such as Next.js and Remix. Defaults to hash for all other SDK's, such as React.

    signUpFallbackRedirectUrl
    string

    The fallback URL to redirect to after the user signs up, if there's no redirect_url in the path already. Used for the 'Don't have an account? Sign up' link that's rendered. Defaults to /. It's recommended to use the environment variable instead.

    signUpForceRedirectUrl
    string

    If provided, this URL will always used as the redirect destination after the user signs up. Used for the 'Don't have an account? Sign up' link that's rendered. It's recommended to use the environment variable instead.

    signUpUrl
    string

    The full URL or path to the sign-up page. Used for the 'Don't have an account? Sign up' link that's rendered. It's recommended to use the environment variable instead.

    transferable
    boolean

    Indicates whether or not sign in attempts are transferable to the sign up flow. Defaults to true. When set to false, prevents opaque sign ups when a user attempts to sign in via OAuth with an email that doesn't exist.

    waitlistUrl
    string

    Full URL or path to the waitlist page. Use this property to provide the target of the 'Waitlist' link that's rendered. If undefined, will redirect to the Account Portal waitlist page. If you've passed the waitlistUrl prop to the <ClerkProvider> component, it will infer from that, and you can omit this prop.

    withSignUp
    boolean

        Opt into sign-in-or-up flow by setting this prop to true. When true, if a user does not exist, they will be prompted to sign up. If a user exists, they will be prompted to sign in. Defaults to true if the CLERK_SIGN_UP_URL environment variable is set. Otherwise, defaults to false.

Usage with frameworks

The following example includes basic implementation of the <SignIn /> component. You can use this as a starting point for your own implementation.
Next.js
Astro
Expo
React
React Router
Remix
Tanstack React Start
Vue

The following example demonstrates how you can use the <SignIn /> component on a public page.

If you would like to create a dedicated /sign-in page in your Next.js application, there are a few requirements you must follow. See the dedicated guide for more information.
app/page.tsx

'use client'

import { SignIn, useUser } from '@clerk/nextjs'

export default function Home() {
  const { user } = useUser()

  if (!user) return <SignIn />

  return <div>Welcome!</div>
}

Customization

To learn about how to customize Clerk components, see the customization documentation.

If Clerk's prebuilt components don't meet your specific needs or if you require more control over the logic, you can rebuild the existing Clerk flows using the Clerk API. For more information, see the custom flow guides.
Feedback
What did you think of this content?omponent Reference

Clerk offers a comprehensive suite of components designed to seamlessly integrate authentication and multi-tenancy into your application. With Clerk components, you can easily customize the appearance of authentication components and pages, manage the entire authentication flow to suit your specific needs, and even build robust SaaS applications.
UI components

    <SignIn />
    <SignUp />
    <GoogleOneTap />
    <UserButton />
    <UserProfile />
    <CreateOrganization />
    <OrganizationProfile />
    <OrganizationSwitcher />
    <OrganizationList />
    <Waitlist />

Control components

Control components manage authentication-related behaviors in your application. They handle tasks such as controlling content visibility based on user authentication status, managing loading states during authentication processes, and redirecting users to appropriate pages. Control components render at <Loading /> and <Loaded /> states for assertions on the Clerk object. A common example is the <SignedIn> component, which allows you to conditionally render content only when a user is authenticated.

    <AuthenticateWithRedirectCallback />
    <ClerkLoaded />
    <ClerkLoading />
    <Protect />
    <RedirectToSignIn />
    <RedirectToSignUp />
    <RedirectToUserProfile />
    <RedirectToOrganizationProfile />
    <RedirectToCreateOrganization />
    <SignedIn />
    <SignedOut />

Unstyled components

    <SignInButton />
    <SignInWithMetamask />
    <SignUpButton />
    <SignOutButton />

Customization Guides

    Customize components with the appearance prop
    Localize components with the localization prop (experimental)
    Add pages to the <UserProfile /> component
    Add pages to the <OrganizationProfile /> component


useUser()

The useUser() hook provides access to the current user's User object, which contains all the data for a single user in your application and provides methods to manage their account. This hook also allows you to check if the user is signed in and if Clerk has loaded and initialized.
Returns

This function returns a discriminated union type. There are multiple variants of this type available which you can select by clicking on one of the tabs.
Initialization
Signed out
Signed in

    isLoaded
    false

    A boolean that indicates whether Clerk has completed initialization. Initially false, becomes true once Clerk loads.

    isSignedIn
    undefined

    A boolean that returns true if the user is signed in.

    user
    undefined

        The User object for the current user.

Examples
Get the current user

The following example uses the useUser() hook to access the User object, which contains the current user's data such as their full name. The isLoaded and isSignedIn properties are used to handle the loading state and to check if the user is signed in, respectively.
src/Example.tsx

export default function Example() {
  const { isSignedIn, user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <div>Sign in to view this page</div>;
  }

  return <div>Hello {user.firstName}!</div>;
}

Update user data

The following example uses the useUser() hook to access the User object, which calls the update() method to update the current user's information.
React
Next.js
app/page.tsx

"use client";

import { useUser } from "@clerk/nextjs";

export default function HomePage() {
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    // Handle loading state
    return null;
  }

  if (!user) return null;

  const updateUser = async () => {
    await user.update({
      firstName: "John",
      lastName: "Doe",
    });
  };

  return (
    <>
      <button onClick={updateUser}>Update your name</button>
      <p>user.firstName: {user?.firstName}</p>
      <p>user.lastName: {user?.lastName}</p>
    </>
  );
}

Reload user data

The following example uses the useUser() hook to access the User object, which calls the reload() method to get the latest user's information.
React
Next.js
app/page.tsx

"use client";

import { useUser } from "@clerk/nextjs";

export default function HomePage() {
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    // Handle loading state
    return null;
  }

  if (!user) return null;

  const updateUser = async () => {
    // Update data via an API endpoint
    const updateMetadata = await fetch("/api/updateMetadata");

    // Check if the update was successful
    if (updateMetadata.message !== "success") {
      throw new Error("Error updating");
    }

    // If the update was successful, reload the user data
    await user.reload();
  };

  return (
    <>
      <button onClick={updateUser}>Update your metadata</button>
      <p>user role: {user?.publicMetadata.role}</p>
    </>
  );
}

Feedback
What did you thi