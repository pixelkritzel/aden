'use strict';

const rimraf = require('rimraf');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const {
  KEY_APATH,
  KEY_CUSTOM,
  KEY_FILE_ARRAY,
} = require('./aden.constants');

function build(pages, webpackConfigs) {
  this.log.info('Building Aden app');

  // TODO: Separate out into clean task
  return this.applyHook('pre:build', { pages, webpackConfigs })
    .then(() => this.compile(webpackConfigs)
      .catch((err) => {
        if (this.isDEV) {
          this.log.error('Webpack failed. waiting for changes...', err);
        } else {
          throw err;
        }
      }))
    .then((stats) => this.writeWebpackStats(pages, stats))
    .then((stats) => {
      // Add build info to pages
      this.flattenPages(pages)
        .forEach((page) => {
          // If there's no stats, the webpack build probably failed and in dev we move on
          if (stats) {
            const frontendStats = stats[0].stats
              .find((stat) => (stat.compilation.name === 'frontend'));
            if (frontendStats.compilation.namedChunks[page.entryName]) {
              let commonFiles = frontendStats.compilation.namedChunks.commons.files.slice();

              if (frontendStats.compilation.namedChunks.global) {
                commonFiles = commonFiles.concat(
                  frontendStats.compilation.namedChunks.global.files);
              }

              const mappedCommons = commonFiles
                .filter((file) => (!file.match(/\.map$/)))
                .map((file) => `${this.settings.publicPath}${file}`);
              Object.assign(page, {
                build: frontendStats.compilation.namedChunks[page.entryName].files
                  .filter((file) => ['.js', '.css'].includes(path.parse(file).ext))
                  .reduce((prev, file) => {
                    ({
                      '.js': () => prev.js.push(`${this.settings.publicPath}${file}`),
                      '.css': () => prev.css.push(`${this.settings.publicPath}${file}`),
                    })[path.parse(file).ext]();
                    return prev;
                  }, {
                    js: [],
                    css: [],
                    commons: page.commons ? mappedCommons : [],
                  }),
              });
            } else {
              Object.assign(page, { build: {} });
            }
          }
        });
    })
    .then(() => this.walkPages(pages, (page) =>
      Promise.resolve().then(() => {
        // Backend build
        const keys = page.keys.map((key) => {
          if (typeof key.build === 'function' && key.value) {
            return key.build(page, key);
          }
          return null;
        })
        .filter((key) => !!key);
        return Promise.all(keys)
          .then(() => page);
      })
    ))
    .then(() => this.writePageStats(pages))
    .then(() => this.applyHook('post:build', { pages, webpackConfigs }));
    // TODO: mark as production build, if so, and lock for other env builds
}

const dropKeyProperties = [
  'resolved', 'dir', 'dist', 'default', 'htmlPlugin',
  'cache', 'load',
];

function serializer(pages) {
  return this.flattenPages(pages)
    .map((page) =>
      // TODO: Config keys can be omitted by default as they will be loaded at runtime
      Object.assign(_.omit(page, [
        'ignore', 'noWatch',
        'log', 'activeAttitudes', 'fileHandlers', 'handledFiles',
        'assign', 'set', 'has',
        'webpackStatsDist', 'pageStatsDist', 'dist',
        'entry', 'greedy', 'key',
      ]), {
        children: page.children.map((child) => child.id),
        keys: page.keys
          .filter((key) => key.store)
          .map((key) => {
            if (key.type === KEY_FILE_ARRAY) {
              Object.assign(key, {
                value: key.value.map((file) => _.omit(file, dropKeyProperties)),
              });
            }

            if (key.type === KEY_CUSTOM) {
              Object.assign(key, {
                value: typeof key.serialize === 'function'
                  ? key.serialize(key.value)
                  : {},
              });
            }

            if (key.type === KEY_APATH) {
              Object.assign(key, {
                value: null,
              });
            }

            return _.omit(key, dropKeyProperties);
          }),
      })
    );
}

// save: use page.id -> flatten pages -> map(replace children with ids)
// load: map(replace children with object references) -> reduce(to pagesById)
// TODO: Do not serialize aden default pages
// TODO: write aden version to build and check for compat before running
function serializePages(pages) {
  return Promise.resolve().then(() => {
    const serials = this.serializer(pages);
    const result = {
      pages: serials,
      info: {
        registered: pages.map((page) => page.id),
        rootPage: pages[0].id,
      },
    };
    return JSON.stringify(result);
  });
}

function writePageStats(pages) {
  if (!this.isDEV) {
    this.log.start('Writing page stats to dist.');

    const filePath = path.resolve(this.settings.dist, this.settings.pageStatsDist);

    return this.serializePages(pages)
      .then((pagesJson) => new Promise((resolve, reject) =>
        fs.writeFile(
          filePath,
          pagesJson,
          (err) => {
            if (err) {
              reject(err);
              return;
            }
            this.log.success('Wrote page stats to dist.', {
              pagesJson,
            });
            resolve();
          })
        )
      );
  }
  return pages;
}

function writeWebpackStats(pages, stats) {
  if (!this.isDEV) {
    this.log.start('Writing webpack stats to dist.');

    const jsonStats = stats
      .map((stat) => JSON.stringify(stat.toJson()))
      .join(',');

    return new Promise((resolve, reject) =>
      fs.writeFile(
        path.resolve(this.settings.dist, this.settings.webpackStatsDist),
        `[${jsonStats}]`,
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          this.log.success('Wrote webpack stats to dist.');
          resolve(stats);
        }
      )
    );
  }
  return stats;
}

// Clear dist folders
// TODO: take rootPage - walk pages and check for dist folders in tree
function clean(/* pages */) {
  return new Promise((resolve, reject) => {
    rimraf(this.settings.dist, (rmErr) => {
      if (rmErr) {
        reject(rmErr);
        return;
      }
      resolve();
    });
  });
}

module.exports = {
  build,
  clean,
  writeWebpackStats,
  writePageStats,
  serializePages,
  serializer,
};
