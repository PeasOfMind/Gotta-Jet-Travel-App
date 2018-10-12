//capitalize first letter of every word in the string & trim off spaces at the ends
function toTitleCase(str){
    const strArr = str.trim().toLowerCase().split(' ');
    let newStrArr = strArr.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    return newStrArr.join(' ');
}

//grabs the capital city of the input country
function getCapital(country){
    //finds index of element in the countriesArray containing the user input country
    const countryIdx = countriesArray.findIndex(element => element.name.common === country);
    //get capital
    return countriesArray[countryIdx].capital[0];
}

function formatQueryParams(params){
    const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${
        encodeURIComponent(params[key])
    }`);
    return queryItems.join('&');
}

//convert celcius to farenheit
function cToF(cTemp){
    return (cTemp * 9/5)+32;
}

//TODO: display 5 or 6 days weather results (excluding today): min, max, probability of precipitation
function displayResults(weatherJson){
    //display weather results
    const results = weatherJson.data[0]
    const weatherHTML = `
    <h2>Weather</h2>
    <img class="weather-icon" src="https://www.weatherbit.io/static/img/icons/${results.weather.icon
    }.png" alt="weather icon: ${results.weather.description}">
    <ul id="weather-results">
    <li>Right Now: ${cToF(results.temp)} &#8457 | ${results.temp} &#8451</li>
    <li>Feels Like:  ${cToF(results.app_temp)} &#8457 | ${results.app_temp} &#8451</li>
    <li>Humidity: ${results.rh}%</li>
    </ul>`
    $('#js-weather').empty();
    $('#js-weather').html(weatherHTML);
    $('#js-results').prop('hidden', false);
}

/*TODO: add a packing list:
max UV from week's forecast = bring sunglasses, hat, sunscreen
max Temp >80 = bring shorts and tees, flip flops or sandals
min Temp <35 = bring winter coat, boots, winter accessories (mitts, gloves, scarves, beanies)
pop (probability of precipitation) > 50% any day = bring umbrella, rainboots
*/

//searches weather locations closest to the specified lat longcommon
function getWeather(locationJson){
    //gets the latitude and longitude (rounded)
    const latitude = Math.round(locationJson[0].lat * 100)/100;
    const longitude = Math.round(locationJson[0].lon * 100)/100;
    const weatherParams = {
        key: weatherbitKey,
        lat: latitude,
        lon: longitude
    }
    const weatherQuery = formatQueryParams(weatherParams);
    const weatherUrl = WEATHER_BASE_URL + '?' + weatherQuery;
    //call to weatherbit location API
    fetch(weatherUrl)
    .then(response => {
        if (response.ok) return response.json();
        throw new Error (response.statusText);
    })
    .then(weatherJson => displayResults(weatherJson))
    .catch(err => {
        //Bad case: display error message, hide results section
        $('#js-error-msg').text(`Something went wrong: ${err.message}`);
        $('#js-results').prop('hidden', true);
        $('#js-error-msg').prop('hidden', false);
    });
}

//get the latitude and longitude of the specified destination
function getLatLon(cityQuery, countryQuery){
    const locationParams = {
        key: geocodeKey,
        city: cityQuery,
        country: countryQuery,
        format: 'json'
    };
    const queryString = formatQueryParams(locationParams);
    const locationUrl = GEO_BASE_URL + '?' + queryString;
    //call to locationIQ geocoding API
    fetch(locationUrl)
    .then(response => {
        if (response.ok) return response.json();
        throw new Error (response.statusText);
    })
    .then(locationJson => getWeather(locationJson))
    .catch(err => {
        //Bad case: display error message, hide results section
        $('#js-error-msg').text(`Something went wrong: ${err.message}`);
        $('#js-results').prop('hidden', true);
        $('#js-error-msg').prop('hidden', false);
    });
}

function watchSubmit(){
    $('.js-form').submit( event => {
        event.preventDefault();
        //get user input for destination city and country
        let cityQuery = $('#js-city').val().toLowerCase();
        const countryQuery = toTitleCase($('#js-country').val());
        const originCountry = toTitleCase($('#js-origin').val());
        
        //if the user didn't enter a city, make it the capital of the country
        if(!cityQuery) {
            cityQuery = getCapital(countryQuery);
        }
        getLatLon(cityQuery, countryQuery);

    });
}

$(watchSubmit);