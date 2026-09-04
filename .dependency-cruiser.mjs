/** @type {import('dependency-cruiser').IConfiguration} */
const config = {
  forbidden: [
    {
      name: 'no-circular',
      comment: 'Circular dependency — a cycle in the module graph.',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'not-to-unresolvable',
      comment: 'Dependency could not be resolved to a file or core module.',
      severity: 'error',
      from: {},
      to: { couldNotResolve: true },
    },
    {
      name: 'lib-not-to-app',
      comment: 'Layer jump: lib/ must not import app/ (inner → outer).',
      severity: 'warn',
      from: { path: '^lib/' },
      to: { path: '^(app/|auth\\.ts$)' },
    },
    {
      name: 'lib-not-to-features',
      comment: 'Layer jump: lib/ must not import features/ (engine → UI).',
      severity: 'warn',
      from: { path: '^lib/' },
      to: { path: '^features/' },
    },
    {
      name: 'lib-not-to-db',
      comment: 'Layer jump: lib/ must stay persistence-free.',
      severity: 'warn',
      from: { path: '^lib/' },
      to: { path: '^db/' },
    },
    {
      name: 'features-not-to-app',
      comment: 'Layer jump: features/ must not import app/ routes.',
      severity: 'warn',
      from: { path: '^features/' },
      to: { path: '^(app/|auth\\.ts$)' },
    },
    {
      name: 'features-not-to-db',
      comment: 'Layer jump: features/ must not import db/ (UI → persistence).',
      severity: 'warn',
      from: { path: '^features/' },
      to: { path: '^db/' },
    },
    {
      name: 'db-not-to-app',
      comment: 'Layer jump: db/ must not import app/.',
      severity: 'warn',
      from: { path: '^db/' },
      to: { path: '^(app/|auth\\.ts$)' },
    },
    {
      name: 'db-not-to-features',
      comment: 'Layer jump: db/ should not depend on features/ (persistence → UI).',
      severity: 'warn',
      from: { path: '^db/' },
      to: { path: '^features/' },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
      dependencyTypes: ['npm', 'npm-dev', 'npm-optional', 'npm-peer', 'npm-bundled', 'npm-no-pkg'],
    },
    includeOnly: '^(app|auth\\.ts$|db|features|lib)',
    exclude: {
      path: 'node_modules|\\.next|\\.(test|spec)\\.(ts|tsx)$|\\.generated\\.',
    },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
      mainFields: ['module', 'main', 'types', 'typings'],
    },
    reporterOptions: {
      archi: {
        collapsePattern: '^(app|db|features/[^/]+|lib/midinike|lib)',
      },
      dot: {
        theme: {
          graph: {
            rankdir: 'LR',
            splines: 'true',
            overlap: 'false',
            fontsize: '12',
            bgcolor: 'white',
          },
          node: { fontsize: '11' },
        },
      },
    },
  },
}

export default config
