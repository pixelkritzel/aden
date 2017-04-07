#!/usr/bin/env node
const bootstrap = require('./lib/backend/index.js');
const express = require('express');
const program = require('commander');

program
  .usage('[options]')
  .option('-a, --app [path]', 'The path to the frontend app to serve')
  .option('-p, --port [port]', 'Specifiy the port to mount the server on')
  .option('-b, --build', 'Will only build out the app assets and exit (not start the server)')
  .option('-v, --verbose', 'Output a lot')
  .option('-s, --silent', 'Do not output anything on purpose')
  // TODO: .option('--clean', 'Remove all dist folders')
  // TODO: .option('--focus', 'Choose one route to focus on. Mount only that.')
  // TODO: .option('--export', 'Export the generated webpack config')
  // TODO: .option('--export-js', 'Export the generated webpack config as JSObject')
  .parse(process.argv);

process.on('uncaughtException', (ex) => {
  console.error('UNCAUGHT EXCEPTION', ex);
  // TODO: restart
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection', reason);
  // TODO: restart
  process.exit(1);
});

const app = express();
app.program = program;

// TODO: Hand over program options as config to bootstrap and then aden itself,
//       >> Do not rely on app.program
bootstrap(app, {
  verbose: program.verbose,
  silent: program.silent,
}).then((aden) => {
  const port = parseInt(program.port, 10) || aden.rootPage.port || 3000;
  app.listen(port, () => aden.logger.success(`Started server at port ${port}`));
}).catch((err) => {
  console.error('Fatal:', err);
});
