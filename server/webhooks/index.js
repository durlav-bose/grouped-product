//Combine all your webhooks here
import { DeliveryMethod } from "@shopify/shopify-api";
import shopify from "../../utils/shopifyConfig.js";
import appUninstallHandler from "./app_uninstalled.js";

/*
  Template for adding new topics:
  ```
  TOPIC: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/topic",
      callback: topicHandler,
    },
  ```

    - Webhook topic and callbackUrl topic should be exactly the same because it's using catch-all
    - Don't change the delivery method unless you know what you're doing
      - the method is `DeliveryMethod.Http` and not `DeliveryMethod.http`, mind the caps on `H` in `http`
*/

const webhookRegistrar = async () => {
  await shopify.webhooks.addHandlers({
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/app_uninstalled",
      callback: appUninstallHandler,
    },
    CARTS_UPDATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/carts_update",
      callback: async () => (topic, shop, body, webhookId) => {
        console.log("-----topics----",  topic)
        console.log("-----shop----",  shop)
        console.log("-----body----",  body)
        console.log("-----webhookId----",  webhookId);
        // hello(); 
      }
    }
  });
};

export default webhookRegistrar;
