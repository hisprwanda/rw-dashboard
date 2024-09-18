export default function joinPath(...parts: string[]): string {
    const [base, ...otherParts] = parts;

    const url = new URL(base);

    otherParts.forEach(part => {
        const cleanPart = part.replace(/^\/+|\/+$/g, '');
        url.pathname = url.pathname.replace(/\/+$/, '') + '/' + cleanPart;
    });

    return url.toString();
}