class BaseWidget{
  constructor(wraperElement,initialValue){
    const thisWidget = this;
    // console.log(thisWidget);
    thisWidget.dom = {};
    thisWidget.dom.wrapper = wraperElement;
    
    thisWidget.correctValue = initialValue;
  }
  get value(){
    const thisWidget = this;
    return thisWidget.correctValue;
  }

  set value(value) {
    const thisWidget = this;
    const newValue = thisWidget.parseValue(value);

    if (thisWidget.correctValue !== newValue && thisWidget.isValid(value)) {
      thisWidget.correctValue = newValue;
      thisWidget.announce();
    }

    thisWidget.renderValue();
  }

  setValue(value){
    const thisWidget = this;
    thisWidget.value = value;
  }
  parseValue(value){
    return parseInt(value);
  }
  isValid(value){
    return  !isNaN(value);
    //  && value >= settings.amountWidget.defaultMin 
    //  && value <= settings.amountWidget.defaultMax;
  }
  renderValue(){
    const thisWidget = this;
    thisWidget.dom.wrapper.innerHTML = thisWidget.value;
  }
  announce() {
    const thisWidget = this;
    // const event = new Event('updated');
    const event = new CustomEvent('updated', {
      bubbles: true
    });

    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}
export default BaseWidget;