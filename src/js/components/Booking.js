import {templates,select} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking{
  constructor(element){
    const thisBooking = this;
    thisBooking.render(element);
    thisBooking.getElements(thisBooking.element);
    thisBooking.initWidgets();
  }
  render(element){
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();

    thisBooking.element = utils.createDOMFromHTML(generatedHTML);
    // console.log(thisBooking.dom.peopleAmount);
    element.appendChild(thisBooking.element);
  }
  getElements(element){
    const thisBooking = this;
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePickerWrapper = document.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hoursPickerWrapper = document.querySelector(select.widgets.hourPicker.wrapper);
    
    console.log(thisBooking.dom.hoursAmount);
    console.log(thisBooking.dom.peopleAmount);

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
  }
}

export default Booking;