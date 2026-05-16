function scrollLeftFunc() {
  document.getElementById("slider").scrollLeft -= 200;
}

function scrollRightFunc() {
  document.getElementById("slider").scrollLeft += 200;
}
const slider = document.getElementById("slider");
const arrows = document.querySelectorAll(".slidebar");

function checkOverflow() {
  if (slider.scrollWidth <= slider.clientWidth) {
    arrows.forEach((btn) => (btn.style.display = "none"));
  } else {
    arrows.forEach((btn) => (btn.style.display = "block"));
  }
}

// run on load
window.addEventListener("load", checkOverflow);

// run on resize
window.addEventListener("resize", checkOverflow);

//API Calling

const API_KEY = "9775388d";

async function getTrendingMovies() {
  try {
    const res = await fetch(
      `https://www.omdbapi.com/?s=avengers&apikey=${API_KEY}`,
    );
    const data = await res.json();
    if (data.Search) showMovies(data.Search);
  } catch (err) {
    console.log("Trending error", err);
  }
}

const trending_container = document.querySelector(".trending-container");

function showMovies(movies) {
  movies.forEach((movie) => {
    const trending_movie = document.createElement("div");
    trending_movie.classList.add("trending-movie");
    const movie_image = document.createElement("div");
    movie_image.classList.add("movie-image");
    if (movie.Poster == "N/A") return;
    movie_image.innerHTML = `<img src="${movie.Poster}" alt="${movie.Title}">`;
    trending_movie.appendChild(movie_image);
    const movie_title = document.createElement("p");
    movie_title.innerHTML = truncateTitle(movie.Title);
    trending_movie.dataset.id = movie.imdbID;
    trending_movie.appendChild(movie_title);
    trending_container.appendChild(trending_movie);
  });
  checkOverflow();
}

function truncateTitle(title) {
  return title.length > 15 ? title.slice(0, 15) + "..." : title;
}
getTrendingMovies();

const container = document.querySelector(".trending-container");

const search_btn = document.querySelector("#btn-to-search");
search_btn.addEventListener("click", handleSearch);
const input = document.querySelector("#movieName");
input.addEventListener("keypress", (e) => {
  if (e.key == "Enter") handleSearch();
});

async function handleSearch() {
  try {
    const query = input.value.trim();
    if (!query) {
      alert("Please enter a movie name");
      return;
    }
    const res = await fetch(
      `https://www.omdbapi.com/?apikey=${API_KEY}&t=${query}`,
    );
    const data = await res.json();
    if (data.Response == "False") {
      alert(data.Error);
      return;
    }
    const firstMovie = data;
    getMovieDetails(firstMovie.imdbID);
  } catch (error) {
    alert("Something went wrong!");
  }
}

container.addEventListener("click", (e) => {
  const card = e.target.closest(".trending-movie");
  if (!card) return;
  const id = card.dataset.id;
  getMovieDetails(id);
});

async function getMovieDetails(id) {
  try {
    const res = await fetch(
      `https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}`,
    );
    const data = await res.json();
    showDetails(data);
  } catch (error) {
    alert("Something went wrong!");
  }
}

function showDetails(movie) {
  const image = document.querySelector(".image-div img");
  const info = document.querySelector(".info");
  if (movie.Poster !== "N/A") image.src = movie.Poster;
  info.innerHTML = `
    <h2>${movie.Title}</h2>
    <p class="rating">⭐ ${movie.imdbRating}</p>

    <p class="plot">${movie.Plot}</p>

    <div class="extra">

      <div class="sub-info"><p>Release Year</p><span>${movie.Year}</span></div>
      <div class="sub-info"><p>Genre</p><span>${movie.Genre}</span></div>
      <div class="sub-info"><p>Runtime</p><span>${movie.Runtime}</span></div>
      <div class="sub-info"><p>Rotten Tomatoes</p><span>${movie.Ratings?.[1]?.Value || "N/A"}</span></div>
    </div>
  `;
}

const suggestionBox = document.getElementById("suggestions");
const input_box = document.getElementById("movieName");
input_box.addEventListener("input", async () => {
  const query = input_box.value;
  if (query.length < 2) {
    suggestionBox.style.display = "none";
    return;
  }
  const res = await fetch(
    `https://www.omdbapi.com/?s=${query}&apikey=${API_KEY}`,
  );
  const data = await res.json();
  if (!data.Search) {
    suggestionBox.style.display = "none";
    return;
  }
  showSuggestions(data.Search);
});

function showSuggestions(movies) {
  suggestionBox.innerHTML = "";
  movies.forEach((movie) => {
    if (movie.Poster === "N/A") return;
    const div = document.createElement("div");
    div.classList.add("suggestion-item");
    div.innerText = movie.Title;

    div.addEventListener("click", () => {
      input.value = movie.Title;
      suggestionBox.style.display = "none";
      getMovieDetails(movie.imdbID);
    });

    suggestionBox.appendChild(div);
  });
  suggestionBox.style.display = "block";
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".search")) {
    suggestionBox.style.display = "none";
  }
});
