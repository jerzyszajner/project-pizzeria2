
import { settings, select, classNames } from './settings.js';
import Cart from "./components/Cart.js";
import Product from "./components/Product.js";
import Booking from "./components/Booking.js";
import Home from './components/Home.js';
import Tv from './components/Tv.js';

const app = {

  handleLinkClick: function (event) {
    const thisApp = this;

    event.preventDefault();
    const id = event.currentTarget.getAttribute('href').replace('#', '');
    thisApp.activatePage(id);
    window.location.hash = '#/' + id;
  },

  initCallToAction: function () {
    const thisApp = this;

    thisApp.heroLinks = document.querySelectorAll(select.home.links);

    for (let link of thisApp.heroLinks) {
      link.addEventListener('click', function (event) {
        thisApp.handleLinkClick(event);
      })
    }
  },

  initPages: function () {
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = thisApp.pages[0].id;

    for (let page of thisApp.pages) {
      if (page.id == idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash);

    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function (event) {
        thisApp.handleLinkClick(event);
      })
    }
  },

  activatePage: function (pageId) {
    const thisApp = this;

    /* add class "active" to matching pages, remove from non-matching */
    for (let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }
    /* add class "active" to matching links, remove from non-matching */
    for (let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }

    // Reinitialize widgets when the home page is activated
    if (pageId === 'home' && thisApp.home) {
      thisApp.home.initWidgets();
    }
  },

  initMenu: function () {
    const thisApp = this;

    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initCart: function () {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function (event) {
      app.cart.add(event.detail.product);
    });
  },

  initData: function () {
    const thisApp = this;

    thisApp.data = {};

    const urlHome = settings.db.url + '/' + settings.db.home;
    const urlProducts = settings.db.url + '/' + settings.db.products;

    fetch(urlHome)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        thisApp.data.home = parsedResponse;
        thisApp.initHome();
      });

    fetch(urlProducts)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        thisApp.data.products = parsedResponse;
        thisApp.initMenu();
      });
  },

  initBooking: function () {
    const thisApp = this;

    const bookingContainer = document.querySelector(select.containerOf.booking);
    if (bookingContainer) {
      thisApp.booking = new Booking(bookingContainer);
    }
  },

  initHome: function () {
    const thisApp = this;

    const homeContainer = document.querySelector(select.containerOf.home);
    if (homeContainer) {
      thisApp.home = new Home(homeContainer, thisApp.data);
      thisApp.initCallToAction();
    }
  },

  initTv: function () {
    const thisApp = this;

    const tvContainer = document.querySelector(select.containerOf.tv);
    if (tvContainer) {
      thisApp.tv = new Tv(tvContainer);
    }
  },

  init: function () {
    const thisApp = this;

    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
    thisApp.initTv();

  },
};

app.init();