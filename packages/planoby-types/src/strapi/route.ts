import { ValueOf } from 'type-fest';
import {
    Booking,
    Checkout,
    CompanyRole,
    CompanySetting,
    Notification,
    ParticipantDataSchema,
    AppContentTypes,
    Populated,
    Service,
    Slot,
    UserSetting,
} from '../api';
import { ClientContentType } from '../utility-types';

interface EditAgendaSlot extends ClientContentType<Populated<Slot>> {
    bookings: Record<string, Booking[]>;
}

interface CheckoutSlot extends Populated<Slot> {
    bookingsCount?: Record<string, number>;
}

type FindMany<CT extends ValueOf<AppContentTypes>> = {
    data: void;
    response: CT[];
};
type FindOne<CT extends ValueOf<AppContentTypes>> = {
    data: void;
    response: CT;
};
type Create<CT extends ValueOf<AppContentTypes>> = {
    data: CT;
    response: CT;
};
type Update<CT extends ValueOf<AppContentTypes>> = {
    data: CT;
    response: CT;
};
type Delete<CT extends ValueOf<AppContentTypes>> = {
    data: void;
    response: CT;
};

export type APIRoutes = {
    users: {
        POST: {};
        GET: {};
        PUT: {};
        DELETE: {};
    };
    bookings: {
        POST: {
            'create-stripe-setup': {
                data: void;
                response: { clientSecret: string; setupIntent: string };
            };
            'send-recap-email': {
                data: {
                    companyDocID: string;
                    content: {
                        title?: string;
                        paragraph: string;
                        subject: string;
                        hideMailContent?: boolean;
                    };
                };
                response: { state: 'success' };
            };
        };
        GET: {
            findByCompany: FindMany<Booking>;
        };
        PUT: {
            'confirm-stripe-setup': {
                data: { setupIntentId: string };
                response: { status: Booking['status'] };
            };
            charge: {
                data: { amount: number };
                response: { paymentIntent: string; api: Booking };
            };
        };
        DELETE: {};
    };
    checkouts: {
        POST: {};
        GET: {
            findByCompany: FindMany<Checkout>;
        };
        PUT: {};
        DELETE: {};
    };
    companies: {
        POST: {
            upload: {
                data: any;
                response: any;
            };
        };
        GET: {};
        PUT: {};
        DELETE: {
            deleteFile: {
                data: void;
                response: any;
            };
        };
    };
    'company-roles': {
        POST: {
            acceptInvitation: Create<CompanyRole>;
        };
        GET: {
            findByCompany: FindMany<CompanyRole>;
            mine: FindMany<CompanyRole>;
        };
        PUT: {};
        DELETE: {
            declineInvitation: Delete<CompanyRole>;
        };
    };
    'company-settings': {
        POST: {
            'sync-stripe': {
                data: {
                    stripeKey?: string;
                };
                response: {
                    state?: 'success';
                    error?: string;
                };
            };
            'verify-email-provider': {
                data: {
                    service?: 'gmail' | 'planoby';
                    auth?: {
                        user?: string;
                        pass?: string;
                    };
                };
                // response: { state: 'success'; error?: string };
                response: {
                    success?: true;
                    error?: any;
                };
            };
        };
        PUT: {
            bulk: {
                data: CompanySetting[];
                response: CompanySetting[];
            };
        };
        GET: {
            findByCompany: FindMany<CompanySetting>;
        };
        DELETE: {};
    };
    notifications: {
        POST: {};
        PUT: {
            hasBeenRead: {
                data: Notification[];
                response: Notification[];
            };
        };
        GET: {
            countUnread: {
                data: void;
                response: number;
            };
        };
        DELETE: {};
    };
    'participant-data-schemas': {
        POST: {};
        PUT: {};
        GET: {
            findByCompany: FindMany<ParticipantDataSchema>;
        };
        DELETE: {};
    };
    services: {
        POST: {};
        PUT: {};
        GET: {
            findByCompany: FindMany<Service>;
        };
        DELETE: {};
    };
    slots: {
        POST: {
            requested: Create<Slot>;
        };
        GET: {
            // technically it is a POST request @todo: fix this
            findForAgenda: {
                data: { days: string[] };
                response: EditAgendaSlot[];
            };
            // technically it is a POST request @todo: fix this
            findForCheckout: {
                data: { days: string[] };
                response: CheckoutSlot[];
            };
            findByCompany: FindMany<Slot>;
        };
        PUT: {
            merge: {
                data: {
                    slotDestination: EditAgendaSlot;
                    slotToMerge: EditAgendaSlot;
                };
                response: EditAgendaSlot;
            };
            move: {
                data: {
                    slotDocID: string;
                    date: string;
                    start: string;
                    end: string;
                };
                response: Populated<Slot>;
            };
        };
        DELETE: {};
    };
    'user-settings': {
        POST: {};
        PUT: {
            bulk: {
                data: UserSetting[];
                response: UserSetting[];
            };
        };
        GET: {};
        DELETE: {};
    };
};

// to implement once typescript @issue sloved: Literal String Union Autocomplete #29729 https://github.com/microsoft/TypeScript/issues/29729
// export type BasicStringAPIEndpoint<
//     CT extends keyof APIRoutes,
//     Method extends 'POST' | 'PUT' | 'GET' | 'DELETE',
// > = Method extends 'POST'
//     ? `/${CT}`
//     : Method extends 'PUT'
//       ? `/${CT}/${string}`
//       : Method extends 'GET'
//         ? `/${CT}` | `/${CT}/${string}`
//         : Method extends 'DELETE'
//           ? `/${CT}/${string}`
//           : never;

// type A = '[params]'

// export type CustomStringAPIEndpoint<
//     CT extends keyof APIRoutes,
//     Method extends 'POST' | 'PUT' | 'GET' | 'DELETE',
// > = ValueOf<{
//     [key in keyof APIRoutes[CT][Method] & string]: `/${CT}/${key}${A}`;
// }>;

// /content-types/route/documentId
type HandleDocIdUrl<
    Method extends 'POST' | 'PUT' | 'GET' | 'DELETE',
    CT extends keyof APIRoutes,
> = Method extends 'PUT'
    ? Update<AppContentTypes[CT]>
    : Method extends 'GET'
      ? FindOne<AppContentTypes[CT]>
      : Method extends 'DELETE'
        ? Delete<AppContentTypes[CT]>
        : never;

// /content-types/route
type HandleSmallUrl<
    Method extends 'POST' | 'PUT' | 'GET' | 'DELETE',
    CT extends keyof APIRoutes,
> = Method extends 'POST'
    ? Create<AppContentTypes[CT]>
    : Method extends 'GET'
      ? FindMany<AppContentTypes[CT]>
      : never;

type ApiRouteShape = { data: unknown | void; response: unknown | void };

type PopulateApiRoute<Route extends ApiRouteShape, Accessors extends keyof ApiRouteShape> = Route & {
    [a in Accessors]: Route[a] extends (infer IndividualRoute)[]
        ? IndividualRoute extends ValueOf<AppContentTypes>
            ? Populated<IndividualRoute>[]
            : Route[a]
        : Route[a] extends ValueOf<AppContentTypes>
          ? Populated<Route[a]>
          : Route[a];
};

type IsUrlPopulatedRoute<
    Url extends string,
    Route extends ApiRouteShape,
> = Url extends `${string}populate=*${string}` ? PopulateApiRoute<Route, 'data' | 'response'> : Route;

export type AppApiRoute<
    Url extends string,
    Method extends 'POST' | 'PUT' | 'GET' | 'DELETE',
> = Url extends `/${infer CT extends keyof APIRoutes}/${infer Path}`
    ? keyof APIRoutes[CT][Method] extends string
        ? Path extends `${infer StringRoute extends keyof APIRoutes[CT][Method]}`
            ? APIRoutes[CT][Method][StringRoute] extends ApiRouteShape
                ? IsUrlPopulatedRoute<Url, APIRoutes[CT][Method][StringRoute]>
                : never
            : Path extends `${infer StringRoute extends keyof APIRoutes[CT][Method]}/${string}`
              ? APIRoutes[CT][Method][StringRoute] extends ApiRouteShape
                  ? IsUrlPopulatedRoute<Url, APIRoutes[CT][Method][StringRoute]>
                  : never
              : Path extends `${infer StringRoute extends keyof APIRoutes[CT][Method]}?${string}`
                ? APIRoutes[CT][Method][StringRoute] extends ApiRouteShape
                    ? IsUrlPopulatedRoute<Url, APIRoutes[CT][Method][StringRoute]>
                    : never
                : IsUrlPopulatedRoute<Url, HandleDocIdUrl<Method, CT>>
        : never
    : Url extends `/${infer CT extends keyof APIRoutes}`
      ? IsUrlPopulatedRoute<Url, HandleSmallUrl<Method, CT>>
      : Url extends `/${infer CT extends keyof APIRoutes}?${string}`
        ? IsUrlPopulatedRoute<Url, HandleSmallUrl<Method, CT>>
        : never;
