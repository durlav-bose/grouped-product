// import { useAppBridge } from "@shopify/app-bridge-react";
// import { authenticatedFetch } from "@shopify/app-bridge/utilities";
// import { Redirect } from "@shopify/app-bridge/actions";

// function useFetch() {
//   const app = useAppBridge();
//   const fetchFunction = authenticatedFetch(app);

//   return async (uri, options) => {
//     const response = await fetchFunction(
//       uri.startsWith("/")
//         ? `https://${appOrigin}/apps${uri}`
//         : `https://${appOrigin}/apps/${uri}`,
//       options
//     );

//     if (
//       response.headers.get("X-Shopify-API-Request-Failure-Reauthorize") === "1"
//     ) {
//       const authUrlHeader = response.headers.get(
//         "X-Shopify-API-Request-Failure-Reauthorize-Url"
//       );

//       const redirect = Redirect.create(app);
//       redirect.dispatch(Redirect.Action.APP, authUrlHeader || `/exitframe`);
//       return null;
//     }

//     return response;
//   };
// }

// export default useFetch;


import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticatedFetch } from "@shopify/app-bridge-utils";
import { Redirect } from "@shopify/app-bridge/actions";

function useFetch() {
  const app = useAppBridge();
  const fetchFunction = authenticatedFetch(app);

  return async (uri, options) => {
    const response = await fetchFunction(
      uri.startsWith("/")
        ? `https://${appOrigin}/apps${uri}`
        : `https://${appOrigin}/apps/${uri}`,
      options,
    );

    if (
      response.headers.get("X-Shopify-API-Request-Failure-Reauthorize") === "1"
    ) {
      // const authUrlHeader = response.headers.get(
      //   "X-Shopify-API-Request-Failure-Reauthorize-Url"
      // );
      // const redirect = Redirect.create(app);
      // redirect.dispatch(Redirect.Action.APP, authUrlHeader || `/exitframe`);
      // return null;

      const authUrlHeader =
        response.headers.get("X-Shopify-API-Request-Failure-Reauthorize-Url") ||
        `/api/auth`;

      // console.log("authUrlHeader .............. ", authUrlHeader);

      const redirect = Redirect.create(app);
      redirect.dispatch(
        Redirect.Action.REMOTE,
        authUrlHeader.startsWith("/")
          ? `https://${window.location.host}${authUrlHeader}`
          : authUrlHeader,
      );

      return null;
    }

    return response;
  };
}

export default useFetch;
