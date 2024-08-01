import { templates, select } from "../settings.js";
import Carousel from "./Carousel.js";

class Home {
  constructor(element, data) {
    const thisHome = this;
    thisHome.data = data;
    thisHome.favoriteCounts = JSON.parse(localStorage.getItem('favoriteCounts')) || {};
    thisHome.render(element);
    thisHome.initWidgets();
    thisHome.initActions();
    thisHome.updateLikeCounts();
    thisHome.initAudioControls();
  }

  render(element) {
    const thisHome = this;
    const generatedHTML = templates.homeSections(thisHome.data);

    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHTML;
  }

  initWidgets() {
    const thisHome = this;

    if (thisHome.carousel) {
      thisHome.carousel.destroy();
    }

    const carouselElement = thisHome.dom.wrapper.querySelector(select.containerOf.carousel);

    if (carouselElement) {
      thisHome.carousel = new Carousel(carouselElement);
    } else {
      console.error('Carousel element not found!');
    }
  }

  initActions() {
    const thisHome = this;

    const likeButtons = thisHome.dom.wrapper.querySelectorAll('.like-button');
    likeButtons.forEach(button => {
      button.addEventListener('click', (event) => thisHome.toggleLike(event));
    });
  }

  initAudioControls() {
    const thisHome = this;

    // Selecting elements from the DOM
    thisHome.dom.audio = thisHome.dom.wrapper.querySelector('audio');
    thisHome.dom.radioSelect = thisHome.dom.wrapper.querySelector('#radioSelect');
    thisHome.dom.playPauseBtn = thisHome.dom.wrapper.querySelector('#playPauseBtn');
    thisHome.dom.muteBtn = thisHome.dom.wrapper.querySelector('#muteBtn');
    thisHome.dom.volumeSlider = thisHome.dom.wrapper.querySelector('#volumeSlider');

    thisHome.dom.audio.volume = 0.25;
    thisHome.dom.volumeSlider.value = 25;

    thisHome.dom.volumeSlider.addEventListener('input', function () {
      thisHome.dom.audio.volume = thisHome.dom.volumeSlider.value / 100;
    });

    // Play/Pause toggle
    thisHome.dom.playPauseBtn.addEventListener('click', function () {
      if (thisHome.dom.audio.paused) {
        thisHome.dom.audio.play();
        thisHome.dom.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
      } else {
        thisHome.dom.audio.pause();
        thisHome.dom.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
      }
    });

    // Mute toggle
    thisHome.dom.muteBtn.addEventListener('click', function () {
      thisHome.dom.audio.muted = !thisHome.dom.audio.muted;
      thisHome.dom.muteBtn.innerHTML = thisHome.dom.audio.muted ? '<i class="fa fa-volume-mute"></i>' : '<i class="fa fa-volume-up"></i>';
    });

    // Change radio station
    thisHome.dom.radioSelect.addEventListener('change', function () {
      const selectedSource = thisHome.dom.radioSelect.value;
      thisHome.dom.audio.src = selectedSource;
      thisHome.dom.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
      //thisHome.dom.audio.play();
     // thisHome.dom.playPauseBtn.textContent = 'Pause';
    });

    // Volume control
    thisHome.dom.volumeSlider.addEventListener('input', function () {
      thisHome.dom.audio.volume = thisHome.dom.volumeSlider.value / 100;
    });
  }

  toggleLike(event) {
    const thisHome = this;
    const clickedButton = event.currentTarget;
    const imageId = clickedButton.getAttribute('data-id');

    if (!thisHome.favoriteCounts[imageId]) {
      thisHome.favoriteCounts[imageId] = 0;
    }

    thisHome.favoriteCounts[imageId] += 1;
    thisHome.updateLikeCount(imageId, clickedButton);
    localStorage.setItem('favoriteCounts', JSON.stringify(thisHome.favoriteCounts));

    clickedButton.classList.add('liked');
    setTimeout(() => {
      clickedButton.classList.remove('liked');
    }, 300);
  }

  updateLikeCount(imageId, button) {
    const likeCount = button.querySelector('.like-count');
    likeCount.textContent = this.favoriteCounts[imageId];
  }

  updateLikeCounts() {
    const thisHome = this;
    const likeButtons = thisHome.dom.wrapper.querySelectorAll('.like-button');
    likeButtons.forEach(button => {
      const imageId = button.getAttribute('data-id');
      if (thisHome.favoriteCounts[imageId]) {
        thisHome.updateLikeCount(imageId, button);
      }
    });
  }
}

export default Home;