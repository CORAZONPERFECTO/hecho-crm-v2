
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Download, Check, X, AlertTriangle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BankReconciliation: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('2024-06');
  const { toast } = useToast();

  const bankMovements = [
    {
      id: 1,
      date: '2024-06-15',
      description: 'TRANSFERENCIA EMPRESA ABC',
      amount: 15000,
      type: 'credit',
      matched: true,
      linkedTransaction: 'ING-001'
    },
    {
      id: 2,
      date: '2024-06-14',
      description: 'PAGO FERRETERIA CENTRAL',
      amount: -5500,
      type: 'debit',
      matched: true,
      linkedTransaction: 'GAS-001'
    },
    {
      id: 3,
      date: '2024-06-13',
      description: 'DEPOSITO EFECTIVO',
      amount: 8500,
      type: 'credit',
      matched: false,
      linkedTransaction: null
    },
    {
      id: 4,
      date: '2024-06-12',
      description: 'COMISION BANCARIA',
      amount: -25,
      type: 'debit',
      matched: false,
      linkedTransaction: null
    }
  ];

  const accountingTransactions = [
    {
      id: 'ING-001',
      date: '2024-06-15',
      description: 'Pago Factura F001 - Empresa ABC',
      amount: 15000,
      type: 'income',
      matched: true
    },
    {
      id: 'GAS-001',
      date: '2024-06-14',
      description: 'Compra materiales - Ferretería Central',
      amount: 5500,
      type: 'expense',
      matched: true
    },
    {
      id: 'ING-002',
      date: '2024-06-13',
      description: 'Pago adelantado - Tech Solutions',
      amount: 8500,
      type: 'income',
      matched: false
    }
  ];

  const reconciliationSummary = {
    bankBalance: 125780,
    accountingBalance: 125755,
    difference: 25,
    matchedTransactions: 2,
    unmatchedBank: 2,
    unmatchedAccounting: 1
  };

  const handleImportBankStatement = () => {
    toast({
      title: "Extracto bancario importado",
      description: "Los movimientos bancarios han sido cargados exitosamente.",
    });
  };

  const handleMatchTransaction = (bankId: number, accountingId: string) => {
    toast({
      title: "Transacción vinculada",
      description: "El movimiento bancario ha sido vinculado correctamente.",
    });
  };

  const handleClosePeriod = () => {
    toast({
      title: "Período cerrado",
      description: "La conciliación del período ha sido cerrada exitosamente.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Conciliación Bancaria</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleImportBankStatement}>
            <Upload size={16} className="mr-2" />
            Importar Extracto
          </Button>
          <Button className="bg-green-600 hover:bg-green-700" onClick={handleClosePeriod}>
            <Check size={16} className="mr-2" />
            Cerrar Período
          </Button>
        </div>
      </div>

      {/* Period Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium">Período:</label>
            <Input 
              type="month" 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-auto"
            />
            <Button variant="outline" size="sm">
              <RefreshCw size={14} className="mr-2" />
              Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reconciliation Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-blue-700">Saldo Bancario</p>
              <p className="text-xl font-bold text-blue-800">${reconciliationSummary.bankBalance.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-green-700">Saldo Contable</p>
              <p className="text-xl font-bold text-green-800">${reconciliationSummary.accountingBalance.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-red-700">Diferencia</p>
              <p className="text-xl font-bold text-red-800">${reconciliationSummary.difference.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-purple-700">Conciliadas</p>
              <p className="text-xl font-bold text-purple-800">{reconciliationSummary.matchedTransactions}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-yellow-700">Pendientes Banco</p>
              <p className="text-xl font-bold text-yellow-800">{reconciliationSummary.unmatchedBank}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-orange-700">Pendientes Contables</p>
              <p className="text-xl font-bold text-orange-800">{reconciliationSummary.unmatchedAccounting}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bank Movements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download size={20} />
              Movimientos Bancarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bankMovements.map((movement) => (
                <div key={movement.id} className={`p-3 rounded-lg border-2 ${movement.matched ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Checkbox checked={movement.matched} />
                        <span className="font-medium text-sm">{movement.description}</span>
                        {movement.matched ? (
                          <Badge className="bg-green-100 text-green-800">
                            <Check size={12} className="mr-1" />
                            Conciliado
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <AlertTriangle size={12} className="mr-1" />
                            Pendiente
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{movement.date}</p>
                      {movement.linkedTransaction && (
                        <p className="text-xs text-blue-600 mt-1">→ {movement.linkedTransaction}</p>
                      )}
                    </div>
                    <div className={`font-bold ${movement.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {movement.amount > 0 ? '+' : ''}${Math.abs(movement.amount).toLocaleString()}
                    </div>
                  </div>
                  {!movement.matched && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <Button size="sm" variant="outline">
                        Vincular Transacción
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Accounting Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw size={20} />
              Transacciones Contables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {accountingTransactions.map((transaction) => (
                <div key={transaction.id} className={`p-3 rounded-lg border-2 ${transaction.matched ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Checkbox checked={transaction.matched} />
                        <span className="font-medium text-sm">{transaction.id}</span>
                        {transaction.matched ? (
                          <Badge className="bg-green-100 text-green-800">
                            <Check size={12} className="mr-1" />
                            Conciliado
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <AlertTriangle size={12} className="mr-1" />
                            Pendiente
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{transaction.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{transaction.date}</p>
                    </div>
                    <div className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      ${transaction.amount.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BankReconciliation;
