import {SchemaBuilder} from 'schematized';
// Import chalk from 'chalk';
// import diff from 'variable-diff';
// import fs from 'fs';
// import {matcherHint} from 'jest-matcher-utils';
// import path from 'path';

module.exports = async function (object) {
	const schemaBuilder = new SchemaBuilder();

	schemaBuilder.addObject(object);

	const newSchema = schemaBuilder.toSchema();
};
