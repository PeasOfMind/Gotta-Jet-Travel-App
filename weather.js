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

function displayResults(weatherJson){
    //find weather report with highest predictability
    const bestMatch = weatherJson.consolidated_weather.reduce((preVal, currVal) => Math.max(preVal.predictability, currVal.predictability));
    console.log(bestMatch);
}

function getWeather(locationJson){
    //gets the latitude and longitude (rounded)
    const latitude = Math.round(locationJson[0].lat * 100)/100;
    const longitude = Math.round(locationJson[0].lon * 100)/100;
    const weatherUrl = `${META_BASE_URL}?lattlong=${latitude},${longitude}`;
    //call to metaweather API
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

function getLatLon(cityQuery, countryQuery){
    const locationParams = {
        key: geocodeKEY,
        city: cityQuery,
        country: countryQuery,
        format: 'json'
    };
    const queryString = formatQueryParams(locationParams);
    const locationUrl = GEO_BASE_URL + '?' + queryString;
    //call to locationIQ API
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