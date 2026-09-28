// Copy this file to backend-config.js for local testing only.
// Cloud saves are opt-in and require an authenticated Supabase access token.
// Never put a service-role key, database password, or Cloudflare tunnel token here.
window.CARMECHANICOS_CONFIG = {
    bugTracker: {
        // Use a same-origin or HTTPS server-side proxy. Never put a Discord webhook URL here.
        endpoint: ""
    },
    supabase: {
        enabled: false,
        url: "https://ctzrhxhzxmeuodnxrluu.supabase.co",
        // Use the Supabase Publishable key (sb_publishable_...) or legacy anon key.
        anonKey: "PASTE_PUBLIC_PUBLISHABLE_OR_ANON_KEY_HERE",
        table: "player_saves",
        // Must match the authenticated Supabase user's auth.uid().
        playerId: "",
        // Obtain this from the active Supabase Auth session; do not commit it.
        accessToken: ""
    }
};
