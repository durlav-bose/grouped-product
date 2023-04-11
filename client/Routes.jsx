

// const routes = {
//   "/": () => <Index />,
//   "/exitframe": () => <ExitFrame />,
//   //Debug Cards
//   "/debug": () => <DebugIndex />,
//   "/debug/activeWebhooks": () => <ActiveWebhooks />,
//   "/debug/getData": () => <GetData />,
//   "/debug/billing": () => <BillingAPI />,
//   "/debug/devNotes": () => <DevNotes />,
//   //Add your routes here
// };

// export default routes;



// import { Route, Routes as ReactRouterRoutes } from "react-router-dom";
// import Index from "./pages/Index.jsx";
// import NotFound from "./pages/NotFound.jsx";
// import ExitFrame from "./ExitFrame.jsx";
// import React from "react";
// import ActiveWebhooks from "./pages/debugCards/ActiveWebhooks";
// import BillingAPI from "./pages/debugCards/BillingAPI";
// import DebugIndex from "./pages/debugCards/DebugIndex";
// import DevNotes from "./pages/debugCards/DevNotes";
// import GetData from "./pages/debugCards/GetData";
// import CreateProductGroup from "./pages/CreateProductGroup";
// import groupProductId from "./pages/group-product/[groupProductId]";

// export default function Routes() {
//   return (
//     <ReactRouterRoutes>{[
//       <Route key={"/"} path={"/"} element={<Index />} />,
//       <Route key={"/exitframe"} path={"/exitframe"} element={<ExitFrame />} />,
//       <Route key={"/debug"} path={"/debug"} element={<DebugIndex />} />,
//       <Route key={"/debug/activeWebhooks"} path={"/debug/activeWebhooks"} element={<ActiveWebhooks />} />,
//       <Route key={"/debug/getData"} path={"/debug/getData"} element={<GetData />} />,
//       <Route key={"/debug/billing"} path={"/debug/billing"} element={<BillingAPI />} />,
//       <Route key={"/debug/devNotes"} path={"/debug/devNotes"} element={<DevNotes />} />,
//       <Route key={"/CreateProductGroup"} path={"/CreateProductGroup"} element={<CreateProductGroup />} />,
//       <Route key={"/group-product/:id"} path={"/group-product/:id"} element={<groupProductId />} />,
//       <Route key={"*"} path={"*"} element={<NotFound />} />,
//     ]}</ReactRouterRoutes>
//   );
// }




import { Routes as ReactRouterRoutes, Route } from "react-router-dom";

/**
 * File-based routing.
 * @desc File-based routing that uses React Router under the hood.
 * To create a new route create a new .jsx file in `/pages` with a default export.
 *
 * Some examples:
 * * `/pages/index.jsx` matches `/`
 * * `/pages/blog/[id].jsx` matches `/blog/123`
 * * `/pages/[...catchAll].jsx` matches any URL not explicitly matched
 *
 * @param {object} pages value of import.meta.globEager(). See https://vitejs.dev/guide/features.html#glob-import
 *
 * @return {Routes} `<Routes/>` from React Router, with a `<Route/>` for each file in `pages`
 */
export default function Routes({ pages }) {
  const routes = useRoutes(pages);
  const routeComponents = routes.map(({ path, component: Component }) => (
    <Route key={path} path={path} element={<Component />} />
  ));

  const NotFound = routes.find(({ path }) => path === "/notFound").component;

  return (
    <ReactRouterRoutes>
      {routeComponents}
      <Route path="*" element={<NotFound />} />
    </ReactRouterRoutes>
  );
}

function useRoutes(pages) {
  const routes = Object.keys(pages)
    .map((key) => {
      let path = key
        .replace("./pages", "")
        .replace(/\.(t|j)sx?$/, "")
        /**
         * Replace /index with /
         */
        .replace(/\/index$/i, "/")
        /**
         * Only lowercase the first letter. This allows the developer to use camelCase
         * dynamic paths while ensuring their standard routes are normalized to lowercase.
         */
        .replace(/\b[A-Z]/, (firstLetter) => firstLetter.toLowerCase())
        /**
         * Convert /[handle].jsx and /[...handle].jsx to /:handle.jsx for react-router-dom
         */
        .replace(/\[(?:[.]{3})?(\w+?)\]/g, (_match, param) => `:${param}`);

      if (path.endsWith("/") && path !== "/") {
        path = path.substring(0, path.length - 1);
      }

      if (!pages[key].default) {
        console.warn(`${key} doesn't export a default React component`);
      }

      return {
        path,
        component: pages[key].default,
      };
    })
    .filter((route) => route.component);

  return routes;
}
