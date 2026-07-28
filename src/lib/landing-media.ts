// Cloudinary delivery URLs for the landing loop-videos (see scripts/gen-card.ts).
// Assets live under `telltales/landing/<id>` as public video uploads; the loop
// URL is the seamless boomerang (original + reversed) so `<video loop>` never
// shows a cut frame. `v` pins the upload version so the CDN can't serve stale.
const BASE = "https://res.cloudinary.com/dh0spkwh3/video/upload";
const PREFIX = "telltales/landing";

// `v` is the bare upload version number; Cloudinary requires it prefixed `v…`
// in the delivery path.
export const cardLoop = (id: string, v: string) =>
  `${BASE}/fl_splice,l_video:${PREFIX.replace(/\//g, ":")}:${id}/e_reverse/fl_layer_apply/v${v}/${PREFIX}/${id}.mp4`;

export const cardPoster = (id: string, v: string) =>
  `${BASE}/so_0/v${v}/${PREFIX}/${id}.jpg`;
