// Import Ajv from 'ajv';
// Import prettyFormat from 'pretty-format';

import {SchemaBuilder} from 'schematized';
import chalk from 'chalk';
import diff from 'variable-diff';
import fs from 'fs';
import {matcherHint} from 'jest-matcher-utils';
import path from 'path';

interface CustomNodeJsGlobal extends NodeJS.Global {
	TEST_DATA: {SHOULD_UPDATE_SCHEMAS: boolean};
}

declare const global: CustomNodeJsGlobal;

const {SHOULD_UPDATE_SCHEMAS} = global.TEST_DATA;

export function toMatchSchema(object, schemaName) {
	const failureMessages = [];

	const schemaPath = findSchema(this.testPath, schemaName);

	let schema = readSchema(schemaPath);

	if (schema) {
		const schemaChanges = checkForSchemaChanges(
			schemaName,
			schemaPath,
			schema,
			object
		);
		if (schemaChanges) {
			failureMessages.unshift(schemaChanges);
		}

		// Const validationFailures = validateAgainstSchema(schema, object)
		// if (validationFailures) failureMessages.unshift(validationFailures)
	}

	if (!schema) {
		schema = generateSchema(schemaName, object);
		writeSchema(schemaPath, schema);
	}

	const pass = failureMessages.length === 0;

	const matcherOptions = {
		comment: 'Using AJV schema validator.',
		isNot: this.isNot,
		promise: this.promise
	};

	const title =
		chalk.inverse.bold('JSON schema matcher') +
		': ' +
		matcherHint('toMatchSchema', 'received', 'schema', matcherOptions);

	failureMessages.unshift(title);

	return {
		message: () => {
			return failureMessages.join('\n\n');
		},
		pass,
		schema
	};
}

function writeSchema(path, schema) {
	const s =
		typeof schema === 'string' ? schema : JSON.stringify(schema, null, 2);

	fs.writeFileSync(path, s);
}

function readSchema(path) {
	const fileExists = checkIfFileExists(path);

	if (!fileExists) {
		return null;
	}

	const schema = fs.readFileSync(path, 'utf-8');

	const s = typeof schema === 'string' ? JSON.parse(schema) : schema;

	return s;
}

function checkIfFileExists(path) {
	try {
		fs.existsSync(path);
		return true;
	} catch {
		return false;
	}
}

function findSchema(testPath, schemaName) {
	const testDir = testPath.match(/.*\/(?=.+ts)/)[0];
	const schemaDir = path.resolve(testDir, 'schemas');

	const dirExists = checkIfFileExists(schemaDir);

	if (!dirExists) {
		fs.mkdirSync(schemaDir, {recursive: true});
	}

	const schemaFileName = schemaName + '.json';

	const schemaPath = path.resolve(schemaDir, schemaFileName);

	return schemaPath;
}

function checkForSchemaChanges(schemaName, schemaPath, schema, object) {
	const newSchema = generateSchema(schemaName, object, schema);

	const schemaDiff = compareSchemas(schema, newSchema);

	if (schemaDiff.changed) {
		if (SHOULD_UPDATE_SCHEMAS) {
			writeSchema(schemaPath, newSchema);
		}

		if (!SHOULD_UPDATE_SCHEMAS) {
			return [
				chalk.bold.red('JSON Schema Trainer: ') +
					chalk.yellow('Schema change is recommended:') +
					'\n\n' +
					schemaDiff.text +
					'\n\n'
			];
		}
	}

	return undefined;
}

function compareSchemas(schemaA, schemaB) {
	const clonedSchemaA = {...schemaA};
	const clonedSchemaB = {...schemaB};
	delete clonedSchemaA.examples;
	delete clonedSchemaB.examples;

	return diff(clonedSchemaA, clonedSchemaB);
}

function generateSchema(_schemaName, object, schema = {}) {
	const schemaBuilder = new SchemaBuilder();

	if (schema) {
		schemaBuilder.addSchema(schema);
	}

	schemaBuilder.addObject(object);

	const newSchema = schemaBuilder.toSchema();

	return newSchema;
}

// Function createSchemaValidator(schema) {
// 	const ajv = new Ajv({schemaId: 'auto', allErrors: true});

// 	return ajv.compile(schema);
// }

// Function validateAgainstSchema(schema, object) {
// 	const validator = createSchemaValidator(schema);
// 	const valid = validator(object);

// 	if (!valid) {
// 		return shapeValidationMessage(validator, object);
// 	}
// }

// function shapeValidationMessage(validator, _object) {
// 	const {errors} = validator;

// 	return errors.map(error => {
// 		const rejectedValue = prettyFormat(eval(`_object${error.objectPath}`));
// 		const allowedValues = error?.params.allowedValues;

// 		return (
// 			chalk.bold.yellow(`${error.keyword.toUpperCase()}`) +
// 			' violation:  ' +
// 			chalk.yellow(`received${error.objectPath} ${error.message}.`) +
// 			'\n\n' +
// 			'Rejected value: ' +
// 			printReceived(rejectedValue) +
// 			'\n\n' +
// 			(
// 				allowedValues ?
// 					chalk.dim('Allowed values: ') +
// 				chalk.dim.green(prettyFormat(allowedValues)) +
// 				'\n\n' :
// 					''
// 			) +
// 			chalk.dim('Schema rule: ' + printExpected(error.schemaPath))
// 		);
// 	});
// }