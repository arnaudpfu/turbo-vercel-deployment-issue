import { ErrorPayload, FormatAPIRestData, Payload, AppApiRoute, ValidPayload } from '@internalpackage/types';

type UserData = {
    user: {
        id: string;
        username: string;
    };
    jwt: string;
};

export interface RequestOptions<Url extends string, Data> {
    relativeUrl: Url;
    jwt?: string;
    data?: FormatAPIRestData<Data>;
    doNotWrap?: boolean;
    isFormData?: boolean;
}

export class RequestHelper {
    private static async fetchJSON<T>(url: string, options: RequestInit = {}): Promise<T> {
        try {
            const response = await fetch(url, options);
            if (response.statusText === 'No Content') {
                return { data: {} } as T;
            }

            return (await response.json()) as T;
        } catch (error) {
            console.log('url');
            console.log(url);
            console.log('options');
            console.log(options);
            this.logError(error);
            throw new Error('Error occurred trying to fetch data in Api::fetchJSON');
        }
    }

    private static async logError<D>(error: D) {
        const message =
            typeof error === 'string'
                ? error
                : (error as { message?: string })?.message
                  ? (error as { message: string }).message
                  : 'Please check the console for more information.';
        console.warn('RequestError : ' + message);
        console.log(error);
    }

    private static verifyPayload<Data>(payload: Payload<Data>): ValidPayload<Data> {
        if (payload.data === null) {
            const { error } = payload as ErrorPayload;
            if (error !== undefined) {
                console.log('An error appeared verifying the payload.');

                if (typeof error === 'string') {
                    this.logError(error);
                    throw new Error(error);
                }

                // @ts-ignore
                if (error.status === 401) {
                    this.logError(error.message || 'You must be logged in to access this resource.');
                    throw new Error(error.message || 'You must be logged in to access this resource.');
                }

                this.logError(error.message || 'REST API fetch returned an error.');
                throw new Error(error.message || 'REST API fetch returned an error.');
            }
            throw new Error('REST API fetch returned data null without error.');
        }

        return payload as ValidPayload<Data>;
    }

    private static async request<Url extends string, Method extends 'POST' | 'GET' | 'PUT' | 'DELETE'>(
        method: Method,
        options: RequestOptions<Url, AppApiRoute<Url, Method>['data']>
    ): Promise<ValidPayload<AppApiRoute<Url, Method>['response']>> {
        const res = await this.fetchJSON<Payload<Response>>(
            process.env.NEXT_PUBLIC_STRAPI_URL + options.relativeUrl,
            {
                method: method,
                headers: {
                    ...(options.isFormData ? {} : { 'Content-Type': 'application/json' }),
                    ...(options.jwt !== undefined ? { Authorization: `Bearer ${options.jwt}` } : {}),
                },
                body: options.data
                    ? options.isFormData
                        ? (options.data as unknown as FormData)
                        : JSON.stringify(options.doNotWrap ? options.data : { data: options.data })
                    : undefined,
            }
        );

        return this.verifyPayload(res);
    }

    public static async post<Url extends string>(
        options: RequestOptions<Url, AppApiRoute<Url, 'POST'>['data']>
    ): Promise<ValidPayload<AppApiRoute<Url, 'POST'>['response']>> {
        return this.request<Url, 'POST'>('POST', options);
    }

    public static async get<Url extends string>(
        options: RequestOptions<Url, AppApiRoute<Url, 'GET'>['data']>
    ): Promise<ValidPayload<AppApiRoute<Url, 'GET'>['response']>> {
        return this.request<Url, 'GET'>('GET', options);
    }

    public static async put<Url extends string>(
        options: RequestOptions<Url, AppApiRoute<Url, 'PUT'>['data']>
    ): Promise<ValidPayload<AppApiRoute<Url, 'PUT'>['response']>> {
        return this.request<Url, 'PUT'>('PUT', options);
    }

    public static async delete<Url extends string>(
        options: RequestOptions<Url, AppApiRoute<Url, 'DELETE'>['data']>
    ): Promise<ValidPayload<AppApiRoute<Url, 'DELETE'>['response']>> {
        return this.request<Url, 'DELETE'>('DELETE', options);
    }

    /**
     * Close to get, but will make sure that all data is loaded by passing throw the pagniation object.
     *
     * @param options
     * @returns
     */
    public static async load<Url extends string>(
        {
            relativeUrl,
            onLoad,
            setProgress,
            data,
            ...options
        }: RequestOptions<Url, AppApiRoute<Url, 'GET'>['data']> & {
            onLoad: (data: ValidPayload<AppApiRoute<Url, 'GET'>['response']>) => void;
            setProgress?: (v: number) => void;
            jwt?: string;
            data?: unknown;
        },
        pageSize = 20
    ): Promise<void> {
        const isPostRequest = data !== undefined;
        let pageIndex = 1;
        const firstRes = await this.request<Url, 'GET'>((isPostRequest ? 'POST' : 'GET') as 'GET', {
            relativeUrl:
                `${relativeUrl}&pagination[page]=${pageIndex}&pagination[pageSize]=${pageSize}&sort=id:asc` as Url,
            data,
            ...options,
        });
        onLoad(firstRes);
        setProgress?.(40);

        for (pageIndex = 2; pageIndex <= firstRes.meta.pagination.pageCount; pageIndex++) {
            const res = await this.request<Url, 'GET'>((isPostRequest ? 'POST' : 'GET') as 'GET', {
                relativeUrl:
                    `${relativeUrl}&pagination[page]=${pageIndex}&pagination[pageSize]=${pageSize}&sort=id:asc` as Url,
                data,
                ...options,
            });
            onLoad(res);
            setProgress?.(40 + (pageIndex / firstRes.meta.pagination.pageCount) * 60);
        }

        setProgress?.(100);
    }

    public static async postAuth<Url extends string>(
        options: RequestOptions<Url, AppApiRoute<Url, 'POST'>['data']> &
            Pick<Required<RequestOptions<Url, AppApiRoute<Url, 'POST'>['data']>>, 'jwt'>
    ): Promise<ValidPayload<AppApiRoute<Url, 'POST'>['response']>> {
        return this.post<Url>(options);
    }

    public static async getAuth<Url extends string>(
        options: RequestOptions<Url, AppApiRoute<Url, 'GET'>['data']> &
            Pick<Required<RequestOptions<Url, AppApiRoute<Url, 'GET'>['data']>>, 'jwt'>
    ): Promise<ValidPayload<AppApiRoute<Url, 'GET'>['response']>> {
        return this.get<Url>(options);
    }

    public static async putAuth<Url extends string>(
        options: RequestOptions<Url, AppApiRoute<Url, 'PUT'>['data']> &
            Pick<Required<RequestOptions<Url, AppApiRoute<Url, 'PUT'>['data']>>, 'jwt'>
    ): Promise<ValidPayload<AppApiRoute<Url, 'PUT'>['response']>> {
        return this.put<Url>(options);
    }

    public static async deleteAuth<Url extends string>(
        options: RequestOptions<Url, AppApiRoute<Url, 'DELETE'>['data']> &
            Pick<Required<RequestOptions<Url, AppApiRoute<Url, 'DELETE'>['data']>>, 'jwt'>
    ): Promise<ValidPayload<AppApiRoute<Url, 'DELETE'>['response']>> {
        return this.delete<Url>(options);
    }

    /**
     * Close to get, but will make sure that all data is loaded by passing throw the pagniation object.
     *
     * @param options
     * @returns
     */
    public static async loadAuth<Url extends string>(
        options: RequestOptions<Url, AppApiRoute<Url, 'GET'>['data']> &
            Pick<Required<RequestOptions<Url, AppApiRoute<Url, 'GET'>['data']>>, 'jwt'> & {
                onLoad: (data: ValidPayload<AppApiRoute<Url, 'GET'>['response']>) => void;
                setProgress?: (v: number) => void;
                data?: unknown;
            },
        pageSize = 20
    ): Promise<void> {
        await RequestHelper.load<Url>(options, pageSize);
    }

    /**
     * Log in with the token provided by Google.
     *
     * @throws {Error} - If the token is invalid
     *
     * @param token Params (id_token & access_token) provided by Google
     * @return {Promise<UserData | undefined>} - The user data | undefined if the token is invalid
     */
    public static async loadGoogleUser(params: string): Promise<UserData | undefined> {
        const res = await this.fetchJSON<UserData>(
            `${process.env.NEXT_PUBLIC_STRAPI_URL}/auth/google/callback?${params}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (res.jwt) {
            return res;
        }

        console.log('res load google user');
        console.log(res);

        process.env.NODE_ENV !== 'production' && console.warn(res, 'Invalid token');
        return undefined;
    }
}
