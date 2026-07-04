import { action } from "../_generated/server";
import { v } from "convex/values";

export const getAssistants = action({
    args: {},
    handler: async () => {
        const apiKey = process.env.VAPI_API_KEY;
        if (!apiKey) {
            throw new Error("VAPI_API_KEY is not configured");
        }

        const response = await fetch("https://api.vapi.ai/assistant", {
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch assistants: ${response.statusText}`);
        }

        return await response.json();
    },
});

export const getPhoneNumbers = action({
    args: {},
    handler: async () => {
        const apiKey = process.env.VAPI_API_KEY;
        if (!apiKey) {
            throw new Error("VAPI_API_KEY is not configured");
        }

        const response = await fetch("https://api.vapi.ai/phone-number", {
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch phone numbers: ${response.statusText}`);
        }

        return await response.json();
    },
});
