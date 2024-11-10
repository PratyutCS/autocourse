import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Signup from './pages/signup';
import Dashboard from './pages/dashboard';
import NotFound from './pages/notfound';
import Info from './pages/Info';
import './css/App.css';

function App() {
  return (
    <div className='App'>
      <BrowserRouter>
        <Routes>
          <Route index element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/form" element={<Info />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
