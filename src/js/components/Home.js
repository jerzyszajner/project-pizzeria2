import { templates, select } from "../settings.js";
import Carousel from "./Carousel.js";

class Home {
    constructor(element, data) {
        const thisHome = this;

        thisHome.data = data;
        thisHome.render(element);
        thisHome.initWidgets();
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
}

export default Home;