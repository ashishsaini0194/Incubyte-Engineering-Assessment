import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/Layout';
import EmployeeList from './pages/EmployeeList';
import EmployeeDetail from './pages/EmployeeDetail';

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/employees" replace />} />
        <Route path="/employees" element={<EmployeeList />} />
        <Route path="/employees/:id" element={<EmployeeDetail />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
