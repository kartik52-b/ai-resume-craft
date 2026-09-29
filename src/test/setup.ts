import "@testing-library/jest-dom";
import { configure } from "@testing-library/react";

/**
 * Routes are code-split with `React.lazy`, so the first visit to a page pays for
 * its transform even in jsdom. The default 1000ms window is fine on an idle
 * machine and marginal on a loaded one, which made lazy-route assertions flake.
 * Waiting longer changes no assertion — it only stops the suite from racing the
 * bundler.
 */
configure({ asyncUtilTimeout: 5000 });

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
