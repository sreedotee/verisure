import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, ScanLine, ShieldCheck, ShieldX, Camera, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VerificationResult {
  productId: string;
  productName: string;
  status: 'Real' | 'Fake';
  manufacturer: string;
  verifiedAt: string;
}

const CustomerDashboard = () => {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>({
    productId: '001',
    productName: 'Nike AirMax',
    status: 'Real',
    manufacturer: 'Nike Inc.',
    verifiedAt: new Date().toLocaleString()
  });

  const [scanHistory] = useState<VerificationResult[]>([
    {
      productId: '001',
      productName: 'Nike AirMax',
      status: 'Real',
      manufacturer: 'Nike Inc.',
      verifiedAt: '2024-01-22 14:30:00'
    },
    {
      productId: '002',
      productName: 'Adidas Bag',
      status: 'Fake',
      manufacturer: 'Unknown',
      verifiedAt: '2024-01-21 09:15:00'
    }
  ]);

  const handleScanSimulation = () => {
    setIsScanning(true);
    
    // Simulate scanning delay
    setTimeout(() => {
      const mockResults = [
        {
          productId: '003',
          productName: 'Levi\'s Denim Jacket',
          status: 'Real' as const,
          manufacturer: 'Levi Strauss & Co.',
          verifiedAt: new Date().toLocaleString()
        },
        {
          productId: '004',
          productName: 'Counterfeit Watch',
          status: 'Fake' as const,
          manufacturer: 'Unknown',
          verifiedAt: new Date().toLocaleString()
        }
      ];
      
      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
      setVerificationResult(randomResult);
      setIsScanning(false);
      
      toast({
        title: "Scan Complete",
        description: `Product verified: ${randomResult.status}`,
        variant: randomResult.status === 'Real' ? 'default' : 'destructive',
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Product Verification</h1>
          <p className="text-muted-foreground">Scan QR codes to verify product authenticity instantly</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Scanner */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <QrCode className="h-5 w-5 mr-2" />
                QR Code Scanner
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Point your camera at the product's QR code to verify authenticity
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
                  className="w-full bg-primary"
                  size="lg"
                >
                  {isScanning ? (
                    <>
                      <ScanLine className="h-4 w-4 mr-2 animate-pulse" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      Start Scan
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Verification Result */}
          <Card>
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
                      <span className="text-sm text-muted-foreground">Manufacturer:</span>
                      <span className="font-medium">{verificationResult.manufacturer}</span>
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
                  <p>Scan a QR code to see verification results</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Scan History */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Scan History</CardTitle>
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
      </div>
    </div>
  );
};

export default CustomerDashboard;