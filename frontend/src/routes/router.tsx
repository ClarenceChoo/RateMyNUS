import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout";

import Landing from "@/pages/Landing";
import Explore from "@/pages/Explore";
import Category from "@/pages/Category";
import Entity from "@/pages/Entity";
import WriteReview from "@/pages/WriteReview";
import CreateEntity from "@/pages/CreateEntity";
import NotFound from "@/pages/NotFound";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <Landing /> },
      { path: "/explore", element: <Explore /> },
      { path: "/c/:type", element: <Category /> },
      { path: "/entity/:entityId", element: <Entity /> },
      { path: "/write/:id", element: <WriteReview /> },
      { path: "/create", element: <CreateEntity /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
