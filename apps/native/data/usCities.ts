export interface USCity {
  city: string
  state: string
  stateCode: string
}

// Top 100+ US cities with their states
export const US_CITIES: USCity[] = [
  { city: 'New York', state: 'New York', stateCode: 'NY' },
  { city: 'Los Angeles', state: 'California', stateCode: 'CA' },
  { city: 'Chicago', state: 'Illinois', stateCode: 'IL' },
  { city: 'Houston', state: 'Texas', stateCode: 'TX' },
  { city: 'Phoenix', state: 'Arizona', stateCode: 'AZ' },
  { city: 'Philadelphia', state: 'Pennsylvania', stateCode: 'PA' },
  { city: 'San Antonio', state: 'Texas', stateCode: 'TX' },
  { city: 'San Diego', state: 'California', stateCode: 'CA' },
  { city: 'Dallas', state: 'Texas', stateCode: 'TX' },
  { city: 'San Jose', state: 'California', stateCode: 'CA' },
  { city: 'Austin', state: 'Texas', stateCode: 'TX' },
  { city: 'Jacksonville', state: 'Florida', stateCode: 'FL' },
  { city: 'Fort Worth', state: 'Texas', stateCode: 'TX' },
  { city: 'Columbus', state: 'Ohio', stateCode: 'OH' },
  { city: 'San Francisco', state: 'California', stateCode: 'CA' },
  { city: 'Charlotte', state: 'North Carolina', stateCode: 'NC' },
  { city: 'Indianapolis', state: 'Indiana', stateCode: 'IN' },
  { city: 'Seattle', state: 'Washington', stateCode: 'WA' },
  { city: 'Denver', state: 'Colorado', stateCode: 'CO' },
  { city: 'Boston', state: 'Massachusetts', stateCode: 'MA' },
  { city: 'El Paso', state: 'Texas', stateCode: 'TX' },
  { city: 'Detroit', state: 'Michigan', stateCode: 'MI' },
  { city: 'Nashville', state: 'Tennessee', stateCode: 'TN' },
  { city: 'Portland', state: 'Oregon', stateCode: 'OR' },
  { city: 'Memphis', state: 'Tennessee', stateCode: 'TN' },
  { city: 'Oklahoma City', state: 'Oklahoma', stateCode: 'OK' },
  { city: 'Las Vegas', state: 'Nevada', stateCode: 'NV' },
  { city: 'Louisville', state: 'Kentucky', stateCode: 'KY' },
  { city: 'Baltimore', state: 'Maryland', stateCode: 'MD' },
  { city: 'Milwaukee', state: 'Wisconsin', stateCode: 'WI' },
  { city: 'Albuquerque', state: 'New Mexico', stateCode: 'NM' },
  { city: 'Tucson', state: 'Arizona', stateCode: 'AZ' },
  { city: 'Fresno', state: 'California', stateCode: 'CA' },
  { city: 'Mesa', state: 'Arizona', stateCode: 'AZ' },
  { city: 'Sacramento', state: 'California', stateCode: 'CA' },
  { city: 'Atlanta', state: 'Georgia', stateCode: 'GA' },
  { city: 'Kansas City', state: 'Missouri', stateCode: 'MO' },
  { city: 'Colorado Springs', state: 'Colorado', stateCode: 'CO' },
  { city: 'Miami', state: 'Florida', stateCode: 'FL' },
  { city: 'Raleigh', state: 'North Carolina', stateCode: 'NC' },
  { city: 'Omaha', state: 'Nebraska', stateCode: 'NE' },
  { city: 'Long Beach', state: 'California', stateCode: 'CA' },
  { city: 'Virginia Beach', state: 'Virginia', stateCode: 'VA' },
  { city: 'Oakland', state: 'California', stateCode: 'CA' },
  { city: 'Minneapolis', state: 'Minnesota', stateCode: 'MN' },
  { city: 'Tulsa', state: 'Oklahoma', stateCode: 'OK' },
  { city: 'Arlington', state: 'Texas', stateCode: 'TX' },
  { city: 'Tampa', state: 'Florida', stateCode: 'FL' },
  { city: 'New Orleans', state: 'Louisiana', stateCode: 'LA' },
  { city: 'Wichita', state: 'Kansas', stateCode: 'KS' },
  { city: 'Cleveland', state: 'Ohio', stateCode: 'OH' },
  { city: 'Bakersfield', state: 'California', stateCode: 'CA' },
  { city: 'Aurora', state: 'Colorado', stateCode: 'CO' },
  { city: 'Anaheim', state: 'California', stateCode: 'CA' },
  { city: 'Honolulu', state: 'Hawaii', stateCode: 'HI' },
  { city: 'Santa Ana', state: 'California', stateCode: 'CA' },
  { city: 'Riverside', state: 'California', stateCode: 'CA' },
  { city: 'Corpus Christi', state: 'Texas', stateCode: 'TX' },
  { city: 'Lexington', state: 'Kentucky', stateCode: 'KY' },
  { city: 'Stockton', state: 'California', stateCode: 'CA' },
  { city: 'Henderson', state: 'Nevada', stateCode: 'NV' },
  { city: 'Saint Paul', state: 'Minnesota', stateCode: 'MN' },
  { city: 'St. Louis', state: 'Missouri', stateCode: 'MO' },
  { city: 'Cincinnati', state: 'Ohio', stateCode: 'OH' },
  { city: 'Pittsburgh', state: 'Pennsylvania', stateCode: 'PA' },
  { city: 'Greensboro', state: 'North Carolina', stateCode: 'NC' },
  { city: 'Anchorage', state: 'Alaska', stateCode: 'AK' },
  { city: 'Plano', state: 'Texas', stateCode: 'TX' },
  { city: 'Lincoln', state: 'Nebraska', stateCode: 'NE' },
  { city: 'Orlando', state: 'Florida', stateCode: 'FL' },
  { city: 'Irvine', state: 'California', stateCode: 'CA' },
  { city: 'Newark', state: 'New Jersey', stateCode: 'NJ' },
  { city: 'Durham', state: 'North Carolina', stateCode: 'NC' },
  { city: 'Chula Vista', state: 'California', stateCode: 'CA' },
  { city: 'Toledo', state: 'Ohio', stateCode: 'OH' },
  { city: 'Fort Wayne', state: 'Indiana', stateCode: 'IN' },
  { city: 'St. Petersburg', state: 'Florida', stateCode: 'FL' },
  { city: 'Laredo', state: 'Texas', stateCode: 'TX' },
  { city: 'Jersey City', state: 'New Jersey', stateCode: 'NJ' },
  { city: 'Chandler', state: 'Arizona', stateCode: 'AZ' },
  { city: 'Madison', state: 'Wisconsin', stateCode: 'WI' },
  { city: 'Lubbock', state: 'Texas', stateCode: 'TX' },
  { city: 'Norfolk', state: 'Virginia', stateCode: 'VA' },
  { city: 'Baton Rouge', state: 'Louisiana', stateCode: 'LA' },
  { city: 'Buffalo', state: 'New York', stateCode: 'NY' },
  { city: 'San Bernardino', state: 'California', stateCode: 'CA' },
  { city: 'Modesto', state: 'California', stateCode: 'CA' },
  { city: 'Fremont', state: 'California', stateCode: 'CA' },
  { city: 'Scottsdale', state: 'Arizona', stateCode: 'AZ' },
  { city: 'Glendale', state: 'Arizona', stateCode: 'AZ' },
  { city: 'Chandler', state: 'Arizona', stateCode: 'AZ' },
  { city: 'Garland', state: 'Texas', stateCode: 'TX' },
  { city: 'Irving', state: 'Texas', stateCode: 'TX' },
  { city: 'Hialeah', state: 'Florida', stateCode: 'FL' },
  { city: 'Richmond', state: 'Virginia', stateCode: 'VA' },
  { city: 'Chesapeake', state: 'Virginia', stateCode: 'VA' },
  { city: 'Gilbert', state: 'Arizona', stateCode: 'AZ' },
  { city: 'Boise', state: 'Idaho', stateCode: 'ID' },
  { city: 'San Bernardino', state: 'California', stateCode: 'CA' },
  { city: 'Spokane', state: 'Washington', stateCode: 'WA' },
  { city: 'Des Moines', state: 'Iowa', stateCode: 'IA' },
  { city: 'Modesto', state: 'California', stateCode: 'CA' },
  { city: 'Fayetteville', state: 'North Carolina', stateCode: 'NC' },
  { city: 'Tacoma', state: 'Washington', stateCode: 'WA' },
  { city: 'Oxnard', state: 'California', stateCode: 'CA' },
  { city: 'Fontana', state: 'California', stateCode: 'CA' },
  { city: 'Columbus', state: 'Georgia', stateCode: 'GA' },
  { city: 'Montgomery', state: 'Alabama', stateCode: 'AL' },
  { city: 'Moreno Valley', state: 'California', stateCode: 'CA' },
  { city: 'Shreveport', state: 'Louisiana', stateCode: 'LA' },
  { city: 'Aurora', state: 'Illinois', stateCode: 'IL' },
  { city: 'Yonkers', state: 'New York', stateCode: 'NY' },
  { city: 'Akron', state: 'Ohio', stateCode: 'OH' },
  { city: 'Huntington Beach', state: 'California', stateCode: 'CA' },
  { city: 'Little Rock', state: 'Arkansas', stateCode: 'AR' },
  { city: 'Augusta', state: 'Georgia', stateCode: 'GA' },
  { city: 'Amarillo', state: 'Texas', stateCode: 'TX' },
  { city: 'Glendale', state: 'California', stateCode: 'CA' },
  { city: 'Mobile', state: 'Alabama', stateCode: 'AL' },
  { city: 'Grand Rapids', state: 'Michigan', stateCode: 'MI' },
  { city: 'Salt Lake City', state: 'Utah', stateCode: 'UT' },
  { city: 'Tallahassee', state: 'Florida', stateCode: 'FL' },
  { city: 'Huntsville', state: 'Alabama', stateCode: 'AL' },
  { city: 'Grand Prairie', state: 'Texas', stateCode: 'TX' },
  { city: 'Knoxville', state: 'Tennessee', stateCode: 'TN' },
  { city: 'Worcester', state: 'Massachusetts', stateCode: 'MA' },
  { city: 'Newport News', state: 'Virginia', stateCode: 'VA' },
  { city: 'Brownsville', state: 'Texas', stateCode: 'TX' },
  { city: 'Overland Park', state: 'Kansas', stateCode: 'KS' },
  { city: 'Santa Clarita', state: 'California', stateCode: 'CA' },
  { city: 'Providence', state: 'Rhode Island', stateCode: 'RI' },
  { city: 'Garden Grove', state: 'California', stateCode: 'CA' },
  { city: 'Chattanooga', state: 'Tennessee', stateCode: 'TN' },
  { city: 'Oceanside', state: 'California', stateCode: 'CA' },
  { city: 'Jackson', state: 'Mississippi', stateCode: 'MS' },
  { city: 'Fort Lauderdale', state: 'Florida', stateCode: 'FL' },
  { city: 'Santa Rosa', state: 'California', stateCode: 'CA' },
  { city: 'Rancho Cucamonga', state: 'California', stateCode: 'CA' },
  { city: 'Port St. Lucie', state: 'Florida', stateCode: 'FL' },
  { city: 'Tempe', state: 'Arizona', stateCode: 'AZ' },
  { city: 'Ontario', state: 'California', stateCode: 'CA' },
  { city: 'Vancouver', state: 'Washington', stateCode: 'WA' },
  { city: 'Cape Coral', state: 'Florida', stateCode: 'FL' },
  { city: 'Sioux Falls', state: 'South Dakota', stateCode: 'SD' },
  { city: 'Springfield', state: 'Missouri', stateCode: 'MO' },
  { city: 'Peoria', state: 'Arizona', stateCode: 'AZ' },
  { city: 'Pembroke Pines', state: 'Florida', stateCode: 'FL' },
  { city: 'Elk Grove', state: 'California', stateCode: 'CA' },
  { city: 'Rockford', state: 'Illinois', stateCode: 'IL' },
  { city: 'Pomona', state: 'California', stateCode: 'CA' },
  { city: 'Salinas', state: 'California', stateCode: 'CA' },
  { city: 'Paterson', state: 'New Jersey', stateCode: 'NJ' },
  { city: 'Bridgeport', state: 'Connecticut', stateCode: 'CT' },
  { city: 'Kansas City', state: 'Kansas', stateCode: 'KS' },
  { city: 'Bellevue', state: 'Washington', stateCode: 'WA' },
  { city: 'Syracuse', state: 'New York', stateCode: 'NY' },
  { city: 'Sunnyvale', state: 'California', stateCode: 'CA' },
  { city: 'Torrance', state: 'California', stateCode: 'CA' },
  { city: 'McAllen', state: 'Texas', stateCode: 'TX' },
  { city: 'Escondido', state: 'California', stateCode: 'CA' },
  { city: 'Naperville', state: 'Illinois', stateCode: 'IL' },
  { city: 'Dayton', state: 'Ohio', stateCode: 'OH' },
  { city: 'Hollywood', state: 'Florida', stateCode: 'FL' },
  { city: 'Sunnyvale', state: 'California', stateCode: 'CA' },
  { city: 'Alexandria', state: 'Virginia', stateCode: 'VA' },
  { city: 'Mesquite', state: 'Texas', stateCode: 'TX' },
  { city: 'Hampton', state: 'Virginia', stateCode: 'VA' },
  { city: 'Pasadena', state: 'California', stateCode: 'CA' },
  { city: 'Orange', state: 'California', stateCode: 'CA' },
  { city: 'Savannah', state: 'Georgia', stateCode: 'GA' },
  { city: 'Cary', state: 'North Carolina', stateCode: 'NC' },
  { city: 'Fullerton', state: 'California', stateCode: 'CA' },
  { city: 'Warren', state: 'Michigan', stateCode: 'MI' }
]

/**
 * Search for US cities by query string
 * @param query Search term
 * @param limit Maximum number of results (default: 10)
 * @returns Array of matching cities
 */
export function searchUSCities(query: string, limit: number = 10): USCity[] {
  if (!query.trim()) return []
  
  const searchTerm = query.toLowerCase().trim()
  
  const matches = US_CITIES.filter(location => {
    const cityMatch = location.city.toLowerCase().includes(searchTerm)
    const stateMatch = location.state.toLowerCase().includes(searchTerm)
    const stateCodeMatch = location.stateCode.toLowerCase().includes(searchTerm)
    const fullLocationMatch = `${location.city}, ${location.stateCode}`.toLowerCase().includes(searchTerm)
    
    return cityMatch || stateMatch || stateCodeMatch || fullLocationMatch
  })
  
  // Sort by relevance: exact city name match first, then starts with, then contains
  return matches
    .sort((a, b) => {
      const aCity = a.city.toLowerCase()
      const bCity = b.city.toLowerCase()
      
      // Exact match
      if (aCity === searchTerm && bCity !== searchTerm) return -1
      if (bCity === searchTerm && aCity !== searchTerm) return 1
      
      // Starts with
      if (aCity.startsWith(searchTerm) && !bCity.startsWith(searchTerm)) return -1
      if (bCity.startsWith(searchTerm) && !aCity.startsWith(searchTerm)) return 1
      
      // Alphabetical for remaining
      return aCity.localeCompare(bCity)
    })
    .slice(0, limit)
}

/**
 * Format a location for display
 * @param location USCity object
 * @returns Formatted string "City, ST"
 */
export function formatLocationDisplay(location: USCity): string {
  return `${location.city}, ${location.stateCode}`
}