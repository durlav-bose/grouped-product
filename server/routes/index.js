import dotenv from "dotenv";
import { Router } from "express";
import clientProvider from "../../utils/clientProvider.js";
import subscriptionRoute from "./recurringSubscriptions.js";
import AWS from "aws-sdk";
import multer from "multer";
import mongoose from "mongoose";
// import shopify from "../shopify.js";
import { GroupProduct } from "../schemas/createGroupProduct.js";
import { ViewCount } from "../schemas/createViewCount.js";
import webPixelCreate from "../webpixel-creator.js";
import productCreator from "../product-creator.js";
dotenv.config();

const userRoutes = Router();
userRoutes.use(subscriptionRoute);

const storage = multer.memoryStorage();

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new AWS.S3({
  accessKeyId: accessKey,
  secretAccessKey: secretAccessKey,
  region: bucketRegion,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // limit the file size to 5MB
});

userRoutes.get("/api", (req, res) => {
  const sendData = { text: "This is coming from /apps/api route." };
  res.status(200).json(sendData);
});

userRoutes.post("/api", (req, res) => {
  res.status(200).json(req.body);
});

userRoutes.get("/api/gql", async (req, res) => {
  //false for offline session, true for online session
  const { client } = await clientProvider.graphqlClient({
    req,
    res,
    isOnline: false,
  });

  const shop = await client.query({
    data: `{
      shop {
        name
      }
    }`,
  });

  res.status(200).send(shop);
});

// retrieve or create webhooks from shopify
userRoutes.get("/api/webhooksCreate", async (req, res) => {
  try {
    const { client } = await clientProvider.restClient({
      req,
      res,
      isOnline: false,
    });

    console.log("client........webhooks create", client);
    const response = await client.get({
      path: "webhooks.json",
    });
    console.log("response........webhooks create", response.body);
    // /admin/api/2023-04/webhooks.json
    // const webhook = await client.Webhook.all({session: res.locals.shopify.session});
    // console.log("webhook.........", webhook);
    // // loop through the webhook and create orders/create webhook if not exist already and return the webhook
    // for(let i = 0; i < webhook.length; i++) {
    //   if(webhook[i].topic === "orders/create") {
    //     res.status(200).send({ success: true, webhook });
    //     return;
    //   }
    // }

    // const createWebhook = new clientProvider.restClient.Webhook({session: res.locals.shopify.session});
    // createWebhook.address = "https://tasty-bulldog-98.telebit.io/webhooks_route/webhooks-data";
    // createWebhook.topic = "orders/create";
    // createWebhook.format = "json";
    // await createWebhook.save({
    //   update: true,
    // });
    res.status(200).send({ success: true, response });
  } catch (error) {
    console.log("error", error);
    res.status(400).send({ success: false, message: "error" });
  }
});

userRoutes.get("/api/getAnalyticsData", async(req, res) => {
  try {
    let groupName = req.query.groupName;
    let data = await ViewCount.find({productGroupName: groupName});
    res.status(200).send({success: true, data});
  } catch (error) {
    console.log("error.....",error);
    res.status(500).send({success: false, message: "Internal Server Error"});
  }
})

userRoutes.get("/api/getTotalAnalyticsData", async(req, res) => {
  try {
    let data = await ViewCount.find({});
    console.log("total analytics data", data)
    res.status(200).send({success: true, data});
  } catch (error) {
    console.log("error.....",error);
    res.status(500).send({success: false, message: "Internal Server Error"});
  }
})

userRoutes.post("/api/webpixelsCreate", async (req, res) => {
  const { client } = await clientProvider.graphqlClient({
    req,
    res,
    isOnline: false,
  });

  const WEB_PIXEL_CREATE_MUTATION = `
    mutation webPixelCreate($webPixel: WebPixelInput!) {
        webPixelCreate(webPixel: $webPixel) {
          userErrors {
            code
            field
            message
          }
          webPixel {
            settings
            id
          }
        }
      }`;

    try {
      const createWebPixel = await client.query({
        data: {
          query: WEB_PIXEL_CREATE_MUTATION,
          variables: {
            webPixel: { 
              settings: { accountID: "234" } 
            }
          },
        },
      });
      console.log('webPixelSuccess');
    } catch (error) {
      console.log('webPixelCreateError', error.response)
    }

    res.status(200).send({ success: true, error: null });
  
});

//upload image to shopify and return the image url
userRoutes.post("/api/image-upload", upload.single("image"), async (req, res) => {
  console.log("req image upload.....", req?.file);
  const params = {
    Bucket: bucketName,
    Key: req?.file?.originalname,
    Body: req?.file?.buffer,
    ContentType: req?.file?.mimetype,
  };

  console.log("params.....", params);

  s3.upload(params, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Failed to upload image");
    }

    console.log("data.....", data);

    res.status(200).send({ success: true, url: data.Location });
  });
});

//create group product
userRoutes.post("/api/create-group-product", async (req, res) => {
  const { groupName, groupProducts } = req.body;
  let { client } = await clientProvider.restClient({
    req,
    res,
    isOnline: false,
  });
  let session = client.session;
  let shopUrl = session.shop;
  let newGroup = {
    groupName,
    shopUrl: shopUrl,
    groupProducts,
  };
  //check if group product name already exists in same shopUrl
  const checkGroupProduct = await GroupProduct.find({
    shopUrl: shopUrl,
    groupName,
  });
  if (checkGroupProduct?.length > 0) {
    return res
      .status(400)
      .send({ success: false, message: "Group Product Name Already Exists" });
  }
  const groupProduct = new GroupProduct(newGroup);

  try {
    await groupProduct.save();
    res
      .status(200)
      .send({ success: true, message: "Group Product Created Successfully" });
  } catch (error) {
    if (error.code === 11000) {
      res
        .status(400)
        .send({ success: false, message: "Group Product Name Already Exists" });
    } else {
      res
        .status(400)
        .send({
          success: false,
          message: "Group Product don't Created Successfully",
        });
    }
  }
});

//get group product form GroupProduct schema with pagination
userRoutes.get("/api/get-group-product", async (req, res) => {
  console.log("req.query...................", req.query);
  const { page, limit } = req.query;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  let { client } = await clientProvider.restClient({
    req,
    res,
    isOnline: false,
  });
  let session = client.session;
  let shopUrl = session.shop;
  console.log("shopUrl.........", shopUrl);
  console.log("session.........", session);
  // const totalPage = Math.ceil(GroupProduct.length / limit);
  //get total page by shopUrl
  const totalPage = Math.ceil(
    (await GroupProduct.find({ shopUrl: shopUrl }))
      .length / limit
  );

  try {
    // const groupProduct = await GroupProduct.find({});
    //find group product by shopUrl and pagination and limit by mongoose
    const groupProduct = await GroupProduct.find({
      shopUrl: shopUrl,
    })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
    if (groupProduct.length > 0) {
      //sort group product by date

      res.status(200).send({ success: true, groupProduct, totalPage });
    } else {
      res
        .status(200)
        .send({ success: false, message: "Group Product Not Exists" });
    }
  } catch (error) {
    res.status(400).send({ success: false, message: "error from server fetching group product" });
  }
});

//check group product form GroupProduct schema has productId
userRoutes.get("/api/check-group-product/:productId", async (req, res) => {
  let newProductId = req.params.productId;
  console.log("newProductId...........1", newProductId);
  newProductId = newProductId.slice(
    newProductId.length - 13,
    newProductId.length
  );
  console.log("newProductId...........2", newProductId);
  let { client } = await clientProvider.graphqlClient({
    req,
    res,
    isOnline: false,
  });

  console.log("clinet...........check group product", client);
  let session = client.session;
  let shopUrl = session.shop;
  try {
    const groupProduct = await GroupProduct.find({
      shopUrl: shopUrl,
      groupProducts: { $elemMatch: { productId: newProductId } },
    });
    if (groupProduct.length > 0) {
      res.status(200).send({ success: true, message: "Product Already Taken" });
    } else {
      res.status(200).send({ success: false, message: "Product Not Exists" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).send({ success: false, message: "Internal Server Error" });
  }
});

//get group product form GroupProduct schema by id
userRoutes.get("/api/get-group-product/:id", async (req, res) => {
  try {
    let { client } = await clientProvider.restClient({
      req,
      res,
      isOnline: false,
    });
    let session = client.session;
    let shopUrl = session.shop;
    const groupProduct = await GroupProduct.findById(req.params.id);
    let products = [];
    let shopifyProducts = [];
    if (groupProduct) {
      products = groupProduct.groupProducts.map((product) => product.productId);
    }
    
    if (products.length > 0) {
      // shopifyProducts = await shopify.api.rest.Product.all({
      //   session: session,
      //   ids: products.join(","),
      // });

      shopifyProducts = await client.get({
        path: "products.json",
        ids: products.join(",")
      });

      console.log("shopifyProducts............", shopifyProducts)
    }
    res
      .status(200)
      .send({ success: true, groupProduct, shopifyProducts: shopifyProducts });
  } catch (error) {
    console.log(error.message);
    res.status(400).send({ success: false, message: "Internal Server Error" });
  }
});

//update group product from GroupProduct schema by id
userRoutes.put("/api/update-group-product", async (req, res) => {
  try {
    const { _id, groupName, groupProducts } = req.body;
    const updateProductGroup = await GroupProduct.findByIdAndUpdate(_id, {
      groupName,
      groupProducts,
    });
    res
      .status(200)
      .send({ success: true, message: "Group Product Updated Successfully" });
  } catch (error) {
    res
      .status(400)
      .send({
        success: false,
        message: "Group Product don't Updated Successfully",
      });
  }
});

//delete group product from GroupProduct schema by id
userRoutes.delete("/api/delete-group-product/:id", async (req, res) => {
  console.log(req.params.id);
  try {
    const groupProduct = await GroupProduct.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .send({ success: true, message: "Group Product Deleted Successfully" });
  } catch (error) {
    res
      .status(400)
      .send({
        success: false,
        message: "Group Product don't Deleted Successfully",
      });
  }
});

// search group product from GroupProduct schema by name
userRoutes.get("/api/search-group-product", async (req, res) => {
  const { search } = req.query;
  console.log("search------->", search);
  // const shopUrl = res.locals.shopify.session.shop;
  let { client } = await clientProvider.graphqlClient({
    req,
    res,
    isOnline: false,
  });
  let session = client.session;
  let shopUrl = session.shop;
  try {
    const groupProduct = await GroupProduct.find({
      $or: [
        { groupName: { $regex: search, $options: "i" } },
        { "groupProducts.productType": { $regex: search, $options: "i" } },
        {
          "groupProducts.selectedProductTitle": {
            $regex: search,
            $options: "i",
          },
        },
      ],
      shopUrl,
    });
    if (groupProduct.length > 0) {
      res.status(200).send({ success: true, groupProduct });
    } else {
      res
        .status(200)
        .send({ success: false, message: "Group Product Not Exists" });
    }
  } catch (error) {
    res.status(400).send({ success: false, message: "Internal Server Error" });
  }
});



userRoutes.get("/api/products/count", async (req, res) => {
  let { client } = await clientProvider.graphqlClient({
    req,
    res,
    isOnline: false,
  });
  let session = client.session;
  let shopUrl = session.shop;
  const countData = await shopify.api.rest.Product.count({
    session: session,
  });
  res.status(200).send(countData);
});



userRoutes.get("/api/products/create", async (req, res) => {
  let status = 200;
  let error = null;

  try {
    let { client } = await clientProvider.graphqlClient({
      req,
      res,
      isOnline: false,
    });
    let session = client.session;
    let shopUrl = session.shop;
    await productCreator(session, client);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 400;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});


export default userRoutes;
