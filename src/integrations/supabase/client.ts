
// MOCK SUPABASE CLIENT FOR MIGRATION
// This file exists to satisfy imports while we migrate to Firebase.

const mockSupabase = {
    from: (table: string) => ({
        select: () => ({
            eq: () => ({
                single: () => Promise.resolve({ data: null, error: null }),
                order: () => Promise.resolve({ data: [], error: null }),
                maybeSingle: () => Promise.resolve({ data: null, error: null }),
            }),
            order: () => Promise.resolve({ data: [], error: null }),
            in: () => ({ order: () => Promise.resolve({ data: [], error: null }) }),
            insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: {}, error: null }) }) }),
            update: () => ({ select: () => ({ single: () => Promise.resolve({ data: {}, error: null }) }) }),
            delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
            url: new URL('https://mock.supabase.co'),
        }),
        insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: {}, error: null }) }) }),
        update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: {}, error: null }) }) }) }),
        upload: () => Promise.resolve({ data: { path: 'mock-path' }, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://mock-url.com/file.jpg' } }),
    }),
    auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
        signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
        admin: {
            deleteUser: () => Promise.resolve({ error: null }),
        }
    },
    storage: {
        from: () => ({
            upload: () => Promise.resolve({ data: { path: 'mock' }, error: null }),
            getPublicUrl: () => ({ data: { publicUrl: 'mock' } }),
        })
    },
    functions: {
        invoke: () => Promise.resolve({ data: {}, error: null })
    }
};

export const supabase = mockSupabase as any;
