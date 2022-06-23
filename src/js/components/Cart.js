import {settings,classNames,select,templates} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';


class Cart{
  constructor(element){
    const thisCart = this;
    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initAcitons();
    // console.log('New Carrt', thisCart);
  }
  getElements(element){
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
  }
  
  initAcitons(){
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click',()=>{
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated',()=>{
      thisCart.update();
      console.log('dziala');
      console.log(thisCart.totalPrice);
    });
    thisCart.dom.productList.addEventListener('remove',e=>{
      thisCart.remove(e.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit',e=>{
      e.preventDefault();
      thisCart.sendOrder();
    });
      
  }
  remove(detail){
    const thisCart = this;
    console.log(detail);
    console.log(detail.dom.wrapper);
    thisCart.products.splice(thisCart.products.indexOf(detail),1);
    detail.dom.wrapper.remove();
    thisCart.update();
  }
  add(cartProduct){
    // !!! name menuProduct change to cartProduct
    // const thisCart = this;
    const thisCart = this;
     
    /* generate HTML based on template */
    const generatedHTML = templates.cartProduct(cartProduct);
    // console.log('Generate html: ',generatedHTML);

    /* create element using utils.createElementFromHTML*/
    thisCart.element = utils.createDOMFromHTML(generatedHTML);
      
    /* add element to menu*/
    thisCart.dom.productList.appendChild(thisCart.element);
    thisCart.products.push(new CartProduct(thisCart.element,cartProduct));
    console.log('adding product', thisCart.products);
    thisCart.update();
  }

  update(){
    const thisCart = this;
    const deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.totalNumber= 0;
    thisCart.subtotalPrice = 0;
    for(const product of thisCart.products){
      console.log('product',product);
      console.log('product',product.amount);
      thisCart.totalNumber += product.amount;
      thisCart.subtotalPrice += product.price;
      
    }
    console.log(thisCart.totalNumber);
    if (thisCart.totalNumber != 0) {
      thisCart.totalPrice = thisCart.subtotalPrice + deliveryFee;
    } else {
      thisCart.totalPrice = 0;
    }
    console.log('subtotalPrice ',thisCart.subtotalPrice);
    console.log('total number ', thisCart.totalNumber);
    console.log('TOTAL PRICE',thisCart.totalPrice);
    thisCart.dom.deliveryFee.innerHTML = deliveryFee;
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    thisCart.dom.totalPrice.forEach(total=>{
      total.innerHTML = thisCart.totalPrice;
    });
  }

  sendOrder(){
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.orders;
    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: settings.cart.defaultDeliveryFee,
      products:[]
    };
    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
    console.log(payload);
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
      
    fetch(url, options);
  }

}
export default Cart;

