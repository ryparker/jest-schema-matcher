import Ajv, {ValidateFunction} from 'ajv';
import {matcherHint, printExpected, printReceived} from 'jest-matcher-utils';

import SchemaBuilder from 'schematized';
import chalk from 'chalk';
import diff from 'variable-diff';
import fs from 'fs';
import path from 'path';
import prettyFormat from 'pretty-format';
import _ from 'lodash';

interface CustomNodeJsGlobal extends NodeJS.Global {
	SHOULD_UPDATE_SCHEMAS: boolean;
}

declare const global: CustomNodeJsGlobal;

const {SHOULD_UPDATE_SCHEMAS} = global;

/**
 * This ensures that a value matches the most recent JSON schema.
 * Check out the [README](https://github.com/ryparker/jest-schema-matcher) for more information.
 * @param object - Valid object or array
 * @param schemaName - Name of the schema file to generate/validate.
 */
export default function toMatchSchema(object: any, schemaName: string) {
	if (!_.isObjectLike(object)) {
		throw new TypeError(`Expected a valid object but received ${typeof object}: ${object}`);
	}

	const failureMessages: string[] = [];

	const schemaPath = findSchema(this.testPath, schemaName);

	let schema = readSchema(schemaPath);

	if (schema) {
		const schemaDiffCheck = checkForSchemaChanges(
			schemaName,
			schemaPath,
			schema,
			object
		);

		if (schemaDiffCheck.updated) {
			schema = readSchema(schemaPath);
		}

		if (schemaDiffCheck.failures) {
			failureMessages.unshift(...schemaDiffCheck.failures);
		}

		const validationFailures = validateAgainstSchema(schema, object);

		if (validationFailures) {
			failureMessages.unshift(...validationFailures);
		}
	}

	if (!schema) {
		schema = generateSchema(schemaName, object);
		writeSchema(schemaPath, schema);
	}

	const pass = failureMessages.length === 0;

	const matcherOptions = {
		// Comment: 'Using AJV schema validator.',
		isNot: this.isNot,
		promise: this.promise
	};

	const title =
		chalk.inverse.bold('JSON schema matcher') +
		': ' +
		matcherHint('toMatchSchema', 'received', 'schema', matcherOptions);

	failureMessages.unshift(title);

	return {
		name: 'toMatchSchema',
		message: () => failureMessages.join('\n'),
		pass,
		schema
	};
}

function writeSchema(path: string, schema: Record<string, any>) {
	const s =
		typeof schema === 'string' ? schema : JSON.stringify(schema, null, 2);

	fs.writeFileSync(path, s);
}

function readSchema(path: string) {
	const fileExists = checkIfFileExists(path);

	if (!fileExists) {
		return null;
	}

	const schema = fs.readFileSync(path, 'utf-8');

	return typeof schema === 'string' ? JSON.parse(schema) : schema;
}

function checkIfFileExists(path: string) {
	return fs.existsSync(path);
}

function findSchema(testPath: string, schemaName: string) {
	const testDir = testPath.replace(/(?<=\/)[\w-.]*\.test\.ts/gm, '');

	const schemaDir = path.resolve(testDir, 'schemas');

	const dirExists = checkIfFileExists(schemaDir);

	if (!dirExists) {
		fs.mkdirSync(schemaDir, {recursive: true});
	}

	const schemaFileName = schemaName + '.json';

	const schemaPath = path.resolve(schemaDir, schemaFileName);

	return schemaPath;
}

function checkForSchemaChanges(
	schemaName: string,
	schemaPath: string,
	schema: Record<string, any>,
	object: Record<string, unknown> | []
) {
	const newSchema = generateSchema(schemaName, object, schema);
	const schemaDiff = compareSchemas(schema, newSchema);

	if (schemaDiff.changed) {
		if (SHOULD_UPDATE_SCHEMAS) {
			writeSchema(schemaPath, newSchema);
			return {
				changes: true,
				updated: true,
				failures: []
			};
		}

		if (!SHOULD_UPDATE_SCHEMAS) {
			return {
				changes: true,
				updated: false,
				failures: [
					chalk.bold.red('JSON Schema Trainer: ') +
						chalk.yellow('Schema change is recommended:') +
						'\n\n' +
						schemaDiff.text +
						'\n\n'
				]
			};
		}
	}

	return {
		changes: false,
		updated: false,
		failures: []
	};
}

function compareSchemas(
	schemaA: Record<string, any>,
	schemaB: Record<string, any>
) {
	const clonedSchemaA = {...schemaA};
	const clonedSchemaB = {...schemaB};
	delete clonedSchemaA.examples;
	delete clonedSchemaB.examples;

	return diff(clonedSchemaA, clonedSchemaB);
}

function generateSchema(
	_schemaName: string,
	object: Record<string, any>,
	schema?: Record<string, any>
) {
	const schemaBuilder = new SchemaBuilder();

	if (schema) {
		schemaBuilder.addSchema(schema);
	}

	schemaBuilder.addObject(object);

	const newSchema = schemaBuilder.toSchema();

	return newSchema;
}

function createSchemaValidator(schema: Record<string, any>) {
	return new Ajv({schemaId: 'auto', allErrors: true}).compile(schema);
}

function validateAgainstSchema(schema: Record<string, any>, object: unknown) {
	const validator = createSchemaValidator(schema);
	const valid = validator(object);

	if (!valid) {
		return shapeValidationMessage(validator, object);
	}

	return null;
}

function shapeValidationMessage(validator: ValidateFunction, _object: unknown) {
	const {errors} = validator;

	if (!errors) {
		throw new Error('Unexpected error: AJV did not provide validation violation details.');
	}

	return errors.slice(0, 1).map(error => {
		const rejectedValue = prettyFormat(eval(`_object${error.dataPath}`));
		const expectedDetails = error.params;

		return (
			chalk.bold.yellow(error.keyword.toUpperCase()) +
			' violation:  ' +
			chalk.yellow(`received ${error.dataPath} ${error.message}.`) +
			'\n\n' +
			'Rejected value: ' +
			printReceived(rejectedValue) +
			'\n\n' +
			(expectedDetails ?
				'Expected: ' +
				chalk.red(prettyFormat(expectedDetails)) +
				'\n\n' :
				'') +
			chalk.dim('Schema rule: ' + printExpected(error.schemaPath)) +
			'\n\n'
		);
	});
}
