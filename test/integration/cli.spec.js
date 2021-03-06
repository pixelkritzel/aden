const aden = require('../../lib/aden');
const Logger = require('../../lib/aden.logger');
const path = require('path');
const expect = require('expect');
const http = require('http');
const spawn = require('../lib/spawn');

describe('CLI', () => {
  afterEach(() => {
    spawn.anakin();
  });

  she('has a dev mode cli command', (done) => {
    const child = spawn('node', ['index.js', 'dev', 'test/tmpdata/basics'], {
      cwd: path.resolve(__dirname, '../../'),
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const logParser = Logger.getLogParser();
    logParser.attach(child.stdout);
    logParser.on('ready', () => child.kill('SIGINT'));
    child.on('error', done);
    child.on('exit', () => {
      logParser.destroy();
      done();
    });
  });

  she('has a start (production mode) cli command', (done) => {
    aden()
      .init(path.resolve(__dirname, '../tmpdata/basics'))
      .then((an) => an.run('build'))
      .then((an) => {
        const child = spawn('node', ['index.js', 'start', 'test/tmpdata/basics'], {
          cwd: path.resolve(__dirname, '../../'),
          stdio: ['ignore', 'pipe', 'pipe'],
        });
        const logParser = Logger.getLogParser();
        logParser.attach(child.stdout);
        logParser.on('ready', () => child.kill('SIGINT'));
        child.on('exit', () => {
          logParser.destroy();
          an.shutdown(done);
        });
      });
  });

  she('has a build cli command', (done) => {
    const child = spawn('node', ['index.js', 'build', 'test/tmpdata/basics'], {
      cwd: path.resolve(__dirname, '../../'),
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const logParser = Logger.getLogParser();
    logParser.attach(child.stdout);
    logParser.on('build:done', () => {
      logParser.destroy();
      done();
    });
  });

  she('has a clean cli command', (done) => {
    const child = spawn('node', ['index.js', 'clean', 'test/tmpdata/basics'], {
      cwd: path.resolve(__dirname, '../../'),
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const logParser = Logger.getLogParser();
    logParser.attach(child.stdout);
    logParser.on('clean:done', () => {
      logParser.destroy();
      done();
    });
  });

  she('has a deploy cli command', (done) => {
    const child = spawn('node', ['index.js', 'build', 'test/tmpdata/basics'], {
      cwd: path.resolve(__dirname, '../../'),
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    child.on('exit', () => {
      const subchild = spawn('node', ['index.js', 'deploy', 'test/tmpdata/basics'], {
        cwd: path.resolve(__dirname, '../../'),
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      const logParser = Logger.getLogParser();
      logParser.attach(subchild.stdout);
      logParser.on('deploy:done', () => {
        logParser.destroy();
        done();
      });
    });
  });

  she('logs error if no .server file at root folder', (done) => {
    const child = spawn('node', ['index.js', 'dev', 'test/tmpdata/nodotserver'], {
      cwd: path.resolve(__dirname, '../../'),
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const logParser = Logger.getLogParser();
    logParser.attach(child.stderr);
    logParser.once('error', (err) => {
      expect(err.message).toMatch('I could not start up, because no .server file');
      logParser.destroy();
      done();
    });
  });

  she('logs error if address is rejected', (done) => {
    const child = spawn('node', ['index.js', 'dev', 'test/tmpdata/basics', '-p', '256.256.256.1:80'], {
      cwd: path.resolve(__dirname, '../../'),
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const logParser = Logger.getLogParser();
    logParser.attach(child.stderr);
    logParser.once('error', (err) => {
      expect(err.message).toMatch('getaddrinfo ENOTFOUND');
      logParser.destroy();
      done();
    });
  });

  she('starts a cluster with -w option', (done) => {
    const child = spawn('node', ['index.js', 'build', 'test/tmpdata/basics'], {
      cwd: path.resolve(__dirname, '../../'),
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    child.on('exit', () => {
      const subchild = spawn('node', [
        'index.js', 'start', 'test/tmpdata/basics', '-w', '2', '-p', '12100',
      ], {
        cwd: path.resolve(__dirname, '../../'),
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      const logParser = Logger.getLogParser();
      logParser.attach(subchild.stdout);
      logParser.once('ready', () => {
        logParser.destroy();
        done();
      });
    });
  });

  she('shuts down workers', (done) => {
    const child = spawn('node', ['index.js', 'build', 'test/tmpdata/empty'], {
      cwd: path.resolve(__dirname, '../../'),
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    child.on('exit', () => {
      const subchild = spawn('node', [
        'index.js', 'start', 'test/tmpdata/empty', '-w', '2', '-p', '12100',
      ], {
        cwd: path.resolve(__dirname, '../../'),
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      const logParser = Logger.getLogParser();
      logParser.attach(subchild.stdout);
      logParser.on('ready', () => {
        // Simulate shutdown
        subchild.kill('SIGINT');
      });
      logParser.once('shutdown:complete', () => {
        logParser.destroy();
        done();
      });
    });
  });

  she('logs worker errors', (done) => {
    const child = spawn('node', ['index.js', 'build', 'test/tmpdata/geterror'], {
      cwd: path.resolve(__dirname, '../../'),
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    child.on('exit', () => {
      const subchild = spawn('node', [
        'index.js', 'start', 'test/tmpdata/geterror', '-w', '2', '-p', '12100',
      ], {
        cwd: path.resolve(__dirname, '../../'),
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      const logParser = Logger.getLogParser();
      logParser.attach(subchild.stderr);
      logParser.attach(subchild.stdout);
      logParser.on('ready', (info) => {
        setTimeout(() =>
          http.get(`http://${info.address}:${info.port}/`).on('error', () => null),
          1000
        );
      });
      logParser.once('worker:error', (err) => {
        expect(err.message).toMatch('Worker error code: 1');
        logParser.destroy();
        done();
      });
    });
  });

  she('// Things Aden already does but are untested...');
  she('provides a flag to set the focus path');
  she('provides a cleanup flag');
});
