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

function renderPlaceResult(placeResult){
    return `<div class='venue-result'>
        <h3>${placeResult.venue.name}</h3>
        <h4>Category: ${placeResult.venue.categories[0].name}</h4>
        <p>${placeResult.venue.location.formattedAddress.join("<br>")}</p>
    </div>`
}

function displayRecResults(recommendsJson){
    //display recommended places from foursquare
    const results = recommendsJson.response.groups[0];
    const resultsHTML = results.items.map(item => renderPlaceResult(item)).join("\n");
    const recommendHTML = `<h2>${results.type}</h2>
    ${resultsHTML}
    <p>Powered by Foursquare</p>`;
    $('#js-recommend-places').empty();
    $('#js-recommend-places').html(recommendHTML);
    $('#js-results').prop('hidden', false);
}

function getRecommendations(locationJson){
    const latitude = Math.round(locationJson[0].lat * 100)/100;
    const longitude = Math.round(locationJson[0].lon * 100)/100;
    const recParams = {
        client_id: 'MHT31R5PBOCZ4WEQLEQTRO5A42NLUQEEY1HA2SAZUTRIWJBI',
        client_secret: 'JB4HKNXIGKFPGE23JQVFAMOGLSUVHNKSCNKCU3M3Z33RVWVI',
        ll: `${latitude},${longitude}`,
        section: 'topPicks',
        v: '20190112',
        limit: 10,
        time: 'any',
        day: 'any'
    }
    const recQuery = formatQueryParams(recParams);
    const recUrl = FOUR_BASE_URL + '?' + recQuery;
    console.log(recUrl);
    //call to foursquare API
    fetch(recUrl)
    .then(response => {
        if (response.ok) return response.json();
        throw new Error (response.statusText);
    })
    .then(recommendsJson => displayRecResults(recommendsJson))
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
    .then(locationJson => getRecommendations(locationJson))
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