import './App.css'
import {Route, Routes} from 'react-router-dom';
import {MainPage} from "./pages/MainPage.tsx";
import {PlayPage} from "./pages/PlayPage.tsx";
import {NotFoundPage} from "./pages/NotFoundPage.tsx";
import {OnlinePage} from "./pages/OnlinePage.tsx";
import {AuthRoute} from "./pages/routes/AuthRoute.tsx";
import AppLayout from "./pages/routes/AppLayout.tsx";
import {DashboardPage} from "./pages/DashboardPage.tsx";
import LogoutPage from "./pages/LogoutPage.tsx";

function App() {

  return (
    <div className={`bg-black text-white`} style={{height: "100vh"}}>
      <Routes>
        <Route path="/" element={<AppLayout/>}>
            <Route path={'/'} element={<MainPage/>}/>
            <Route element={<AuthRoute/>}>
              <Route path={'/dashboard'} element={<DashboardPage/>} />
              <Route path={'/play/online/:id'} element={<PlayPage/>}/>
              <Route path={'/play/online/'} element={<OnlinePage/>}/>
              <Route path={'/logout'} element={<LogoutPage/>}/>
            </Route>
            <Route path={'*'} element={<NotFoundPage/>}/>
        </Route>
      </Routes>
    </div>
  )
}

export default App
