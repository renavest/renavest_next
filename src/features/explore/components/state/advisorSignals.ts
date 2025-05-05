import { signal } from '@preact-signals/safe-react';

import { Advisor } from '@/src/shared/types';

export const advisorSignal = signal<Advisor | null>(null);
export const isOpenSignal = signal<boolean>(false);
