import {templates,select, settings, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking{
  constructor(element){
    const thisBooking = this;
    thisBooking.booked = {};
    thisBooking.booking = null;
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.initAction();
    thisBooking.updateDOM();
    thisBooking.sendBooking();
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
        thisBooking.updateDOM();
      });
      
  }
    
  parseData(booking,eventsCurrent,eventsReapeat){
    const thisBooking = this;
    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date,item.hour,item.duration,item.table);
      console.log('item', item.date);
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

    for(let hourBlock = startHour;hourBlock<=startHour+duration;hourBlock+=0.5){

      
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
    // console.log(thisBooking.booked);
    // thisBooking.updateDOM();
    thisBooking.updateDOM();
  }
  updateDOM(){
    const thisBooking =  this;
    // console.log('UPDATED');
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
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId) 
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
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePickerWrapper = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hoursPickerWrapper = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.tablesWrapper = thisBooking.dom.wrapper.querySelector(select.booking.tablesWrapper);
  
    thisBooking.dom.inputAddress = thisBooking.dom.wrapper.querySelector('[name="address"]');
    thisBooking.dom.inputPhone = thisBooking.dom.wrapper.querySelector('[name="phone"]');
  
    thisBooking.dom.checkboxStarters = thisBooking.dom.wrapper.querySelectorAll('[name="starter"]');
    thisBooking.dom.oderConfirmBtn = thisBooking.dom.wrapper.querySelector('.order-confirmation > .btn-secondary');
  }
  initAction(){
    const thisBooking = this;
    thisBooking.dom.tablesWrapper.addEventListener('click', function(event){  
      event.preventDefault();
      thisBooking.clearTables();
      if(
        event.target.classList.contains('table') 
        && 
        !event.target.classList.contains(classNames.booking.tableBooked)
      ){
        // console.log('event target',event.target);
        event.target.classList.add(classNames.booking.tableActivated);
        thisBooking.booking = event.target.getAttribute('data-table');
      }
    });
  }
  clearTables(){
    const thisBooking = this;
    thisBooking.booking = null;
    thisBooking.dom.tables.forEach(function(element){
      element.classList.remove('active');
    });
  }
  sendBooking(){
    const thisBooking = this;
    thisBooking.dom.oderConfirmBtn.addEventListener('click',function(event){
      event.preventDefault();
      const url = settings.db.url + '/' + settings.db.booking;
      // localhost:3131/bookings
      const bookingLoad=
      {
        date: thisBooking.datePicker.value,
        hour: thisBooking.hoursPicker.value,
        table: parseInt(thisBooking.booking),
        duration: parseInt(thisBooking.amountWidgetHours.value),
        ppl: parseInt(thisBooking.amountWidgetPeople.value),
        starters: [],
        phone: thisBooking.dom.inputPhone.value,
        address: thisBooking.dom.inputAddress.value
      };
      console.log(bookingLoad);
      thisBooking.dom.checkboxStarters.forEach(element => {
        // console.log(element);
        if(element.checked){
          bookingLoad['starters'].push(element.value);
        }
        
      });
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingLoad),
      };
      fetch(url, options);
      thisBooking.makeBooked(thisBooking.datePicker.value,bookingLoad['hour'],bookingLoad['duration'],bookingLoad['table']);
      thisBooking.clearTables();
      // thisBooking.parseData();
      
      console.log(
        thisBooking.datePicker,
        bookingLoad['hour'],
        bookingLoad['duration'],
        bookingLoad['table']
      );
      console.log(bookingLoad);
    }); 
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
      thisBooking.clearTables();

    });
  }
}

export default Booking;