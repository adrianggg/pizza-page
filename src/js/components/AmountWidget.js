import {settings, select} from '../settings.js';


class AmountWidget{
  constructor(element){
    const thisWidget = this;
    // console.log('AmountWidget',thisWidget);
    // console.log('constructor arguments: ',element);
    thisWidget.getElements(element);
    thisWidget.initAcitons(element);
    thisWidget.setValue(thisWidget.input.value);
  }
  getElements(element){
    const thisWidget = this;
    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
      
    thisWidget.value = settings.amountWidget.defaultValue;
  }
 
  setValue(value){
    const thisWidget = this;
    const newValue = parseInt(value);
     
    // TODO Add validation
    if(thisWidget.value !== newValue && !isNaN(newValue) && newValue>=settings.amountWidget.defaultMin && newValue<=settings.amountWidget.defaultMax){
      thisWidget.value = newValue;
      thisWidget.announce();
    }
      
    thisWidget.input.value = thisWidget.value;
  }

  initAcitons(){
    const thisWidget = this;
    thisWidget.input.addEventListener('change',()=>{
      thisWidget.setValue(thisWidget.input.value);
    });
      
    thisWidget.linkDecrease.addEventListener('click', event=>{
      event.preventDefault();
      thisWidget.setValue(thisWidget.value-1);
    });
      
    thisWidget.linkIncrease.addEventListener('click', event=>{
      event.preventDefault();
      thisWidget.setValue(thisWidget.value+1);
    });  
  }

  announce(){
    const thisWidget = this;
    // const event = new Event('updated');
    const event = new CustomEvent('updated',{
      bubbles: true
    });

    thisWidget.element.dispatchEvent(event);
  }
    
}

export default AmountWidget;