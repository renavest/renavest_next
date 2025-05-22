@preact-signals/safe-react

Tracking

this is not valid: import { useSignals } from '@preact-signals/react/runtime';

do not use hooks.

The React adapter allows you to access signals directly inside your components and will automatically subscribe to them.

import { signal } from "@preact-signals/safe-react";

const count = signal(0);

function CounterValue() {
  // Whenever the `count` signal is updated, we'll
  // re-render this component automatically for you
  return <p>Value: {count.value}</p>;
}

Hooks

If you need to instantiate new signals inside your components, you can use the useSignal or useComputed hook.

import { useSignal, useComputed } from "@preact-signals/safe-react";

function Counter() {
  const count = useSignal(0);
  const double = useComputed(() => count.value * 2);

  return (
    <button onClick={() => count.value++}>
      Value: {count.value}, value x 2 = {double.value}
    </button>
  );
}

Optimization: Put signal into JSX

The React adapter ships with several optimizations it can apply out of the box to minimize virtual-dom diffing. If you pass a signal directly into JSX, it will behave as component which renders value of signal.

import { signal } from "@preact-signals/safe-react";

const count = signal(0);

// Unoptimized: Will trigger the surrounding
// component to re-render
function Counter() {
  return <p>Value: {count.value}</p>;
}

// Optimized: Will diff only value of signal
function Counter() {
  return (
    <p>
      <>Value: {count}</>
    </p>
  );
}

Prop signal unwrapping

If you pass a signal as a prop to a component, it will automatically unwrap it for you. This means you can pass signals directly to DOM elements and they will be bound to the DOM node.

import { signal } from "@preact-signals/safe-react";

const count = signal(0);

// data-count={count} will be unwrapped and equal to data-count={count.value}
const Counter = () => <div data-count={count}>Value: {count.value}</div>;