// Import Ajv from 'ajv';
// Import prettyFormat from 'pretty-format';

import {SchemaBuilder} from 'schematized';
import chalk from 'chalk';
import diff from 'variable-diff';
import fs from 'fs/promises';
import {matcherHint} from 'jest-matcher-utils';
import path from 'path';

declare global {
	namespace NodeJS {
		interface Global {
			TEST_DATA: Record<string, any>;
		}
	}
}

const {SHOULD_UPDATE_SCHEMAS} = global.TEST_DATA;

export async function toMatchSchema(response, schemaName) {
	const {data} = response;

	const failureMessages = [];

	const schemaPath = await findSchema(this.testPath, schemaName);

	let schema = await readSchema(schemaPath);

	if (schema) {
		const schemaChanges = await checkForSchemaChanges(
			schemaName,
			schemaPath,
			schema,
			data
		);
		if (schemaChanges) {
			failureMessages.unshift(schemaChanges);
		}

		// Const validationFailures = validateAgainstSchema(schema, data)
		// if (validationFailures) failureMessages.unshift(validationFailures)
	}

	if (!schema) {
		schema = generateSchema(schemaName, data);
		await writeSchema(schemaPath, schema);
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

async function writeSchema(path, schema) {
	const s =
		typeof schema === 'string' ? schema : JSON.stringify(schema, null, 2);

	await fs.writeFile(path, s);
}

async function readSchema(path) {
	const fileExists = await checkIfFileExists(path);

	if (!fileExists) {
		return null;
	}

	const schema = await fs.readFile(path, 'utf-8');

	const s = typeof schema === 'string' ? JSON.parse(schema) : schema;

	return s;
}

async function checkIfFileExists(path) {
	try {
		await fs.access(path);
		return true;
	} catch {
		return false;
	}
}

async function findSchema(testPath, schemaName) {
	const testDir = testPath.match(/.*\/(?=.+js)/)[0];
	const schemaDir = path.resolve(testDir, 'schemas');

	const dirExists = await checkIfFileExists(schemaDir);

	if (!dirExists) {
		await fs.mkdir(schemaDir, {recursive: true});
	}

	const schemaFileName = schemaName + '.json';

	const schemaPath = path.resolve(schemaDir, schemaFileName);

	return schemaPath;
}

async function checkForSchemaChanges(schemaName, schemaPath, schema, data) {
	const newSchema = await generateSchema(schemaName, data, schema);

	const schemaDiff = compareSchemas(schema, newSchema);

	if (schemaDiff.changed) {
		if (SHOULD_UPDATE_SCHEMAS) {
			await writeSchema(schemaPath, newSchema);
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

function generateSchema(_schemaName, data, schema = {}) {
	const schemaBuilder = new SchemaBuilder();

	if (schema) {
		schemaBuilder.addSchema(schema);
	}

	schemaBuilder.addObject(data);

	const newSchema = schemaBuilder.toSchema();

	return newSchema;
}

// Function createSchemaValidator(schema) {
// 	const ajv = new Ajv({schemaId: 'auto', allErrors: true});

// 	return ajv.compile(schema);
// }

// Function validateAgainstSchema(schema, data) {
// 	const validator = createSchemaValidator(schema);
// 	const valid = validator(data);

// 	if (!valid) {
// 		return shapeValidationMessage(validator, data);
// 	}
// }

// function shapeValidationMessage(validator, _data) {
// 	const {errors} = validator;

// 	return errors.map(error => {
// 		const rejectedValue = prettyFormat(eval(`_data${error.dataPath}`));
// 		const allowedValues = error?.params.allowedValues;

// 		return (
// 			chalk.bold.yellow(`${error.keyword.toUpperCase()}`) +
// 			' violation:  ' +
// 			chalk.yellow(`received${error.dataPath} ${error.message}.`) +
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
