
//capitalize first letter of every word in the string & trim off spaces at the ends
function toTitleCase(str){
    const strArr = str.trim().toLowerCase().split(' ');
    let newStrArr = strArr.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    return newStrArr.join(' ');
}
function formatQueryParams(params){
    const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${
        encodeURIComponent(params[key])
    }`);
    return queryItems.join('&');
}

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
    console.log(videoJson);
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
    console.log(videoSearchURL)
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

function watchSubmit(){
    $('.js-form').submit( event => {
        event.preventDefault();
        //get user input for destination city and country
        let cityQuery = $('#js-city').val().toLowerCase();
        const countryQuery = toTitleCase($('#js-country').val());
        const originCountry = toTitleCase($('#js-origin').val());
        
        //if the user didn't enter a city, search by country instead
        if(!cityQuery) getVideos(countryQuery);
        else getVideos(cityQuery)

    });
}

$(watchSubmit);