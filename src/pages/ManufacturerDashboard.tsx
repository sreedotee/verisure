import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Factory, Package, Plus, QrCode, Link as LinkIcon, Cloud } from "lucide-react"; // Added Link and Cloud icons
import { useToast } from "@/hooks/use-toast";
import { fetchProducts, addProduct, type Product, blockchainStatus } from "@/lib/productService"; // Import blockchainStatus
import { generateQRCode, downloadQRCode } from "@/lib/qrService";

const ManufacturerDashboard = () => {
  const { toast } = useToast();
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
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

  const generateQRForProduct = async (product: Product) => {
    try {
      if (!product.qr_hash) {
        console.error("❌ Missing qr_hash for product:", product);
        return;
      }
      console.log("✅ Generating QR for hash:", product.qr_hash);
      const qrDataURL = await generateQRCode(product.qr_hash);
      setQrCodes(prev => ({ ...prev, [product.id]: qrDataURL }));
    } catch (error) {
      console.error("❌ QR Generation failed:", error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  const handleDownloadQR = (product: Product) => {
    const qrDataURL = qrCodes[product.id];
    if (qrDataURL) {
      downloadQRCode(product.qr_hash, qrDataURL);
      toast({
        title: "QR Code Downloaded",
        description: `QR code for ${product.name} has been downloaded.`,
      });
    }
  };

  const handleRegisterProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId.trim() || !productName.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    // Call the updated addProduct which handles blockchain and fallback
    const result = await addProduct(productId.trim(), productName.trim());
    
    // Update the UI badge based on the status from productService
    setCurrentBlockchainStatus(blockchainStatus);

    if (result?.qr_hash) {
      setProducts(prev => [result, ...prev]);
      generateQRForProduct(result);
      setProductId("");
      setProductName("");
      toast({
        title: "Product Registered",
        description: `${productName} has been successfully registered with ID: ${productId}. ${blockchainStatus === 'blockchain' ? 'Blockchain-backed!' : 'Supabase fallback active.'}`,
      });
    } else {
      console.error("❌ Failed to register product or missing qr_hash:", result);
      toast({
        title: "Error",
        description: "Failed to register product. Product ID might already exist or blockchain issue.",
        variant: "destructive",
      });
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Manufacturer Dashboard</h1>
            <p className="text-muted-foreground">Register new products and manage your product catalog</p>
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
                  <label htmlFor="productId" className="block text-sm font-medium mb-2">Product ID</label>
                  <Input
                    id="productId"
                    type="text"
                    placeholder="e.g., PRD-001"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="w-full"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label htmlFor="productName" className="block text-sm font-medium mb-2">Product Name</label>
                  <Input
                    id="productName"
                    type="text"
                    placeholder="e.g., Premium Sneakers"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full"
                    disabled={submitting}
                  />
                </div>
                <Button type="submit" className="w-full bg-primary" disabled={submitting}>
                  <Package className="h-4 w-4 mr-2" />
                  {submitting ? "Registering..." : "Register Product"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Factory className="h-5 w-5 mr-2" />
                Manufacturing Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Products</span>
                <Badge variant="secondary">{loading ? "..." : products.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Active Products</span>
                <Badge variant="secondary">{loading ? "..." : products.filter(p => !p.is_fake).length}</Badge>
              </div>
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    products.forEach(product => {
                      if (!qrCodes[product.id]) generateQRForProduct(product);
                    });
                    toast({ title: "QR Codes Generated", description: "All products now have QR codes." });
                  }}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate All QR Codes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Registered Products */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Registered Products</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground">Loading products...</p>
            ) : (
              products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">ID: {product.product_id}</p>
                    <p className="text-xs font-mono text-muted-foreground">QR Hash: {product.qr_hash}</p> {/* Display QR Hash */}
                  </div>
                  <div className="flex flex-col items-center">
                    {qrCodes[product.id] && (
                      <>
                        <img src={qrCodes[product.id]} alt="QR Code" className="w-16 h-16 mb-2 border rounded" />
                        <Button size="sm" variant="outline" onClick={() => handleDownloadQR(product)}>
                          <QrCode className="h-3 w-3 mr-1" /> Download
                        </Button>
                      </>
                    )}
                    {!qrCodes[product.id] && (
                      <Button size="sm" variant="outline" onClick={() => generateQRForProduct(product)}>
                        <QrCode className="h-3 w-3 mr-1" /> Generate QR
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManufacturerDashboard;
