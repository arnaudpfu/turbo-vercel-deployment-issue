import { formatTimeDifference } from '../src/time';
describe('Time check', () => {
    // test format time difference
    it('formatTimeDifference should be "just now"', () => {
        const now = new Date();
        const dtObject = new Date(now.getTime() - 1000);
        expect(formatTimeDifference(dtObject.toISOString())).toEqual('just now');
    });

    it('formatTimeDifference should be "1 minute ago"', () => {
        const now = new Date();
        const dtObject = new Date(now.getTime() - 62000);
        expect(formatTimeDifference(dtObject.toISOString())).toEqual('1 minute ago');
    });

    it('formatTimeDifference should be "2 minutes ago"', () => {
        const now = new Date();
        const dtObject = new Date(now.getTime() - 120000);
        expect(formatTimeDifference(dtObject.toISOString())).toEqual('2 minutes ago');
    });

    it('formatTimeDifference should be "1 hour ago"', () => {
        const now = new Date();
        const dtObject = new Date(now.getTime() - 3600000);
        expect(formatTimeDifference(dtObject.toISOString())).toEqual('1 hour ago');
    });

    it('formatTimeDifference should be "2 days ago"', () => {
        const now = new Date();
        const dtObject = new Date(now.getTime() - 172800000);
        expect(formatTimeDifference(dtObject.toISOString())).toEqual('2 days ago');
    });

    it('formatTimeDifference should be "1 week ago"', () => {
        const now = new Date();
        const dtObject = new Date(now.getTime() - 604800000);
        expect(formatTimeDifference(dtObject.toISOString())).toEqual('1 week ago');
    });

    it('formatTimeDifference should be "2 weeks ago"', () => {
        const now = new Date();
        const dtObject = new Date(now.getTime() - 1209600000);
        expect(formatTimeDifference(dtObject.toISOString())).toEqual('2 weeks ago');
    });

    it('formatTimeDifference should be "1 month ago"', () => {
        const now = new Date();
        const dtObject = new Date(now.getTime() - 2629746000);
        expect(formatTimeDifference(dtObject.toISOString())).toEqual('1 month ago');
    });

    it('formatTimeDifference should be "1 year ago"', () => {
        const now = new Date();
        const dtObject = new Date(now.getTime() - 31556952000);
        expect(formatTimeDifference(dtObject.toISOString())).toEqual('1 year ago');
    });
});
