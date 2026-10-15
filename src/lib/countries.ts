/**
 * Country helpers shared by the map and the country sidebar.
 * Membership lists are the official EU-27 and the EEA EFTA states.
 */

/** EU-27 member states (ISO 3166-1 alpha-2). */
export const EU_MEMBERS = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE",
  "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
]);

/** EEA = EU-27 + Iceland, Liechtenstein, Norway. */
export const EEA_MEMBERS = new Set([...EU_MEMBERS, "IS", "LI", "NO"]);

/** world-atlas country names that differ from the names used in the datasets. */
const ATLAS_NAME_ALIASES: Record<string, string> = {
  "United States of America": "United States",
};

/** Normalises a world-atlas country name to the dataset's `countryName`. */
export const datasetCountryName = (atlasName: string) => ATLAS_NAME_ALIASES[atlasName] ?? atlasName;

/** world-atlas (Natural Earth 110m) country name → ISO 3166-1 alpha-2, from the ISO numeric ids (Kosovo: XK). */
const ATLAS_ISO: Record<string, string> = {
  "Afghanistan": "AF", "Albania": "AL", "Algeria": "DZ", "Angola": "AO", "Antarctica": "AQ", "Argentina": "AR", "Armenia": "AM", "Australia": "AU",
  "Austria": "AT", "Azerbaijan": "AZ", "Bahamas": "BS", "Bangladesh": "BD", "Belarus": "BY", "Belgium": "BE", "Belize": "BZ", "Benin": "BJ", "Bhutan": "BT",
  "Bolivia": "BO", "Bosnia and Herz.": "BA", "Botswana": "BW", "Brazil": "BR", "Brunei": "BN", "Bulgaria": "BG", "Burkina Faso": "BF", "Burundi": "BI",
  "Cambodia": "KH", "Cameroon": "CM", "Canada": "CA", "Central African Rep.": "CF", "Chad": "TD", "Chile": "CL", "China": "CN", "Colombia": "CO",
  "Congo": "CG", "Costa Rica": "CR", "Croatia": "HR", "Cuba": "CU", "Cyprus": "CY", "Czechia": "CZ", "Côte d'Ivoire": "CI", "Dem. Rep. Congo": "CD",
  "Denmark": "DK", "Djibouti": "DJ", "Dominican Rep.": "DO", "Ecuador": "EC", "Egypt": "EG", "El Salvador": "SV", "Eq. Guinea": "GQ", "Eritrea": "ER",
  "Estonia": "EE", "Ethiopia": "ET", "Falkland Is.": "FK", "Fiji": "FJ", "Finland": "FI", "Fr. S. Antarctic Lands": "TF", "France": "FR", "Gabon": "GA",
  "Gambia": "GM", "Georgia": "GE", "Germany": "DE", "Ghana": "GH", "Greece": "GR", "Greenland": "GL", "Guatemala": "GT", "Guinea": "GN", "Guinea-Bissau": "GW",
  "Guyana": "GY", "Haiti": "HT", "Honduras": "HN", "Hungary": "HU", "Iceland": "IS", "India": "IN", "Indonesia": "ID", "Iran": "IR", "Iraq": "IQ",
  "Ireland": "IE", "Israel": "IL", "Italy": "IT", "Jamaica": "JM", "Japan": "JP", "Jordan": "JO", "Kazakhstan": "KZ", "Kenya": "KE", "Kosovo": "XK",
  "Kuwait": "KW", "Kyrgyzstan": "KG", "Laos": "LA", "Latvia": "LV", "Lebanon": "LB", "Lesotho": "LS", "Liberia": "LR", "Libya": "LY", "Lithuania": "LT",
  "Luxembourg": "LU", "Macedonia": "MK", "Madagascar": "MG", "Malawi": "MW", "Malaysia": "MY", "Mali": "ML", "Mauritania": "MR", "Mexico": "MX",
  "Moldova": "MD", "Mongolia": "MN", "Montenegro": "ME", "Morocco": "MA", "Mozambique": "MZ", "Myanmar": "MM", "Namibia": "NA", "Nepal": "NP",
  "Netherlands": "NL", "New Caledonia": "NC", "New Zealand": "NZ", "Nicaragua": "NI", "Niger": "NE", "Nigeria": "NG", "North Korea": "KP", "Norway": "NO",
  "Oman": "OM", "Pakistan": "PK", "Palestine": "PS", "Panama": "PA", "Papua New Guinea": "PG", "Paraguay": "PY", "Peru": "PE", "Philippines": "PH",
  "Poland": "PL", "Portugal": "PT", "Puerto Rico": "PR", "Qatar": "QA", "Romania": "RO", "Russia": "RU", "Rwanda": "RW", "S. Sudan": "SS",
  "Saudi Arabia": "SA", "Senegal": "SN", "Serbia": "RS", "Sierra Leone": "SL", "Slovakia": "SK", "Slovenia": "SI", "Solomon Is.": "SB", "Somalia": "SO",
  "South Africa": "ZA", "South Korea": "KR", "Spain": "ES", "Sri Lanka": "LK", "Sudan": "SD", "Suriname": "SR", "Sweden": "SE", "Switzerland": "CH",
  "Syria": "SY", "Taiwan": "TW", "Tajikistan": "TJ", "Tanzania": "TZ", "Thailand": "TH", "Timor-Leste": "TL", "Togo": "TG", "Trinidad and Tobago": "TT",
  "Tunisia": "TN", "Turkey": "TR", "Turkmenistan": "TM", "Uganda": "UG", "Ukraine": "UA", "United Arab Emirates": "AE", "United Kingdom": "GB",
  "United States of America": "US", "Uruguay": "UY", "Uzbekistan": "UZ", "Vanuatu": "VU", "Venezuela": "VE", "Vietnam": "VN", "W. Sahara": "EH", "Yemen": "YE",
  "Zambia": "ZM", "Zimbabwe": "ZW", "eSwatini": "SZ",
};

/** ISO alpha-2 code for a world-atlas country name, when it has one. */
export const atlasCountryCode = (atlasName: string): string | undefined => ATLAS_ISO[atlasName];

/** Round flag shipped in /public/flags (circle-flags, MIT) for an ISO alpha-2 code. */
export const flagSrc = (code: string | undefined) => (code && /^[A-Za-z]{2}$/.test(code) ? `/flags/${code.toLowerCase()}.svg` : null);
