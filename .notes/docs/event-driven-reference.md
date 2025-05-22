
# 📦 Event-Driven Architecture + CI/CD Reference

This guide documents how we're building scalable, non-overengineered systems using event-driven logic, vertical slices, and modular components with Preact Safe Signals and Next.js.

---

## 🧠 Core Principles

- **Emit events**, don’t tightly couple logic
- **Separate critical vs. optional side effects**
- **Use modular monolith structure** (vertical slices)
- **CI/CD must be fast, automated, and catch regressions early**
- **Developer experience is a top priority**

---

## 🔔 Event Bus: How It Works

### lib/eventBus.ts

```ts
type EventHandler<T = any> = (payload: T) => void | Promise<void>;

const listeners: Record<string, EventHandler[]> = {};

export function emit<T = any>(event: string, payload: T): Promise<void[]> {
  const handlers = listeners[event] || [];
  return Promise.all(
    handlers.map(async (handler) => {
      try {
        await handler(payload);
      } catch (e) {
        console.error(\`Error in \${event} handler:\`, e);
      }
    })
  );
}

export function on<T = any>(event: string, handler: EventHandler<T>) {
  listeners[event] ??= [];
  listeners[event].push(handler);
}
```

---

## 🎯 Emitting Events

### Fire-and-Forget (Default)

```ts
emit("session.booked", { sessionId }).catch(console.error);
```

- Non-blocking
- Good for: analytics, logs, cache invalidation

### Critical Side Effects

```ts
try {
  await emit("session.booked", { sessionId });
} catch (err) {
  // optionally rollback
}
```

- Blocking
- Good for: confirmations, Stripe sync, legal audit logs

---

## 🧩 Listener Registration

All listeners should live in `/listeners/*.ts` and be imported once in a central file:

### Example:
```ts
// app/api/_listeners.ts
import "@/listeners/session-log";
import "@/listeners/send-email";
```

And ensure this is imported at the top of API routes that use `emit()`.
