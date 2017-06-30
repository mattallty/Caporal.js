<a name="0.7.0"></a>
# [0.7.0](https://github.com/mattallty/Caporal.js/compare/v0.6.0...v0.7.0) (2017-06-30)


### Features

* **logger:** allow log level to be passed through env (#58) ([2f9e578](https://github.com/mattallty/Caporal.js/commit/2f9e578))



<a name="0.6.0"></a>
# [0.6.0](https://github.com/mattallty/Caporal.js/compare/v0.5.0...v0.6.0) (2017-05-29)


### Bug Fixes

* **autocomplete:** fix arguments autocompletion (#53) ([e21f846](https://github.com/mattallty/Caporal.js/commit/e21f846)), closes [#53](https://github.com/mattallty/Caporal.js/issues/53)
* **logger:** Fix logger (new line missing) (#54) ([ecd145f](https://github.com/mattallty/Caporal.js/commit/ecd145f)), closes [#54](https://github.com/mattallty/Caporal.js/issues/54)
* **logger:** fix logger metadata handling (#55) ([d0b9953](https://github.com/mattallty/Caporal.js/commit/d0b9953)), closes [#55](https://github.com/mattallty/Caporal.js/issues/55)



<a name="0.5.0"></a>
# [0.5.0](https://github.com/mattallty/Caporal.js/compare/v0.4.1...v0.5.0) (2017-04-13)


### Bug Fixes

* **validator:** fix handling of prog.LIST flag (#43) ([d1e429a](https://github.com/mattallty/Caporal.js/commit/d1e429a)), closes [#43](https://github.com/mattallty/Caporal.js/issues/43) [#39](https://github.com/mattallty/Caporal.js/issues/39)


### Features

* **help:** Added custom help feature (#47) ([3324eec](https://github.com/mattallty/Caporal.js/commit/3324eec)), closes [#14](https://github.com/mattallty/Caporal.js/issues/14)
* **program,command:** return promise of executed command for facilitate testing (#40) ([0d1bd54](https://github.com/mattallty/Caporal.js/commit/0d1bd54))



<a name="0.4.1"></a>
## [0.4.1](https://github.com/mattallty/Caporal.js/compare/v0.4.0...v0.4.1) (2017-03-26)


### Bug Fixes

* **help:** use console.log for help() instead of custom logger (#38) ([e00932b](https://github.com/mattallty/Caporal.js/commit/e00932b)), closes [#34](https://github.com/mattallty/Caporal.js/issues/34)



<a name="0.4.0"></a>
# [0.4.0](https://github.com/mattallty/Caporal.js/compare/v0.3.0...v0.4.0) (2017-03-26)


### Bug Fixes

* **autocomplete:** Handle error when no argument is given to autocomplete helper (#4) ([fee73ab](https://github.com/mattallty/Caporal.js/commit/fee73ab))
* Fix fish's autorun file path (#15) ([fba79bb](https://github.com/mattallty/Caporal.js/commit/fba79bb)), closes [#15](https://github.com/mattallty/Caporal.js/issues/15)
* Fix options parsing when only short name is defined (#32) ([4b5f754](https://github.com/mattallty/Caporal.js/commit/4b5f754)), closes [#32](https://github.com/mattallty/Caporal.js/issues/32)
* Fix typo in README (#17) ([f786ef5](https://github.com/mattallty/Caporal.js/commit/f786ef5)), closes [#17](https://github.com/mattallty/Caporal.js/issues/17)
* **help:** Fix help command not exiting (#37) ([3c725f6](https://github.com/mattallty/Caporal.js/commit/3c725f6)), closes [#37](https://github.com/mattallty/Caporal.js/issues/37)
* **logger:** Fix logger new line character after metadata (#31) ([51139ad](https://github.com/mattallty/Caporal.js/commit/51139ad)), closes [#31](https://github.com/mattallty/Caporal.js/issues/31)
* **options:** Fix handling of --no-color option (#24) ([0ac0619](https://github.com/mattallty/Caporal.js/commit/0ac0619)), closes [#24](https://github.com/mattallty/Caporal.js/issues/24)
* **parsing:** Fixes negative numbers parsing as argument (#16) ([690b46d](https://github.com/mattallty/Caporal.js/commit/690b46d)), closes [#16](https://github.com/mattallty/Caporal.js/issues/16) [#13](https://github.com/mattallty/Caporal.js/issues/13)
* **program:** Force exiting for help command and -h, -V, --version options (#27) ([c2e7146](https://github.com/mattallty/Caporal.js/commit/c2e7146))


### Features

* **actions:** Implement async actions ([afef8b2](https://github.com/mattallty/Caporal.js/commit/afef8b2))



<a name="0.3.0"></a>
# [0.3.0](https://github.com/mattallty/Caporal.js/compare/v0.2.0...v0.3.0) (2017-02-26)


### Bug Fixes

* _getLongOptions should only return options that have long notations ([d76e3dd](https://github.com/mattallty/Caporal.js/commit/d76e3dd))
* change the way we handle new lines in logger ([635fa9b](https://github.com/mattallty/Caporal.js/commit/635fa9b))


### Features

* Node.js 4.4.5+ compatibility ([fd0fbdc](https://github.com/mattallty/Caporal.js/commit/fd0fbdc))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/mattallty/Caporal.js/compare/v0.1.0...v0.2.0) (2017-02-25)


### Features

* Implement auto-completion (#1) ([333c968](https://github.com/mattallty/Caporal.js/commit/333c968))



<a name="0.1.0"></a>
# 0.1.0 (2017-02-19)


### Bug Fixes

* fix eslint errors ([84177db](https://github.com/mattallty/Caporal.js/commit/84177db))
* Fix passing logger in action callback ([6d35d5f](https://github.com/mattallty/Caporal.js/commit/6d35d5f))
* fix release script ([20015a3](https://github.com/mattallty/Caporal.js/commit/20015a3))





<a name="0.1.0-alpha"></a>
# 0.1.0-alpha (2017-02-19)

### Bug Fixes

* fix eslint errors ([84177db](https://github.com/mattallty/Caporal.js/commit/84177db))



