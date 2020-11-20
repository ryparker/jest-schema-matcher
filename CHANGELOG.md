# Changelog

## [1.7.11](https://github.com/ryparker/jest-schema-matcher/compare/v1.7.10...v1.7.11) (2020-11-20)


### Bug Fixes

* **package.json:** upgraded deps and resolved yargs-parser ([3c5d93d](https://github.com/ryparker/jest-schema-matcher/commit/3c5d93d3f3a0a340fae716f72c79d742419ce408))
* **to-match-schema.ts:** fixed XO linter errors ([6e4b299](https://github.com/ryparker/jest-schema-matcher/commit/6e4b29911b0564447c65a399c3f0eb575c77d053))

## [1.7.10](https://github.com/ryparker/jest-schema-matcher/compare/v1.7.9...v1.7.10) (2020-11-18)


### Bug Fixes

* **package.json, to-match-schema.ts:** upgraded deps, implemented node path parsing instead of regex ([2f1dc60](https://github.com/ryparker/jest-schema-matcher/commit/2f1dc60dac43b03539c2e73fd3dca05345a6aa27))

## [1.7.9](https://github.com/ryparker/jest-schema-matcher/compare/v1.7.8...v1.7.9) (2020-08-27)


### Bug Fixes

* **improved console logs:** rejected value will no longer be wrapped in 2 sets of quotes ([1f30068](https://github.com/ryparker/jest-schema-matcher/commit/1f300680cd6b13bc5059683732eaca82d5e2809b))

## [1.7.8](https://github.com/ryparker/jest-schema-matcher/compare/v1.7.7...v1.7.8) (2020-08-27)


### Bug Fixes

* **windows file paths:** improved file path regex so that the mathcer supports windows and unix ([3b02a00](https://github.com/ryparker/jest-schema-matcher/commit/3b02a005271ff33739d974e73312e9c650b48de7))

## [1.7.7](https://github.com/ryparker/jest-schema-matcher/compare/v1.7.6...v1.7.7) (2020-08-27)


### Bug Fixes

* **fixing regex replacement:** .replace() does not mutate, so we need to assign the value ([f95e533](https://github.com/ryparker/jest-schema-matcher/commit/f95e533adef9581f29c04dde7158be95801bd494))

## [1.7.6](https://github.com/ryparker/jest-schema-matcher/compare/v1.7.5...v1.7.6) (2020-08-27)


### Bug Fixes

* **fix file path replacements for windows:** replaced \ with / for windows users ([7235550](https://github.com/ryparker/jest-schema-matcher/commit/72355501f238769d071c37fa536ceabb2ad897f6))

## [1.7.5](https://github.com/ryparker/jest-schema-matcher/compare/v1.7.4...v1.7.5) (2020-08-13)


### Bug Fixes

* **min/max limits and empty object properties:** bumped schematized to resolve bugs ([ad52031](https://github.com/ryparker/jest-schema-matcher/commit/ad520312d00b9fcac886a3e4e56d0e1cd30e3b35))

## [1.7.4](https://github.com/ryparker/jest-schema-matcher/compare/v1.7.3...v1.7.4) (2020-08-12)


### Bug Fixes

* **schema locator:** improvement to test file name regex ([115376e](https://github.com/ryparker/jest-schema-matcher/commit/115376eccca5c79210177883bbccbaf8d30eda98))

## [1.7.3](https://github.com/ryparker/jest-schema-matcher/compare/v1.7.2...v1.7.3) (2020-08-12)


### Bug Fixes

* **array items:undefined:** bumped schematized to resolve empty array bug "items:undefined" ([ad2c5d0](https://github.com/ryparker/jest-schema-matcher/commit/ad2c5d05d683c7b5bbaf74e0dc48e5c153544fed))
