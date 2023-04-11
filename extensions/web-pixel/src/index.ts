import { register } from "@shopify/web-pixels-extension";

register(({ analytics, browser, settings, init }) => {
  // Bootstrap and insert pixel script tag here
  console.log("settings.....", settings);
  console.log("browser.....", browser);
  console.log("analytics.....", analytics);
  console.log("init.....", init);
  

  // Sample subscribe to product added to cart
  analytics.subscribe('product_added_to_cart', async(event) => {
    console.log('Add to cart', event);
    console.log("web-pixels-extension");

    const jsonString = JSON.stringify(event);
    const uint8Array = jsonString;

    const url = '/apps/new/add-to-cart';
    let status = await browser.sendBeacon(url, uint8Array);
    if (status) {
      console.log('Data sent successfully using sendBeacon,,,,,,', status);
    } else {
      console.error('sendBeacon failed', status);
    }
  });

  // Sample subscribe to page view
  analytics.subscribe('product_viewed', async(event) => {
    console.log('page viewed', event);
    console.log("web-pixels-extension product viewed");

    const jsonString = JSON.stringify(event);
    const uint8Array = jsonString;

    const url = '/apps/new/product-viewed';
    let status = await browser.sendBeacon(url, uint8Array);
    if (status) {
      console.log('Data sent successfully using sendBeacon,,,,,,', status);
    } else {
      console.error('sendBeacon failed', status);
    }
  });

});
