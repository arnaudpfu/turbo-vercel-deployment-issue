import { get } from 'lodash';
import { Paths } from 'type-fest';
import { AllCompanyRoles, Permissions } from '../company-roles/constants';

export const getRolesWithPermissions = (path: Paths<Permissions>): Array<keyof typeof AllCompanyRoles> => {
    // @ts-ignore
    return Object.keys(AllCompanyRoles).filter((role) => get(AllCompanyRoles[role], path)) as Array<
        keyof typeof AllCompanyRoles
    >;
};
