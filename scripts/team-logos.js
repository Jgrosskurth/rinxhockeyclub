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

// League opponents: MyHockeyRankings CDN logo ids (matched by a substring of
// the team name) and logos uploaded to the site. Shared by the schedule block
// and the standings points race.
export const MHR_CDN = 'https://ranktech-cdn.s3.us-east-2.amazonaws.com/myhockey_prod/logos/';

const TEAM_LOGOS = {
  // 10U confirmed
  aviator: '001dfe',
  kings: '001ba2',
  'north park': '002ee8',
  'great neck': '001934',
  arrows: '0013c6',
  lions: '00017d',
  lightning: '0004c5',
  sharks: '000bd3',
  edge: '000723',
  hawks: '000f90',
  cyclones: '001589',
  tigers: '00075f',
  express: '001f15',
  wildcats: '00153e',
  vipers: '00000b',
  panthers: '001d53',
  predators: '00133e',
  blues: '00018b',
  'ice devils': '0014fd',
  'red wings': '001dfe',
  // 14U confirmed
  rebels: '001506',
  wolfpack: '001570',
  phantoms: '00123e',
  piedmont: '001729',
  'sound tigers': '001888',
  mustangs: '0010b0',
  wizards: '000032',
  bears: '000f91',
  storm: '000cb9',
  admirals: '002d89',
  advantage: '00246a',
  outlaws: '000114',
  capitals: '000bc7',
  whalers: '00230f',
  ramparts: '001f58',
  wolves: '000f98',
  flames: '000f8c',
  // Opponents matched by club/city name that differ from the mascot key
  peconic: '00153e', // Peconic Wildcats
  brewster: '001f15', // Westchester Express (Brewster)
  'long beach': '0004c5', // Long Beach Lightning
};

// Logos for teams not on the ranking CDN, uploaded to the site media library.
const LOCAL_LOGOS = {
  'dix hills selects': '/images/dh.png',
  'beaver dam': '/images/beaverdam.png',
  'white plains': '/images/whiteplains.png',
  'isles elite': '/images/soundtigers.jpeg',
  'iceworks islanders': '/images/iceworks-islanders.webp',
};

export function findLogoId(oppName) {
  const lower = oppName.toLowerCase();
  const keys = Object.keys(TEAM_LOGOS);
  for (let i = 0; i < keys.length; i += 1) {
    if (lower.includes(keys[i])) return TEAM_LOGOS[keys[i]];
  }
  return '';
}

export function findLocalLogo(oppName) {
  const lower = oppName.toLowerCase();
  const keys = Object.keys(LOCAL_LOGOS);
  for (let i = 0; i < keys.length; i += 1) {
    if (lower.includes(keys[i])) return LOCAL_LOGOS[keys[i]];
  }
  return '';
}

/**
 * Best available logo URL for a (tidied) team name, or ''.
 * @param {string} name e.g. "Long Island Sharks"
 */
export function teamLogo(name) {
  const gs = gameSheetLogo(name);
  if (gs) return gs;
  const local = findLocalLogo(name);
  if (local) return local;
  const id = findLogoId(name);
  return id ? `${MHR_CDN}${id}_a.png` : '';
}
