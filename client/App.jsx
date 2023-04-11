// import {
//   NavigationMenu,
//   Provider as AppBridgeProvider,
// } from "@shopify/app-bridge-react";
// import { AppProvider as PolarisProvider } from "@shopify/polaris";
// import "@shopify/polaris/build/esm/styles.css";
// import translations from "@shopify/polaris/locales/en.json";
// import { useRoutes } from "raviger";
// import ApolloClientProvider from "./providers/ApolloClientProvider";
// import routes from "./Routes";

// const appBridgeConfig = {
//   apiKey: process.env.SHOPIFY_API_KEY,
//   host: new URL(location).searchParams.get("host"),
//   forceRedirect: true,
// };

// export default function App() {
//   const RouteComponents = useRoutes(routes);

//   return (
//     <PolarisProvider i18n={translations}>
//       <AppBridgeProvider config={appBridgeConfig}>
//         <NavigationMenu
//           navigationLinks={[
//             {
//               label: "Debug Cards",
//               destination: "/debug",
//             },
//           ]}
//         />
//         <ApolloClientProvider>{RouteComponents}</ApolloClientProvider>
//       </AppBridgeProvider>
//     </PolarisProvider>
//   );
// }


import { BrowserRouter } from "react-router-dom";
import { NavigationMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";
import { ApolloClientProvider, AppBridgeProvider, PolarisProvider, QueryProvider } from "./providers/index.js";

import { createContext, useState } from "react";
import { Frame, Toast } from "@shopify/polaris";
export const GroupProductContext = createContext("default");
// const GroupProductContext = createContext("default");

export default function App() {

  const [defaultContextValues, setDefaultContextValues] = useState({
    isShowToast: false,
    toastStatus: "",
    toastMessage: "",
  });

  const toggleActive = () => {
    setDefaultContextValues({
      isShowToast: !defaultContextValues.isShowToast,
      toastStatus: defaultContextValues.toastStatus,
      toastMessage: defaultContextValues.toastMessage,
    });
  };

  const tostMarkup = defaultContextValues.isShowToast ? (
    <Toast
      content={defaultContextValues?.toastMessage}
      onDismiss={toggleActive}
      error={defaultContextValues?.toastStatus === "error" ? true : false}
    />
  ) : null;

  const pages = import.meta.globEager("./pages/**/!(*.test.[jt]sx)*.([jt]sx)");

  return (

    <GroupProductContext.Provider
      value={[defaultContextValues, setDefaultContextValues]}
    >
      <PolarisProvider>
        <Frame>
      <BrowserRouter>
        <AppBridgeProvider>
          <QueryProvider>
            <NavigationMenu
              navigationLinks={[

              ]}
            />
            <ApolloClientProvider>
              <Routes pages={pages} />
            </ApolloClientProvider>
          </QueryProvider>
        </AppBridgeProvider>
      </BrowserRouter>
      {tostMarkup}
      </Frame>
    </PolarisProvider>
    </GroupProductContext.Provider>
  );
}
