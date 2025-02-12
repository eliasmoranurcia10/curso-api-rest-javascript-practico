
let page = 1;
let infiniteScroll;

//Escucha el evento cuando el navegador esta cargado
window.addEventListener('DOMContentLoaded',navigator, false);
//Escucha el evento cuando se cambia el hash en el navegador
window.addEventListener('hashchange',navigator, false);
//Escucha elevento cuando se le da scroll a la pantalla
window.addEventListener('scroll',infiniteScroll,{ passive: false });

//Cambie la url a search concatenando el query
searchFormBtn.addEventListener('click', () => {
    location.hash = "#search=" + searchFormInput.value;
});

trendingBtn.addEventListener('click', () => {
    location.hash = "#trends";
});

arrowBtn.addEventListener('click', () => {
    history.back();
});


function navigator(){
    console.log({location});

    if(infiniteScroll) {
        window.removeEventListener('scroll',infiniteScroll,{ passive: false });
        infiniteScroll = undefined;
    }

    if(location.hash.startsWith('#trends')){
        trendsPage();
    } else if(location.hash.startsWith('#search=')){
        
        //Cuando el hash cambia a #search, se ejecuta la función searchPage();
        searchPage();
    } else if(location.hash.startsWith('#movie=')){
        movieDetailsPage();
    }else if(location.hash.startsWith('#category=')){
        categoriesPage();
    } else{
        homePage();
    }
    //Muestra la parte superior del documento html
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    if(infiniteScroll){
        window.addEventListener('scroll',infiniteScroll,{ passive: false });
    }
}

function homePage(){
    console.log('Home!!');
    
    headerSection.classList.remove('header-container--long');
    headerSection.style.background = '';

    arrowBtn.classList.add('inactive');
    arrowBtn.classList.remove('header-arrow--white');
    headerTitle.classList.remove('inactive');
    headerCategoryTitle.classList.add('inactive');
    searchForm.classList.remove('inactive');

    trendingPreviewSection.classList.remove('inactive');
    categoriesPreviewSection.classList.remove('inactive');
    genericSection.classList.add('inactive');
    movieDetailSection.classList.add('inactive');

    getTrendingMoviesPreview();
    getCategoriesPreview();
}

function categoriesPage(){
    console.log('Categories!!');

    headerSection.classList.remove('header-container--long');
    headerSection.style.background = '';

    arrowBtn.classList.remove('inactive');
    arrowBtn.classList.remove('header-arrow--white');
    headerTitle.classList.add('inactive');
    headerCategoryTitle.classList.remove('inactive');
    searchForm.classList.add('inactive');

    trendingPreviewSection.classList.add('inactive');
    categoriesPreviewSection.classList.add('inactive');
    genericSection.classList.remove('inactive');
    movieDetailSection.classList.add('inactive');


    const [,categoryData] = location.hash.split('=') // ['#category','id-name'];
    const [categoryId,categoryName] = categoryData.split('-');

    headerCategoryTitle.innerHTML = categoryName;

    getMoviesByCategory(categoryId);
}

function movieDetailsPage(){
    console.log('Movie!!')

    headerSection.classList.add('header-container--long');
    //headerSection.style.background = '';

    arrowBtn.classList.remove('inactive');
    arrowBtn.classList.add('header-arrow--white');
    headerTitle.classList.add('inactive');
    headerCategoryTitle.classList.add('inactive');
    searchForm.classList.add('inactive');

    trendingPreviewSection.classList.add('inactive');
    categoriesPreviewSection.classList.add('inactive');
    genericSection.classList.add('inactive');
    movieDetailSection.classList.remove('inactive');

    //['movie','4646']
    const [,movieId] = location.hash.split('=')
    getMovieById(movieId);
}

function searchPage(){
    console.log('Search!!');
    //Lógica de mostrar y ocultar secciones
    headerSection.classList.remove('header-container--long');
    headerSection.style.background = '';

    arrowBtn.classList.remove('inactive');
    arrowBtn.classList.remove('header-arrow--white');
    headerTitle.classList.add('inactive');
    headerCategoryTitle.classList.add('inactive');
    searchForm.classList.remove('inactive');

    trendingPreviewSection.classList.add('inactive');
    categoriesPreviewSection.classList.add('inactive');
    genericSection.classList.remove('inactive');
    movieDetailSection.classList.add('inactive');

    
    //Identifica el hash en string ylo separa mediante un array para sacar el valor del query.
    const [,query] = location.hash.split('='); // ['#search','valor buscado'];
    //Envía el query
    getMoviesBySearch(query);
}
function trendsPage(){
    console.log('Trends!!');

    headerSection.classList.remove('header-container--long');
    headerSection.style.background = '';

    arrowBtn.classList.remove('inactive');
    arrowBtn.classList.remove('header-arrow--white');
    headerTitle.classList.add('inactive');
    headerCategoryTitle.classList.remove('inactive');
    searchForm.classList.add('inactive');

    trendingPreviewSection.classList.add('inactive');
    categoriesPreviewSection.classList.add('inactive');
    genericSection.classList.remove('inactive');
    movieDetailSection.classList.add('inactive');

    headerCategoryTitle.innerHTML = 'Tendencias';

    getTrendingMovies();

    infiniteScroll = getPaginatedTrendingMovies;
}
