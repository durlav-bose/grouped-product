
// import clientProvider from "../../../utils/clientProvider.js";
import { Router } from "express";
import { GroupProduct } from "../../schemas/createGroupProduct.js";
import { ViewCount } from "../../schemas/createViewCount.js";
const proxyRouter = Router();

// /apps/new/json/productId=${productId}
proxyRouter.get("/json/productId=:productId&shop=:shop", async (req, res) => {
  let newProductId = req.params.productId;
  let shopUrl = req.query.shop;
  try {
    const groupProduct = await GroupProduct.findOne({
      shopUrl: shopUrl,
      groupProducts: { $elemMatch: { productId: newProductId } },
    });

    let groupProducts;

    if (groupProduct?.groupProducts?.length > 0) {
      groupProducts = groupProduct.groupProducts;
    }

    if (groupProduct?.groupProducts?.length > 0) {
      let productHtml = `
      <div class="prdGrp__wrp">
  ${
    groupProduct.groupProducts.length > 0 &&
    groupProduct.groupProducts
      .map((product,index) => {
        return `<div key="${index}" class="prdGrd__card ${newProductId === product.productId && 'prdGrd__card--active'}">
          <a
            class="prdGrd__link"
            href="/products/${product.productHandle}"
          >
            &nbsp
          </a>
          <div class="prdGrd__card__img__wrp ${newProductId === product.productId && 'prdGrd__card--active'}">
            <img src="${product.productImage}" class="prdGrd__card__img" />
          </div>
          <h4 class="prdGrd__type">${product.productType}</h4>
        </div>`;
      })
      .join("") // <-- Use the join method to concatenate the array items
  }
</div>`;

      res.status(200).send({
        success: true,
        message: "Product Exists",
        productHtml: productHtml,
        groupProducts,
      });
    } else {
      res.status(200).send({ success: false, message: "Product Not Exists" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).send({ success: false, message: "Internal Server Error" });
  }
});

proxyRouter.post("/add-to-cart", async (req, res) => {
  console.log("incoming request from web pixels.............");
  try {
    const chunks = [];
    req.on("data", (chunk) => {
      chunks.push(chunk);
    });
    req.on("end", async() => {
      const buffer = Buffer.concat(chunks);
      const jsonString = buffer.toString();
      const eventData = JSON.parse(jsonString);
      let productId = eventData?.data?.cartLine?.merchandise?.product?.id;
      let searchQuery = eventData?.context?.document?.location?.search;
      let query = eventData?.context?.document?.referrer;
      if((searchQuery && searchQuery.includes("app=true")) || (query && query.includes("app=true"))) {
        let groupProduct = await GroupProduct.findOne({
          groupProducts: { $elemMatch: { productId: productId } },
        });
        if (!groupProduct) return;
        // find productId object from groupProducts array
        let product = groupProduct?.groupProducts.find(
          (product) => product.productId == productId
        );
        
        // check if group already exists in ViewCount collection
        let findByGroupName = await ViewCount.findOne({
          productGroupName: groupProduct?.groupName,
        });

        if (!findByGroupName) {
          let data = {
            productGroupName: groupProduct?.groupName,
            productViewCount: 0,
            productClickedCount: 0,
            productAddedToCartCount: 1,
            productCheckedOutCount: 0,
            totalRevenue: 0,
            perProductViewDetails: [
              {
                productType: product?.productType,
                productId: product?.productId,
                perProductViewCount: 0,
                perProductClickCount: 0,
                perProductAddedToCartCount: 1,
                perProductCheckedOutCount: 0,
                perLineItemRevenue: 0,
                productHandle: product?.productHandle,
              },
            ],
          };
          const countByGroupName = await ViewCount.create(data);
          console.log("added to cart 1", countByGroupName);
          // res.sendStatus(200);
        } else {
          // check if product already exists in perProductViewDetails array
          let productExists = findByGroupName?.perProductViewDetails.find((product) => product.productId == productId);
          // console.log("productExists.............", productExists);
  
          // filter for ViewCount model
          let filter = {
            productGroupName: findByGroupName?.productGroupName,
          };
  
          // update ViewCount model
          let update;
  
          // options for ViewCount model
          let options;
          if (productExists) {
  
            update = {
              $inc: {
                productAddedToCartCount: 1,
                "perProductViewDetails.$[elem].perProductAddedToCartCount": 1,
              }
            };
  
            options = {
              new: true,
              arrayFilters: [{ "elem.productId": product?.productId }],
            };
  
          } else {
  
            update = {
              $inc: { productAddedToCartCount: 1 },
              $push: {
                perProductViewDetails: {
                  productType: product?.productType,
                  productId: product?.productId,
                  perProductViewCount: 0,
                  perProductClickCount: 0,
                  perProductAddedToCartCount: 1,
                  perProductCheckedOutCount: 0,
                  perLineItemRevenue: 0,
                  productHandle: product?.productHandle,
                }
              }
            }
  
            options = {
              new: true
            };
          }
          let countByGroupName;
            // findOneAndUpdate ViewCount model
          countByGroupName = await ViewCount.findOneAndUpdate(
            filter,
            update,
            options
          ).lean();
          
          console.log("added to cart 2", countByGroupName);
          // res.sendStatus(200);
        }
      }
      res.sendStatus(200);
    });
  } catch (error) {
    console.log("error from web pixels.............", error);
  }
});

proxyRouter.post("/product-viewed", async (req, res) => {
  try {
    
    const chunks = [];
    req.on("data", (chunk) => {
      chunks.push(chunk);
    });
    let eventData;
    req.on("end", async () => {
      const buffer = Buffer.concat(chunks);
      const jsonString = buffer.toString();
      eventData = JSON.parse(jsonString);
      let productId = eventData?.data?.productVariant?.product?.id;
      // //check if group product name already exists in same shopUrl
      let groupProduct = await GroupProduct.findOne({
        groupProducts: { $elemMatch: { productId: productId } },
      });
      if (!groupProduct) return;


      // find productId object from groupProducts array
      let product = groupProduct?.groupProducts.find(
        (product) => product.productId == productId
      );
      // console.log("product.............aaaaa", product);
      let findByGroupName = await ViewCount.findOne({
        productGroupName: groupProduct?.groupName,
      });

      if (!findByGroupName) {
        let data = {
          productGroupName: groupProduct?.groupName,
          productViewCount: 1,
          productClickedCount: 0,
          productAddedToCartCount: 0,
          productCheckedOutCount: 0,
          totalRevenue: 0,
          perProductViewDetails: [
            {
              productType: product?.productType,
              productId: product?.productId,
              perProductViewCount: 1,
              perProductClickCount: 0,
              perProductAddedToCartCount: 0,
              perProductCheckedOutCount: 0,
              perLineItemRevenue: 0,
              productHandle: product?.productHandle,
            },
          ],
        };
        const countByGroupName = await ViewCount.create(data);
        // res.sendStatus(200);
      } else {
        // check if product already exists in perProductViewDetails array
        let productExists = findByGroupName?.perProductViewDetails.find((product) => product.productId == productId);
        // console.log("productExists.............", productExists);

        // filter for ViewCount model
        let filter = {
          productGroupName: findByGroupName?.productGroupName,
        };

        // update ViewCount model
        let update;

        // options for ViewCount model
        let options;
        if (productExists) {

          update = {
            $inc: {
              productViewCount: 1,
              "perProductViewDetails.$[elem].perProductViewCount": 1,
            }
          };

          options = {
            new: true,
            arrayFilters: [{ "elem.productId": product?.productId }],
          };

        } else {

          update = {
            $inc: { productViewCount: 1 },
            $push: {
              perProductViewDetails: {
                productType: product?.productType,
                productId: product?.productId,
                perProductViewCount: 1,
                perProductClickCount: 0,
                perProductAddedToCartCount: 0,
                perProductCheckedOutCount: 0,
                perLineItemRevenue: 0,
                productHandle: product?.productHandle,
              }
            }
          }

          options = {
            new: true
          };
        }
        let countByGroupName;
          // findOneAndUpdate ViewCount model
        countByGroupName = await ViewCount.findOneAndUpdate(
          filter,
          update,
          options
        ).lean();
        // res.sendStatus(200);
      }

    });

    res.sendStatus(200);
  } catch (error) {
    console.log("error from web pixels.............", error);
  }
});

proxyRouter.post("/product-clicked", async (req, res) => {
  try {
    const chunks = [];
    req.on("data", (chunk) => {
      chunks.push(chunk);
    });
    req.on("end", async() => {
      // getting data from request
      const buffer = Buffer.concat(chunks);
      const jsonString = buffer.toString();
      const eventData = JSON.parse(jsonString);
      // getting productId from request
      let productId = eventData?.productId;
      // checking if the product is in group product model
      let groupProduct = await GroupProduct.findOne({
        groupProducts: { $elemMatch: { productId: productId } },
      });
      // if product is not in group product model then return
      if (!groupProduct) return;
      // find productId object from groupProducts array
      let product = groupProduct?.groupProducts.find(
        (product) => product.productId == productId
      );
      // find whole collection based on group name
      let findByGroupName = await ViewCount.findOne({
        productGroupName: groupProduct?.groupName,
      });
      // if group exist in grouped product model
      if (findByGroupName) {
        // check if product already exists in perProductViewDetails array
        let productExists = findByGroupName?.perProductViewDetails.find((product) => product.productId == productId);

        // filter for ViewCount model
        let filter = {
          productGroupName: findByGroupName?.productGroupName,
        };
        // update ViewCount model
        let update;

        // options for ViewCount model
        let options;
        // if product exists in perProductViewDetails array then update product clicked count and perProductClickCount
        if (productExists) {
          update = {
            $inc: {
              productClickedCount: 1,
              "perProductViewDetails.$[elem].perProductClickCount": 1,
            }
          };
          options = {
            new: true,
            arrayFilters: [{ "elem.productId": product?.productId }],
          };
        } else {
          // if product does not exist in perProductViewDetails array then push new product object in perProductViewDetails array
          update = {
            $inc: { productClickedCount: 1 },
            $push: {
              perProductViewDetails: {
                productType: product?.productType,
                productId: product?.productId,
                perProductViewCount: 0,
                perProductClickCount: 1,
                perProductAddedToCartCount: 0,
                perProductCheckedOutCount: 0,
                perLineItemRevenue: 0,
                productHandle: product?.productHandle,
              }
            }
          }

          options = {
            new: true
          };
        }
        let countByGroupName;
          // findOneAndUpdate ViewCount model
        countByGroupName = await ViewCount.findOneAndUpdate(
          filter,
          update,
          options
        ).lean();
        console.log("product clicked count 2", countByGroupName);
      }
    });
  } catch (error) {
    console.log("error from web pixels.............", error);
  }
});

proxyRouter.post("/webhooks-data", async (req, res) => {
  try {
    console.log("getting webhooks headers",req.headers);
    console.log("getting webhooks body",req.body);
    // getting line items from request
    let lineItems = req.body?.line_items;
    // sending success response
    res.status(200).send("success");
    // calling performAnalyticsTask function to collect webhooks data
    await performAnalyticsTask(lineItems);
  } catch (error) {
    console.log("error from check out.............", error);
    res.status(500).send(error);
  }
});

// function to collect webhooks data
async function performAnalyticsTask(lineItems){
  try {
    // looping through line items to update mongodb database
    // using forloop else it will not work as expected (will not update database one by one)
    for(let i=0;i<lineItems.length;i++){
      // collection product id and associated property of the product purchased through app
      let productId = lineItems[i].product_id;
      let properties = lineItems[i].properties;
      let price = parseInt(lineItems[i].price);
      let quantity = lineItems[i].quantity;
      let discount = lineItems[i].total_discount;
      let perLineItemPrice = price * quantity;
      // check if properties exists
      if(properties && properties.length) {
        // looping through properties to find "app" property
        for(let j=0;j<properties.length;j++){
          // check if property name is "app"
          if(properties[j].name == "app"){
            // checking if the product is purchased through our app is available in mongodb database
            let groupProduct = await GroupProduct.findOne({
              groupProducts: { $elemMatch: { productId: productId } },
            });

            // if product is not available in mongodb database then return
            if (!groupProduct) return;

            // find productId object from groupProducts array
            let product = groupProduct?.groupProducts.find(
              (product) => product.productId == productId
            );

            // check if group already exists in ViewCount collection
            let findByGroupName = await ViewCount.findOne({
              productGroupName: groupProduct?.groupName,
            });

            // if group does not exists in ViewCount collection then create new group
            if (!findByGroupName) {
              let data = {
                productGroupName: groupProduct?.groupName,
                productViewCount: 0,
                productClickedCount: 0,
                productAddedToCartCount: 0,
                productCheckedOutCount: 1,
                totalRevenue: perLineItemPrice,
                perProductViewDetails: [
                  {
                    productType: product?.productType,
                    productId: product?.productId,
                    perProductViewCount: 0,
                    perProductClickCount: 0,
                    perProductAddedToCartCount: 0,
                    perProductCheckedOutCount: 1,
                    perLineItemRevenue: perLineItemPrice,
                    productHandle: product?.productHandle,
                  },
                ],
              };
              const countByGroupName = await ViewCount.create(data);
              console.log("added to checkout 1", countByGroupName);
            } else {
              // check if product already exists in perProductViewDetails array
              let productExists = findByGroupName?.perProductViewDetails.find((product) => product.productId == productId);
      
              // filter for ViewCount model
              let filter = {
                productGroupName: findByGroupName?.productGroupName,
              };

              // update ViewCount model
              let update;
      
              // options for ViewCount model
              let options;

              // if product already exists in perProductViewDetails array then update productCheckedOutCount and perProductCheckedOutCount
              if (productExists) {
                update = {
                  $inc: {
                    productCheckedOutCount: 1,
                    totalRevenue: perLineItemPrice,
                    "perProductViewDetails.$[elem].perProductCheckedOutCount": 1,
                    "perProductViewDetails.$[elem].perLineItemRevenue": perLineItemPrice,
                  }
                };
                // options for ViewCount model
                options = {
                  new: true,
                  arrayFilters: [{ "elem.productId": productId }],
                };
              } else {
                // if product does not exists in perProductViewDetails array then update productCheckedOutCount and push new object in perProductViewDetails array
                update = {
                  $inc: { productCheckedOutCount: 1, totalRevenue: perLineItemPrice },
                  $push: {
                    perProductViewDetails: {
                      productType: product?.productType,
                      productId: productId,
                      perProductViewCount: 0,
                      perProductClickCount: 0,
                      perProductAddedToCartCount: 0,
                      perProductCheckedOutCount: 1,
                      perLineItemRevenue: perLineItemPrice,
                      productHandle: product?.productHandle,
                    }
                  }
                }
                // options for ViewCount model
                options = {
                  new: true
                };
              }
              let countByGroupName;
              // findOneAndUpdate ViewCount model
              countByGroupName = await ViewCount.findOneAndUpdate(
                filter,
                update,
                options
              ).lean();
              
              console.log("added to checkout 2", countByGroupName);
            }
          }
        }
      }
    }
  } catch (error) {
    console.log("error from performTask.............", error);
  }
}
      

export default proxyRouter;
