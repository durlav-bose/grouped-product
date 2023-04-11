// console.log("productId...................", productId);
//apps/new/json
// console.log('navigator ....................... ', navigator);
const shopUrl = window.Shopify.shop;
if (productId) {
  console.log(productId);
  //apps/new/json
  
  let fetchData = async () => {
    try {
      const response = await fetch(
        `/apps/new/json/productId=${productId}&shop=${shopUrl}`,
        {
          method: "GET",
          headers: {
            "ngrok-skip-browser-warning": "69420",
            "Content-Type": "application/json",
          },
        }
      );
      const { productHtml, groupProducts } = await response.json();
      console.log("groupProducts ....................... ", groupProducts);
      if (productHtml !== undefined) {
        document.getElementById("group-product").innerHTML = productHtml;
        let href = document.querySelectorAll(".prdGrd__link");
        for (let i = 0; i < href.length; i++) {
          href[i].addEventListener("click", (e) => {
            let beconUrl = '/apps/new/product-clicked';
            e.preventDefault();
            console.log("clicked", href[i].href);
            console.log("groupProducts[i].productHandle :>> ", groupProducts[i].productHandle);
            navigator.sendBeacon(beconUrl, JSON.stringify({ productId: groupProducts[i].productId, shop: shopUrl, fromHref: window.location.href, productHandle: groupProducts[i].productHandle}));
            window.location.href = `/products/${groupProducts[i].productHandle}?app=true`;
          });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  fetchData();
}

if(window.location && window.location.search && window.location.search.includes("app=true")) {
  let addToCartForm = document.querySelector('form[action$="/cart/add"].form');
  let inputProperty = document.createElement("input");
  inputProperty.setAttribute("type", "hidden");
  inputProperty.setAttribute("name", "properties[app]");
  inputProperty.setAttribute("value", "true");
  addToCartForm.appendChild(inputProperty);
}

  

