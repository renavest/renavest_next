Once your PostHog instance is up and running, the next step is to start sending events.

We recommend starting with autocapture for your web app as it's the quickest way to get set up, gives you full coverage, and avoids manually adding custom events.

You can add custom events to track the most important events, too.

We recommend using a combination of autocapture and custom events, and tuning autocapture to your needs if you find you're sending too many events.
1. Set up autocapture

When you call posthog.init, the PostHog browser JS library begins automatically capturing user events:

    Pageviews and pageleaves, including the URL, referrer, UTMs, scroll depth, and more
    Autocaptured events, such as any click, change of input, or submission associated with a, button, form, input, select, textarea, and label tags

Configuring single page apps

Hiding sensitive elements

2. Capture custom events

Setting up autocapture is a great way to get started, but typically when integrating tracking into your product, you'll want to send additional events for when specific things occur.

On the client-side, we can use the capture method, with the first argument being the name of the event you want to track.
Web

posthog.capture('user_signed_up')

At first, it may seem somewhat unnecessary to send these custom events when we already have autocapture setup, but these custom events are important for two main reasons:

    Sending custom properties on an event
    Keeping events consistent over time

Sending custom properties on an event

Suppose you're building a SaaS app and want to track when a user purchases a plan.

With autocapture, you'll already see Clicked button with text 'Purchase' events, but these won't have any information on which plan the user purchased.

We include extra information on events by adding a second parameter in our capture call, which contains a map of custom property names and values.
Web

posthog.capture('plan_purchased', {
    price: 1599,
    plan_id: 'XYZ12345',
    frequency: 'monthly',
    features: {
        'SSO': true,
        'Custom branding': true,
        'Custom domains': false,
    }
})

Later, we can use these properties to filter events based on a particular plan, or to calculate the aggregate values of a property over time.

We recommend always including more properties than you might need at first.

There's no limit to the number of properties an event can have, and your future self will thank you when you need to access a property that initially seemed unecessary.
Keeping events consistent and reliable

Using custom events also helps keep your tracking consistent and reliable.

When elements of your frontend change, this can affect how autocapture events show up in PostHog.

If you changed the text for your 'Add to cart' button to just 'Add', our autocapure events would begin showing up as Clicked button with text 'Add' instead of what they had previously been.

While combining these two events using actions to fix this drift is possible, manually tracking these high-value actions with custom events is far more reliable.
Naming your custom events

We recommend adding custom events for the most important actions in your product that are unlikely to change, such as user sign-ups, purchases, and when features are used.

While you can name your events however you'd like, we typically recommend using a [object][verb] format, where [object] is whatever entity the action relates to, and the [verb] is the action itself.

Some examples of this include project created, user signed up, and invite sent.
3. Capture backend events

If you're building a web or mobile app with a backend, we also highly recommend setting up tracking from your server in addition to your frontend.

There are two main benefits to sending certain events from the server-side:

    More reliable delivery: As these events originate from your server, there's no way for them to get accidentally blocked by client-side ad-blockers

    More reliable data: You can fetch up-to-date information directly from your database or other services, which may not be readily available on the frontend

Our SDK pages contain information on installing PostHog on your specific platform. Once you have the library installed, you can send a capture event using the same capture method as in posthog-js.

client.capture({
    distinctId: 'distinct_id',
    event: 'order_created',
    properties: {
        order_id: '#0054',
        subtotal: 3599,
        customer_name: 'Max Hedgehog',
    },
})

The only major difference on the server-side is that we must include a distinct_id with every event.

Often, this will come in the form of a unique user ID and can be pulled from a session cookie when requests arrive from the client.
When should I send events from the server vs. the client?

In general, our guidance is to track events on both the frontend and backend whenever possible. This ensures maximum reliability, and the most flexibility when analyzing your data.

That said, we strongly recommend tracking the following events from the server-side:

    Sign-up events: Given how high value these events are, you should also send server-side events whenever possible

    CRUD events: This is a broad class of events, but generally speaking, whenever you receive an API request to create or update a specific resource within your app, it's useful to forward these to PostHog. We also recommend including context about the request itself in the event (latency, errors, properties passed in the request payload, etc.)

    Backend jobs: PostHog is for more than just optimizing your frontend. It can often be useful to send events whenever backend jobs or workflows are kicked off, which allows you to analyze them within PostHog.



    Linking events to specific users enables you to build a full picture of how they're using your product across different sessions, devices, and platforms.

This is straightforward to do when capturing backend events, as you associate events to a specific user using a distinct_id, which is a required argument.

However, in the frontend of a web or mobile app, a distinct_id is not a required argument — PostHog's SDKs will generate an anonymous distinct_id for you automatically and you can capture events anonymously, provided you use the appropriate configuration.

To link events to specific users, call identify:

posthog.identify(
  'distinct_id',  // Replace 'distinct_id' with your user's unique identifier
  { email: 'max@hedgehogmail.com', name: 'Max Hedgehog' } // optional: set additional person properties
);

Events captured after calling identify are identified events and this creates a person profile if one doesn't exist already.

Due to the cost of processing them, anonymous events can be up to 4x cheaper than identified events, so it's recommended you only capture identified events when needed.
How identify works

When a user starts browsing your website or app, PostHog automatically assigns them an anonymous ID, which is stored locally.

Provided you've configured persistence to use cookies or localStorage, this enables us to track anonymous users – even across different sessions.

By calling identify with a distinct_id of your choice (usually the user's ID in your database, or their email), you link the anonymous ID and distinct ID together.

Thus, all past and future events made with that anonymous ID are now associated with the distinct ID.

This enables you to do things like associate events with a user from before they log in for the first time, or associate their events across different devices or platforms.
Using `identify` in the backend

Best practices when using identify
1. Call identify as soon as you're able to

In your frontend, you should call identify as soon as you're able to.

Typically, this is every time your app loads for the first time, and directly after your users log in.

This ensures that events sent during your users' sessions are correctly associated with them.

You only need to call identify once per session, and you should avoid calling it multiple times unnecessarily.

If you call identify multiple times with the same data without reloading the page in between, PostHog will ignore the subsequent calls.
2. Use unique strings for distinct IDs

If two users have the same distinct ID, their data is merged and they are considered one user in PostHog. Two common ways this can happen are:

    Your logic for generating IDs does not generate sufficiently strong IDs and you can end up with a clash where 2 users have the same ID.
    There's a bug, typo, or mistake in your code leading to most or all users being identified with generic IDs like null, true, or distinctId.

PostHog also has built-in protections to stop the most common distinct ID mistakes.
3. Reset after logout

If a user logs out on your frontend, you should call reset() to unlink any future events made on that device with that user.

This is important if your users are sharing a computer, as otherwise all of those users are grouped together into a single user due to shared cookies between sessions.

We strongly recommend you call reset on logout even if you don't expect users to share a computer.

You can do that like so:

posthog.reset()

If you also want to reset the device_id so that the device will be considered a new device in future events, you can pass true as an argument:
Web

posthog.reset(true)

4. Person profiles and properties

You'll notice that one of the parameters in the identify method is a properties object.

This enables you to set person properties.

Whenever possible, we recommend passing in all person properties you have available each time you call identify, as this ensures their person profile on PostHog is up to date.

Person properties can also be set being adding a $set property to a event capture call.

See our person properties docs for more details on how to work with them and best practices.
Further reading

    Identifying users docs
    How person processing works
    An introductory guide to identifying users in PostHog


    Users getting value: Measuring activation with PostHog

Last updated: Mar 12, 2025
|
Edit this page
Plan with your teammates
Get this intro to PostHog as a private repo you can share with your team. Learn the basics while documenting the specifics of your integration.

You should have the basics of your PostHog integration up and rolling now.

Next you need to define and track the behavior that indicates a user is actually getting something from your product.

We call this activation: once someone passes this threshold, they're likely to keep coming back and making progress with your product.

If someone does not pass this threshold, they still don't know why you're valuable, and they may not come back.

Like your North Star, you need to think about activation as a precursor to revenue. What steps must someone take in your product to understand its value, and become a paying customer?

Just because someone has signed up or logged in doesn't mean they're using our tools. That's where measuring activation comes in.

Once we know how many people do or don't activate, we can adjust our product design to influence that number.
Activation by example

Let's talk through a few cases of activation you might have seen yourself.

For Dropbox, activation was simple: a user who stored one file within the first week was likely to become a long-term customer. Seeing your files sync so seamlessly is persuasive, and likely sparks more ideas about how to use the product. If you never get there, you don't understand the value firsthand.

In Uber's case, activation was taking a first ride. Once you understand the simplicity of pushing a button and receiving transportation, you'll likely do it again.

Some products have wide variability in how they get used, like Pinterest. Rather than focus on a specific behavior, they counted activation according to the number of days within a month someone used the product. Anything more than four counted as activation.

Quantity is a totally reasonable factor in activation, too. For PostHog's session replay product, we count activation as anyone who has watched at least five replays. Just looking at one or two is more like kicking the tires.

Activation looks different for every product. It can be expressed as a quantity of events, or even as a composite of multiple events.
Activation planning

Think about activation for your product.

What event or events correspond to seriously getting what you do and cementing why a customer would want to continue using your product?

Which events tracked in PostHog correspond to activation? Do you need to track more?
Tracking activation

With the product emitting events we need to measure activation, we can create a new insight to provide ongoing measurement and reporting.

funnel

One good start is the funnel insight. This will show you progression from the total population of users – for example, people who have logged in – toward the events that represent your activation.

You'll see the percentage of dropoff for each step, and this will give you something to chip away at with your product design and development.

Each step in a funnel can be finely constrained using filters, so you're measuring exactly the behavior that you described in the above planning step.

In the above example, an imaginary streaming service called Hogflix, the funnel has three events: started_trial, viewed_content, and completed_trial.

The final event, completed_trial, is the activation event here because this is when you can be confident a user has experience the full value of the service.

Read our funnel documentation for more on building funnel insights.

Once your funnel is created, add it to your project's dashboard alongside insights tracking the events that influence your North star metric.
Advanced activation tracking

    A more complex activation sequence – where the intermediate steps could be one of many events – may need a custom query. This post on how we found our activation metric walks through the thinking and queries behind this approach.

    Our newsletter on activation metrics goes deeper into why you should care about activation, and the different factors you should consider when choosing your activation metric.

Next steps

With event data ingesting reliably into PostHog, and a clear sense of your activation criteria now reporting for your team, it's time to think about retention: how many of your users continue using your product.Capturing component render errors

Next.js uses error boundaries to handle uncaught exceptions by rendering a fallback UI instead of the crashing components.

To set one up, create a error.tsx file in any of your route directories. This triggers when there is an error rendering your component and should look like this:
error.tsx

"use client";  // Error boundaries must be Client Components

import posthog from "posthog-js";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    posthog.captureException(error);
  }, [error]);

  return (
    ...
  );
}

You can also create a Global Error component in your root layout to capture unhandled exceptions in your root layout.
app/global-error.tsx

'use client' // Error boundaries must be Client Components

import posthog from "posthog-js";
import NextError from "next/error";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    posthog.captureException(error);
  }, [error]);

  return (
    // global-error must include html and body tags
    <html>
      <body>
        {/* `NextError` is the default Next.js error page component */}
        <NextError statusCode={0} />
      </body>
    </html>
  )
}

Server-side installation

Next.js enables you to both server-side render pages and add server-side functionality. To integrate PostHog into your Next.js app on the server-side, you can use the Node SDK.

First, install the posthog-node library:
Terminal

yarn add posthog-node
# or
npm install --save posthog-node

Router-specific instructions

For the app router, we can initialize the posthog-node SDK once with a PostHogClient function, and import it into files.

This enables us to send events and fetch data from PostHog on the server – without making client-side requests.
JavaScript

// app/posthog.js
import { PostHog } from 'posthog-node'

export default function PostHogClient() {
  const posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0
  })
  return posthogClient
}

    Note: Because server-side functions in Next.js can be short-lived, we set flushAt to 1 and flushInterval to 0.

        flushAt sets how many capture calls we should flush the queue (in one batch).
        flushInterval sets how many milliseconds we should wait before flushing the queue. Setting them to the lowest number ensures events are sent immediately and not batched. We also need to call await posthog.shutdown() once done.

To use this client, we import it into our pages and call it with the PostHogClient function:
JavaScript

import Link from 'next/link'
import PostHogClient from '../posthog'

export default async function About() {

  const posthog = PostHogClient()
  const flags = await posthog.getAllFlags(
    'user_distinct_id' // replace with a user's distinct ID
  );
  await posthog.shutdown()

  return (
    <main>
      <h1>About</h1>
      <Link href="/">Go home</Link>
      { flags['main-cta'] &&
        <Link href="http://posthog.com/">Go to PostHog</Link>
      }
    </main>
  )
}

Capturing server errors

To capture errors that occur in your server-side code, you can set up a instrumentation.ts file at the root of your project. This provides a onRequestError hook that you can use to capture errors.

Importantly, you need to:

    Set up a posthog-node client in your server-side code. See our doc on setting up Next.js server-side analytics for more.
    Check the request is running in the nodejs runtime to ensure PostHog works.
    Get the distinct_id from the cookie to connect the error to a specific user.

This looks like this:
JavaScript

// instrumentation.js
export function register() {
  // No-op for initialization
}

export const onRequestError = async (err, request, context) => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { getPostHogServer } = require('./app/posthog-server')
    const posthog = await getPostHogServer()

    let distinctId = null
    if (request.headers.cookie) {
      const cookieString = request.headers.cookie
      const postHogCookieMatch = cookieString.match(/ph_phc_.*?_posthog=([^;]+)/)
      
      if (postHogCookieMatch && postHogCookieMatch[1]) {
        try {
          const decodedCookie = decodeURIComponent(postHogCookieMatch[1])
          const postHogData = JSON.parse(decodedCookie)
          distinctId = postHogData.distinct_id
        } catch (e) {
          console.error('Error parsing PostHog cookie:', e)
        }
      }
    }

    await posthog.captureException(err, distinctId || undefined)
  }
}

You can find a full example of both this and client-side error tracking in our Next.js error monitoring tutorial.
Uploading source maps

If your source maps are not publicly hosted, you will need to upload them during your build process to see unminified code in your stack traces, the posthog-cli handles this process.
Download

Install posthog-cli and upgrade to latest version
Terminal

curl --proto '=https' --tlsv1.2 -LsSf https://github.com/PostHog/posthog/releases/download/posthog-cli-v0.0.5/posthog-cli-installer.sh | sh
posthog-cli-update

Authenticate
