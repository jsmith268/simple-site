import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { GeneratedFile } from '@simplesight/contracts';

/* The versioned standalone-site starter. A bespoke site is a real, isolated
 * Next 16 + Tailwind v4 app stamped from these templates (outside the monorepo
 * so pnpm workspace resolution never interferes), then filled by the generators. */

const PACKAGE_JSON = (name: string) => `${JSON.stringify(
  {
    name,
    version: '0.1.0',
    private: true,
    type: 'module',
    scripts: { dev: 'next dev', build: 'next build', start: 'next start' },
    dependencies: { next: '16.2.6', react: '19.2.4', 'react-dom': '19.2.4' },
    devDependencies: {
      '@tailwindcss/postcss': '^4',
      tailwindcss: '^4',
      typescript: '^5',
      '@types/node': '^22',
      '@types/react': '^19',
      '@types/react-dom': '^19',
    },
  },
  null,
  2,
)}\n`;

const NEXT_CONFIG = `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Pin the workspace root to this app so a stray parent lockfile doesn't warn.
  turbopack: { root: import.meta.dirname },
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
};

export default nextConfig;
`;

const POSTCSS = `const config = { plugins: { '@tailwindcss/postcss': {} } };
export default config;
`;

const TSCONFIG = `${JSON.stringify(
  {
    compilerOptions: {
      target: 'ES2022',
      lib: ['dom', 'dom.iterable', 'ESNext'],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: 'esnext',
      moduleResolution: 'bundler',
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: 'preserve',
      incremental: true,
      plugins: [{ name: 'next' }],
      baseUrl: '.',
      paths: { '@/*': ['./app/*'] },
    },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
    exclude: ['node_modules'],
  },
  null,
  2,
)}\n`;

export interface ScaffoldOptions {
  /** Absolute path of the new app directory (must be OUTSIDE the monorepo). */
  dir: string;
  /** npm package name / Vercel project slug. */
  slug: string;
}

/** Write the starter config files for a fresh standalone Next app. */
export function scaffoldNextApp(opts: ScaffoldOptions): void {
  mkdirSync(opts.dir, { recursive: true });
  const write = (rel: string, body: string) => {
    const full = join(opts.dir, rel);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, body);
  };
  write('package.json', PACKAGE_JSON(opts.slug));
  write('next.config.ts', NEXT_CONFIG);
  write('postcss.config.mjs', POSTCSS);
  write('tsconfig.json', TSCONFIG);
  write('next-env.d.ts', '/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n');
}

/** Write generated files (paths relative to the app dir) to disk. */
export function writeGeneratedFiles(dir: string, files: GeneratedFile[]): void {
  for (const f of files) {
    const full = join(dir, f.path);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, f.contents);
  }
}
