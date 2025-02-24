import { hash } from "bcryptjs";

export const doHash = async (value, saltvalue) => {
    const result = await hash(value, saltvalue); // Await the hash function
    return result;
};

