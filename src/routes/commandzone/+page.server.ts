import type { Actions } from "@sveltejs/kit";

export const actions: Actions = {
    add: async ({ request }) => {
        console.log('add', request);
    }
}