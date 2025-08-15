import { get_engine } from "@eva-ics/webengine-react";

export async function setUserData<T>(key: string, value: T): Promise<void> {
    const engine = get_engine();
    if (!engine) {
        throw new Error("Engine is null");
    }
    await engine.call("user_data.set", { key, value });
}

export async function getUserData<T>(key: string): Promise<T | null> {
    const engine = get_engine();
    if (!engine) {
        throw new Error("Engine is null");
    }
    const res = await engine.call("user_data.get", { key });
    return res.value;
}
