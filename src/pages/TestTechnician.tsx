import React, { useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

const TestTechnician: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    console.log('=== TestTechnician DEBUG ===');
    console.log('Component loaded successfully!');
    console.log('Current location:', location);
    console.log('Search params:', Object.fromEntries(searchParams));
    console.log('Full URL:', window.location.href);
    console.log('==============================');
  }, [location, searchParams]);
  
  const ticketParam = searchParams.get('ticket');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-green-600 mb-2">¡FUNCIONA!</h1>
          <p className="text-gray-600">La ruta /technician está funcionando correctamente</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg text-left text-sm space-y-2">
          <p><strong>Ruta actual:</strong> {location.pathname}</p>
          <p><strong>Query params:</strong> {location.search || 'ninguno'}</p>
          {ticketParam && (
            <p><strong>Ticket ID:</strong> <span className="text-blue-600">{ticketParam}</span></p>
          )}
          <p><strong>URL completa:</strong> {window.location.href}</p>
        </div>
        
        <div className="mt-6">
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestTechnician;