# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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