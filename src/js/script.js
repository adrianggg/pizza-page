/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

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
      
      console.log('new Product', thisProduct);
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
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);

    }
    
    initAccordion(){
      const thisProduct = this;
  
      /* START: add event listener to clickable trigger on event click */
      thisProduct.accordionTrigger.addEventListener('click', function(event) {

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

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
    }
    
    processOrder(){
      const thisProduct = this;
     
      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
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
          const optionImage = thisProduct.imageWrapper.querySelector(`.${paramId}-${optionId}`);
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

      // update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;

      
    }

    initAmountWidget(){
      const thisProduct = this;
      // thisProduct.amountWidgetElem div w którym są inputy
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      
    }
  }

  class AmountWidget{
    constructor(element){
      const thisWidget = this;
      console.log('AmountWidget',thisWidget);
      console.log('constructor arguments: ',element);
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
    }

    setValue(value){
      const thisWidget = this;
      const newValue = parseInt(value);
      
      // TODO Add validation
      if(thisWidget.value !== newValue && !isNaN(newValue) && newValue>=settings.amountWidget.defaultMin && newValue<=settings.amountWidget.defaultMax){
        thisWidget.value = newValue;
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
  }


  const app = {
    initMenu: function(){
      const thisApp = this;
      
      console.log('thisApp.data: ',thisApp.data);
    
      for(let productData in thisApp.data.products){
        new Product(productData,thisApp.data.products[productData]);
      }
    },
    
    initData: function(){
      const thisApp = this;
      thisApp.data = dataSource;
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      
      thisApp.initData();
      
      thisApp.initMenu();
    },
  };

  app.init();
}
