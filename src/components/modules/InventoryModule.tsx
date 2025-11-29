
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, AlertTriangle, TrendingUp, Boxes, Upload } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogTrigger,
} from '@/components/ui/dialog';
import AddProductForm from './inventory/AddProductForm';
import ImportProducts from './inventory/ImportProducts';
import { Product } from './inventory/types';
import { ProductFormValues } from './inventory/validation';
import { useToast } from '@/hooks/use-toast';

const initialProducts: Product[] = [
    { 
      id: 1, 
      type: 'Producto',
      name: 'Laptop Dell XPS 13', 
      sku: 'LT-DELL-001',
      category: 'Electrónicos',
      unit: 'Unidad',
      stock: 25,
      minStock: 10,
      price: 1299,
      status: 'En Stock',
    },
    { 
      id: 2, 
      type: 'Producto',
      name: 'Mouse Inalámbrico', 
      sku: 'AC-MSE-002',
      category: 'Accesorios',
      unit: 'Unidad',
      stock: 150,
      minStock: 50,
      price: 29,
      status: 'En Stock',
    },
    { 
      id: 3, 
      type: 'Producto',
      name: 'Monitor 4K 27"', 
      sku: 'MN-4K-003',
      category: 'Monitores',
      unit: 'Pieza',
      stock: 8,
      minStock: 15,
      price: 599,
      status: 'Stock Bajo',
    },
    { 
      id: 4, 
      type: 'Producto',
      name: 'Teclado Mecánico', 
      sku: 'KB-MEC-004',
      category: 'Accesorios',
      unit: 'Unidad',
      stock: 0,
      minStock: 20,
      price: 149,
      status: 'Agotado',
    },
];

const InventoryModule: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const { toast } = useToast();

  const getStatus = (stock: number, minStock: number): Product['status'] => {
    if (stock === 0) return 'Agotado';
    if (stock <= minStock) return 'Stock Bajo';
    return 'En Stock';
  };
  
  const handleAddProduct = (newProductData: ProductFormValues) => {
    setProducts(prevProducts => {
      const newProduct: Product = {
        id: prevProducts.length > 0 ? Math.max(...prevProducts.map(p => p.id)) + 1 : 1,
        type: newProductData.type,
        name: newProductData.name,
        sku: newProductData.sku,
        category: newProductData.category,
        stock: newProductData.stock,
        minStock: newProductData.minStock,
        price: newProductData.price,
        unit: newProductData.unit,
        status: getStatus(newProductData.stock, newProductData.minStock),
      };
      return [...prevProducts, newProduct];
    });
  };

  const handleImportProducts = (importedProducts: ProductFormValues[]) => {
    const newProducts: Product[] = importedProducts.map(productData => ({
      id: Date.now() + Math.random(),
      type: productData.type,
      name: productData.name,
      sku: productData.sku,
      category: productData.category,
      stock: productData.stock,
      minStock: productData.minStock,
      price: productData.price,
      unit: productData.unit,
      status: getStatus(productData.stock, productData.minStock),
    }));
    
    setProducts(prev => [...newProducts, ...prev]);
    setShowImportForm(false);
    toast({
      title: "Productos Importados",
      description: `${importedProducts.length} productos/servicios han sido importados exitosamente.`,
      variant: "default",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En Stock': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'Stock Bajo': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'Agotado': return 'bg-red-100 text-red-800 hover:bg-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Inventario</h1>
          <div className="flex space-x-3">
            <Button 
              variant="outline"
              onClick={() => setShowImportForm(true)}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              <Upload size={16} className="mr-2" />
              Importar Productos
            </Button>
            <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                  <Plus size={16} className="mr-2" />
                  Nuevo Producto
                </Button>
              </DialogTrigger>
              <AddProductForm onAddProduct={handleAddProduct} setOpen={setIsAddProductOpen} />
            </Dialog>
          </div>
        </div>

        {/* Inventory Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Productos</p>
                  <p className="text-2xl font-bold text-blue-600">{products.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Package className="text-blue-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
                  <p className="text-2xl font-bold text-yellow-600">{products.filter(p => p.status === 'Stock Bajo').length}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <AlertTriangle className="text-yellow-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold text-green-600">${(products.reduce((sum, p) => sum + (p.price * p.stock), 0)).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Categorías</p>
                  <p className="text-2xl font-bold text-purple-600">{new Set(products.map(p => p.category)).size}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Boxes className="text-purple-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Inventario de Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{product.sku}</TableCell>
                    <TableCell className="text-muted-foreground">{product.category}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className={`font-semibold ${product.stock <= product.minStock && product.stock > 0 ? 'text-yellow-600' : product.stock === 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {product.stock}
                        </span>
                        <span className="text-xs text-gray-500">Min: {product.minStock}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">{`$${product.price.toLocaleString('en-US')}`}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(product.status)}>
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {product.type === 'Producto' ? product.unit : <span className="text-gray-400 italic">N/A</span>}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">Editar</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      {showImportForm && (
        <ImportProducts
          onClose={() => setShowImportForm(false)}
          onImport={handleImportProducts}
        />
      )}
    </>
  );
};

export default InventoryModule;
