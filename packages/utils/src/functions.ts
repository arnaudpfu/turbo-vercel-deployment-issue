function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function replaceAll(str: string, find: string, replace: string): string {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

export const replaceDynamicValue = (
    str: string,
    obj: Record<string, string | number | boolean | null>
): string => {
    for (const [key, value] of Object.entries(obj)) {
        const strV = typeof value === 'boolean' ? (value ? '✅' : '❌') : String(value === null ? '' : value);
        str = replaceAll(str, '{' + key + '}', strV);
    }
    return str;
};
