const API_KEY = "818c19ba"
const URL = `https://www.omdbapi.com/?apikey=${API_KEY}&type=movie&`

let watchlist = JSON.parse(localStorage.getItem('watchlist')) || []
let inWatchlist = false

if (document.getElementById('watchlist')) {
    inWatchlist = true
    renderWatchlist()
}

document.addEventListener('click', async (e) => {
    if (e.target.id === 'search-btn') {
        handleSearchClick()
    } else if (e.target.dataset.add) {
        handleAddClick(e.target.dataset.add)
    } else if (e.target.dataset.remove) {
        handleRemoveClick(e.target.dataset.remove)
    }
})

async function renderWatchlist() {
    if (!inWatchlist) return

    const html = watchlist.length === 0 ?
        getEmptyHtml() :
        await getMoviesHtml(watchlist)

    document.getElementById('watchlist').innerHTML = html
}

async function handleSearchClick() {
    const searchInput = document.getElementById('search-input')

    if (!searchInput.value) return

    const data = await getBySearch(searchInput.value)

    const html = data.Response === "True" ?
        await getMoviesHtml(data.Search) :
        getNotFoundHtml()

    renderMovies(html)

    searchInput.value = ""
}

async function getBySearch(title) {
    const res = await fetch(`${URL}s=${title}`)
    return await res.json()
}

async function getById(id) {
    const res = await fetch(`${URL}i=${id}`)
    return await res.json()
}

async function getMoviesHtml(search) {
    const html = []

    for (const movie of search) {
        const id = movie.imdbID
        const data = await getById(id)
        const {Poster, Title, imdbRating, Runtime, Genre, Plot} = data

        html.push(`
<div class="card">
    <img
        src="${Poster}"
        alt="${Title} poster image"
        class="movie-poster">

    <div class="movie-data">
        <div>
            <span class="movie-title">${Title}</span>
            <i class="fa-solid fa-star star-icon"></i>
            <span class="rating">
                ${imdbRating}
            </span>
        </div>

        <div class="movie-data-sub">
            <span class="duration">${Runtime}</span>
            <span class="genre">${Genre}</span>
            <div id=${id}>
                ${getBtnHtml(id)}
            </div>
        </div>
    </div>

    <p class="description">${Plot}</p>
</div>
<hr>
        `)
    }

    return html.join("")
}

function getNotFoundHtml() {
    return `
<div class="message-box">
    <p class="message message-light">
        Unable to find what you're looking for. Please try another search.
    </p>
</div>`
}

function getBtnHtml(id) {
    const inList = watchlist.some(movie => movie.imdbID === id)

    return `
<button
    class="add-remove-btn"
    data-${inList ? "remove" : "add"}="${id}">
        <i
            class="fa-solid fa-circle-${inList ? "minus" : "plus"} circle-icon"
            data-${inList ? "remove" : "add"}="${id}"></i>
        ${inList ? "Remove" : "Watchlist"}
</button>`
}

function getEmptyHtml() {
    return `
<div class="message-box">
    <p class="message message-light">
        Your watchlist is looking a little empty...
    </p>
    <a href="index.html">
        <i class="fa-solid fa-circle-plus circle-icon"></i>
        Let's add some movies!
    </a>
</div>`
}

function handleAddClick(id) {
    watchlist.push({imdbID: id})
    localStorage.setItem('watchlist', JSON.stringify(watchlist))
    document.getElementById(id).innerHTML = getBtnHtml(id)
    renderWatchlist()
}

function handleRemoveClick(id) {
    watchlist = watchlist.filter(movie => movie.imdbID !== id)
    localStorage.setItem('watchlist', JSON.stringify(watchlist))
    document.getElementById(id).innerHTML = getBtnHtml(id)
    renderWatchlist()
}

function renderMovies(html) {
    document.getElementById('movies').innerHTML = html
}
