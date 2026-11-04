// Only background selections are room-local; all other preferences keep their persistence.
export function withoutBackgrounds(prefs){const {skin,...rest}=prefs;const {skin:gomokuSkin,...gomoku}=prefs.gomoku||{};return {...rest,gomoku};}
export function withRandomBackgrounds(prefs){return {...prefs,skin:'random',gomoku:{...prefs.gomoku,skin:'random'}};}
