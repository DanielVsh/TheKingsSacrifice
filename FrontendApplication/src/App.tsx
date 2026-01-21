import './App.css'
import {Route, Routes} from 'react-router-dom';
import {MainPage} from "./pages/MainPage.tsx";
import {PlayPage} from "./pages/PlayPage.tsx";
import {NotFoundPage} from "./pages/NotFoundPage.tsx";
import {OnlinePage} from "./pages/OnlinePage.tsx";
import {ProfilePage} from "./pages/ProfilePage.tsx";
import {AuthRoute} from "./pages/routes/AuthRoute.tsx";
import AppLayout from "./pages/routes/AppLayout.tsx";
import {DashboardPage} from "./pages/DashboardPage.tsx";
import LogoutPage from "./pages/LogoutPage.tsx";
import {BotSelectPage} from "./pages/BotSelectPage.tsx";
import {SpecificGameAnalysisPage} from "./pages/SpecificGameAnalysisPage.tsx";
import {AnalysisPage} from "./pages/AnalysisPage.tsx";
import {PuzzlePage} from "./pages/PuzzlePage.tsx";
import {SpecificPuzzlePage} from "./pages/SpecificPuzzlePage.tsx";
import {AppRoute} from "./app/interfaces/Types.ts";

export const appRoutes: AppRoute[] = [
  { path: "/", element: <MainPage />, breadcrumb: "Home" },
  { path: "/analysis", element: <AnalysisPage boardOrientation="white" />, breadcrumb: "Analysis" },
  { path: "/dashboard", element: <DashboardPage />, breadcrumb: "Dashboard", auth: true },
  { path: "/play/bot", element: <BotSelectPage />, breadcrumb: "Practice", auth: true },
  { path: "/play/online", element: <OnlinePage />, breadcrumb: "Online", auth: true },
  { path: "/play/online/:id", element: <PlayPage />, breadcrumb: "Play Online", auth: true },
  { path: "/game/:id", element: <SpecificGameAnalysisPage />, breadcrumb: "Game", auth: true },
  { path: "/puzzle", element: <PuzzlePage />, breadcrumb: "Puzzles", auth: true },
  { path: "/puzzle/:id", element: <SpecificPuzzlePage />, breadcrumb: "Puzzle", auth: true },
  { path: "/profile", element: <ProfilePage />, breadcrumb: "Profile", auth: true },
  { path: "/logout", element: <LogoutPage />, breadcrumb: "Logout" },
  { path: "*", element: <NotFoundPage />},
];

function App() {
  return (
    <div className="bg-black text-white min-h-screen">
      <Routes>
        <Route path="/" element={<AppLayout routes={appRoutes} />}>
          {appRoutes.map((route, idx) => {
            if (route.auth) {
              return (
                <Route key={idx} element={<AuthRoute />}>
                  <Route path={route.path} element={route.element} />
                </Route>
              );
            } else {
              return <Route key={idx} path={route.path} element={route.element} />;
            }
          })}
        </Route>
      </Routes>
    </div>
  );
}

export default App
