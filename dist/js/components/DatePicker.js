//import BaseWidget from '../components/BaseWidget.js';
import BaseWidget from './BaseWidget.js';
import utils from '../utils.js';
import {select, settings} from '../settings.js';

class DatePicker extends BaseWidget{
  constructor(wrapper){
    super(wrapper, utils.dateToStr(new Date()));
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);
    thisWidget.initPlugin();
  }
  initPlugin(){
    const thisWidget = this;

    thisWidget.minDate = new Date();
    thisWidget.maxDate = utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture);
    // eslint-disable-next-line no-undef
    thisWidget.fp = flatpickr(thisWidget.dom.input, {
      defaultDate: thisWidget.minDate,
      minDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,
      locale: {
        firstDayOfWeek: 1
      },
      disable: [
        function(date) {
          return (date.getDay() === 1);
        }
      ],
      onChange: function(selectedDates, dateStr) {
        thisWidget.value = dateStr;
      },
    });

    thisWidget.dom.input.value = utils.dateToStr(thisWidget.minDate);
  }

  resetDatePicker() {
    const thisWidget = this;

    thisWidget.fp.setDate(this.minDate);
    thisWidget.setValue(utils.dateToStr(new Date()));
  }

  parseValue(value){
    return value;
  }

  isValid(){
    return true;
  }

  renderValue(){

  }
}

export default DatePicker;
