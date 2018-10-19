//Weather API

const FORECAST_BASE_URL = 'https://api.weatherbit.io/v2.0/forecast/daily';

const weatherbitKey = 'd71c43c198a0496980e61a6b389cc98a';

//Geocoding API (LocationIQ)

const GEO_BASE_URL = 'https://us1.locationiq.com/v1/search.php';

const geocodeKey = `pk.d192d95e312fef7e3b96dd5355e86c12`;

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

//TODO - future: add autocomplete dropdown feature

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

function formatString(cityQuery,countryQuery){
    let combinedQuery = `${cityQuery}+${countryQuery}`;
    combinedQuery = combinedQuery.split(' ').join('+');
    return combinedQuery;
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
    return Math.round(((cTemp * 9/5)+32) * 100)/100;
}

//VIDEO RESULTS//

//puts each result into html string format
function renderVideoResult(result){
    return `<div class="search-result">
    <div class="content">
    <div class="content-overlay"></div>
    <input type="image" class="trigger" id="${result.id.videoId}" aria-label="Open Video in Lightbox: ${result.snippet.title}"
    src="${result.snippet.thumbnails.medium.url}" alt="${result.snippet.title}">
    <div class="content-details fadeIn-top"><h3 class="result-title">${result.snippet.title}</h3></div>
    </div>
</div>`
}

function displayYoutubeResults(videoJson){
    //HTML string array containing the results of the search
    const resultsHTML = videoJson.items.map(item => renderVideoResult(item)).join("\n");
    //put into HTML
    $('#js-video-tips').empty();
    $('#js-video-tips').html('<h2>Youtube Travel Tips</h2>');
    $('#js-video-tips').append(`<div class="search-container">${resultsHTML}</div>`);
    $('#js-video-tips').append('<p class="info-source">Powered by Youtube</p>'); 
    $('#js-results').prop('hidden', false);
}

function getVideos(locationQuery){
    const searchParams = {
        key: youtubeKey,
        q: 'Travel Tips ' + locationQuery,
        part: 'snippet',
        type: 'video',
        maxResults: 6,
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
        //Bad case: display error message in the specific API sections it affects
        $('#js-video-tips').html(`<p class="API-error">Sorry couldn't get you video tips. Something went wrong: ${err.message}<p>`);
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
    const recommendHTML = `<h2>${results.type}</h2><div class="venue-container">
    ${resultsHTML}</div>
    <p class="info-source">Powered by Foursquare</p>`;
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
        limit: 6,
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
        //Bad case: display error message in the specific API sections it affects
        $('#js-recommend-places').html(`<p class="API-error">Sorry couldn't get you recommendations. Something went wrong: ${err.message}<p>`);
    });
}

//TIME RESULTS//
function displayTime(forecastJson){

    //gets the timezone offset for destination location
    const destTimezone = forecastJson.timezone;
    const zoneIdx = timeZones.findIndex(zone => zone.utc.includes(destTimezone));
    const timeOffset = timeZones[zoneIdx].offset;
    //get Date object for current location
    const d = new Date();
    //getTimezoneOffset returns minutes - convert to milliseconds to get UTC time
    const utcTime = d.getTime() + d.getTimezoneOffset()*1000*60;
    const destDate = new Date(utcTime + 1000*60*60*timeOffset);
    const timeString = destDate.toLocaleTimeString('en-US');
    $('#js-time').html(`<h2>Current Time at Destination</h2>
    <p>${timeString}</p>`);
}

/*TODO: Reach Goal for Future - add a packing list:
max UV from week's forecast = bring sunglasses, hat, sunscreen
max Temp >80 = bring shorts and tees, flip flops or sandals
min Temp <35 = bring winter coat, boots, winter accessories (mitts, gloves, scarves, beanies)
pop (probability of precipitation) > 50% any day = bring umbrella, rainboots
*/

//WEATHER FORECAST RESULTS//

function renderForecastResult(result){
    //returns date as a string of milliseconds
    let dateMilli = Date.parse(result.valid_date);
    //parsed date is 1 day off. Add 1 day in milliseconds (1 day = 86400000 milliseconds)
    dateMilli = parseInt(dateMilli)+86400000;
    //creates date object
    const dateObj = new Date(dateMilli);
    const dateString = dateObj.toLocaleDateString('en-US', {month:'short', day:'numeric'});
    return `<div class="forecast-result">
    <h3>${dateString}</h3>
    <img class="weather-icon" src="https://www.weatherbit.io/static/img/icons/${result.weather.icon
    }.png" alt="weather icon: ${result.weather.description}">
    <ul class="weather-results">
    <li>Max Temperature: ${cToF(result.max_temp)} &#8457 | ${result.max_temp} &#8451</li>
    <li>Min Temperature: ${cToF(result.min_temp)} &#8457 | ${result.min_temp} &#8451</li>
    <li>Chance of Rain: ${result.pop}%</li>
    <li>Humidity: ${result.rh}%</li>
    </ul></div>`
}

function displayForecastResults(forecastJson){
    //display forecast results
    const results = forecastJson.data;
    const forecastHTML = results.map(item => renderForecastResult(item)).join("\n");
    $('#js-weather').empty();
    $('#js-weather').html('<h2>Weather Forecast</h2>');
    $('#js-weather').append(`<div class="forecast-container">${forecastHTML}</div>`);
    $('#js-weather').append('<p class="info-source">Powered by Weatherbit</p>');
    $('#js-results').prop('hidden', false);
}

function getForecast(latitude, longitude){
    const forecastParams = {
        key: weatherbitKey,
        lat: latitude,
        lon: longitude,
        days: 7
    }
    const forecastQuery = formatQueryParams(forecastParams);
    const forecastUrl = FORECAST_BASE_URL + '?' + forecastQuery;
    //call to weatherbit location API
    fetch(forecastUrl)
    .then(response => {
        if (response.ok) return response.json();
        throw new Error (response.statusText);
    }).catch(err => {
        //Bad case: display error message in the specific API sections it affects
        $('#js-weather').html(`<p class="API-error">Sorry couldn't get you weather. Something went wrong: ${err.message}<p>`);
    }).then(forecastJson => {
        displayForecastResults(forecastJson);
        displayTime(forecastJson);
    }).catch(err => {
        $('#js-time').html(`<p class="API-error">Sorry couldn't get you time. Timezone not found.<p>`);
    });
}

//LATITUDE AND LONGITUDE (FOR OTHER API USE)//

function formatLatLon(locationJson){
    //gets the latitude and longitude (rounded)
    const latitude = Math.round(locationJson[0].lat * 100)/100;
    const longitude = Math.round(locationJson[0].lon * 100)/100;
    //call the current weather, weather forecast, foursquare recommendations APIs
    getForecast(latitude, longitude);
    getRecommendations(latitude, longitude);
}

//get the latitude and longitude of the specified destination
function getLatLon(cityQuery, countryQuery){
    const combinedQuery = formatString(cityQuery,countryQuery);
    const locationParams = {
        key: geocodeKey,
        format: 'json'
    };
    const queryString = formatQueryParams(locationParams);
    const locationUrl = GEO_BASE_URL + '?' + queryString + `&q=${combinedQuery}`;
    //call to locationIQ geocoding API
    fetch(locationUrl)
    .then(response => {
        if (response.ok) return response.json();
        throw new Error (response.statusText);
    })
    .then(locationJson => formatLatLon(locationJson))
    .catch(err => {
        //Bad case: display error message in the specific API sections it affects
        $('#js-weather').html(`<p class="API-error">Sorry couldn't get you weather. Something went wrong: ${err.message}<p>`);
        $('#js-recommend-places').html(`<p class="API-error">Sorry couldn't get you recommendations. Something went wrong: ${err.message}<p>`);
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
    if (toCurrency === fromCurrency) {
        $('#js-currency').html(`<h2>Currency Conversion</h2><p>You're not going far. Your currency is accepted at your destination too!<p>`);
    } else {
        const url = `${XCHANGE_BASE_URL}?base=${fromCurrency}&symbols=${toCurrency}`;
        fetch(url)
        .then(response => {
            if (response.ok) return response.json();
            throw new Error (response.statusText);
        })
        .then(responseJson => displayXchangeResults(responseJson, toCurrency, fromCurrency))
        .catch(err => {
            //Bad case: display error message in the specific API sections it affects
            $('#js-currency').html(`<p class="API-error">Sorry couldn't get you currency. Something went wrong: No information available on ${toCurrency}.<p>`);
        });
    }
}

//add languages from array into string
function langString(langArray){
    let langString = '';
    if (langArray.length === 1) langString = `${langArray[0]}`
    else if (langArray.length === 2) langString = `${langArray[0]} and/or ${langArray[1]}`;
    else langArray.forEach(function(language, idx){
        if(idx === langArray.length-1) langString += `and/or ${language}`;
        else langString += `${language}, `;
    });
    return langString;
}

//LANGUAGES RESULTS//

function displayLanguages(countryIdx){
    const langArray = Object.values(countriesArray[countryIdx].languages);
    let langToLearn = 'Time to brush up on your ';
    let langSubtext = '';
    //If english is the only language listed, it's fine
    if (langArray[0] === 'English' && langArray.length === 1) langToLearn = "You'll get by just fine with English";
    //If english is listed but other languages are too, recommend those also
    else if (langArray.includes('English')) {
        langToLearn = "You'll probably get by with English";
        langArray.splice((langArray.indexOf('English')), 1);
        langSubtext = `But it won't hurt to also learn some ${langString(langArray)}`;
    }
    //Else, need user to learn the country's languages
    else langToLearn += langString(langArray);
    $('#js-language').html(`<h2>${langToLearn}</h2>`);
    $('#js-language').append(`<p>${langSubtext}</p>`);
}

//VISA RESULTS//
function getVisaLink(countryIdx, originCountryIdx){
    if (countryIdx === originCountryIdx) {
        $('#js-visa').html(`<h2>Visa Requirements</h2>
        <p>No visa requirements. Roam freeeeeee!</p>`);
    } else {
        const countryCode = countriesArray[countryIdx].cca3.toLowerCase();
        $('#js-visa').html(`<h2>Visa Requirements</h2>
        <a class="visa-link" href="https://cibtvisas.com/destination/${countryCode}" target="_blank" rel="noopener noreferrer">
        Check Visa Requirements for Your Destination</a>`);
    }
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
        
        $('#js-error').prop('hidden', true);
        $('#js-preview').prop('hidden', true);

        //show error to user if country can't be found
        if (countryIdx === -1) {
            generateErr(countryQuery);
        } else {
            //if the user didn't enter a city, make it the capital of the country
            //also call the video tips with the country
            if(!cityQuery) {
                cityQuery = getCapital(countryIdx);
                getVideos(countryQuery);
            } else getVideos(`${cityQuery} ${countryQuery}`); //call video tips with the city

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
            displayLanguages(countryIdx);
            //Generate link to check visa requirements
            getVisaLink(countryIdx, originCountryIdx);
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
    $('#js-video-tips').on('click', '.content', function(event){
        event.preventDefault();
        const videoImg = $(this).find('.trigger');
        //get video title
        const videoTitle = $(videoImg).attr('alt');
        //passes the video id into renderEmbedLink
        const embedLink = renderEmbedLink($(videoImg).attr('id'));
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

$(watchSubmit);
$(watchModal);