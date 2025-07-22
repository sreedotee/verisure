import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, ScanLine, ShieldCheck, ShieldX, Camera, CheckCircle, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { verifyProduct, verifyProductByQR } from "@/lib/productService";

interface VerificationResult {
  productId: string;
  productName: string;
  status: 'Real' | 'Fake';
  verifiedAt: string;
}

const CustomerDashboard = () => {
  const { toast } = useToast();
  const [productId, setProductId] = useState("");
  const [qrHash, setQrHash] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  const [scanHistory, setScanHistory] = useState<VerificationResult[]>([]);

  const handleVerifyById = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a product ID to verify.",
        variant: "destructive",
      });
      return;
    }

    setVerifying(true);
    const result = await verifyProduct(productId.trim());
    
    if (result) {
      const verificationData = {
        productId: productId.trim(),
        productName: result.name,
        status: result.is_fake ? 'Fake' as const : 'Real' as const,
        verifiedAt: new Date().toLocaleString()
      };
      
      setVerificationResult(verificationData);
      setScanHistory(prev => [verificationData, ...prev.slice(0, 4)]);
      
      toast({
        title: "Verification Complete",
        description: `Product ${productId} has been verified.`,
      });
    } else {
      toast({
        title: "Product Not Found",
        description: "No product found with this ID.",
        variant: "destructive",
      });
      setVerificationResult(null);
    }
    setVerifying(false);
  };

  const handleVerifyByQR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrHash.trim()) {
      toast({
        title: "Error",
        description: "Please enter a QR hash to verify.",
        variant: "destructive",
      });
      return;
    }

    setVerifying(true);
    const result = await verifyProductByQR(qrHash.trim());
    
    if (result) {
      const verificationData = {
        productId: result.product_id,
        productName: result.name,
        status: result.is_fake ? 'Fake' as const : 'Real' as const,
        verifiedAt: new Date().toLocaleString()
      };
      
      setVerificationResult(verificationData);
      setScanHistory(prev => [verificationData, ...prev.slice(0, 4)]);
      
      toast({
        title: "Verification Complete",
        description: `Product verified from QR code.`,
      });
    } else {
      toast({
        title: "Invalid QR Code",
        description: "No product found with this QR hash.",
        variant: "destructive",
      });
      setVerificationResult(null);
    }
    setVerifying(false);
  };

  const simulateQRScan = () => {
    // Simulate scanning a QR code by setting a sample hash
    setQrHash("product_001_hash_abc123def456");
    toast({
      title: "QR Code Scanned",
      description: "QR code detected. Click verify to check authenticity.",
    });
  };

  const handleScanSimulation = () => {
    setIsScanning(true);
    
    // Simulate scanning delay
    setTimeout(() => {
      simulateQRScan();
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Product Verification</h1>
          <p className="text-muted-foreground">Scan QR codes or enter product IDs to verify authenticity instantly</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Manual Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Manual Verification
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter product ID to verify authenticity
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyById} className="space-y-4">
                <div>
                  <Label htmlFor="productId">Product ID</Label>
                  <Input 
                    id="productId" 
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    placeholder="Enter product ID (e.g., 001)" 
                    className="mt-1"
                    disabled={verifying}
                  />
                </div>
                <Button type="submit" className="w-full bg-primary" disabled={verifying}>
                  <Search className="h-4 w-4 mr-2" />
                  {verifying ? "Verifying..." : "Verify Product"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* QR Scanner */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <QrCode className="h-5 w-5 mr-2" />
                QR Code Scanner
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Scan product QR code for instant verification
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Scanner Preview Area */}
                <div className="relative bg-muted rounded-lg aspect-square flex items-center justify-center">
                  {isScanning ? (
                    <div className="flex flex-col items-center space-y-3">
                      <ScanLine className="h-12 w-12 text-primary animate-pulse" />
                      <p className="text-sm text-muted-foreground">Scanning QR code...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-3 text-muted-foreground">
                      <Camera className="h-12 w-12" />
                      <p className="text-sm text-center">Camera preview will appear here</p>
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={handleScanSimulation}
                  disabled={isScanning}
                  className="w-full mb-4"
                  variant="outline"
                >
                  {isScanning ? (
                    <>
                      <ScanLine className="h-4 w-4 mr-2 animate-pulse" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      Simulate QR Scan
                    </>
                  )}
                </Button>

                <form onSubmit={handleVerifyByQR} className="space-y-4">
                  <div>
                    <Label htmlFor="qrHash">QR Hash (for testing)</Label>
                    <Input 
                      id="qrHash" 
                      value={qrHash}
                      onChange={(e) => setQrHash(e.target.value)}
                      placeholder="Enter QR hash" 
                      className="mt-1"
                      disabled={verifying}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary" disabled={verifying}>
                    <QrCode className="h-4 w-4 mr-2" />
                    {verifying ? "Verifying..." : "Verify QR"}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verification Result */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Verification Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            {verificationResult ? (
              <div className="space-y-4">
                <div className="text-center p-6 rounded-lg border-2 border-dashed border-border">
                  {verificationResult.status === 'Real' ? (
                    <div className="space-y-3">
                      <ShieldCheck className="h-16 w-16 text-success mx-auto" />
                      <h3 className="text-xl font-bold text-success">Authentic Product</h3>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <ShieldX className="h-16 w-16 text-destructive mx-auto" />
                      <h3 className="text-xl font-bold text-destructive">Counterfeit Detected</h3>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Product:</span>
                    <span className="font-medium">{verificationResult.productName}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Product ID:</span>
                    <span className="font-mono text-sm">{verificationResult.productId}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge 
                      variant={verificationResult.status === 'Real' ? 'default' : 'destructive'}
                      className={verificationResult.status === 'Real' ? 'bg-success hover:bg-success/80' : ''}
                    >
                      {verificationResult.status === 'Real' ? (
                        <ShieldCheck className="h-3 w-3 mr-1" />
                      ) : (
                        <ShieldX className="h-3 w-3 mr-1" />
                      )}
                      {verificationResult.status}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Verified at:</span>
                    <span className="text-sm">{verificationResult.verifiedAt}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <QrCode className="h-12 w-12 mx-auto mb-3" />
                <p>Scan a QR code or enter a product ID to see verification results</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scan History */}
        {scanHistory.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Recent Verifications</CardTitle>
              <p className="text-sm text-muted-foreground">
                Your recent product verification scans
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scanHistory.map((scan, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {scan.status === 'Real' ? (
                        <ShieldCheck className="h-5 w-5 text-success" />
                      ) : (
                        <ShieldX className="h-5 w-5 text-destructive" />
                      )}
                      <div>
                        <h4 className="font-medium">{scan.productName}</h4>
                        <p className="text-sm text-muted-foreground">ID: {scan.productId}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-sm">{scan.verifiedAt}</p>
                      </div>
                      <Badge 
                        variant={scan.status === 'Real' ? 'default' : 'destructive'}
                        className={scan.status === 'Real' ? 'bg-success hover:bg-success/80' : ''}
                      >
                        {scan.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;