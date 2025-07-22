import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Factory, Package, Plus, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ManufacturerDashboard = () => {
  const { toast } = useToast();
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [registeredProducts, setRegisteredProducts] = useState([
    { id: '001', name: 'Nike AirMax', registeredDate: '2024-01-15' },
    { id: '002', name: 'Adidas Bag', registeredDate: '2024-01-20' }
  ]);

  const handleRegisterProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !productName) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const newProduct = {
      id: productId,
      name: productName,
      registeredDate: new Date().toISOString().split('T')[0]
    };

    setRegisteredProducts(prev => [...prev, newProduct]);
    setProductId("");
    setProductName("");
    
    toast({
      title: "Product Registered",
      description: `${productName} has been successfully registered with ID: ${productId}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Manufacturer Dashboard</h1>
          <p className="text-muted-foreground">Register new products and manage your product catalog</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Registration Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Register New Product
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Add a new product to the authenticity registry
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegisterProduct} className="space-y-4">
                <div>
                  <label htmlFor="productId" className="block text-sm font-medium mb-2">
                    Product ID
                  </label>
                  <Input
                    id="productId"
                    type="text"
                    placeholder="e.g., PRD-001"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="productName" className="block text-sm font-medium mb-2">
                    Product Name
                  </label>
                  <Input
                    id="productName"
                    type="text"
                    placeholder="e.g., Premium Sneakers"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full"
                  />
                </div>

                <Button type="submit" className="w-full bg-primary">
                  <Package className="h-4 w-4 mr-2" />
                  Register Product
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Factory className="h-5 w-5 mr-2" />
                Manufacturing Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Products Registered</span>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {registeredProducts.length}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">QR Codes Generated</span>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {registeredProducts.length}
                </Badge>
              </div>
              
              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full">
                  <QrCode className="h-4 w-4 mr-2" />
                  Download QR Code Package
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Registered Products */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Registered Products</CardTitle>
            <p className="text-sm text-muted-foreground">
              View all products you've registered in the authenticity system
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {registeredProducts.map((product) => (
                <div 
                  key={product.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">ID: {product.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Registered</p>
                      <p className="text-sm">{product.registeredDate}</p>
                    </div>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      Active
                    </Badge>
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

export default ManufacturerDashboard;