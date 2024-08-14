import { templates, select, classNames } from "../settings.js";
import Carousel from "./Carousel.js";

class Home {
  constructor(element, data) {
    const thisHome = this;

    thisHome.data = data;
    thisHome.likeStorage = JSON.parse(localStorage.getItem('likeStorage')) || {};
    thisHome.render(element);
    thisHome.initWidgets();
    thisHome.initActions();
    thisHome.updateAllLikeDisplays();
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

    const likeButtons = thisHome.dom.wrapper.querySelectorAll(select.gallery.likeButton);
    likeButtons.forEach(button => {
      button.addEventListener('click', (event) => thisHome.toggleLike(event));
    });

    thisHome.dom.wrapper.addEventListener('click', event => {
      if (event.target.id === 'car') {
        thisHome.animateCar(event.target);
      }
    });
  }

  animateCar(target) {
    const thisHome = this;

    // Disable pointer events to prevent interactions during the animation
    target.style.pointerEvents = 'none';

    // Remove 'animate' class to reset the animation
    target.classList.remove(classNames.audioControls.animate);

    // Play audio if it's not already defined
    thisHome.dom.snoopAudio = thisHome.dom.snoopAudio || thisHome.dom.wrapper.querySelector(select.audioControls.snoopAudio);
    thisHome.dom.snoopAudio.play();

    // Reapply 'animate' class after a short delay to trigger the animation
    setTimeout(() => {
      target.classList.add(classNames.audioControls.animate);

      // Re-enable pointer events after animation ends
      setTimeout(() => {
        target.classList.remove(classNames.audioControls.animate);
        target.style.pointerEvents = 'auto';
      }, 4900); // Animation duration
    }, 10);  // Delay before reapplying 'animate' class
  }

  initAudioControls() {
    const thisHome = this;

    // Selecting elements from the DOM
    thisHome.dom.audio = thisHome.dom.wrapper.querySelector(select.audioControls.audio);
    thisHome.dom.radioSelect = thisHome.dom.wrapper.querySelector(select.audioControls.radioSelect);
    thisHome.dom.playPauseBtn = thisHome.dom.wrapper.querySelector(select.audioControls.playPauseBtn);
    thisHome.dom.muteBtn = thisHome.dom.wrapper.querySelector(select.audioControls.muteBtn);
    thisHome.dom.volumeSlider = thisHome.dom.wrapper.querySelector(select.audioControls.volumeSlider);

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

    if (!thisHome.likeStorage[imageId]) {
      thisHome.likeStorage[imageId] = 0;
    }

    thisHome.likeStorage[imageId] += 1;
    thisHome.updateLikeDisplay(imageId, clickedButton);
    localStorage.setItem('likeStorage', JSON.stringify(thisHome.likeStorage));

    clickedButton.classList.add(classNames.gallery.liked);
    setTimeout(() => {
      clickedButton.classList.remove(classNames.gallery.liked);
    }, 300);
  }

  updateLikeDisplay(imageId, button) {
    const thisHome = this;

    const likeDisplay = button.querySelector(select.gallery.likeDisplay);
    likeDisplay.textContent = thisHome.likeStorage[imageId];
  }

  updateAllLikeDisplays() {
    const thisHome = this;
    const likeButtons = thisHome.dom.wrapper.querySelectorAll(select.gallery.likeButton);
    likeButtons.forEach(button => {
      const imageId = button.getAttribute('data-id');
      if (thisHome.likeStorage[imageId]) {
        thisHome.updateLikeDisplay(imageId, button);
      }
    });
  }
}

export default Home;