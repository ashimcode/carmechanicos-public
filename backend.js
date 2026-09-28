// Optional Supabase bridge. The game remains fully playable with localStorage
// when backend-config.js is absent or not configured.
(function () {
    const config = (window.CARMECHANICOS_CONFIG && window.CARMECHANICOS_CONFIG.supabase) || {};
    const configuredUrl = typeof config.url === "string" ? config.url.trim() : "";
    const configuredKey = typeof config.anonKey === "string" ? config.anonKey.trim() : "";
    const configuredPlayerId = typeof config.playerId === "string" ? config.playerId.trim() : "";
    const table = typeof config.table === "string" && /^[A-Za-z_][A-Za-z0-9_]*$/.test(config.table) ? config.table : "player_saves";
    const accessToken = typeof config.accessToken === "string" ? config.accessToken.trim() : "";
    let supabaseUrl;
    try { supabaseUrl = new URL(configuredUrl); } catch { supabaseUrl = null; }

    const validUrl = Boolean(
        supabaseUrl &&
        (supabaseUrl.protocol === "https:" || ["localhost", "127.0.0.1"].includes(supabaseUrl.hostname)) &&
        !supabaseUrl.username &&
        !supabaseUrl.password &&
        !configuredUrl.includes("YOUR_PROJECT_REF")
    );
    const validKey = Boolean(configuredKey && !configuredKey.includes("YOUR_PUBLIC") && !configuredKey.includes("PASTE_"));
    const validPlayerId = Boolean(configuredPlayerId && configuredPlayerId.length <= 128);
    // Cloud saves are opt-in and require an authenticated Supabase access token.
    // The old anonymous, open-policy mode is intentionally no longer enabled.
    const enabled = Boolean(config.enabled === true && validUrl && validKey && validPlayerId && accessToken);
    const playerId = configuredPlayerId;

    if (config.enabled === true && !enabled) {
        console.warn("CarMechanicOS cloud saves are disabled: use an HTTPS Supabase URL, a browser-safe key, a player id, and an authenticated access token.");
    }

    async function request(method, body) {
        if (!enabled) return null;
        const url = new URL(`/rest/v1/${table}`, supabaseUrl);
        if (method === "POST") url.searchParams.set("on_conflict", "player_id");
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        let response;
        try {
            response = await fetch(url.href, {
                method,
                headers: { apikey: configuredKey, Authorization: `Bearer ${accessToken}`, Accept: "application/json", "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
                body: body ? JSON.stringify(body) : undefined,
                signal: controller.signal
            });
        } finally {
            clearTimeout(timeout);
        }
        if (!response.ok) throw new Error(`Supabase request failed (${response.status})`);
        return response;
    }

    let saveTimer;
    window.CarMechanicBackend = {
        enabled,
        provider: enabled ? "supabase" : "localStorage",
        queueSave(state) {
            if (!enabled) return;
            clearTimeout(saveTimer);
            saveTimer = setTimeout(() => request("POST", { player_id: playerId, save_state: state, updated_at: new Date().toISOString() }).catch(error => console.warn("Cloud save skipped:", error.message)), 1200);
        },
        async clearSave() {
            if (!enabled) return;
            clearTimeout(saveTimer);
            const url = new URL(`/rest/v1/${table}`, supabaseUrl);
            url.searchParams.set("player_id", `eq.${playerId}`);
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 8000);
            let response;
            try {
                response = await fetch(url.href, {
                    method: "DELETE",
                    headers: { apikey: configuredKey, Authorization: `Bearer ${accessToken}` },
                    signal: controller.signal
                });
            } finally {
                clearTimeout(timeout);
            }
            if (!response.ok) throw new Error(`Supabase reset failed (${response.status})`);
        },
        async health() {
            if (!enabled) return { enabled: false, provider: "localStorage" };
            try { await request("GET"); return { enabled: true, provider: "supabase" }; } catch (error) { return { enabled: true, provider: "supabase", error: error.message }; }
        }
    };
})();
