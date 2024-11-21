#!/usr/bin/env node

const fs = require('fs');
const createInterface = require('./createSchemaInterface');
const createComponentInterface = require('./createComponentInterface.untested');
const { pascalCase } = require('./utils');

const typesDir = 'types';

if (!fs.existsSync(typesDir)) fs.mkdirSync(typesDir);

const config = fs.existsSync('./strapi-type-sender/config-type.json')
    ? JSON.parse(fs.readFileSync('./strapi-type-sender/config-type.json', 'utf8'))
    : {};

let defaultImport = 'import { z } from "zod";\n';
var content = defaultImport + (config.hook && config.hook.import ? config.hook.import : '');
const path = config.strapiPath ? config.strapiPath + '/' : '';

// --------------------------------------------
// User
// --------------------------------------------

const userTsInterface = createInterface(
    path + `./src/extensions/users-permissions/content-types/user/schema.json`,
    'User',
    config,
    true
);

content += userTsInterface + '\n';

// --------------------------------------------
// MediaFormat
// --------------------------------------------

var mediaFormatTsInterface = `export const mediaFormatSchema = z.object({
  name: z.string(),
  hash: z.string(),
  ext: z.string(),
  mime: z.string(),
  width: z.number(),
  height: z.number(),
  size: z.number(),
  path: z.string(),
  url: z.string(),
});

export type MediaFormat = z.infer<typeof mediaFormatSchema>;

`;

content += mediaFormatTsInterface;

// --------------------------------------------
// Media
// --------------------------------------------

var mediaTsInterface = `export const mediaSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  name: z.string(),
  alternativeText: z.string(),
  caption: z.string(),
  width: z.number(),
  height: z.number(),
  formats: z.object({
    thumbnail: mediaFormatSchema,
    medium: mediaFormatSchema,
    small: mediaFormatSchema,
  }),
  hash: z.string(),
  ext: z.string(),
  mime: z.string(),
  size: z.number(),
  url: z.string(),
  previewUrl: z.string(),
  provider: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Media = z.infer<typeof mediaSchema>;
`;

content += mediaTsInterface;

content += '// Content Types\n';

// --------------------------------------------
// API Types
// --------------------------------------------

var apiFolders;
try {
    apiFolders = fs.readdirSync(path + './src/api').filter((x) => !x.startsWith('.'));
} catch (e) {
    console.log('No API types found. Skipping...');
}

if (apiFolders) {
    const contentTypeNames = {
        user: 'User',
    };

    for (const apiFolder of apiFolders) {
        const interfaceName = pascalCase(apiFolder);
        const strInterface = createInterface(
            path + `./src/api/${apiFolder}/content-types/${apiFolder}/schema.json`,
            interfaceName,
            config
        );
        if (strInterface) {
            content += strInterface;
            // contentTypeNames.push(interfaceName);
            contentTypeNames[apiFolder] = interfaceName;
        }
    }

    if (Object.keys(contentTypeNames).length > 0) {
        content += 'export type AppContentTypes = {\n';
        for (const contentTypeName in contentTypeNames) {
            content += `    "${contentTypeName.endsWith('y') ? contentTypeName.slice(0, -1) + 'ies' : contentTypeName + 's'}": ${contentTypeNames[contentTypeName]},\n`;
        }
        content += '};\n\n';

        // content += `type PlanobyContentType = ${Object.values(contentTypeNames).join(' | ')};\n\n`;
        content += `export type PopulatedList<CT extends ValueOf<AppContentTypes>> = ${Object.values(
            contentTypeNames
        )
            .map((x) => `CT extends ${x} ? Relation${x}`)
            .join(' : ')} : CT extends Media ? Media : never;\n\n`;
        content += `export type Populated<
    CT extends ValueOf<AppContentTypes>,
    K extends keyof PopulatedList<CT> = keyof PopulatedList<CT>,
> = CT & { [P in K]: PopulatedList<CT>[P] };`;
    }
}

// --------------------------------------------
// Components
// --------------------------------------------

var componentCategoryFolders;
try {
    componentCategoryFolders = fs.readdirSync(path + './src/components');
} catch (e) {
    console.log('No Component types found. Skipping...');
}

if (componentCategoryFolders) {
    const targetFolder = path + './types/components';

    if (!fs.existsSync(targetFolder)) fs.mkdirSync(targetFolder);

    for (const componentCategoryFolder of componentCategoryFolders) {
        var componentSchemas = fs.readdirSync(path + `./src/components/${componentCategoryFolder}`);
        for (const componentSchema of componentSchemas) {
            const interfaceName = pascalCase(componentSchema.replace('.json', ''));
            const strInterface = createComponentInterface(
                path + `./src/components/${componentCategoryFolder}/${componentSchema}`,
                interfaceName
            );
            if (strInterface) content += strInterface;
        }
    }
}

const targetFolder = process.argv[2] || 'strapi-extra-types.ts';

// const replacer = config.replace;

// // if (replacer) {
// //   for (const keyToReplace in replacer) {
// //     for (const keyToFind in replacer[keyToReplace]) {
// //       const valueToReplace = replacer[keyToReplace][keyToFind];
// //       content = content.replace(
// //         new RegExp(`(\\s*)${keyToFind}(\\s*:\\s*)${keyToReplace}(\\s*;)`, "g"),
// //         `$1${keyToFind}$2${valueToReplace}$3`
// //       );
// //     }
// //   }
// // }

content += config.hook && config.hook.after ? config.hook.after : '';

fs.writeFileSync(targetFolder, content);
