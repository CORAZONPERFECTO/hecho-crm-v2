import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";

// Placeholder components
const Dashboard = () => (
    <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Nexus Growth Hub</h1>
        <p className="text-gray-600">Sistema reconstruido con Firebase y Vercel.</p>
        <p className="text-sm text-gray-400 mt-2">Fase 1: Inicialización completada.</p>
    </div>
);

const Auth = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md">
            <h1 className="text-xl font-bold mb-4">Autenticación</h1>
            <p>Próximamente...</p>
        </div>
    </div>
);

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/auth" element={<Auth />} />
            </Routes>
            <Toaster />
        </BrowserRouter>
    );
}

export default App;
