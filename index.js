//Weather API
const WEATHER_BASE_URL = 'https://api.weatherbit.io/v2.0/current';

const weatherbitKey = 'd71c43c198a0496980e61a6b389cc98a';

//Geocoding API (LocationIQ)

const GEO_BASE_URL = 'https://us1.locationiq.com/v1/search.php';

const geocodeKey = `pk.d192d95e312fef7e3b96dd5355e86c12`;

//TODO: convert user input into geocode (longitude and latitude WGS 84). Need the google geocode API

//Currency API
const XCHANGE_BASE_URL = 'https://api.exchangeratesapi.io/latest';

const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

const youtubeKey = 'AIzaSyDOszIaG1Ao6Yf66WAw2n83SUma7jnzRRA';

//TODO: Add source credits for all apis
//TODO - add language of destination country

//TODO - future: add autocomplete dropdown feature
//TODO - future: test for edge cases for countries (e.g. GB vs. UK vs. England vs. Britain)
