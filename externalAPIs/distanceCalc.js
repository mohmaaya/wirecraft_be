// Function to calculate the distance between two points using the Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const earthRadius = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadius * c;
  
    return distance.toFixed(2);
  }
  
  // Function to convert degrees to radians
  function toRadians(degrees) {
    return (degrees * Math.PI) / 180;
  }


const findGeoLocationDistances = (userLat, userLong, friendCoords) => {

    const distances =  friendCoords.map(coord => ({
        name:coord.name, 
        distance : calculateDistance(userLat, userLong, coord.latitude, coord.longitude),
        city: coord.city
    }));
        
    distances.sort((a, b) => a.distance - b.distance);
    return distances;
};

module.exports = {findGeoLocationDistances};