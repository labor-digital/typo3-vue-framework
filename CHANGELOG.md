# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [2.18.2](https://github.com/labor-digital/typo3-vue-framework/compare/v2.18.1...v2.18.2) (2020-12-10)


### Bug Fixes

* **BasicBootstrap:** wait for the app event hooks to resolve their promises ([a4eff99](https://github.com/labor-digital/typo3-vue-framework/commit/a4eff9979494ae5983d30f311459ca948a3575f5))

### [2.18.1](https://github.com/labor-digital/typo3-vue-framework/compare/v2.18.0...v2.18.1) (2020-10-23)


### Bug Fixes

* set the initial state again ([a9081af](https://github.com/labor-digital/typo3-vue-framework/commit/a9081afb32845aa3bdb9d783c78d021f2695eb58))

## [2.18.0](https://github.com/labor-digital/typo3-vue-framework/compare/v2.17.0...v2.18.0) (2020-10-09)


### Features

* update dependencies ([e8563f7](https://github.com/labor-digital/typo3-vue-framework/commit/e8563f7901bf38e63739dd826cd0bc4cd09c141f))
* **ErrorHandling:** allow dynamic error route resolving ([b79b040](https://github.com/labor-digital/typo3-vue-framework/commit/b79b040a70aed0a09e0ac8c9ab8f7acb791b0694))
* **PageMeta:** implement support for new "hrefLang" data node ([737d65c](https://github.com/labor-digital/typo3-vue-framework/commit/737d65c2ca330638a827cbd1d6c294fefa002db8))
* **RouteHandler:** tell the backend about the current language code ([f2e2446](https://github.com/labor-digital/typo3-vue-framework/commit/f2e24462578ca47960d56b8ea26d317299d98ee2))
* **SPA:** implement LinkRepository to fetch registered page links ([ff7a586](https://github.com/labor-digital/typo3-vue-framework/commit/ff7a5868070e7faf489af04c5625ce6b5591eb24))
* **Translation:** implement EVENT_LANGUAGE_CHANGED ([e3e99dc](https://github.com/labor-digital/typo3-vue-framework/commit/e3e99dca59962990b4355ae481dbf17b510ac1fa))
* **Translation:** transport current language as header instead of query parameter ([a67d9cf](https://github.com/labor-digital/typo3-vue-framework/commit/a67d9cf44176cdd9481d28d090e7896023af56f8))


### Bug Fixes

* **ErrorHandling:** prevent infinite redirects ([7e01b21](https://github.com/labor-digital/typo3-vue-framework/commit/7e01b21dc72aa06377acfac4a0993de7e9303b95))

## [2.17.0](https://github.com/labor-digital/typo3-vue-framework/compare/v2.16.0...v2.17.0) (2020-09-30)


### Features

* update dependencies ([38f47f3](https://github.com/labor-digital/typo3-vue-framework/commit/38f47f3321948f95a92dd4b372bd5015483d5597))
* **RouteHandler:** remove SSR cache handling, as it is no longer supported in the TYPO3 extension ([1d90c4c](https://github.com/labor-digital/typo3-vue-framework/commit/1d90c4c71d13e0a1e8427a08a4c688ea697ae2f6))


### Bug Fixes

* **PageMeta:** don't call vue-meta.refresh() when rendering ssr ([03bce4f](https://github.com/labor-digital/typo3-vue-framework/commit/03bce4f9c1b089a33dad50e68a045d9bbc78bc6f))

## [2.16.0](https://github.com/labor-digital/typo3-vue-framework/compare/v2.15.3...v2.16.0) (2020-07-21)


### Features

* more readable error reporting for the browser and your cli ([338bbfa](https://github.com/labor-digital/typo3-vue-framework/commit/338bbfa15deb094d5863439fb64b88ba69c3e930))

### [2.15.3](https://github.com/labor-digital/typo3-vue-framework/compare/v2.15.2...v2.15.3) (2020-07-20)


### Bug Fixes

* update dependencies ([ff6eedb](https://github.com/labor-digital/typo3-vue-framework/commit/ff6eedb88e60c40eda97611566a4cc47b3627cc2))

### [2.15.2](https://github.com/labor-digital/typo3-vue-framework/compare/v2.15.1...v2.15.2) (2020-07-20)


### Bug Fixes

* update dependencies ([f0d3538](https://github.com/labor-digital/typo3-vue-framework/commit/f0d3538823bd2dbfbff9c5fddb33a57c82375749))

### [2.15.1](https://github.com/labor-digital/typo3-vue-framework/compare/v2.15.0...v2.15.1) (2020-06-22)


### Bug Fixes

* **PageContext:** fix site url update ([c8459dc](https://github.com/labor-digital/typo3-vue-framework/commit/c8459dc3cc9f35f4c3916772b9888554e4b54510))

## [2.15.0](https://github.com/labor-digital/typo3-vue-framework/compare/v2.14.0...v2.15.0) (2020-06-19)


### Features

* update dependencies ([b011174](https://github.com/labor-digital/typo3-vue-framework/commit/b011174ac648285ac68a268111324b389c0762e1))


### Bug Fixes

* **TypoJsonApi:** make sure different requests don't cancel each other out ([1da9d02](https://github.com/labor-digital/typo3-vue-framework/commit/1da9d02b6bad0c9f409e17eab414e1d254274e8a))

## [2.14.0](https://github.com/labor-digital/typo3-vue-framework/compare/v2.13.0...v2.14.0) (2020-06-17)


### Features

* implement option to register app preloader component ([9224829](https://github.com/labor-digital/typo3-vue-framework/commit/922482928eb3337f8f40a919522f27935c9befa6))
* update dependencies ([e13e72b](https://github.com/labor-digital/typo3-vue-framework/commit/e13e72bf98c186ff1a80d2d16b4c976555600e97))
* **Store:** allow store watchers to accept vue watcher options ([7726788](https://github.com/labor-digital/typo3-vue-framework/commit/77267885ab640d82ee24d8d5a28e5f7605353e2e))


### Bug Fixes

* **ContentElementComponent:** retry if the network crashed when loading a component ([a21b4c5](https://github.com/labor-digital/typo3-vue-framework/commit/a21b4c5f2411d60c1611144504c1c0a7b6b25571))

## [2.13.0](https://github.com/labor-digital/typo3-vue-framework/compare/v2.12.1...v2.13.0) (2020-05-25)


### Features

* remove deprecated JsonApiState and JsonApiStateList references + add getAdditional() method to the json api class + update dependencies ([393397b](https://github.com/labor-digital/typo3-vue-framework/commit/393397bb46f21869b25b0bd5d3d8762338c8ac55))

### [2.12.1](https://github.com/labor-digital/typo3-vue-framework/compare/v2.12.0...v2.12.1) (2020-05-20)


### Bug Fixes

* **PageContext:** make sure the site url is updated correctly when a navigation occurs ([c32a7ca](https://github.com/labor-digital/typo3-vue-framework/commit/c32a7ca063b790c3cc7c780d84d071fd0165f5e2))

## [2.12.0](https://github.com/labor-digital/typo3-vue-framework/compare/v2.11.0...v2.12.0) (2020-04-30)


### Features

* **PageContext:** use the real site url from the TYPO3 backend instead of the API url to allow the app to run on different domains on the frontend and the backend ([3daf425](https://github.com/labor-digital/typo3-vue-framework/commit/3daf425a7f2ecef37365f410628541be60ccb7bc))
* **Store:** make the store instance watchable ([b0f45d2](https://github.com/labor-digital/typo3-vue-framework/commit/b0f45d2491b3cb3f5386328621ae8f4b6f42088e))
* add more shortcuts to connect the contexts better with each other ([6f9e50d](https://github.com/labor-digital/typo3-vue-framework/commit/6f9e50dfa967874576c89c2283a5b32d44339f7b))

## [2.11.0](https://github.com/labor-digital/typo3-vue-framework/compare/v2.10.0...v2.11.0) (2020-04-19)


### Features

* implement more reliable error handling in the OuterAppComponent instead of depending on the routerView component ([ffb4c8d](https://github.com/labor-digital/typo3-vue-framework/commit/ffb4c8daf470c16d4ab6ef97a9e416b24e566d88))

## [2.10.0](https://github.com/labor-digital/typo3-vue-framework/compare/v2.9.1...v2.10.0) (2020-04-19)


### Features

* deprecate EventList in favour of FrameworkEventList + clean up route handler ([ab010f0](https://github.com/labor-digital/typo3-vue-framework/commit/ab010f0bd72faa450c9e81a395c980a6664b57c3))
* implement pid repository to access new frontend API pid bridge feature ([b51cd09](https://github.com/labor-digital/typo3-vue-framework/commit/b51cd09d9f46d55da4b40fe879ec0052e7f3773e))
* implement support for Typo3 based redirects ([ba47db3](https://github.com/labor-digital/typo3-vue-framework/commit/ba47db31b055944074522f5877a2848fb3477e04))
* update dependencies ([5966598](https://github.com/labor-digital/typo3-vue-framework/commit/5966598959e163a15853ae1dd397be877b8214d4))


### Bug Fixes

* **RouteHandler:** make sure the correct context is given ([1e3a7f9](https://github.com/labor-digital/typo3-vue-framework/commit/1e3a7f9e82ec41333763a3246467fc5e92ecc2d7))

### [2.9.1](https://github.com/labor-digital/typo3-vue-framework/compare/v2.9.0...v2.9.1) (2020-04-17)

## [2.9.0](https://github.com/labor-digital/typo3-vue-framework/compare/v2.8.0...v2.9.0) (2020-04-17)


### Features

* **PageContext:** make all page related properties watchable ([abae961](https://github.com/labor-digital/typo3-vue-framework/commit/abae9610cd331f292f31c45850d354e784f4b216))
* **SPA:** add reloadCommonElement option to router configuration ([dcd9b9d](https://github.com/labor-digital/typo3-vue-framework/commit/dcd9b9d04b8dacd0f2caa162dce2bf6ff77c22ba))
* add event emitter getter to all context types ([958a9b5](https://github.com/labor-digital/typo3-vue-framework/commit/958a9b5a1759d3afdfaa16ae05f13c5cc6721d6e))


### Bug Fixes

* **PageContext:** remove unwanted console log spam ([c44c2d5](https://github.com/labor-digital/typo3-vue-framework/commit/c44c2d5c93a040c9b6ce7b3cae74053a724a6517))
* **PageMeta:** fix missing updates on navigation ([8c82941](https://github.com/labor-digital/typo3-vue-framework/commit/8c82941948dc9ffde4087fbfac93cc76f7b09cdc))

## [2.8.0](https://github.com/labor-digital/typo3-vue-framework/compare/v2.7.0...v2.8.0) (2020-03-30)


### Features

* add page language to the html attributes ([61d2826](https://github.com/labor-digital/typo3-vue-framework/commit/61d28269ea693c6e6a2e0545c4565c8db1fdef6e))

## [2.7.0](https://github.com/labor-digital/typo3-vue-framework/compare/v2.6.0...v2.7.0) (2020-03-25)


### Features

* pass more environment information to the additional configuration handler ([40f7a2b](https://github.com/labor-digital/typo3-vue-framework/commit/40f7a2b9b18c129fa273cf7c153eb44322d2a2ba))

## 2.6.0 (2020-03-23)


### Features

* initial public release ([0ed2346](https://github.com/labor-digital/typo3-vue-framework/commit/0ed2346cc2c4115646179531ffe891a8c66d7b3b))

## [2.5.2] (2020-01-15)


### Bug Fixes

* remove unwanted console.log ([47467bd])



## [2.5.1] (2020-01-15)


### Bug Fixes

* don't set headers if they already have been sent ([b7c25e2])



# [2.5.0] (2020-01-10)


### Features

* update dependencies ([20bfaac])



# [2.4.0] (2020-01-10)


### Features

* **AppComponent:** move DefaultAppComponent to its own file ([532ed58])
* **PageContext:** add support for preview marker rendering on hidden typo3 pages ([b394cf0])
* add support for the new app-based header/status management in the vue asset builder extension ([580e33c])
* update dependencies ([454ab23])



# [2.3.0] (2020-01-09)


### Features

* **ContentElementComponent:** add support for the useLoaderComponent option of the backend configurator ([b0afc8f])



# [2.2.0] (2020-01-07)


### Features

* **HybridApp:** use the new div definition by data attribute instead of a script tag when running in hybrid mode ([8eee0c9])
* update dependencies ([b9817fe])



# [2.1.0] (2020-01-02)


### Features

* better error handling for sentry logging ([d46c6aa])



# [2.0.0] (2020-01-02)


### Features

* add support for hybrid apps (snippets on a website) ([c0cff7a])
* update dependencies ([66870e8])


### BREAKING CHANGES

* Library rewrite. This will break your existing apps



# [1.9.0] (2019-12-06)


### Features

* **ErrorHandler:** make sure that the framework error keeps the original stack trace ([a1ac550])



# [1.8.0] (2019-12-06)


### Bug Fixes

* remove "setting state!" output from the console ([ab8fd19])


### Features

* allow event listeners to pass through content-element and content-element-children components ([1bef607])



# [1.7.0] (2019-11-29)


### Features

* better implementation for sentry error tracking. ([2b5f44b])



# [1.6.0] (2019-11-27)


### Features

* update to latest json api version ([e0d7f4a])



# [1.5.0] (2019-11-08)


### Bug Fixes

* **Framework:** make sure the INIT hook is also called on the server when using SSR ([048a2ac])


### Features

* **ContentElementChildrenComponent:** allow to pass context object manually by the "context" prop ([a2b7e35])
* **ContentElementComponent:** use an array of css classes instead of a string ([6721bdc])
* **PageMeta:** implement static page meta that should be identical for all pages ([bf561ab])
* **RootLineElementInterface:** allow new, optional fields transferred by the TYPO3 api ([c4c1f7d])
* **RouteComponent:** better re-rending detection when the route changes ([8dfc813])
* **RouteHandler:** implement new navigation events ([c9b659a])
* **Store:** implement a simple store object to hold reactive data for projects that don't need the complexity of vuex ([53d53cc])
* update dependencies ([433451e])



# [1.4.0] (2019-10-28)


### Features

* add support for webpack DefinePlugin for NODE_ENV and VUE_ENV ([6a88671])



# [1.3.0] (2019-10-25)


### Features

* basic implementation of additional functions like meta and error handling ([9928350])



# [1.2.0] (2019-10-15)


### Features

* basic implementation ([e0c56e1])



# 1.1.0 (2019-09-26)


### Bug Fixes

* add correct repository domain ([8da9c7d])


### Features

* initial commit ([5731576])
