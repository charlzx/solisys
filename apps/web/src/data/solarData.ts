export const SOLAR_REGIONS = [
  {
    region: 'West Africa',
    cities: [
      { name: 'Lagos, Nigeria', psh: 5.0 },
      { name: 'Abuja, Nigeria', psh: 5.5 },
      { name: 'Kano, Nigeria', psh: 6.5 },
      { name: 'Port Harcourt, Nigeria', psh: 4.5 },
      { name: 'Ibadan, Nigeria', psh: 5.0 },
      { name: 'Accra, Ghana', psh: 5.0 },
      { name: 'Kumasi, Ghana', psh: 4.8 },
      { name: 'Dakar, Senegal', psh: 5.8 },
      { name: 'Bamako, Mali', psh: 6.0 },
      { name: 'Ouagadougou, Burkina Faso', psh: 6.0 },
      { name: 'Niamey, Niger', psh: 6.5 },
      { name: 'Lomé, Togo', psh: 5.0 },
      { name: 'Cotonou, Benin', psh: 5.0 },
      { name: 'Abidjan, Côte d\'Ivoire', psh: 4.8 },
      { name: 'Freetown, Sierra Leone', psh: 4.5 },
    ],
  },
  {
    region: 'East Africa',
    cities: [
      { name: 'Nairobi, Kenya', psh: 5.5 },
      { name: 'Mombasa, Kenya', psh: 5.8 },
      { name: 'Dar es Salaam, Tanzania', psh: 5.5 },
      { name: 'Kampala, Uganda', psh: 5.0 },
      { name: 'Addis Ababa, Ethiopia', psh: 5.8 },
      { name: 'Kigali, Rwanda', psh: 5.0 },
      { name: 'Mogadishu, Somalia', psh: 6.5 },
      { name: 'Djibouti, Djibouti', psh: 6.5 },
    ],
  },
  {
    region: 'Southern Africa',
    cities: [
      { name: 'Johannesburg, South Africa', psh: 5.5 },
      { name: 'Cape Town, South Africa', psh: 5.0 },
      { name: 'Durban, South Africa', psh: 5.0 },
      { name: 'Harare, Zimbabwe', psh: 5.8 },
      { name: 'Lusaka, Zambia', psh: 5.8 },
      { name: 'Maputo, Mozambique', psh: 5.5 },
      { name: 'Windhoek, Namibia', psh: 6.5 },
      { name: 'Gaborone, Botswana', psh: 6.0 },
    ],
  },
  {
    region: 'North Africa & Middle East',
    cities: [
      { name: 'Cairo, Egypt', psh: 6.5 },
      { name: 'Casablanca, Morocco', psh: 5.5 },
      { name: 'Tunis, Tunisia', psh: 5.5 },
      { name: 'Algiers, Algeria', psh: 5.5 },
      { name: 'Tripoli, Libya', psh: 6.0 },
      { name: 'Dubai, UAE', psh: 6.5 },
      { name: 'Riyadh, Saudi Arabia', psh: 7.0 },
      { name: 'Amman, Jordan', psh: 6.0 },
      { name: 'Baghdad, Iraq', psh: 6.0 },
      { name: 'Tehran, Iran', psh: 5.5 },
    ],
  },
  {
    region: 'South & Southeast Asia',
    cities: [
      { name: 'Mumbai, India', psh: 5.5 },
      { name: 'New Delhi, India', psh: 5.5 },
      { name: 'Chennai, India', psh: 5.5 },
      { name: 'Rajasthan, India', psh: 6.5 },
      { name: 'Bangkok, Thailand', psh: 5.0 },
      { name: 'Manila, Philippines', psh: 5.0 },
      { name: 'Jakarta, Indonesia', psh: 4.8 },
      { name: 'Karachi, Pakistan', psh: 5.5 },
      { name: 'Dhaka, Bangladesh', psh: 4.5 },
    ],
  },
  {
    region: 'Europe',
    cities: [
      { name: 'Madrid, Spain', psh: 5.5 },
      { name: 'Rome, Italy', psh: 5.0 },
      { name: 'Athens, Greece', psh: 5.5 },
      { name: 'Lisbon, Portugal', psh: 5.5 },
      { name: 'Paris, France', psh: 3.5 },
      { name: 'Berlin, Germany', psh: 3.0 },
      { name: 'London, UK', psh: 3.0 },
      { name: 'Amsterdam, Netherlands', psh: 3.0 },
      { name: 'Stockholm, Sweden', psh: 3.0 },
      { name: 'Warsaw, Poland', psh: 3.5 },
    ],
  },
  {
    region: 'Americas',
    cities: [
      { name: 'Phoenix, Arizona, USA', psh: 7.0 },
      { name: 'Los Angeles, California, USA', psh: 6.0 },
      { name: 'Miami, Florida, USA', psh: 5.5 },
      { name: 'Houston, Texas, USA', psh: 5.5 },
      { name: 'New York, USA', psh: 4.5 },
      { name: 'Denver, Colorado, USA', psh: 5.5 },
      { name: 'Mexico City, Mexico', psh: 5.5 },
      { name: 'São Paulo, Brazil', psh: 4.5 },
      { name: 'Lima, Peru', psh: 5.0 },
      { name: 'Bogotá, Colombia', psh: 4.5 },
      { name: 'Santiago, Chile', psh: 5.5 },
      { name: 'Buenos Aires, Argentina', psh: 4.5 },
    ],
  },
  {
    region: 'Australia & Pacific',
    cities: [
      { name: 'Sydney, Australia', psh: 5.0 },
      { name: 'Melbourne, Australia', psh: 4.5 },
      { name: 'Brisbane, Australia', psh: 5.5 },
      { name: 'Perth, Australia', psh: 6.0 },
      { name: 'Alice Springs, Australia', psh: 7.0 },
      { name: 'Auckland, New Zealand', psh: 4.0 },
    ],
  },
];

export function getAllLocations() {
  const locations = [];
  for (const region of SOLAR_REGIONS) {
    for (const city of region.cities) {
      locations.push({
        value: `${city.name}`,
        label: `${city.name} — ${city.psh}h PSH`,
        psh: city.psh,
        region: region.region,
      });
    }
  }
  return locations;
}
