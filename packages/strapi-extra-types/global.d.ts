import type { Core } from '@strapi/strapi';

declare global {
    // @ts-ignore
    const strapi: Core.Strapi;
}
