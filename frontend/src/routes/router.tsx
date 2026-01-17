import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { RequireAuth } from "@/routes/guards/RequireAuth";

import Landing from "@/pages/Landing";
import Explore from "@/pages/Explore";
import Entity from "@/pages/Entity";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import MyReviews from "@/pages/MyReviews";
import NotFound from "@/pages/NotFound";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <Landing /> },
      { path: "/explore", element: <Explore /> },
      { path: "/entity/:entityId", element: <Entity /> },
      { path: "/login", element: <Login /> },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { path: "/dashboard", element: <Dashboard /> },
              { path: "/me/reviews", element: <MyReviews /> },
            ],
          },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
