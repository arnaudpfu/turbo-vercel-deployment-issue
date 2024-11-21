import { Context as KoaContext } from 'koa';
import { MergeDeep } from 'type-fest';

export type Context<ParamKeys extends string | void = void, Body = unknown> = MergeDeep<
    KoaContext,
    {
        params: Record<ParamKeys, string | undefined>;
        request: {
            body: Partial<Body>;
            query: {
                [x: string]: string | string[] | undefined;
            } & Partial<{
                pagination: {
                    page: number;
                    pageSize: number;
                };
            }>;
        };
    }
>;

declare module 'koa' {
    // @ts-ignore attempt to override existing type
    type Context<ParamKeys = unknown, Body = unknown> = Context<ParamKeys, Body>;
}
