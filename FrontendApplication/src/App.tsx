import './App.css'
import {Route, Routes} from 'react-router-dom';
import {MainPage} from "./pages/MainPage.tsx";
import {PlayPage} from "./pages/PlayPage.tsx";
import {NotFoundPage} from "./pages/NotFoundPage.tsx";
import {OnlinePage} from "./pages/OnlinePage.tsx";
import {AuthRoute} from "./components/AuthRoute.tsx";

function App() {

  return (
    <div className={`bg-black text-white`} style={{height: "100vh"}}>
      <Routes>
        <Route path={'/'} element={<MainPage/>}/>
        <Route element={<AuthRoute/>}>
          <Route path={'/play/online/:id'} element={<PlayPage/>}/>
          <Route path={'/play/online/'} element={<OnlinePage/>}/>
        </Route>
        <Route path={'*'} element={<NotFoundPage/>}/>
      </Routes>
    </div>
  )
}

export default App
