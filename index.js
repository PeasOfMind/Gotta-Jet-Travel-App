//Weather API
const WEATHER_BASE_URL = 'https://api.weatherbit.io/v2.0/current';

const weatherbitKey = 'd71c43c198a0496980e61a6b389cc98a';

//Geocoding API (LocationIQ)

const GEO_BASE_URL = 'https://us1.locationiq.com/v1/search.php';

const geocodeKey = `pk.d192d95e312fef7e3b96dd5355e86c12`;

//TODO: convert user input into geocode (longitude and latitude WGS 84). Need the google geocode API

//Currency API
const XCHANGE_BASE_URL = 'https://api.exchangeratesapi.io/latest';

//Foursquare API
const FOUR_BASE_URL = 'https://api.foursquare.com/v2/venues/explore';

const idKey = 'MHT31R5PBOCZ4WEQLEQTRO5A42NLUQEEY1HA2SAZUTRIWJBI';
const secretKey ='JB4HKNXIGKFPGE23JQVFAMOGLSUVHNKSCNKCU3M3Z33RVWVI';

//Youtube API
const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

const youtubeKey = 'AIzaSyDOszIaG1Ao6Yf66WAw2n83SUma7jnzRRA';

//TODO: Add source credits for all apis
//TODO - add language of destination country

//TODO - future: add autocomplete dropdown feature
//TODO - future: test for edge cases for countries (e.g. GB vs. UK vs. England vs. Britain)

//capitalize first letter of every word in the string & trim off spaces at the ends
function toTitleCase(str){
    const strArr = str.trim().toLowerCase().split(' ');
    let newStrArr = strArr.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    return newStrArr.join(' ');
}

function getCountryIdx(country){
    //finds index of element in the countriesArray containing the user input country
    if(country.length <= 3) country = country.toUpperCase();
    else country = toTitleCase(country);
    let countryIdx = countriesArray.findIndex(element => element.name.common === country);

    //if country isn't found by the common name, check alt spellings
    if (countryIdx === -1) {
        countryIdx = countriesArray.findIndex(element => element.altSpellings.includes(country));
    }

    return countryIdx;
    //TODO: generate error if country isn't found in countriesArray
    //TODO: account for alternative names
}

//grabs the capital city of the specified country index
function getCapital(idx){
    //get capital
    return countriesArray[idx].capital[0];
}

//fetches corresponding currency code for the specified country index
function convertToCurrency(idx){
    //get currency code
    return countriesArray[idx].currency[0];
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

//VIDEO RESULTS//

//puts each result into html string format
function renderVideoResult(result){
    return `<div class="search-result">
    <h3 class="result-title">${result.snippet.title}</h3>
    <input type="image" class="trigger" id="${result.id.videoId}" aria-label="Open Video in Lightbox: ${result.snippet.title}"
    src="${result.snippet.thumbnails.medium.url}" alt="${result.snippet.title}">
</div>`
}

function displayYoutubeResults(videoJson){
    //HTML string array containing the results of the search
    const resultsHTML = videoJson.items.map(item => renderVideoResult(item)).join("\n");
    //put into HTML
    $('#js-video-tips').empty();
    $('#js-video-tips').html('<h2>Watch some travel tips</h2>');
    $('#js-video-tips').append(resultsHTML);
    $('#js-results').prop('hidden', false);
}

function getVideos(locationQuery){
    const searchParams = {
        key: youtubeKey,
        q: 'Travel Tips ' + locationQuery,
        part: 'snippet',
        type: 'video',
        videoEmbeddable: true
    }
    const searchString = formatQueryParams(searchParams);
    const videoSearchURL = YOUTUBE_SEARCH_URL + '?' + searchString;
    fetch(videoSearchURL)
    .then(response => {
        if (response.ok) return response.json();
        throw new Error (response.statusText);
    })
    .then(videoJson => displayYoutubeResults(videoJson))
    .catch(err => {
        //Bad case: display error message, hide results section
        $('#js-error-msg').text(`Something went wrong: ${err.message}`);
        $('#js-results').prop('hidden', true);
        $('#js-error-msg').prop('hidden', false);
    }) 
}

//FOURSQUARE RECOMMENDATIONS RESULTS//

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
    const recommendHTML = `<h2>${results.type} around ${recommendsJson.response.headerFullLocation}</h2>
    ${resultsHTML}
    <p>Powered by Foursquare</p>`;
    $('#js-recommend-places').empty();
    $('#js-recommend-places').html(recommendHTML);
    $('#js-results').prop('hidden', false);
}

function getRecommendations(latitude, longitude){
    const recParams = {
        client_id: 'MHT31R5PBOCZ4WEQLEQTRO5A42NLUQEEY1HA2SAZUTRIWJBI',
        client_secret: 'JB4HKNXIGKFPGE23JQVFAMOGLSUVHNKSCNKCU3M3Z33RVWVI',
        ll: `${latitude},${longitude}`,
        section: 'topPicks',
        v: '20190112',
        limit: 5,
        time: 'any',
        day: 'any'
    }
    const recQuery = formatQueryParams(recParams);
    const recUrl = FOUR_BASE_URL + '?' + recQuery;
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

//WEATHER RESULTS//

//TODO: display 5 or 6 days weather results (excluding today): min, max, probability of precipitation
function displayWeatherResults(weatherJson){
    //display weather results
    const results = weatherJson.data[0];
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

function getWeather(latitude, longitude){
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
    .then(weatherJson => displayWeatherResults(weatherJson))
    .catch(err => {
        //Bad case: display error message, hide results section
        $('#js-error-msg').text(`Something went wrong: ${err.message}`);
        $('#js-results').prop('hidden', true);
        $('#js-error-msg').prop('hidden', false);
    });
}

//LATITUDE AND LONGITUDE (FOR OTHER API USE)//

function formatLatLon(locationJson){
    //gets the latitude and longitude (rounded)
    const latitude = Math.round(locationJson[0].lat * 100)/100;
    const longitude = Math.round(locationJson[0].lon * 100)/100;
    //call the weather and foursquare recommendations APIs
    getWeather(latitude, longitude);
    getRecommendations(latitude, longitude);
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
    .then(locationJson => formatLatLon(locationJson))
    .catch(err => {
        //Bad case: display error message, hide results section
        $('#js-error-msg').text(`Something went wrong: ${err.message}`);
        $('#js-results').prop('hidden', true);
        $('#js-error-msg').prop('hidden', false);
    });
}

//EXCHANGE RATE RESULTS//

function displayXchangeResults(responseJson, toCurrency, fromCurrency){
    //round the given exchange rate
    const roundedRate = Math.round(responseJson.rates[toCurrency] * 100)/100;
    //get currency symbols from currencyCodes and display along with the exchange rate
    const currencyHTML = `<h2>Currency Conversion</h2>
    <p>${currencyCodes[fromCurrency].name} to ${currencyCodes[toCurrency].name
    }: ${currencyCodes[fromCurrency].symbol} 1 = ${currencyCodes[toCurrency].symbol
    } ${roundedRate}</p>`
    $('#js-currency').empty();
    $('#js-currency').html(currencyHTML);
    $('#js-results').prop('hidden', false);
}

//call the exchangeRate API. USD is default (assume user is in the US)
function getXchangeRate(toCurrency, fromCurrency = 'USD'){
    const url = `${XCHANGE_BASE_URL}?base=${fromCurrency}&symbols=${toCurrency}`;
    fetch(url)
    .then(response => {
        if (response.ok) return response.json();
        throw new Error (response.statusText);
    })
    .then(responseJson => displayXchangeResults(responseJson, toCurrency, fromCurrency))
    .catch(err => {
        //Bad case: display error message, hide results section
        $('#js-error-msg').text(`Something went wrong: ${err.message}`);
        $('#js-results').prop('hidden', true);
        $('#js-error-msg').prop('hidden', false);
    });
}

function languages(countryIdx){
    const langArray = Object.values(countriesArray[countryIdx].languages);
    let langToLearn = 'Time to brush up on your '
    if (langArray.includes('English')) langToLearn = "You'll get by just fine with English";
    else if (langArray.length === 1) langToLearn += `${langArray[0]}.`
    else if (langArray.length === 2) langToLearn += `${langArray[0]} and/or ${langArray[1]}.`;
    else langArray.forEach(function(language, idx){
        if(idx === langArray.length-1) langToLearn += `and/or ${language}.`;
        else langToLearn += `${language}, `;
    });
    $('#js-language').html(`<h2>${langToLearn}</h2>`);
}

function generateErr(query){
    $('#js-error-msg').html(`<h2>Sorry, ${query} not found. Try checking your spelling or simplifying your search.</h2>`)
    $('#js-results').prop('hidden', true);
    $('#js-error-msg').prop('hidden', false);
}

function watchSubmit(){
    $('.js-form').submit( event => {
        event.preventDefault();

        //get user input for destination city and country
        let cityQuery = $('#js-city').val().toLowerCase();
        const countryQuery = ($('#js-country').val());
        const originCountry = ($('#js-origin').val());

        const countryIdx = getCountryIdx(countryQuery);

        //show error to user if country can't be found
        if (countryIdx === -1) {generateErr(countryQuery);
        } else {
            //if the user didn't enter a city, make it the capital of the country
            //also call the video tips with the country
            if(!cityQuery) {
                cityQuery = getCapital(countryIdx);
                getVideos(countryQuery);
            } else getVideos(cityQuery); //call video tips with the city

            //get latitude and longitude in order to fetch weather and recommendations
            getLatLon(cityQuery, countryQuery);

            //get currency code of destination country
            const currencyCode = convertToCurrency(countryIdx);

            //set default origin country to US
            let originCountryIdx = getCountryIdx('United States');

            //if the user entered a origin country, get the currency code for that instead
            if (originCountry) {
                originCountryIdx = getCountryIdx(originCountry);

                //show error to user if country can't be found
                if (originCountryIdx === -1) {generateErr(originCountry);
                } else {
                    const originCurrencyCode = convertToCurrency(originCountryIdx);
                    getXchangeRate(currencyCode, originCurrencyCode);
                }
            } else getXchangeRate(currencyCode);

            //Tell user what language(s) to learn
            languages(countryIdx);
        }
    });
}

//makes the html code for the embedded video link using iframe
function renderEmbedLink(videoCode){
    return `<iframe width="560" height="315" 
    src="https://www.youtube.com/embed/${videoCode}" frameborder="0" 
    allow="autoplay; encrypted-media" allowfullscreen></iframe>`
}

//makes modal visible or invisible
function toggleModal(){
    $('.modal').toggleClass('show-modal');
}

function watchModal(){
    $('#js-video-tips').on('click', '.trigger', function(event){
        event.preventDefault();
        //get video title
        const videoTitle = $(this).attr('alt');
        //passes the video id into renderEmbedLink
        const embedLink = renderEmbedLink($(this).attr('id'));
        //insert the embedded link into the modal paragraph 
        $('.video-player').html(embedLink).attr('aria-label',`Opened Video in Lightbox: ${videoTitle}`);
        //make the modal visible
        toggleModal();
    });

    $('.close-button').click(event => {
        //make the modal hidden
        toggleModal();
    });
}

$(watchSubmit)
$(watchModal)