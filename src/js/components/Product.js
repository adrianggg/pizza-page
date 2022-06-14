import {select, templates, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product{
  constructor(id,data){
    const thisProduct = this;

    thisProduct.id=id;
    thisProduct.data=data;
      
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();

    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
      
    // console.log('new Product', thisProduct);
  }
  renderInMenu(){
    const thisProduct = this;

    /* generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);
    // console.log('Generate html: ',generatedHTML);

    /* create element using utils.createElementFromHTML*/
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);

    /* find menu container*/
    const menuConatiner = document.querySelector(select.containerOf.menu);

    /* add element to menu*/
    menuConatiner.appendChild(thisProduct.element);
  }

  getElements(){
    const thisProduct = this;
    thisProduct.dom = {};
    thisProduct.dom.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
    thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }
    
  initAccordion(){
    const thisProduct = this;
  
    /* START: add event listener to clickable trigger on event click */
    thisProduct.dom.accordionTrigger.addEventListener('click', function(event) {

      /* prevent default action for event */
      event.preventDefault();

      /* find active product (product that has active class) */
      const activeProducts = document.querySelectorAll(select.all.menuProductsActive);

      /* if there is active product and it's not thisProduct.element, remove class active from it */
      activeProducts.forEach(activeProduct=>{
        // console.log('ACTIVE PRODUCT: ', activeProduct);
        // console.log('THIS PRODUCT: ', thisProduct.element);
        if(activeProduct && activeProduct != thisProduct.element){
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive); 
        }
          
      });
      /* toggle active class on thisProduct.element */
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
    });
  
  }
    
  initOrderForm(){
    const thisProduct = this;
    // console.log('This product: ',thisProduct);

    thisProduct.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });
      
    for(let input of thisProduct.dom.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }
      
    thisProduct.dom.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }
    
  processOrder(){
    const thisProduct = this;
     
    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.dom.form);
    // console.log('formData', formData);

    // set price to default price
    let price = thisProduct.data.price;

    // for every category (param)...
    for(let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
        
      // for every option in this category
      for(let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        // console.log('optionID: ',option);
        // console.log('optio: ',paramId);
        const optionImage = thisProduct.dom.imageWrapper.querySelector(`.${paramId}-${optionId}`);
        // console.log('OPTION: ',optionId, option,'PRICE: ',option.price);
        // optionImage.classList.toggle(classNames.menuProduct.imageVisible);
        if(formData[paramId].includes(optionId)){
          if(optionImage){
            optionImage.classList.add(classNames.menuProduct.imageVisible);
          }
          if(!option.default){
            price+=option.price;
          }
        }else{
          if(optionImage){
            optionImage.classList.remove(classNames.menuProduct.imageVisible);
          }
          if(option.default){
            price-=option.price;
          }
        }
      }
    }

    thisProduct.priceSingle = price;
    // multiply price by amount
    price *= thisProduct.amountWidget.value;
    // update calculated price in the HTML
    thisProduct.dom.priceElem.innerHTML = price;
      
  }

  initAmountWidget(){
    const thisProduct = this;
    // thisProduct.amountWidgetElem div w którym są inputy
    thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);
    thisProduct.dom.amountWidgetElem.addEventListener('updated',()=>{thisProduct.processOrder();});
  }

  addToCart(){
    const thisProduct = this;
    // app.cart.add(thisProduct.prepareCartProduct());

    const event = new CustomEvent('add-to-cart',{
      bubbles: true,
      detail:{
        product: thisProduct.prepareCartProduct(),
      },
    });

    thisProduct.element.dispatchEvent(event);
  }

  prepareCartProduct(){
    const thisProduct = this;
    thisProduct.productSummary = {};
    thisProduct.productSummary.id = thisProduct.id;  
    thisProduct.productSummary.name = thisProduct.data.name;
    thisProduct.productSummary.amount = thisProduct.amountWidget.value;
    thisProduct.productSummary.priceSingle = thisProduct.priceSingle;
    thisProduct.productSummary.price = thisProduct.productSummary.amount * thisProduct.productSummary.priceSingle;
    thisProduct.productSummary.params = thisProduct.prepareCartProductParams();
    return thisProduct.productSummary;
  }

  prepareCartProductParams(){
    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.dom.form);
    thisProduct.productParams = {};
    for(let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];
      
      thisProduct.productParams[paramId] = {
        label:param.label,
        options:{}
      };

      for(let optionId in param.options) {
        const option = param.options[optionId];

        if(formData[paramId].includes(optionId)){
          thisProduct.productParams[paramId].options[optionId] = option.label;
        }

      }

    }
    console.log(thisProduct.productParams);
    return thisProduct.productParams;
  }
}

export default Product;
