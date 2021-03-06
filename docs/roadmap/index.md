# Development Roadmap

## Version 0.2
### Attitudes (Extensions)
- use app level attitudes (override default attitudes with same name)
- autoprefix by default for CSS Attitude
- jsx default language extras (es2016/17, polyfills)
- Re-introduce `base.css|scss`

### Dev
- Test coverage for sourcemaps

### config
- Handle dotfiles as special case again (ignored by default)

## Version 0.3
### Attitudes
- Add default behaviour `{ default: {}, development: {}, test: {}, production: {} }`
- Proxy Attitude. To proxy a path containing a `.proxy` or `.proxy.js` file,
with a function returning a target URL string or a plain string URL target.
- React Attitude (providing all the babel boilerplate and loaders)
- Default Linting (Linting as core feature, extendable via hooks to add plugins etc.)

### Server
- Support for [Koa](http://koajs.com/)
- Default SSL setup (take certificates from root folder or `.server`)

### Dev
- optimise watcher and page tree reload (only reload the path that was changed)

### Webpack
- Use aliases from `.server`
- Tree-shaking with webpack 2
- Separate bundles for vendor and common application code (common.js already exists)
- [Optimize incremental builds](http://engineering.invisionapp.com/post/optimizing-webpack/)
- Multi-Process compilation with [happypack](https://github.com/amireh/happypack)
- [Code Splitting](https://github.com/webpack/docs/wiki/code-splitting)

## Version 0.4
- ?
