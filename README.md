# Jest-Schema-Matcher

[![npm version](https://badge.fury.io/js/jest-schema-matcher.svg)](https://badge.fury.io/js/jest-schema-matcher)
![Lint-Build-Test-Publish](https://github.com/ryparker/jest-schema-matcher/workflows/Lint-Build-Test-Publish/badge.svg)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo)

An opinionated Jest matcher that generates, validates, and versions JSON Schemas for your APIs.

## :rocket: Quick start

1. Add dependency

```shell
yarn add --dev jest-schema-matcher
```

2. Set global variable `SHOULD_UPDATE_SCHEMAS` in your jest's global config

```js
// jest.config.js

module.exports = {
  ...
  globals: {
    SHOULD_UPDATE_SCHEMAS: true, // If true, schemas will be written/updated
  }
}
```

3. Add the matcher to your tests

```js
test('Check against schema', () => {
  const object = {
    username: 'test_user_a124',
    password: 'fixtures_password',
  }

  expect(object).toMatchSchema('schemaName')
  /**
   * 1. If SHOULD_UPDATE_SCHEMAS === true:
   * Will create a new schema or update existing schema in same path as test file.
   * E.g. If test path is `.../__tests__/sample.tests.js`
   * Then schema will be created in `.../__tests__/schemas/schemaName.json`
   * --or--
   * If SHOULD_UPDATE_SCHEMAS === false:
   * Will infer a new schema and recommend schema changes if the saved schema could be improved.
   */

  /** 2. Will validate `object` against saved schema.*/
})
```
