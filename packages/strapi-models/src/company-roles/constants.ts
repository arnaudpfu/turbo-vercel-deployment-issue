import contributor from './roles/contributor.json';
import editor from './roles/editor.json';
import owner from './roles/owner.json';
import secretary from './roles/secretary.json';

export type Permissions = typeof owner;

export type PermissionKeys = keyof Permissions;

// sorted in order of importance
export const COMPANY_ROLES = ['owner', 'editor', 'secretary', 'contributor'] as const;
export type CompanyRoleSlugs = (typeof COMPANY_ROLES)[number];

export const AllCompanyRoles: {
    [slug in CompanyRoleSlugs]: Permissions;
} = {
    owner: owner,
    editor: editor,
    secretary: secretary,
    contributor: contributor,
};
