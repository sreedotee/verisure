import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldCheck, ShieldX, Plus, AlertTriangle, Link as LinkIcon, Cloud } from "lucide-react"; // Added Link and Cloud icons
import { useToast } from "@/hooks/use-toast";
import { fetchProducts, markAsFake, type Product, blockchainStatus } from "@/lib/productService"; // Import blockchainStatus

const AdminDashboard = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBlockchainStatus, setCurrentBlockchainStatus] = useState<'blockchain' | 'supabase'>(blockchainStatus); // State for UI badge

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const data = await fetchProducts();
    setProducts(data);
    setLoading(false);
  };

  const handleMarkAsFake = async (productId: string) => {
    // Call the updated markAsFake which handles blockchain and fallback
    const result = await markAsFake(productId);
    
    // Update the UI badge based on the status from productService
    setCurrentBlockchainStatus(blockchainStatus);

    if (result) {
      setProducts(prev => 
        prev.map(p => 
          p.product_id === productId ? { ...p, is_fake: true } : p
        )
      );
      toast({
        title: "Product Status Updated",
        description: `Product ${productId} has been marked as fake. ${blockchainStatus === 'blockchain' ? 'Blockchain-backed!' : 'Supabase fallback active.'}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update product status. Product might not exist or blockchain issue.",
        variant: "destructive",
      });
    }
  };

  const realCount = products.filter(p => !p.is_fake).length;
  const fakeCount = products.filter(p => p.is_fake).length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage product authenticity and monitor system health</p>
          </div>
          {/* Blockchain Status Badge */}
          <Badge 
            variant="outline" 
            className={`px-3 py-1 text-sm font-medium ${
              currentBlockchainStatus === 'blockchain' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-gray-100 text-gray-800 border-gray-200'
            }`}
          >
            {currentBlockchainStatus === 'blockchain' ? (
              <>
                <LinkIcon className="h-3 w-3 mr-1" /> Blockchain-backed (Amoy)
              </>
            ) : (
              <>
                <Cloud className="h-3 w-3 mr-1" /> Supabase fallback active
              </>
            )}
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Real</CardTitle>
              <ShieldCheck className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{realCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Flagged Fake</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{fakeCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Product Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Product Registry</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage product authenticity status and QR code hashes
                </p>
              </div>
              {/* Note: Add New Product button here would typically link to Manufacturer Dashboard or a modal */}
              <Button className="bg-primary" onClick={() => toast({ title: "Info", description: "Products are registered via the Manufacturer Dashboard." })}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Product
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>QR Hash</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading products...
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.product_id}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={!product.is_fake ? 'default' : 'destructive'}
                          className={!product.is_fake ? 'bg-success hover:bg-success/80' : ''}
                        >
                          {!product.is_fake ? (
                            <ShieldCheck className="h-3 w-3 mr-1" />
                          ) : (
                            <ShieldX className="h-3 w-3 mr-1" />
                          )}
                          {!product.is_fake ? 'Real' : 'Fake'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {product.qr_hash}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleMarkAsFake(product.product_id)}
                          disabled={product.is_fake} // Disable if already fake
                        >
                          <ShieldX className="h-3 w-3 mr-1" />
                          Mark as Fake
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
