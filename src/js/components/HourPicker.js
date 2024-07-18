import BaseWidget from './BaseWidget.js';
import { select, settings } from '../settings.js';
import utils from '../utils.js';

class HourPicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, settings.hours.open);
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.input);
    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.output);
    thisWidget.initPlugin();
    thisWidget.initialValue = thisWidget.dom.input.value;
    thisWidget.value = thisWidget.dom.input.value;
    thisWidget.isResetting = false;
  }

  initPlugin() {
    const thisWidget = this;

    // eslint-disable-next-line no-undef
    rangeSlider.create(thisWidget.dom.input);
    thisWidget.dom.input.addEventListener('input', function () {
      if (!thisWidget.isResetting) {
        thisWidget.value = thisWidget.dom.input.value;
        console.log('inputValue', thisWidget.value);
      }
    });
  }

  resetHourPicker() {
    const thisWidget = this;

    thisWidget.isResetting = true;
    thisWidget.setValue(thisWidget.initialValue);

    // Update the slider's internal state if necessary
    thisWidget.dom.input.rangeSlider.update({
      value: thisWidget.initialValue
    });

    console.log('inputValue after reset', thisWidget.initialValue);
    thisWidget.isResetting = false;
  }

  parseValue(value) {
    return utils.numberToHour(value);
  }

  isValid() {
    return true;
  }

  renderValue() {
    const thisWidget = this;

    thisWidget.dom.output.innerHTML = thisWidget.value;
  }
}

export default HourPicker;