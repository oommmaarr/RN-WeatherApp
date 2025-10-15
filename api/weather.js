import axios from 'axios';
const api_key = '203e2f51e674498692e204142251410';
const endpoint = (params) =>
  `https://api.weatherapi.com/v1/forecast.json?key=${api_key}&q=${params.cityName}&days=${params.days}&aqi=no&alerts=no`;
const location = (params) =>
  `https://api.weatherapi.com/v1/search.json?key=${api_key}&q=${params.cityName}`;
const apiCall = async (endpoint) => {
  const options = {
    method: 'GET',
    url: endpoint,
  };
  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const  fetchWeather = params =>{
    let Url =  endpoint(params);
    return apiCall(Url);
}
export const fetchLocation = params =>{
    let Url =  location(params);
    return apiCall(Url);
}