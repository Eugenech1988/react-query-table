import { SchoolarProvider } from '@/SchoolarContext.tsx';
import { Routes, Route, Navigate } from 'react-router-dom';
import TableComponent from '@/components/TableComponent';
import SchoolarCard from '@/components/SchoolarCard';

const App = () => (
  <SchoolarProvider>
    <Routes>
      <Route path="/" element={<TableComponent/>}/>
      <Route path="/card" element={<SchoolarCard/>}/>
      <Route path="*" element={<Navigate to="/"/>}/>
    </Routes>
  </SchoolarProvider>
);


export default App;
