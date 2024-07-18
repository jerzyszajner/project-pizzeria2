import { classNames, select, settings, templates } from "../settings.js";
import { validatePhone, validateAddress } from "../validation.js";
import utils from "../utils.js";
import Alert from "./alert.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";

class Booking {
    constructor(element) {
        const thisBooking = this;

        thisBooking.selectedTable = [];

        thisBooking.render(element);
        thisBooking.initWidgets();
        thisBooking.getData();
        thisBooking.initActions();
    }

    getData() {
        const thisBooking = this;

        const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
        const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

        const params = {
            bookings: [
                startDateParam,
                endDateParam,
            ],
            eventsCurrent: [
                settings.db.notRepeatParam,
                startDateParam,
                endDateParam,
            ],
            eventsRepeat: [
                settings.db.repeatParam,
                endDateParam,
            ],
        };

        const urls = {
            bookings: settings.db.url + '/' + settings.db.bookings + '?' + params.bookings.join('&'),
            eventsCurrent: settings.db.url + '/' + settings.db.events + '?' + params.eventsCurrent.join('&'),
            eventsRepeat: settings.db.url + '/' + settings.db.events + '?' + params.eventsRepeat.join('&'),
        };

        Promise.all([
            fetch(urls.bookings),
            fetch(urls.eventsCurrent),
            fetch(urls.eventsRepeat),
        ])
            .then(function (allResponses) {
                const bookingsResponse = allResponses[0];
                const eventsCurrentResponse = allResponses[1];
                const eventsRepeatResponse = allResponses[2];
                return Promise.all([
                    bookingsResponse.json(),
                    eventsCurrentResponse.json(),
                    eventsRepeatResponse.json(),
                ]);
            })
            .then(function ([bookings, eventsCurrent, eventsRepeat]) {
                thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
            });
    }

    parseData(bookings, eventsCurrent, eventsRepeat) {
        const thisBooking = this;

        thisBooking.booked = {};

        for (let item of bookings) {
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        for (let item of eventsCurrent) {
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        const minDate = thisBooking.datePicker.minDate;
        const maxDate = thisBooking.datePicker.maxDate;

        for (let item of eventsRepeat) {
            if (item.repeat == 'daily') {
                for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
                    thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
                }
            }
        }

        thisBooking.updateDOM();
    }

    makeBooked(date, hour, duration, table) {
        const thisBooking = this;

        if (typeof thisBooking.booked[date] == 'undefined') {
            thisBooking.booked[date] = {};
        }

        const startHour = utils.hourToNumber(hour);

        for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {

            if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
                thisBooking.booked[date][hourBlock] = [];
            }

            thisBooking.booked[date][hourBlock].push(table);
        }
    }

    initTables(event) {
        const thisBooking = this;
        const clickedElement = event.target;

        if (clickedElement.matches(select.booking.table)) {
            const tableId = clickedElement.getAttribute(settings.booking.tableIdAttribute);

            if (clickedElement.classList.contains(classNames.booking.tableBooked)) {
                new Alert('This table is already booked.');
            } else {
                if (thisBooking.selectedTable.includes(tableId)) {
                    clickedElement.classList.remove(classNames.booking.tableSelected);
                    thisBooking.selectedTable = thisBooking.selectedTable.filter(id => id !== tableId);
                } else {
                    thisBooking.clearSelectedTable();
                    clickedElement.classList.add(classNames.booking.tableSelected);
                    thisBooking.selectedTable.push(tableId);
                }
            }
        }
    }

    initActions() {
        const thisBooking = this;
        thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);

        thisBooking.dom.form.addEventListener('submit', function (event) {
            event.preventDefault();
            thisBooking.sendBooking();
        });

        thisBooking.dom.phone.addEventListener('change', () => validatePhone(thisBooking.dom.phone));
        thisBooking.dom.address.addEventListener('change', () => validateAddress(thisBooking.dom.address));
    }

    clearSelectedTable() {
        const thisBooking = this;

        const selectedTable = thisBooking.dom.wrapper.querySelector('.' + classNames.booking.tableSelected);

        if (selectedTable) {
            selectedTable.classList.remove(classNames.booking.tableSelected);
        }
        thisBooking.selectedTable = [];
    }

    updateDOM() {
        const thisBooking = this;

        thisBooking.date = thisBooking.datePicker.value;
        thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

        let allAvailable = false;

        if (
            typeof thisBooking.booked[thisBooking.date] == 'undefined'
            ||
            typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
        ) {
            allAvailable = true;
        }

        for (let table of thisBooking.dom.tables) {
            let tableId = table.getAttribute(settings.booking.tableIdAttribute);
            if (!isNaN(tableId)) {
                tableId = parseInt(tableId);
            }

            if (
                !allAvailable
                &&
                thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
            ) {
                table.classList.add(classNames.booking.tableBooked);
            } else {
                table.classList.remove(classNames.booking.tableBooked);
            }
        }

        thisBooking.clearSelectedTable();
    }

    sendBooking() {
        const thisBooking = this;

        const url = settings.db.url + '/' + settings.db.bookings;

        validatePhone(thisBooking.dom.phone);
        validateAddress(thisBooking.dom.address);

        if (thisBooking.selectedTable.length === 0) {
            new Alert("Please select a table before placing the order.", 'warning');
            return;
        }

        if (thisBooking.dom.phone.classList.contains('error')) {
            new Alert("Please provide a valid phone number!", 'error');
            return;
        } else if (thisBooking.dom.address.classList.contains('error')) {
            new Alert("Please provide a valid address!", 'error');
            return;
        }

        const payload = {
            date: thisBooking.datePicker.value,
            hour: thisBooking.hourPicker.value,
            table: parseInt(thisBooking.selectedTable) || null,
            duration: parseInt(thisBooking.hoursAmountWidget.value),
            ppl: parseInt(thisBooking.peopleAmountWidget.value),
            phone: thisBooking.dom.phone.value,
            address: thisBooking.dom.address.value,
            starters: [],
        };

        thisBooking.dom.starters.forEach(function (starter) {
            if (starter.checked) {
                payload.starters.push(starter.value);
            }
        });

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        };

        fetch(url, options)
            .then(function (response) {
                return response.json();
            })
            .then(function (parsedResponse) {
                console.log('parsedResponse', parsedResponse);
                thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
                thisBooking.updateDOM();
                new Alert("Booking successfully placed!", 'success');
                thisBooking.resetBooking();
            });
    }

    handleStartersInput(event) {
        const thisBooking = this;

        const clickedElement = event.target;

        if (clickedElement.tagName === 'INPUT' && clickedElement.type === 'checkbox' &&
            (clickedElement.name === 'water' || clickedElement.name === 'bread')) {
            const valueIndex = thisBooking.starters.indexOf(clickedElement.value);
            if (clickedElement.checked && valueIndex === -1) {
                thisBooking.starters.push(clickedElement.value);
            } else if (!clickedElement.checked && valueIndex !== -1) {
                thisBooking.starters.splice(valueIndex, 1);
            }
        }
        console.log('clickedStarters', clickedElement);
    }

    resetBooking() {
        const thisBooking = this;
      
        thisBooking.dom.form.reset();
        thisBooking.datePicker.resetDatePicker();
        thisBooking.hourPicker.resetHourPicker();
        thisBooking.peopleAmountWidget.setValue(settings.amountWidget.defaultValue);
        thisBooking.hoursAmountWidget.setValue(settings.amountWidget.defaultValue);
        thisBooking.clearSelectedTable();
        thisBooking.updateDOM();
      }      

    render(element) {
        const thisBooking = this;
        const generatedHTML = templates.bookingWidget();

        thisBooking.dom = {};
        thisBooking.dom.wrapper = element;

        thisBooking.dom.wrapper.innerHTML = generatedHTML;

        thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
        thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

        thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
        thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

        thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
        thisBooking.dom.tablesWrapper = thisBooking.dom.wrapper.querySelector(select.booking.tablesWrapper);

        thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
        thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
        thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);
    }

    initWidgets() {
        const thisBooking = this;

        thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);

        thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
        thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

        thisBooking.dom.wrapper.addEventListener('updated', function () {
            thisBooking.updateDOM();
        });

        thisBooking.dom.tablesWrapper.addEventListener('click', function (event) {
            thisBooking.initTables(event);
        });
    }
}

export default Booking;