import type { PshCity } from '../types/index.js';
import cities from './psh-cities.json' assert { type: 'json' };

export const PSH_CITIES: PshCity[] = cities as PshCity[];

/**
 * Find a city by name or country (case-insensitive, partial match).
 * Checks city name first, then country name.
 */
export function findCityByName(name: string): PshCity | undefined {
  const query = name.toLowerCase().trim();
  return PSH_CITIES.find(
    (c) =>
      c.city.toLowerCase().includes(query) ||
      c.country.toLowerCase().includes(query),
  );
}

/**
 * Find a city by its unique ID (e.g. "lagos-ng").
 */
export function findCityById(id: string): PshCity | undefined {
  return PSH_CITIES.find((c) => c.id === id);
}
