/* global Flickity */

class Carousel {
    constructor(element) {
        const thisCarousel = this;

        thisCarousel.render(element);
        thisCarousel.initPlugin();
    }

    render(element) {
        const thisCarousel = this;

        thisCarousel.dom = {};
        thisCarousel.dom.wrapper = element;
    }

    initPlugin() {
        const thisCarousel = this;

        const flickityElement = thisCarousel.dom.wrapper;

        thisCarousel.flickity = new Flickity(flickityElement, {
            wrapAround: true,
            autoPlay: false
        });
    }

    destroy() {
        const thisCarousel = this;
        
        if (thisCarousel.flickity) {
            thisCarousel.flickity.destroy();
        }
    }
}

export default Carousel;