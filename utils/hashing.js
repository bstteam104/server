import { compare, hash } from "bcryptjs";

export const doHash = async (value, saltvalue) => {
    const result = await hash(value, saltvalue); // Await the hash function
    return result;
};


export const doHashValidation = async (value, hashedValue) => {
    const result = compare(value, hashedValue); // Await the hash function
    return result;
};


