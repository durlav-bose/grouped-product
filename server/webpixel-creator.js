import { GraphqlQueryError } from "@shopify/shopify-api";
// import shopify from "./shopify.js";
import clientProvider from "../utils/clientProvider.js";

export const DEFAULT_ACCOUNT_ID = "234";

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


export default async function webPixelCreate(session, accountID = DEFAULT_ACCOUNT_ID) {
  // let client = new shopify.api.clients.Graphql({ session });

  const { client } = await clientProvider.graphqlClient({
    req,
    res,
    isOnline: false,
  });

  console.log("client..............", client);

  try {
    let resp = await client.query({
      data: {
        query: WEB_PIXEL_CREATE_MUTATION,
        variables: {
          webPixel: { 
            settings: { accountID: accountID } 
          }
        },
      },
    });
    console.log('webPixelSuccess', JSON.stringify(resp.body, null, 2));
    let data = JSON.stringify(resp.body);
    return data;
  } catch (error) {
    console.log('error from webpixel create..................... ', error.response.errors);
    if (error instanceof shopify.Errors.GraphqlQueryError) {
      throw new Error(`${error.message}\n${JSON.stringify(error.response, null, 2)}`);
    } else {
      throw error;
    }
  }
}