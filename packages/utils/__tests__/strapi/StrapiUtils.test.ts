import { StrapiUtils } from '../../src/strapi/StrapiUtils';

describe('StrapiUtils', () => {
    it('should extract documentId', () => {
        const data = { documentId: 'ldjfhslfjsd' };
        expect(StrapiUtils.extractDocID(data)).toEqual('ldjfhslfjsd');
    });

    it('should extract documentId', () => {
        const data = { data: { documentId: '2' } };
        expect(StrapiUtils.extractDocID(data)).toEqual('2');
    });

    it('should extract documentId', () => {
        const data = '3';
        expect(StrapiUtils.extractDocID(data)).toEqual('3');
    });

    it('should extract documentId', () => {
        const data = { data: { documentId: '6' } };
        expect(StrapiUtils.extractDocID(data)).toEqual('6');
    });

    it('should extract documentId', () => {
        const data = undefined;
        expect(StrapiUtils.extractDocID(data)).toEqual(null);
    });
});
