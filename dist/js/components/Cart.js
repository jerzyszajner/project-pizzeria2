import { select, settings, classNames, templates } from "../settings.js";
import utils from "../utils.js";
import CartProduct from "./CartProduct.js";

class Cart {
    constructor(element) {
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();
    }

    getElements(element) {
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
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    }

    initActions() {
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function () {
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      thisCart.dom.productList.addEventListener('updated', function () {
        thisCart.update();
      });

      thisCart.dom.productList.addEventListener('remove', function (event) {
        thisCart.remove(event.detail.cartProduct);
      });

      thisCart.dom.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisCart.sendOrder();
      });

      thisCart.dom.phone.addEventListener('change', () => thisCart.validatePhone());
      thisCart.dom.address.addEventListener('change', () => thisCart.validateAddress());
    }

    add(menuProduct) {
      const thisCart = this;

      const generatedHTML = templates.cartProduct(menuProduct);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);

      thisCart.dom.productList.appendChild(generatedDOM);
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));

      thisCart.update();
    }

    update() {
      const thisCart = this;

      const deliveryFee = settings.cart.defaultDeliveryFee;

      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;
      thisCart.totalPrice = 0;
      thisCart.deliveryFee = 20;

      for (let product of thisCart.products) {
        thisCart.totalNumber += product.amount;
        thisCart.subtotalPrice += product.price;
      }

      if (thisCart.totalNumber > 0) {
        thisCart.totalPrice = thisCart.subtotalPrice + deliveryFee;
        thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      } else {
        thisCart.totalPrice = 0;
        thisCart.dom.deliveryFee.innerHTML = 0;
      }

      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
      thisCart.dom.totalPrice.forEach(elem => elem.innerHTML = thisCart.totalPrice);

      console.log('Cart update complete:', {
        DeliveryFee: deliveryFee,
        TotalNumber: thisCart.totalNumber,
        SubtotalPrice: thisCart.subtotalPrice,
        TotalPrice: thisCart.totalPrice
      });
    }

    remove(cartProduct) {
      const thisCart = this;

      cartProduct.dom.wrapper.remove();

      const index = thisCart.products.indexOf(cartProduct);
      if (index !== -1) {
        thisCart.products.splice(index, 1);
      }

      thisCart.update();
    }

    sendOrder() {
      const thisCart = this;

      const url = settings.db.url + '/' + settings.db.orders;

      if (thisCart.products.length === 0) {
        alert("Your cart is empty. Please add some products before proceeding.");
        return;
      }

      thisCart.validatePhone();
      thisCart.validateAddress();

      if (thisCart.dom.phone.classList.contains('error') || thisCart.dom.address.classList.contains('error')) {
        return;
      }

      const payload = {
        address: thisCart.dom.address.value,
        phone: thisCart.dom.phone.value,
        totalPrice: thisCart.totalPrice,
        subtotalPrice: thisCart.subtotalPrice,
        totalNumber: thisCart.totalNumber,
        deliveryFee: thisCart.deliveryFee,
        products: [],
      };

      for (let prod of thisCart.products) {
        payload.products.push(prod.getData());
      }

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
        }).then(function (parsedResponse) {
          console.log('parsedResponse', parsedResponse);
          thisCart.resetCart();
        });
    }

    resetCart() {
      const thisCart = this;

      thisCart.products = [];
      thisCart.dom.productList.innerHTML = '';

      thisCart.dom.totalNumber.innerHTML = 0;
      thisCart.dom.subtotalPrice.innerHTML = 0;
      thisCart.dom.totalPrice.forEach((elem) => (elem.innerHTML = 0));
      thisCart.dom.deliveryFee.innerHTML = 0;

      thisCart.dom.phone.value = '';
      thisCart.dom.address.value = '';
    }

    validatePhone() {
      const thisCart = this;

      const phoneInput = thisCart.dom.phone;
      const phone = phoneInput.value.trim();

      if (!phone || phone.length < 8) {
        phoneInput.classList.add('error');
        phoneInput.value = '';
      } else {
        phoneInput.classList.remove('error');
      }
    }

    validateAddress() {
      const thisCart = this;

      const addressInput = thisCart.dom.address;
      const address = addressInput.value.trim();

      if (!address || address.length < 10) {
        addressInput.classList.add('error');
        addressInput.value = '';
      } else {
        addressInput.classList.remove('error');
      }
    }
  }

export default Cart;

