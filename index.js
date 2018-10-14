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

//turns the user input country into the corresponding currency code
function convertToCurrency(country){
    //finds index of element in the countriesArray containing the user input country
    const countryIdx = countriesArray.findIndex(element => element.name.common === country);
    
    //TODO: generate error if country isn't found in countriesArray
    //TODO: account for alternative names

    //get currency code
    return countriesArray[countryIdx].currency[0];
}

function displayResults(responseJson, toCurrency, fromCurrency){
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
function getExchangeRate(toCurrency, fromCurrency = 'USD'){
    const url = `${XCHANGE_BASE_URL}?base=${fromCurrency}&symbols=${toCurrency}`;
    fetch(url)
    .then(response => {
        if (response.ok) return response.json();
        throw new Error (response.statusText);
    })
    .then(responseJson => displayResults(responseJson, toCurrency, fromCurrency))
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
        const cityQuery = $('#js-city').val().toLowerCase();
        const countryQuery = toTitleCase($('#js-country').val());
        const originCountry = toTitleCase($('#js-origin').val());

        //get currency code of destination country
        const currencyCode = convertToCurrency(countryQuery);
        //if the user entered a origin country, get the currency code for that too
        if (originCountry) {
            const originCurrencyCode = convertToCurrency(originCountry);
            getExchangeRate(currencyCode, originCurrencyCode);
        } else getExchangeRate(currencyCode);
    });
}

$(watchSubmit)