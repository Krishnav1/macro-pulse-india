// Major Indian cities with coordinates for AUM mapping
export interface CityCoordinates {
  name: string;
  latitude: number;
  longitude: number;
  state: string;
}

export const CITY_COORDINATES: Record<string, CityCoordinates> = {
  'Mumbai': { name: 'Mumbai', latitude: 19.0760, longitude: 72.8777, state: 'Maharashtra' },
  'Delhi': { name: 'Delhi', latitude: 28.7041, longitude: 77.1025, state: 'Delhi' },
  'Bangalore': { name: 'Bangalore', latitude: 12.9716, longitude: 77.5946, state: 'Karnataka' },
  'Bengaluru': { name: 'Bangalore', latitude: 12.9716, longitude: 77.5946, state: 'Karnataka' },
  'Hyderabad': { name: 'Hyderabad', latitude: 17.3850, longitude: 78.4867, state: 'Telangana' },
  'Chennai': { name: 'Chennai', latitude: 13.0827, longitude: 80.2707, state: 'Tamil Nadu' },
  'Pune': { name: 'Pune', latitude: 18.5204, longitude: 73.8567, state: 'Maharashtra' },
  'Kolkata': { name: 'Kolkata', latitude: 22.5726, longitude: 88.3639, state: 'West Bengal' },
  'Ahmedabad': { name: 'Ahmedabad', latitude: 23.0225, longitude: 72.5714, state: 'Gujarat' },
  'Surat': { name: 'Surat', latitude: 21.1702, longitude: 72.8311, state: 'Gujarat' },
  'Jaipur': { name: 'Jaipur', latitude: 26.9124, longitude: 75.7873, state: 'Rajasthan' },
  'Lucknow': { name: 'Lucknow', latitude: 26.8467, longitude: 80.9462, state: 'Uttar Pradesh' },
  'Chandigarh': { name: 'Chandigarh', latitude: 30.7333, longitude: 76.7794, state: 'Chandigarh' },
  'Indore': { name: 'Indore', latitude: 22.7196, longitude: 75.8577, state: 'Madhya Pradesh' },
  'Kochi': { name: 'Kochi', latitude: 9.9312, longitude: 76.2673, state: 'Kerala' },
  'Cochin': { name: 'Kochi', latitude: 9.9312, longitude: 76.2673, state: 'Kerala' },
  'Vadodara': { name: 'Vadodara', latitude: 22.3072, longitude: 73.1812, state: 'Gujarat' },
  'Nagpur': { name: 'Nagpur', latitude: 21.1458, longitude: 79.0882, state: 'Maharashtra' },
  'Visakhapatnam': { name: 'Visakhapatnam', latitude: 17.6868, longitude: 83.2185, state: 'Andhra Pradesh' },
  'Vizag': { name: 'Visakhapatnam', latitude: 17.6868, longitude: 83.2185, state: 'Andhra Pradesh' },
  'Coimbatore': { name: 'Coimbatore', latitude: 11.0168, longitude: 76.9558, state: 'Tamil Nadu' },
  'Patna': { name: 'Patna', latitude: 25.5941, longitude: 85.1376, state: 'Bihar' },
  'Bhubaneswar': { name: 'Bhubaneswar', latitude: 20.2961, longitude: 85.8245, state: 'Odisha' },
  'Gurgaon': { name: 'Gurgaon', latitude: 28.4595, longitude: 77.0266, state: 'Haryana' },
  'Gurugram': { name: 'Gurgaon', latitude: 28.4595, longitude: 77.0266, state: 'Haryana' },
  'Noida': { name: 'Noida', latitude: 28.5355, longitude: 77.3910, state: 'Uttar Pradesh' },
  'Thane': { name: 'Thane', latitude: 19.2183, longitude: 72.9781, state: 'Maharashtra' },
  'Navi Mumbai': { name: 'Navi Mumbai', latitude: 19.0330, longitude: 73.0297, state: 'Maharashtra' },
  'Ghaziabad': { name: 'Ghaziabad', latitude: 28.6692, longitude: 77.4538, state: 'Uttar Pradesh' },
  'Faridabad': { name: 'Faridabad', latitude: 28.4089, longitude: 77.3178, state: 'Haryana' },
  'Rajkot': { name: 'Rajkot', latitude: 22.3039, longitude: 70.8022, state: 'Gujarat' },
  'Meerut': { name: 'Meerut', latitude: 28.9845, longitude: 77.7064, state: 'Uttar Pradesh' },
  'Varanasi': { name: 'Varanasi', latitude: 25.3176, longitude: 82.9739, state: 'Uttar Pradesh' },
  'Amritsar': { name: 'Amritsar', latitude: 31.6340, longitude: 74.8723, state: 'Punjab' },
  'Allahabad': { name: 'Allahabad', latitude: 25.4358, longitude: 81.8463, state: 'Uttar Pradesh' },
  'Prayagraj': { name: 'Allahabad', latitude: 25.4358, longitude: 81.8463, state: 'Uttar Pradesh' },
  'Ranchi': { name: 'Ranchi', latitude: 23.3441, longitude: 85.3096, state: 'Jharkhand' },
  'Howrah': { name: 'Howrah', latitude: 22.5958, longitude: 88.2636, state: 'West Bengal' },
  'Jabalpur': { name: 'Jabalpur', latitude: 23.1815, longitude: 79.9864, state: 'Madhya Pradesh' },
  'Gwalior': { name: 'Gwalior', latitude: 26.2183, longitude: 78.1828, state: 'Madhya Pradesh' },
  'Vijayawada': { name: 'Vijayawada', latitude: 16.5062, longitude: 80.6480, state: 'Andhra Pradesh' },
  'Jodhpur': { name: 'Jodhpur', latitude: 26.2389, longitude: 73.0243, state: 'Rajasthan' },
  'Madurai': { name: 'Madurai', latitude: 9.9252, longitude: 78.1198, state: 'Tamil Nadu' },
  'Raipur': { name: 'Raipur', latitude: 21.2514, longitude: 81.6296, state: 'Chhattisgarh' },
  'Kota': { name: 'Kota', latitude: 25.2138, longitude: 75.8648, state: 'Rajasthan' },
  'Guwahati': { name: 'Guwahati', latitude: 26.1445, longitude: 91.7362, state: 'Assam' },
  'Thiruvananthapuram': { name: 'Thiruvananthapuram', latitude: 8.5241, longitude: 76.9366, state: 'Kerala' },
  'Trivandrum': { name: 'Thiruvananthapuram', latitude: 8.5241, longitude: 76.9366, state: 'Kerala' },
  'Solapur': { name: 'Solapur', latitude: 17.6599, longitude: 75.9064, state: 'Maharashtra' },
  'Hubli': { name: 'Hubli', latitude: 15.3647, longitude: 75.1240, state: 'Karnataka' },
  'Mysore': { name: 'Mysore', latitude: 12.2958, longitude: 76.6394, state: 'Karnataka' },
  'Mysuru': { name: 'Mysore', latitude: 12.2958, longitude: 76.6394, state: 'Karnataka' },
  'Tiruchirappalli': { name: 'Tiruchirappalli', latitude: 10.7905, longitude: 78.7047, state: 'Tamil Nadu' },
  'Trichy': { name: 'Tiruchirappalli', latitude: 10.7905, longitude: 78.7047, state: 'Tamil Nadu' },
  'Bareilly': { name: 'Bareilly', latitude: 28.3670, longitude: 79.4304, state: 'Uttar Pradesh' },
  'Aligarh': { name: 'Aligarh', latitude: 27.8974, longitude: 78.0880, state: 'Uttar Pradesh' },
  'Moradabad': { name: 'Moradabad', latitude: 28.8389, longitude: 78.7378, state: 'Uttar Pradesh' },
  'Jalandhar': { name: 'Jalandhar', latitude: 31.3260, longitude: 75.5762, state: 'Punjab' },
  'Bhopal': { name: 'Bhopal', latitude: 23.2599, longitude: 77.4126, state: 'Madhya Pradesh' },
  'Dehradun': { name: 'Dehradun', latitude: 30.3165, longitude: 78.0322, state: 'Uttarakhand' },
  'Nashik': { name: 'Nashik', latitude: 19.9975, longitude: 73.7898, state: 'Maharashtra' },
  'Aurangabad': { name: 'Aurangabad', latitude: 19.8762, longitude: 75.3433, state: 'Maharashtra' },
  'Ludhiana': { name: 'Ludhiana', latitude: 30.9010, longitude: 75.8573, state: 'Punjab' },
  'Agra': { name: 'Agra', latitude: 27.1767, longitude: 78.0081, state: 'Uttar Pradesh' },
  'Kanpur': { name: 'Kanpur', latitude: 26.4499, longitude: 80.3319, state: 'Uttar Pradesh' },
  'Jamshedpur': { name: 'Jamshedpur', latitude: 22.8046, longitude: 86.2029, state: 'Jharkhand' },
  'Udaipur': { name: 'Udaipur', latitude: 24.5854, longitude: 73.7125, state: 'Rajasthan' },
  'Jammu': { name: 'Jammu', latitude: 32.7266, longitude: 74.8570, state: 'Jammu and Kashmir' },
  'Srinagar': { name: 'Srinagar', latitude: 34.0837, longitude: 74.7973, state: 'Jammu and Kashmir' },
  'Mangalore': { name: 'Mangalore', latitude: 12.9141, longitude: 74.8560, state: 'Karnataka' },
  'Mangaluru': { name: 'Mangalore', latitude: 12.9141, longitude: 74.8560, state: 'Karnataka' },
  'Ernakulam': { name: 'Ernakulam', latitude: 9.9816, longitude: 76.2999, state: 'Kerala' },
  'Cuttack': { name: 'Cuttack', latitude: 20.5124, longitude: 85.8829, state: 'Odisha' },
  'Firozabad': { name: 'Firozabad', latitude: 27.1591, longitude: 78.3957, state: 'Uttar Pradesh' },
  'Bhilai': { name: 'Bhilai', latitude: 21.2095, longitude: 81.3784, state: 'Chhattisgarh' },
  'Bhiwandi': { name: 'Bhiwandi', latitude: 19.3009, longitude: 73.0643, state: 'Maharashtra' },
  'Saharanpur': { name: 'Saharanpur', latitude: 29.9680, longitude: 77.5460, state: 'Uttar Pradesh' },
  'Gorakhpur': { name: 'Gorakhpur', latitude: 26.7606, longitude: 83.3732, state: 'Uttar Pradesh' },
  'Bikaner': { name: 'Bikaner', latitude: 28.0229, longitude: 73.3119, state: 'Rajasthan' },
  'Amravati': { name: 'Amravati', latitude: 20.9374, longitude: 77.7796, state: 'Maharashtra' },
  'Jhansi': { name: 'Jhansi', latitude: 25.4484, longitude: 78.5685, state: 'Uttar Pradesh' },
  'Ulhasnagar': { name: 'Ulhasnagar', latitude: 19.2183, longitude: 73.1382, state: 'Maharashtra' },
  'Jammu Tawi': { name: 'Jammu', latitude: 32.7266, longitude: 74.8570, state: 'Jammu and Kashmir' },
  'Sangli': { name: 'Sangli', latitude: 16.8524, longitude: 74.5815, state: 'Maharashtra' },
  'Jamnagar': { name: 'Jamnagar', latitude: 22.4707, longitude: 70.0577, state: 'Gujarat' },
  'Ujjain': { name: 'Ujjain', latitude: 23.1765, longitude: 75.7885, state: 'Madhya Pradesh' },
  'Loni': { name: 'Loni', latitude: 28.7520, longitude: 77.2864, state: 'Uttar Pradesh' },
  'Siliguri': { name: 'Siliguri', latitude: 26.7271, longitude: 88.3953, state: 'West Bengal' },
  'Pondicherry': { name: 'Pondicherry', latitude: 11.9416, longitude: 79.8083, state: 'Puducherry' },
  'Puducherry': { name: 'Pondicherry', latitude: 11.9416, longitude: 79.8083, state: 'Puducherry' },
  'Nellore': { name: 'Nellore', latitude: 14.4426, longitude: 79.9865, state: 'Andhra Pradesh' },
  'Ajmer': { name: 'Ajmer', latitude: 26.4499, longitude: 74.6399, state: 'Rajasthan' },
  'Akola': { name: 'Akola', latitude: 20.7002, longitude: 77.0082, state: 'Maharashtra' },
  'Gulbarga': { name: 'Gulbarga', latitude: 17.3297, longitude: 76.8343, state: 'Karnataka' },
  'Kalaburagi': { name: 'Gulbarga', latitude: 17.3297, longitude: 76.8343, state: 'Karnataka' },
  'Tiruppur': { name: 'Tiruppur', latitude: 11.1085, longitude: 77.3411, state: 'Tamil Nadu' },
  'Malegaon': { name: 'Malegaon', latitude: 20.5579, longitude: 74.5287, state: 'Maharashtra' },
  'Gaya': { name: 'Gaya', latitude: 24.7955, longitude: 85.0002, state: 'Bihar' },
  'Jalgaon': { name: 'Jalgaon', latitude: 21.0077, longitude: 75.5626, state: 'Maharashtra' },
  'Unnao': { name: 'Unnao', latitude: 26.5464, longitude: 80.4879, state: 'Uttar Pradesh' },
  'Latur': { name: 'Latur', latitude: 18.4088, longitude: 76.5604, state: 'Maharashtra' },
  'Patiala': { name: 'Patiala', latitude: 30.3398, longitude: 76.3869, state: 'Punjab' },
  'Tirunelveli': { name: 'Tirunelveli', latitude: 8.7139, longitude: 77.7567, state: 'Tamil Nadu' },
  'Rohtak': { name: 'Rohtak', latitude: 28.8955, longitude: 76.6066, state: 'Haryana' },
  'Korba': { name: 'Korba', latitude: 22.3595, longitude: 82.7501, state: 'Chhattisgarh' },
  'Nanded': { name: 'Nanded', latitude: 19.1383, longitude: 77.3210, state: 'Maharashtra' },
  'Panipat': { name: 'Panipat', latitude: 29.3909, longitude: 76.9635, state: 'Haryana' },
  'Muzaffarpur': { name: 'Muzaffarpur', latitude: 26.1225, longitude: 85.3906, state: 'Bihar' },
  'Mathura': { name: 'Mathura', latitude: 27.4924, longitude: 77.6737, state: 'Uttar Pradesh' },
  'Rajahmundry': { name: 'Rajahmundry', latitude: 17.0005, longitude: 81.8040, state: 'Andhra Pradesh' },
  'Rajahmahendravaram': { name: 'Rajahmundry', latitude: 17.0005, longitude: 81.8040, state: 'Andhra Pradesh' },
  'Bilaspur': { name: 'Bilaspur', latitude: 22.0797, longitude: 82.1409, state: 'Chhattisgarh' },
  'Shahjahanpur': { name: 'Shahjahanpur', latitude: 27.8800, longitude: 79.9119, state: 'Uttar Pradesh' },
  'Parbhani': { name: 'Parbhani', latitude: 19.2608, longitude: 76.7611, state: 'Maharashtra' },
  'Muzaffarnagar': { name: 'Muzaffarnagar', latitude: 29.4727, longitude: 77.7085, state: 'Uttar Pradesh' },
  'Ratlam': { name: 'Ratlam', latitude: 23.3315, longitude: 75.0367, state: 'Madhya Pradesh' },
  'Durgapur': { name: 'Durgapur', latitude: 23.5204, longitude: 87.3119, state: 'West Bengal' },
  'Shillong': { name: 'Shillong', latitude: 25.5788, longitude: 91.8933, state: 'Meghalaya' },
  'Imphal': { name: 'Imphal', latitude: 24.8170, longitude: 93.9368, state: 'Manipur' },
  'Haridwar': { name: 'Haridwar', latitude: 29.9457, longitude: 78.1642, state: 'Uttarakhand' },
  'Rishikesh': { name: 'Rishikesh', latitude: 30.0869, longitude: 78.2676, state: 'Uttarakhand' },
  'Panaji': { name: 'Panaji', latitude: 15.4909, longitude: 73.8278, state: 'Goa' },
  'Panjim': { name: 'Panaji', latitude: 15.4909, longitude: 73.8278, state: 'Goa' },
  'Vasco': { name: 'Vasco', latitude: 15.3983, longitude: 73.8156, state: 'Goa' },
  'Margao': { name: 'Margao', latitude: 15.2832, longitude: 73.9667, state: 'Goa' },
  'Shimla': { name: 'Shimla', latitude: 31.1048, longitude: 77.1734, state: 'Himachal Pradesh' },
  'Gangtok': { name: 'Gangtok', latitude: 27.3389, longitude: 88.6065, state: 'Sikkim' },
  'Itanagar': { name: 'Itanagar', latitude: 27.0844, longitude: 93.6053, state: 'Arunachal Pradesh' },
  'Kohima': { name: 'Kohima', latitude: 25.6751, longitude: 94.1086, state: 'Nagaland' },
  'Aizawl': { name: 'Aizawl', latitude: 23.7271, longitude: 92.7176, state: 'Mizoram' },
  'Agartala': { name: 'Agartala', latitude: 23.8315, longitude: 91.2868, state: 'Tripura' },
  'Dispur': { name: 'Dispur', latitude: 26.1433, longitude: 91.7898, state: 'Assam' },
  'Port Blair': { name: 'Port Blair', latitude: 11.6234, longitude: 92.7265, state: 'Andaman and Nicobar Islands' },
  'Kavaratti': { name: 'Kavaratti', latitude: 10.5669, longitude: 72.6369, state: 'Lakshadweep' },
  'Daman': { name: 'Daman', latitude: 20.4283, longitude: 72.8397, state: 'Daman and Diu' },
  'Silvassa': { name: 'Silvassa', latitude: 20.2737, longitude: 72.9960, state: 'Dadra and Nagar Haveli' },
};

// Function to get coordinates for a city (case-insensitive, handles variations)
export function getCityCoordinates(cityName: string): CityCoordinates | null {
  const normalizedName = cityName.trim();
  
  // Direct match
  if (CITY_COORDINATES[normalizedName]) {
    return CITY_COORDINATES[normalizedName];
  }
  
  // Case-insensitive match
  const lowerCityName = normalizedName.toLowerCase();
  const matchedKey = Object.keys(CITY_COORDINATES).find(
    key => key.toLowerCase() === lowerCityName
  );
  
  if (matchedKey) {
    return CITY_COORDINATES[matchedKey];
  }
  
  return null;
}

// Get all cities as array
export function getAllCities(): CityCoordinates[] {
  const uniqueCities = new Map<string, CityCoordinates>();
  
  Object.values(CITY_COORDINATES).forEach(city => {
    if (!uniqueCities.has(city.name)) {
      uniqueCities.set(city.name, city);
    }
  });
  
  return Array.from(uniqueCities.values());
}
