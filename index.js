//Weather API (climacell)
const CLIMA_BASE_URL = 'https://api2.climacell.co/v2';

// const climaKey //add api key here (use on 'apikey' header parameter)

//Geocoding API (LocationIQ)

const GEO_BASE_URL = 'https://us1.locationiq.com/v1/search.php'

const geocodeKEY = `pk.d192d95e312fef7e3b96dd5355e86c12`;

//TODO: convert user input into geocode (longitude and latitude WGS 84). Need the google geocode API

//Currency API
const XCHANGE_BASE_URL = 'https://api.exchangeratesapi.io/latest';
//need to add "?symbols=USD,[insert destination currency]" to endpoint URL


//TODO - future: add autocomplete dropdown feature
//TODO - future: test for edge cases for countries (e.g. GB vs. UK vs. England vs. Britain)