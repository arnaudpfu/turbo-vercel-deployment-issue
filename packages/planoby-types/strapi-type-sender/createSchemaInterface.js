const fs = require('fs');
const { pascalCase, isOptional, getSchemaNameFromTypeName, SCHEMA_PATTERN } = require('./utils');

const OPTIONAL_ZOD_KEY = 'nullable';

module.exports = (schemaPath, interfaceName, config) => {
    var schemaFile;
    var schema;
    try {
        schemaFile = fs.readFileSync(schemaPath, 'utf8');
        schema = JSON.parse(schemaFile);
    } catch (e) {
        console.log(`Skipping ${schemaPath}: could not parse schema`, e);
        return null;
    }

    const populatedSchemaName = 'relation' + interfaceName + SCHEMA_PATTERN;
    const schemaName = getSchemaNameFromTypeName(interfaceName);
    let needPopulatedSchema = false;
    let recursiveZodSchema = `export const ${populatedSchemaName} = z.object({\n`;

    let mainScript = '\n id: z.number(),\n documentId: z.string(),\n';

    const attributes = Object.entries(schema.attributes);
    for (const attribute of attributes) {
        let attributeName = attribute[0];
        const attributeValue = attribute[1];
        const optional = isOptional(attributeValue);
        const suffix = optional ? '.' + OPTIONAL_ZOD_KEY + '(),\n' : ',\n';
        let tsPropertyType;
        var tsProperty = '';
        let recursiveProperty = '';
        // -------------------------------------------------
        // Relation
        // -------------------------------------------------
        if (attributeValue.type === 'relation') {
            needPopulatedSchema = true;
            const lazyType = `z.lazy(() => ${getSchemaNameFromTypeName(
                attributeValue.target.includes('::user')
                    ? 'User'
                    : `${pascalCase(attributeValue.target.split('.')[1])}`
            )})`;
            const isArray = attributeValue.relation.endsWith('ToMany');
            const arrayMethod = isArray ? '.array()' : '';
            const optionalMethod = optional && !isArray ? '.' + OPTIONAL_ZOD_KEY + '()' : '';
            recursiveProperty = `${attributeName}: ${lazyType}${optionalMethod}${arrayMethod},\n`;
        }
        // -------------------------------------------------
        // Component
        // -------------------------------------------------
        else if (attributeValue.type === 'component') {
            needPopulatedSchema = true;
            const lazyType = `z.lazy(() => ${getSchemaNameFromTypeName(
                attributeValue.target === 'plugin::users-permissions.user'
                    ? 'User'
                    : pascalCase(attributeValue.component.split('.')[1])
            )})`;
            const isArray = attributeValue.repeatable;
            const arrayMethod = isArray ? '.array()' : '';
            const optionalMethod = optional && !isArray ? '.' + OPTIONAL_ZOD_KEY + '()' : '';
            recursiveProperty = `${attributeName}: ${lazyType}${optionalMethod}${arrayMethod},\n`;
        }
        // -------------------------------------------------
        // Dynamic zone
        // -------------------------------------------------
        else if (attributeValue.type === 'dynamiczone') {
            // TODO
            tsPropertyType = 'z.any()';
            tsProperty = `${attributeName}: ${tsPropertyType}` + suffix;
        }
        // -------------------------------------------------
        // Media
        // -------------------------------------------------
        else if (attributeValue.type === 'media') {
            needPopulatedSchema = true;
            // const isArray = attributeValue.repeatable;
            const isArray = attributeValue.multiple;
            const arrayMethod = isArray ? '.array()' : '';
            const optionalMethod = optional && !isArray ? '.' + OPTIONAL_ZOD_KEY + '()' : '';
            recursiveProperty = `${attributeName}: z.lazy(() => mediaSchema)${optionalMethod}${arrayMethod},\n`;
        }
        // -------------------------------------------------
        // Enumeration
        // -------------------------------------------------
        else if (attributeValue.type === 'enumeration') {
            const enumOptions = `z.enum([${attributeValue.enum.map((v) => `'${v}'`).join(', ')}])`;
            tsProperty = `${attributeName}: ${enumOptions}` + suffix;
        }
        // -------------------------------------------------
        // Text, RichText, Email, UID
        // -------------------------------------------------
        else if (
            attributeValue.type === 'string' ||
            attributeValue.type === 'text' ||
            attributeValue.type === 'richtext' ||
            attributeValue.type === 'email' ||
            attributeValue.type === 'uid'
        ) {
            tsPropertyType = 'z.string()';
            tsProperty = `${attributeName}: ${tsPropertyType}` + suffix;
        }
        // -------------------------------------------------
        // Json
        // -------------------------------------------------
        else if (attributeValue.type === 'json') {
            const jsonTable = config.jsonTable || {};
            if (jsonTable[attributeName]) {
                if (jsonTable[attributeName].needPopulatedSchema) {
                    needPopulatedSchema = true;
                    recursiveProperty = attributeName + ': ' + jsonTable[attributeName].value + suffix;
                } else {
                    tsProperty = attributeName + ': ' + jsonTable[attributeName].value + suffix;
                }
            } else {
                tsPropertyType = 'z.any()';
                tsProperty = `${attributeName}: ${tsPropertyType}` + suffix;
            }
        }
        // -------------------------------------------------
        // Password
        // -------------------------------------------------
        else if (attributeValue.type === 'password') {
            tsProperty = '';
        }
        // -------------------------------------------------
        // Number
        // -------------------------------------------------
        else if (
            attributeValue.type === 'integer' ||
            attributeValue.type === 'biginteger' ||
            attributeValue.type === 'decimal' ||
            attributeValue.type === 'float'
        ) {
            tsPropertyType = 'z.number()';
            tsProperty = `${attributeName}: ${tsPropertyType}` + suffix;
        }
        // -------------------------------------------------
        // Date
        // -------------------------------------------------
        else if (
            attributeValue.type === 'date' ||
            attributeValue.type === 'datetime' ||
            attributeValue.type === 'time'
        ) {
            // tsPropertyType = "z.date()";
            tsPropertyType = 'z.string()';
            tsProperty = `${attributeName}: ${tsPropertyType}` + suffix;
        }
        // -------------------------------------------------
        // Boolean
        // -------------------------------------------------
        else if (attributeValue.type === 'boolean') {
            tsPropertyType = 'z.boolean()';
            tsProperty = `${attributeName}: ${tsPropertyType}` + suffix;
        }
        // -------------------------------------------------
        // Others
        // -------------------------------------------------
        else {
            tsPropertyType = 'z.any()';
            tsProperty = `${attributeName}: ${tsPropertyType}` + suffix;
        }
        // console.log( tsProperty )
        mainScript += ` ${tsProperty}`;
        recursiveZodSchema += recursiveProperty;
    }
    // -------------------------------------------------
    // Localization
    // -------------------------------------------------
    if (schema.pluginOptions?.i18n?.localized) {
        needBaseInterface = true;
        mainScript += ` locale: z.string(),\n`;
        recursiveZodSchema += ` localizations: z.lazy(() => ${interfaceName}.array()).${OPTIONAL_ZOD_KEY}(),\n`;
    }

    mainScript += ` createdAt: z.string(),\n`;
    mainScript += ` updatedAt: z.string(),\n`;
    mainScript += ` publishedAt: z.string(),\n`;
    mainScript += `});\n`;

    mainScript = `\nexport const ${schemaName} = z.object({` + mainScript + '\n';

    mainScript += `export type ${interfaceName} = z.infer<typeof ${schemaName}>;\n\n`;

    if (needPopulatedSchema) {
        mainScript += `${recursiveZodSchema}})

export type Relation${interfaceName} = z.infer<typeof ${populatedSchemaName}>;\n\n`;
    }

    return mainScript;
};
