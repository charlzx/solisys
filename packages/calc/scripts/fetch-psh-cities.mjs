/**
 * Fetches long-term monthly PSH averages from NASA POWER for 74 cities
 * and writes the result to src/data/psh-cities.json.
 *
 * Usage: node scripts/fetch-psh-cities.mjs
 * NASA POWER API: https://power.larc.nasa.gov/api/temporal/climatology/point
 * Parameter: ALLSKY_SFC_SW_DWN (all-sky surface shortwave downward irradiance, kWh/m²/day)
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, '../src/data/psh-cities.json');

// 74 cities across 8 global regions (Africa, Middle East, Asia, Southeast Asia,
// Australia/Oceania, Europe, North America, South America)
const CITIES = [
  // West Africa
  { id: 'lagos-ng',      city: 'Lagos',         country: 'Nigeria',       lat: 6.5244,   lon: 3.3792   },
  { id: 'abuja-ng',      city: 'Abuja',          country: 'Nigeria',       lat: 9.0765,   lon: 7.3986   },
  { id: 'kano-ng',       city: 'Kano',           country: 'Nigeria',       lat: 12.0022,  lon: 8.5920   },
  { id: 'accra-gh',      city: 'Accra',          country: 'Ghana',         lat: 5.6037,   lon: -0.1870  },
  { id: 'kumasi-gh',     city: 'Kumasi',         country: 'Ghana',         lat: 6.6885,   lon: -1.6244  },
  { id: 'dakar-sn',      city: 'Dakar',          country: 'Senegal',       lat: 14.7167,  lon: -17.4677 },
  { id: 'abidjan-ci',    city: 'Abidjan',        country: 'Côte d\'Ivoire', lat: 5.3600,   lon: -4.0083  },
  { id: 'bamako-ml',     city: 'Bamako',         country: 'Mali',          lat: 12.6392,  lon: -8.0029  },
  { id: 'lome-tg',       city: 'Lomé',           country: 'Togo',          lat: 6.1375,   lon: 1.2123   },
  { id: 'cotonou-bj',    city: 'Cotonou',        country: 'Benin',         lat: 6.3654,   lon: 2.4183   },

  // East Africa
  { id: 'nairobi-ke',    city: 'Nairobi',        country: 'Kenya',         lat: -1.2921,  lon: 36.8219  },
  { id: 'mombasa-ke',    city: 'Mombasa',        country: 'Kenya',         lat: -4.0435,  lon: 39.6682  },
  { id: 'dar-tz',        city: 'Dar es Salaam',  country: 'Tanzania',      lat: -6.7924,  lon: 39.2083  },
  { id: 'kampala-ug',    city: 'Kampala',        country: 'Uganda',        lat: 0.3476,   lon: 32.5825  },
  { id: 'addis-et',      city: 'Addis Ababa',    country: 'Ethiopia',      lat: 9.0300,   lon: 38.7400  },

  // Southern Africa
  { id: 'johannesburg-za', city: 'Johannesburg', country: 'South Africa',  lat: -26.2041, lon: 28.0473  },
  { id: 'cape-town-za',  city: 'Cape Town',      country: 'South Africa',  lat: -33.9249, lon: 18.4241  },
  { id: 'durban-za',     city: 'Durban',         country: 'South Africa',  lat: -29.8587, lon: 31.0218  },
  { id: 'lusaka-zm',     city: 'Lusaka',         country: 'Zambia',        lat: -15.3875, lon: 28.3228  },
  { id: 'harare-zw',     city: 'Harare',         country: 'Zimbabwe',      lat: -17.8252, lon: 31.0335  },

  // North Africa
  { id: 'cairo-eg',      city: 'Cairo',          country: 'Egypt',         lat: 30.0444,  lon: 31.2357  },
  { id: 'casablanca-ma', city: 'Casablanca',     country: 'Morocco',       lat: 33.5731,  lon: -7.5898  },
  { id: 'tunis-tn',      city: 'Tunis',          country: 'Tunisia',       lat: 36.8190,  lon: 10.1658  },
  { id: 'algiers-dz',    city: 'Algiers',        country: 'Algeria',       lat: 36.7538,  lon: 3.0588   },
  { id: 'tripoli-ly',    city: 'Tripoli',        country: 'Libya',         lat: 32.9022,  lon: 13.1802  },

  // Middle East
  { id: 'riyadh-sa',     city: 'Riyadh',         country: 'Saudi Arabia',  lat: 24.7136,  lon: 46.6753  },
  { id: 'dubai-ae',      city: 'Dubai',          country: 'UAE',           lat: 25.2048,  lon: 55.2708  },
  { id: 'tehran-ir',     city: 'Tehran',         country: 'Iran',          lat: 35.6892,  lon: 51.3890  },
  { id: 'istanbul-tr',   city: 'Istanbul',       country: 'Turkey',        lat: 41.0082,  lon: 28.9784  },
  { id: 'amman-jo',      city: 'Amman',          country: 'Jordan',        lat: 31.9454,  lon: 35.9284  },

  // South Asia
  { id: 'delhi-in',      city: 'New Delhi',      country: 'India',         lat: 28.6139,  lon: 77.2090  },
  { id: 'mumbai-in',     city: 'Mumbai',         country: 'India',         lat: 19.0760,  lon: 72.8777  },
  { id: 'bangalore-in',  city: 'Bangalore',      country: 'India',         lat: 12.9716,  lon: 77.5946  },
  { id: 'karachi-pk',    city: 'Karachi',        country: 'Pakistan',      lat: 24.8607,  lon: 67.0011  },
  { id: 'dhaka-bd',      city: 'Dhaka',          country: 'Bangladesh',    lat: 23.8103,  lon: 90.4125  },

  // Southeast Asia
  { id: 'jakarta-id',    city: 'Jakarta',        country: 'Indonesia',     lat: -6.2088,  lon: 106.8456 },
  { id: 'manila-ph',     city: 'Manila',         country: 'Philippines',   lat: 14.5995,  lon: 120.9842 },
  { id: 'kuala-lumpur-my', city: 'Kuala Lumpur', country: 'Malaysia',      lat: 3.1390,   lon: 101.6869 },
  { id: 'bangkok-th',    city: 'Bangkok',        country: 'Thailand',      lat: 13.7563,  lon: 100.5018 },
  { id: 'ho-chi-minh-vn', city: 'Ho Chi Minh City', country: 'Vietnam',   lat: 10.8231,  lon: 106.6297 },

  // East Asia
  { id: 'beijing-cn',    city: 'Beijing',        country: 'China',         lat: 39.9042,  lon: 116.4074 },
  { id: 'shanghai-cn',   city: 'Shanghai',       country: 'China',         lat: 31.2304,  lon: 121.4737 },
  { id: 'tokyo-jp',      city: 'Tokyo',          country: 'Japan',         lat: 35.6762,  lon: 139.6503 },
  { id: 'seoul-kr',      city: 'Seoul',          country: 'South Korea',   lat: 37.5665,  lon: 126.9780 },
  { id: 'hong-kong-hk',  city: 'Hong Kong',      country: 'Hong Kong',     lat: 22.3193,  lon: 114.1694 },

  // Australia & Oceania
  { id: 'sydney-au',     city: 'Sydney',         country: 'Australia',     lat: -33.8688, lon: 151.2093 },
  { id: 'melbourne-au',  city: 'Melbourne',      country: 'Australia',     lat: -37.8136, lon: 144.9631 },
  { id: 'brisbane-au',   city: 'Brisbane',       country: 'Australia',     lat: -27.4698, lon: 153.0251 },
  { id: 'perth-au',      city: 'Perth',          country: 'Australia',     lat: -31.9505, lon: 115.8605 },
  { id: 'auckland-nz',   city: 'Auckland',       country: 'New Zealand',   lat: -36.8509, lon: 174.7645 },

  // Europe
  { id: 'london-gb',     city: 'London',         country: 'United Kingdom', lat: 51.5074, lon: -0.1278  },
  { id: 'berlin-de',     city: 'Berlin',         country: 'Germany',       lat: 52.5200,  lon: 13.4050  },
  { id: 'paris-fr',      city: 'Paris',          country: 'France',        lat: 48.8566,  lon: 2.3522   },
  { id: 'madrid-es',     city: 'Madrid',         country: 'Spain',         lat: 40.4168,  lon: -3.7038  },
  { id: 'rome-it',       city: 'Rome',           country: 'Italy',         lat: 41.9028,  lon: 12.4964  },

  // North America
  { id: 'new-york-us',   city: 'New York',       country: 'United States', lat: 40.7128,  lon: -74.0060 },
  { id: 'los-angeles-us', city: 'Los Angeles',   country: 'United States', lat: 34.0522,  lon: -118.2437 },
  { id: 'miami-us',      city: 'Miami',          country: 'United States', lat: 25.7617,  lon: -80.1918 },
  { id: 'phoenix-us',    city: 'Phoenix',        country: 'United States', lat: 33.4484,  lon: -112.0740 },
  { id: 'mexico-city-mx', city: 'Mexico City',   country: 'Mexico',        lat: 19.4326,  lon: -99.1332 },

  // Caribbean & Central America
  { id: 'kingston-jm',   city: 'Kingston',       country: 'Jamaica',       lat: 17.9714,  lon: -76.7920 },
  { id: 'port-of-spain-tt', city: 'Port of Spain', country: 'Trinidad & Tobago', lat: 10.6549, lon: -61.5019 },
  { id: 'havana-cu',     city: 'Havana',         country: 'Cuba',          lat: 23.1136,  lon: -82.3666 },
  { id: 'guatemala-city-gt', city: 'Guatemala City', country: 'Guatemala', lat: 14.6349,  lon: -90.5069 },
  { id: 'san-jose-cr',   city: 'San José',       country: 'Costa Rica',    lat: 9.9281,   lon: -84.0907 },

  // South America
  { id: 'sao-paulo-br',  city: 'São Paulo',      country: 'Brazil',        lat: -23.5505, lon: -46.6333 },
  { id: 'rio-de-janeiro-br', city: 'Rio de Janeiro', country: 'Brazil',    lat: -22.9068, lon: -43.1729 },
  { id: 'bogota-co',     city: 'Bogotá',         country: 'Colombia',      lat: 4.7110,   lon: -74.0721 },
  { id: 'lima-pe',       city: 'Lima',           country: 'Peru',          lat: -12.0464, lon: -77.0428 },
  { id: 'buenos-aires-ar', city: 'Buenos Aires', country: 'Argentina',     lat: -34.6037, lon: -58.3816 },
  { id: 'santiago-cl',   city: 'Santiago',       country: 'Chile',         lat: -33.4489, lon: -70.6693 },
  { id: 'caracas-ve',    city: 'Caracas',        country: 'Venezuela',     lat: 10.4806,  lon: -66.9036 },
  { id: 'quito-ec',      city: 'Quito',          country: 'Ecuador',       lat: -0.1807,  lon: -78.4678 },
  { id: 'asuncion-py',   city: 'Asunción',       country: 'Paraguay',      lat: -25.2867, lon: -57.6470 },
];

const BASE_URL = 'https://power.larc.nasa.gov/api/temporal/climatology/point';
const PARAM = 'ALLSKY_SFC_SW_DWN';

async function fetchCityPsh(city) {
  const url = `${BASE_URL}?parameters=${PARAM}&community=RE&longitude=${city.lon}&latitude=${city.lat}&format=JSON&header=true`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${city.city}`);

  const data = await res.json();
  const monthly = data.properties?.parameter?.[PARAM];
  if (!monthly) throw new Error(`No data for ${city.city}`);

  const MONTH_KEYS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const months = MONTH_KEYS.map((key) => {
    const val = monthly[key];
    return typeof val === 'number' && val >= 0 ? Math.round(val * 10) / 10 : 0;
  });

  const annualRaw = monthly['ANN'];
  const annual = typeof annualRaw === 'number' && annualRaw >= 0
    ? Math.round(annualRaw * 10) / 10
    : Math.round((months.reduce((a, b) => a + b, 0) / 12) * 10) / 10;

  return {
    id: city.id,
    city: city.city,
    country: city.country,
    lat: city.lat,
    lon: city.lon,
    pshMonthly: months,
    pshAnnual: annual,
  };
}

async function main() {
  const results = [];
  let success = 0;
  let failed = 0;

  for (const city of CITIES) {
    try {
      process.stdout.write(`Fetching ${city.city}, ${city.country}... `);
      const result = await fetchCityPsh(city);
      results.push(result);
      success++;
      console.log(`✓ annual PSH ${result.pshAnnual}`);
    } catch (err) {
      failed++;
      console.log(`✗ ${err.message}`);
    }

    // Polite delay — NASA POWER is a free public API
    await new Promise((r) => setTimeout(r, 300));
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2));
  console.log(`\nDone. ${success} cities written, ${failed} failed.`);
  console.log(`Output: ${OUTPUT_PATH}`);
}

main().catch(console.error);
