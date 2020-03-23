# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
