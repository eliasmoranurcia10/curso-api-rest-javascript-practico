const api = axios.create({
    baseURL: 'https://api.themoviedb.org/3/',
    headers:{
        'Content-Type': 'application/json;charset=utf-8'
    },
    params: {
        'api_key': API_KEY,
        'language': navigator.language || "es-ES"
    },
});

//Helper

function likedMoviesList(){
    //Convirtiendo a objeto lo que viene de localStorage
    const item = JSON.parse(localStorage.getItem('liked_movies'));
    let movies;

    if(item){
        movies = item;
    } else {
        movies = {};
    }
    
    return movies;
}

function likeMovie(movie){
    //Me devuelve un objeto
    const likedMovies = likedMoviesList();
    console.log(likedMovies);

    if(likedMovies[movie.id]){
        console.log('la película ya estaba en localStorage, deberíamos elimienrala');
        likedMovies[movie.id] = undefined;
    } else {
        console.log('la película no estaba en localStorage, deberíamos agregarla');
        likedMovies[movie.id] = movie;
    }

    localStorage.setItem('liked_movies',JSON.stringify(likedMovies));

    getLikedMovies();

    /* 
    if(localStorage.getItem(movie.id) == null){
        localStorage.setItem(JSON.stringify(movie.id), JSON.stringify(movie));
    } else{
        localStorage.removeItem(movie.id);
    } 
        */
}

//Util
//Clase de Lazy Loading
//entries es la lista de tarjetas img y entry los recorre a cad auno
const lazyLoader = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        //console.log({entry});
        if(entry.isIntersecting){
            const url = entry.target.getAttribute('data-img');
            //console.log(entry.target);
            entry.target.setAttribute('src', url);
        }
        
    });
});


function createMovies(movies,container, {lazyLoad = false, clean = true}){
    //limpiar el contenedor
    if (clean) {
        container.innerHTML = '';
    }
    
    movies.forEach(movie => {
       
        const movieContainer = document.createElement('div');
        movieContainer.classList.add('movie-container');
        

        const movieImg = document.createElement('img');
        movieImg.classList.add('movie-img');
        movieImg.setAttribute('alt', movie.title);

        movieImg.setAttribute(
            lazyLoad ? 'data-img': 'src',
            'https://image.tmdb.org/t/p/w300' + movie.poster_path
        );

        //Agregar un evento de click a cada elemento img
        movieImg.addEventListener('click', () => {
            location.hash = '#movie=' + movie.id;
        });

        movieImg.addEventListener('error', () => {
            movieImg.setAttribute('src','https://e0.pxfuel.com/wallpapers/912/253/desktop-wallpaper-game-over-no-signal-error-glitch-ideas-in-2021-glitch-glitch.jpg')
        });

        const movieBtn = document.createElement('button');
        movieBtn.classList.add('movie-btn');

        //Prueba
        
        /*
        const moviesLikeded = Object.values(likedMoviesList());
        console.log(movie.id);

        moviesLikeded.forEach(movieLikeado => {
            if (movieLikeado.id == movie.id) {
                movieBtn.classList.add('movie-btn--liked');
            }
        }); 
        */
        
        //Prueba

        likedMoviesList()[movie.id]  && movieBtn.classList.add('movie-btn--liked');

        movieBtn.addEventListener('click', () => {
            movieBtn.classList.toggle('movie-btn--liked');
            //SE DEBERÍA LA PELÍCULA A LOCALSTORAGE
            likeMovie(movie);
        });

        //Clase de Intersection Observer 
        //movieImg es un array que contiene una lista de imagentes
        if(lazyLoad) {
            lazyLoader.observe(movieImg);
        }

        movieContainer.appendChild(movieImg);
        movieContainer.appendChild(movieBtn);
        container.appendChild(movieContainer);
    });
}

function createCategories(categories,container){
    //limpiar el html
    container.innerHTML = '';

    categories.forEach(category => {

        const categoryContainer = document.createElement('div');
        categoryContainer.classList.add('category-container');

        const categoryTitle = document.createElement('h3');
        categoryTitle.classList.add('category-title');
        categoryTitle.setAttribute('id', 'id'+category.id);

        categoryTitle.addEventListener('click', () => {
            location.hash = `#category=${category.id}-${category.name}`;
        });

        const categoryTitleText = document.createTextNode(category.name);

        categoryTitle.appendChild(categoryTitleText);
        categoryContainer.appendChild(categoryTitle);
        container.appendChild(categoryContainer);
    });
}

//Llamados a la API

async function getTrendingMoviesPreview() {
    
    const {data} = await api('trending/movie/day');
    const movies = data.results;

    console.log(movies);

    createMovies(
        movies,
        trendingMoviesPreviewList, 
        { 
            lazyLoad:false, 
            clean:true
        }
    );

}

async function getCategoriesPreview() {
    const {data} = await api('genre/movie/list');

    const categories = data.genres;

    console.log(categories);

    createCategories(categories,categoriesPreviewList);

}

async function getMoviesByCategory(id) {
    //Se presenta la parte superior del documento html
    //window.scrollTo(0,0);
    const {data} = await api('discover/movie',{
        params:{
            with_genres: id
        }
    });
    const movies = data.results;
    
    console.log(data.total_pages);
    maxPage = data.total_pages;

    createMovies(
        movies,
        genericSection, 
        { 
            lazyLoad:true, 
            clean:true
        }
    );
}

function getPaginatedMoviesByCategory(id) {

    return async function() {
        //Calcula que el scroll haya llegado al final del documento
        const {scrollTop, scrollHeight, clientHeight} = document.documentElement;
        const scrollIsBotton = (scrollTop + scrollHeight) >= (clientHeight - 15);
        const pageIsNotMax = page < maxPage;    

        if(scrollIsBotton && pageIsNotMax){
            page++;
            const {data} = await api('discover/movie',{
                params:{
                    with_genres: id,
                    page,
                }
            });
            const movies = data.results;

            createMovies(
                movies,
                genericSection,
                { 
                    lazyLoad:true, 
                    clean:false
                }
            );
        }
    }
}

async function getMoviesBySearch(query) {
    //Se presenta la parte superior del documento html
    //window.scrollTo(0,0);
    
    const {data} = await api('search/movie',{
        params:{
            query,
        }
    });
    const movies = data.results;

    maxPage = data.total_pages;
    console.log(maxPage);

    createMovies(
        movies,
        genericSection,
        { 
            lazyLoad:false, 
            clean:true
        }
    );
}

function getPaginatedMoviesBySearch(query) {
    return async function(){
        //Calcula que el scroll haya llegado al final del documento
        const {scrollTop, scrollHeight, clientHeight} = document.documentElement;
        const scrollIsBotton = (scrollTop + scrollHeight) >= (clientHeight - 15);
        const pageIsNotMax = page < maxPage;    

        if(scrollIsBotton && pageIsNotMax){
            page++;
            const {data} = await api('search/movie',{
                params:{
                    query,
                    page,
                }
            });
            const movies = data.results;
        
            createMovies(
                movies,
                genericSection,
                { 
                    lazyLoad: true, 
                    clean: false
                }
            );
        }
    }
}

async function getTrendingMovies() {
    
    const {data} = await api('trending/movie/day');
    const movies = data.results;

    let maxPage = data.total_pages;

    createMovies(
        movies,
        genericSection,
        { 
            lazyLoad:true, 
            clean:true
        }
    );

    /* 
    const btnLoadMore = document.createElement('button');
    btnLoadMore.innerText = 'Cargar más';
    btnLoadMore.addEventListener('click', getPaginatedTrendingMovies );
    genericSection.appendChild(btnLoadMore); 
    */

}

async function getPaginatedTrendingMovies() {
    //Calcula que el scroll haya llegado al final del documento
    const {scrollTop, scrollHeight, clientHeight} = document.documentElement;

    const scrollIsBotton = (scrollTop + scrollHeight) >= (clientHeight - 15);

    const pageIsNotMax = page < maxPage;    

    if(scrollIsBotton && pageIsNotMax){
        page++;
        const {data} = await api('trending/movie/day',{
            params:{
                page,
            },
        });
        const movies = data.results;

        createMovies(
            movies,
            genericSection,
            { 
                lazyLoad:true, 
                clean:false
            }
        );
    }

    /* 
    CREANDO UN BOTON PARA CARGAR MÁS PELÍCULAS
    const btnLoadMore = document.createElement('button');
    btnLoadMore.innerText = 'Cargar más';
    btnLoadMore.addEventListener('click', getPaginatedTrendingMovies );
    genericSection.appendChild(btnLoadMore); 
    */
}

async function getMovieById(id) {
    
    const {data: movie} = await api('movie/' + id);

    console.log(movie);

    const movieImgUrl = 'https://image.tmdb.org/t/p/w500' + movie.poster_path;
    console.log(movieImgUrl);
    headerSection.style.background = `
        linear-gradient(180deg, rgba(0, 0, 0, 0.35) 19.27%, rgba(0, 0, 0, 0) 29.17%),
        url(${movieImgUrl})
    `;

    movieDetailTitle.textContent = movie.title;
    movieDetailDescription.textContent = movie.overview;
    movieDetailScore.textContent = movie.vote_average;

    createCategories(movie.genres,movieDetailCategoriesList);

    getRelatedMoviesId(id);
}

async function getRelatedMoviesId(id) {
    const {data} = await api(`movie/${id}/recommendations`);
    const relatedMovies = data.results;

    createMovies(
        relatedMovies,
        relatedMoviesContainer,
        { 
            lazyLoad:false, 
            clean:true
        }
    );
}

function getLikedMovies(){
    const likedMovies = likedMoviesList();

    const moviesArray = Object.values(likedMovies);

    createMovies(
        moviesArray,
        likedMovieListArticle,
        {
            lazyLoad:true,
            clean:true
        }
    );
}