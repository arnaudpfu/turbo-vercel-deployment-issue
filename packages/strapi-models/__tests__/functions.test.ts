import { parseAPIUrl } from '../src/utils/functions';
describe('strapi models functions', () => {
    // test parseAPIUrl

    it('should parse API URL', () => {
        const url =
            'api/company-settings/findByCompany/1?filters[$or][0][slug]=currency&pagination[page]=1&pagination[pageSize]=20&sort=name:asc';
        const result = parseAPIUrl(url);
        expect(result).toEqual(['company-settings', 'findByCompany', '1']);
    });

    it('should throw error for invalid API URL', () => {
        const url =
            'company-settings/findByCompany/1?filters[$or][0][slug]=currency&pagination[page]=1&pagination[pageSize]=20&sort=name:asc';
        expect(() => parseAPIUrl(url)).toThrow('Invalid API URL');
    });
});
