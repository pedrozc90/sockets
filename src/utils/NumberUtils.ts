export function normalizeInt(value?: string): number | undefined {
    if (!value) return;
    let result: number = parseInt(value);
    if (isNaN(result)) return;
    return result;
}
