# Tèsèvè

> A simple static webserver, in an app.

* * *

![screenshot](http://teseve.github.io/assets/img/screenshot.png)

* * *

## Getting Started

### Download the binaries

You can download the binaries on the [releases page](https://github.com/teseve/teseve/releases).

#### Cask

If you are on Mac OS X and use [Cask](https://caskroom.github.io), you can install Teseve by typing the following command in your terminal : `brew cask install teseve`.

### Build the app from the source

You can build the app by yourself:

1. Clone the repository
2. Run `npm install` to get the dependencies
3. Run `grunt` to build & run the app
4. Use `grunt release` if you want to build a binary.

## Contributing

**Tèsèvè** is currently in heavy development. If you want to contribute, try to follow the existing codestyle.

### TODO

* [x] Allow to drag'n'drop a folder on window to set the server root
* [x] Auto-try to resolve url like `page` to `page.html`
* [x] Custom 404 page
* [x] Multiple-window feature, managing multiple servers
* [ ] About window
* [x] Refactor repo structure + builder
* [ ] All-around refactor
* [ ] Implement main menu for OSX & Windows
* [x] Test Windows
* [x] Test Linux
* [x] Presentation website

## Release History
* **2016/05/08:** `0.5.0` multiple-window managment
* **2015/09/21:** `0.4.0` 404 managment, auto-try to resolve url
* **2015/09/11:** `0.3.0` drag'n'drop feature, new build system
* **2015/09/06:** `0.2.0` autoindex feature
* **2015/08/26:** `0.1.0` basic features
* **2015/08/25:** starting project

## License

**Tèsèvè** is free and unencumbered software released into the public domain.
