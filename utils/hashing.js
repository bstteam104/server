import { hash } from "bcryptjs";
import crypto from 'node:crypto';  // ✅ Correct way for ESM


export const doHash = async (value, saltvalue) => {
    const result = await hash(value, saltvalue); // Await the hash function
    return result;
};

export const hmacProcess = async (value, key) => {
    const hash = crypto.createHmac('sha256', key)
    .update(value)
    .digest('hex');  // ✅ Correct
    return hash;
};
