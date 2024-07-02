import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['web/index.js', 'web/crates.js', 'web/stats.js', 'web/settings.js', 'web/export.js'],
  bundle: true,
  write: true,
  outdir: 'out',
})