import {templates,select, settings, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking{
  constructor(element){
    const thisBooking = this;
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData(){
    const thisBooking = this;
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);
    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsReapeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };
    // console.log('getData params',params);
    const urls = {
      booking:       settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent.join('&'),
      eventsReapeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsReapeat.join('&'),
    };
    // console.log('getData urls', urls);

    Promise.all([
      fetch(urls.booking),      
      fetch(urls.eventsCurrent),      
      fetch(urls.eventsReapeat),      
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsReapeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsReapeatResponse.json(),
        ]);
      })
      .then(function([booking,eventsCurrent, eventsReapeat]){
        // console.log(booking);
        // console.log(eventsCurrent);
        // console.log(eventsReapeat);
        thisBooking.parseData(booking,eventsCurrent,eventsReapeat);
      });
      
  }
    
  parseData(booking,eventsCurrent,eventsReapeat){
    const thisBooking = this;
    thisBooking.booked = {};
    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date,item.hour,item.duration,item.table);
    }
    for(let item of booking){
      thisBooking.makeBooked(item.date,item.hour,item.duration,item.table);
    }
    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;


    for(let item of eventsReapeat){
      if(item.repeat == 'daily'){
        // console.log(minDate);
        for(let loopDate = minDate;loopDate<=maxDate;loopDate = utils.addDays(loopDate,1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate),item.hour,item.duration,item.table);
        }
      }
    }
    // console.log('thisBooking',thisBooking.booked);
    thisBooking.updateDOM;
  }
  makeBooked(date,hour,duration,table){
    const thisBooking = this;
    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }
    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour;hourBlock<startHour+duration;hourBlock+=0.5){

      
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
    
  }
  updateDOM(){
    const thisBooking =  this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hoursPicker.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }
    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId) > -1
      ){
        table.classList.add(classNames.booking.tableBooked);
      }else{
        table.classList.remove(classNames.booking.tableBooked);
      }
    }

  }

  render(element){
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();

    thisBooking.element = utils.createDOMFromHTML(generatedHTML);

    // console.log(thisBooking.dom.peopleAmount);
    element.appendChild(thisBooking.element);

    thisBooking.dom = {};

    thisBooking.dom.wrapper = thisBooking.element;
    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePickerWrapper = document.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hoursPickerWrapper = document.querySelector(select.widgets.hourPicker.wrapper);
    
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);

  }

  initWidgets(){
    // const thisCartProduct = this;
    // thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
    // thisCartProduct.dom.amountWidget.addEventListener('updated', function () {

    //   thisCartProduct.amount = thisCartProduct.amountWidget.value;
    //   thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
    //   thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
    // });
    const thisBooking = this;
    thisBooking.amountWidgetPeople = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.amountWidgetHours = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePickerWrapper);
    thisBooking.hoursPicker = new HourPicker(thisBooking.dom.hoursPickerWrapper);

    thisBooking.dom.wrapper.addEventListener('updated',function(){
      thisBooking.updateDOM();
    });
  }
}

export default Booking;