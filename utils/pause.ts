import { state } from '../state';
import ask from './ask';

function waitForUnpause(): Promise<void> {
  return new Promise((resolve) => {
    const check = () => {
      if (!state.paused) {
        resolve();
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
}

export function withPauseCheck<T extends (...args: any[]) => Promise<any>>(fn: T): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    await waitForUnpause();
    return fn(...args);
  }) as T;
}

export const pauseIfTheUserPressesEnter = async () => {
  if (!state.paused) {
    await ask("Program unpaused. Press enter to pause the program.");
    state.paused = true;
  } else {
    await ask("Program paused. Press enter to unpause the program.");
    state.paused = false;
  }

  pauseIfTheUserPressesEnter();
};
