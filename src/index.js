import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { createMarkup } from './js/markup';
import Notiflix from 'notiflix';

const search = document.querySelector('#search-form');
const loadmore = document.querySelector('.load-more');
const card = document.querySelector('.gallery');

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '35854292-19f54c877684ffd2565072a73';

const gallery = new SimpleLightbox('.gallery a');
const axios = require('axios').default;

let currentPage = 1;

async function getImages(name, page = 1) {
  const params = new URLSearchParams({
    key: API_KEY,
    q: name,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: 40,
  });

  const response = await axios.get(`${BASE_URL}?${params}&page=${page}`);
  const datas = response.data;
  loadmore.hidden = false;

  if (page === 1 && datas.totalHits !== 0) {
    Notiflix.Notify.info(`Hooray! We found ${datas.totalHits} images.`);
  }
    card.insertAdjacentHTML('beforeend', createMarkup(datas.hits));

  if (
    card.childNodes.length + 1 > datas.totalHits &&
    datas.totalHits !== 0
  ) {
    loadmore.hidden = true;
    Notiflix.Notify.warning(
      "We're sorry, but you've reached the end of search results."
    );
  }

  if (!datas.hits.length) {
    loadmore.hidden = true;
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }
}


search.addEventListener('submit', onSearch);
loadmore.addEventListener('click', onLoad);

async function onSearch(event) {
  event.preventDefault();
  card.innerHTML = '';
  loadmore.hidden = true;
  if (!search.elements.searchQuery.value) {
    return;
  }
  try {
    const cardImage = await getImages(search.elements.searchQuery.value);
    gallery.refresh(); 
    return cardImage;
  } catch (error) {
    Notiflix.Notify.failure(`${error}`);
  }
}

async function onLoad() {
  currentPage += 1;
  try {
    const addImages = await getImages(search.elements.searchQuery.value,currentPage);
    gallery.refresh();
    return addImages;
  } catch (error) {
    Notiflix.Notify.failure(`${error}`);
  }
}