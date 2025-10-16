/**
 * Asynchronously calculates the SHA-256 hash of a given string.
 * Uses the browser's native SubtleCrypto API for performance and security.
 * @param str The string to hash.
 * @returns A promise that resolves to the hex-encoded SHA-256 hash.
 */
export const calculateSHA256 = async (str: string): Promise<string> => {
    // Encode the string into a Uint8Array
    const encoder = new TextEncoder();
    const data = encoder.encode(str);

    // Hash the data
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // Convert the ArrayBuffer to a hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
};
