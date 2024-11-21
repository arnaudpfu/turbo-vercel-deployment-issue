export interface Pagination {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
}

export type ValidPayload<T> = {
    data: NonNullable<T>;
    meta: {
        pagination: Pagination;
    };
};

export type ErrorPayload = {
    data: null;
    error:
        | {
              message: string;
              name: string;
              status: number;
              details: unknown;
          }
        | Error;
};

export type Payload<T> = ValidPayload<T> | ErrorPayload;

export type ClientContentType<T> = T & {
    id: number | null;
};
