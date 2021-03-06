const fs = require('fs');
const path = require('path');
const hogan = require('hogan.js');
const cannot = require('brokens');

/**
 * hbs
 */
module.exports = (aden) => {
  const {
    ENTRY_DYNAMIC,
    KEY_OBJECT,
    KEY_RPATH,
    KEY_CUSTOM,
  } = aden.constants;

  aden.registerKey('hbs', {
    type: KEY_OBJECT,
    config: true,
    value: {
      entry: 'index',
    },
    inherit: true,
  });

  aden.registerKey('hbsIndex', {
    type: KEY_RPATH,
    entry: ENTRY_DYNAMIC,
  });

  aden.registerKey('templates', {
    type: KEY_CUSTOM,
    value: {},
  });

  aden.registerFiles('hbsFiles', /\.(hbs|hdbs)$/, {
    handler: ({ page, fileInfo }) => {
      if (fileInfo.name === page.hbs.value.entry) {
        page.set('hbsIndex', fileInfo.rpath);
        return;
      }
    },
    entry: ENTRY_DYNAMIC,
    distExt: '.hbs',
  });

  aden.hook('setup:route', ({ page }) =>
    Promise.resolve().then(() => {
      const templates = page.hbsFiles.value.reduce((prev, file) => {
        return Object.assign(prev, {
          [file.name]: {
            render: (data, partials, indent) => file
              .load((content) => hogan.compile(content.toString('utf8')))
              .then((template) => template.render(data, partials, indent)),
          },
        });
      }, {});
      page.set('templates', templates);
    })
  );

  aden.hook('setup:page', ({ page }) => {
    if (page.hbsIndex.value) {
      Object.assign(page, {
        get: (req, res, thepage) => {
          return thepage.hbsIndex
            .load((content) => hogan.compile(content.toString('utf8')))
            .then((template) => {
              const html = template.render({ 
                req, res, page: thepage,
              });
              res.send(html);
            });
        },
      });
    }
    return null;
  });

  aden.hook('post:apply', ({ webpackConfigs, pages }) => {
    const frontendConfig = webpackConfigs
      .find((conf) => (conf.name === 'frontend'));

    frontendConfig.resolve.extensions.push(
      '.hbs', '.hdbs', '.handlebars'
    );

    frontendConfig.module.rules.push({
      test: /\.(hbs|hdbs|handlebars)$/,
      include: [
        path.resolve(aden.rootPath, '../node_modules'),
        path.resolve(aden.rootPath, '../../node_modules'),
      ].concat(aden.flattenPages(pages).map((page) => page.path.resolved)),
      use: [
        {
          loader: require.resolve('html-loader'),
        },
      ],
    });
  });
};
