export const parseAPIUrl = (url: string): string[] => {
    const [segments] = url.split('?');
    const [api, contentTypes, ...params] = segments.split('/').filter((part) => part);

    if (api !== 'api') {
        throw new Error('Invalid API URL');
    }

    return [contentTypes, ...params];
};
