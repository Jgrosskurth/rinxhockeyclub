// GameSheet team logos (Cloudflare Images) for tournament opponents, keyed by
// tidied team name. Shared by the schedule and standings blocks. The 128px
// variant stays sharp at the small icon sizes on high-density screens.
const GAMESHEET_LOGO_CDN = 'https://imagedelivery.net/ErrQpIaCOWR-Tz51PhN1zA/';

const GAMESHEET_LOGOS = {
  // 2026 Mid-Atlantic Fall Showcase, 10A
  'genesis hockey club': '3f442c23-a1f5-485d-8c69-6bdeebbd5000',
  'cranford hockey club': '2d86cc59-2ae9-48de-414e-06ae3f1cd300',
  'long island gulls': 'a9befe24-9496-499b-e5ce-aab9fba97c00',
  'the st. james': 'a88eb313-d6aa-4a31-a15c-4c9c8b022800',
  'delco phantoms': '547984bb-9b2f-44b0-2a7a-a011a7a21d00',
  'central penn panthers': '4195975c-860c-4caa-37da-4197a76a3000',
};

export const RINX_LOGO = '/icons/rinxlogo-140.webp';

/**
 * GameSheet logo URL for a team, or '' if we don't have one.
 * @param {string} name Tidied team name, e.g. "Delco Phantoms"
 */
export function gameSheetLogo(name) {
  const id = GAMESHEET_LOGOS[(name || '').trim().toLowerCase()];
  return id ? `${GAMESHEET_LOGO_CDN}${id}/128` : '';
}
