import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import Root from "@/layouts/Root";
import Layout from "@/components/organisms/Layout";
import NotFound from "@/components/pages/NotFound";
import Loading from "@/components/ui/Loading";
import { getRouteConfig } from "./route.utils";

// Lazy load pages
const Dashboard = lazy(() => import("@/components/pages/Dashboard"));
const Transactions = lazy(() => import("@/components/pages/Transactions"));
const Budgets = lazy(() => import("@/components/pages/Budgets"));
const Goals = lazy(() => import("@/components/pages/Goals"));
const Reports = lazy(() => import("@/components/pages/Reports"));
const BankAccounts = lazy(() => import("@/components/pages/BankAccounts"));
const Login = lazy(() => import("@/components/pages/Login"));
const Signup = lazy(() => import("@/components/pages/Signup"));
const Callback = lazy(() => import("@/components/pages/Callback"));
const ErrorPage = lazy(() => import("@/components/pages/ErrorPage"));
const PromptPassword = lazy(() => import("@/components/pages/PromptPassword"));
const ResetPassword = lazy(() => import("@/components/pages/ResetPassword"));

const createRoute = ({
  path,
  index,
  element,
  access,
  children,
  ...meta
}) => {
  let configPath;
  if (index) {
    configPath = "/";
  } else {
    configPath = path.startsWith('/') ? path : `/${path}`;
  }

  const config = getRouteConfig(configPath);
  const finalAccess = access || config?.allow;

  const route = {
    ...(index ? { index: true } : { path }),
    element: element ? <Suspense fallback={<Loading />}>{element}</Suspense> : element,
    handle: {
      access: finalAccess,
      ...meta,
    },
  };

  if (children && children.length > 0) {
    route.children = children;
  }

  return route;
};

const mainRoutes = [
  createRoute({
    path: "",
    index: true,
    element: <Dashboard />,
  }),
  createRoute({
    path: "transactions",
    element: <Transactions />,
  }),
  createRoute({
    path: "budgets",
    element: <Budgets />,
  }),
  createRoute({
    path: "goals",
    element: <Goals />,
  }),
  createRoute({
    path: "reports",
element: <Reports />,
  }),
  createRoute({
    path: "/bank-accounts",
    element: <BankAccounts />,
  }),
  {
    path: "*",
    element: <NotFound />,
  },
];

const authRoutes = [
  createRoute({
    path: "login",
    element: <Login />,
  }),
  createRoute({
    path: "signup",
    element: <Signup />,
  }),
  createRoute({
    path: "callback",
    element: <Callback />,
  }),
  createRoute({
    path: "error",
    element: <ErrorPage />,
  }),
  createRoute({
    path: "prompt-password/:appId/:emailAddress/:provider",
    element: <PromptPassword />,
  }),
  createRoute({
    path: "reset-password/:appId/:fields",
    element: <ResetPassword />,
  }),
];

const routes = [
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "/",
        element: <Layout />,
        children: mainRoutes,
      },
      ...authRoutes,
    ],
  },
];

export const router = createBrowserRouter(routes);