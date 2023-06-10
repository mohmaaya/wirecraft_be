const axios = require('axios');
require('dotenv').config();

const geoLocation = async (city) => {
  try {
    const response = await axios.get('https://api.api-ninjas.com/v1/geocoding', {
      params: { city },
      headers: {
        'X-Api-Key': process.env.GEO_LOCATION_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error('Request failed:', error.message);
    throw error;
  }
};

module.exports = geoLocation

 