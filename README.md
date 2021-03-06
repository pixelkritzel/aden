# Aden
Automation for the Web.

Aden integrates [Webpack](https://github.com/webpack/webpack),
[Babel](https://babeljs.io) and
[Express](http://expressjs.com/) with an extensible [file](https://en.wikipedia.org/wiki/Computer_file) [tree](https://en.wikipedia.org/wiki/Tree_data_structure) [parser](https://en.wikipedia.org/wiki/Parsing),
to generate universal frontend asset builds and allow for a classic webserver behaviour, mapping paths to routes, while setting up a non-mutable express app for production. Aden also allows for straight forward server side rendering and API development.

The _/docs_ from this repository are running on _aden_ on a heroku instance at [aden.zwerk.io](https://aden.zwerk.io).


[![Build Status](https://travis-ci.org/kommander/aden.png)](https://travis-ci.org/kommander/aden)
[![Build status](https://ci.appveyor.com/api/projects/status/chkkhb0sgcpmgfyl?svg=true)](https://ci.appveyor.com/project/kommander/aden)
[![Coverage Status](https://coveralls.io/repos/github/kommander/aden/badge.svg?branch=master)](https://coveralls.io/github/kommander/aden?branch=master) [![Greenkeeper badge](https://badges.greenkeeper.io/kommander/aden.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/github/kommander/aden/badge.svg)](https://snyk.io/test/github/kommander/aden)


## Prerequisites
[Node 6+](https://nodejs.org/en/) and [NPM 3+](https://www.npmjs.com/).
Currently supporting OSX and Linux.

## Install
```
npm install -g aden
```

## Help
```
$ aden -h

Usage: aden <command> [rootPath] [options]

Commands:

  start|s [rootPath]          Run in production mode
  dev|d [rootPath]            Run in development mode (live reload)
  build|b [rootPath]          Will create a production build and exit
  clean|c [rootPath]          Remove all dist folders
  deploy [rootPath] [target]  Run deploy task with default or given target(s)

Options:

  -h, --help            output usage information
  -f, --focus <path>    Choose one route to focus on. Mount only that.
  -w, --workers [num]   Start with given [num] of workers, or all CPUs.
  -p, --port <port>     Override the port to mount the server on
  -u, --use <attitude>  Specify attitude(s) to use
  -s, --silent          Do not output anything on purpose
  -v, --verbose         Output a lot
  --debug               Debug output
  --log-no-date         Omit date from log output
  -V, --version         output the version number
```
Aden runs in _production_ by default, without any CLI options.

## Run
### Development
To confirm aden is installed correctly, try running the docs from the repository,
or check out the getting started guide at [aden.zwerk.io](https://aden.zwerk.io)
```
aden dev path/to/docs
```
(Point to any directory containing a `.server` file)

From the repo:
```
node index dev docs
```

### Production
Running in production requires an existing build,
by default in a _.dist_ folder in the root folder of the app.

To create a build:
```
aden build [path]
```

To run an existing production build:
```
aden start [path]
```

# Resources
Learn more about the technologies used:
 - [Awesome Webpack](https://github.com/webpack-contrib/awesome-webpack)
 - [12 Factor Application](https://12factor.net/)

# About
_Aden_ is an effort to allow convenient aggregation of data from services,
with a focus on frontend development, packaging and delivery automation.

---
Copyright 1997-2017 Sebastian Herrlinger

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
