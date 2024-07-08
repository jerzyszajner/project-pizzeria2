import { templates } from "../settings.js";

class Tv {
    constructor(element) {
        const thisTv = this;

        thisTv.render(element);
    }

    render(element) {
        const thisTv = this;
        const generatedHTML = templates.tvSection();

        thisTv.dom = {};
        thisTv.dom.wrapper = element;

        thisTv.dom.wrapper.innerHTML = generatedHTML;
    }
      



}

export default Tv;