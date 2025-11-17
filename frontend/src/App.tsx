import './App.css';
import { HealthCheck } from './components/HealthCheck';
import { Register } from './components/Register';
import NavBar from './components/navBar/NavBar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const Page: React.FC<{ title: string }> = ({ title }) => <h1>{title}</h1>;

const App: React.FC = () => {
  return (
    <Router>
      <NavBar />
      <div style={{ padding: '1rem' }}>
        <HealthCheck />
        <Routes>
          <Route path="/" element={<Page title="Home" />} />
          <Route path="/about" element={<Page title="About" />} />
          <Route path="/contact" element={<Page title="Contact" />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
