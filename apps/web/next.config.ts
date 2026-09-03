import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  /**
   * The workspace packages ship TypeScript source rather than a build output.
   * One less build step, and a change in the design system shows up in the dev
   * server immediately instead of after a rebuild.
   */
  transpilePackages: ['@flux/core', '@flux/ui'],

  /**
   * Next generates its own AGENTS.md / CLAUDE.md next to the app. The guidance
   * that matters for FLUX lives in CONTRIBUTING.md and ARCHITECTURE.md, and a
   * second, auto-written set would quietly compete with it.
   */
  agentRules: false,
};

export default config;
