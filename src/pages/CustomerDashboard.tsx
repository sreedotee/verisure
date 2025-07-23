import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, ScanLine, ShieldCheck, ShieldX, Camera, CheckCircle, Search, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { verifyProduct, verifyProductByQR } from "@/lib/productService";
import { decodeQRFromFile } from "@/lib/qrService";

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
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
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
      const verificationData: VerificationResult = {
        productId: productId.trim(),
        productName: result.name,
        status: result.is_fake ? 'Fake' : 'Real',
        verifiedAt: new Date().toLocaleString()
      };

      setVerificationResult(verificationData);
      setScanHistory(prev => [verificationData, ...prev.slice(0, 4)]);

      toast({
        title: "Verification Complete",
        description: `Product ${productId} is ${verificationData.status}`,
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
      const verificationData: VerificationResult = {
        productId: result.product_id,
        productName: result.name,
        status: result.is_fake ? 'Fake' : 'Real',
        verifiedAt: new Date().toLocaleString()
      };

      setVerificationResult(verificationData);
      setScanHistory(prev => [verificationData, ...prev.slice(0, 4)]);

      toast({
        title: "Verification Complete",
        description: `Product ${result.name} is ${verificationData.status}`,
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

  const processQRFile = async (file: File) => {
    if (!file) return;

    setUploadedFile(file);

    try {
      // Extract QR hash from file name (without extension)
      const extractedHash = decodeQRFromFile(file);
      console.log('📦 Extracted QR Hash from file name:', extractedHash);

      // Fill QR Hash input field
      setQrHash(extractedHash);

      toast({
        title: "QR Hash Extracted",
        description: "File name extracted and filled in QR Hash field. Click verify to check authenticity.",
      });
    } catch (error) {
      console.error('❌ Error processing QR file:', error);
      toast({
        title: "Error",
        description: "Failed to process the uploaded file.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processQRFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      await processQRFile(imageFile);
      toast({
        title: "QR Code Dropped",
        description: "QR hash extracted from file name.",
      });
    } else {
      toast({
        title: "Invalid File",
        description: "Please drop an image file containing a QR code.",
        variant: "destructive",
      });
    }
  };

  const simulateQRScan = () => {
    setQrHash("product_001_1705523456789_abc123def");
    toast({
      title: "QR Code Scanned",
      description: "Sample QR hash filled. Click verify to check authenticity.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Product Verification
          </h1>
          <p className="text-lg text-muted-foreground">
            Scan QR codes or enter Product IDs to verify authenticity
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Manual Product ID Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Verify by Product ID
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyById} className="space-y-4">
                <div>
                  <Label htmlFor="productId">Product ID</Label>
                  <Input
                    id="productId"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    placeholder="Enter Product ID (e.g., PROD-001)"
                    disabled={verifying}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={verifying}
                >
                  {verifying ? "Verifying..." : "Verify Product"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* QR Code Scanning */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Code Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Simulate QR Scan Button */}
              <Button 
                onClick={simulateQRScan}
                variant="outline"
                className="w-full"
              >
                <QrCode className="h-4 w-4 mr-2" />
                QR Scan
              </Button>

              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragOver 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drop QR image here or
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="qr-upload"
                />
                <label htmlFor="qr-upload">
                  <Button variant="outline" size="sm" asChild>
                    <span>Choose File</span>
                  </Button>
                </label>
                {uploadedFile && (
                  <p className="text-xs text-primary mt-2">
                    ✓ {uploadedFile.name}
                  </p>
                )}
              </div>

              {/* Manual QR Hash Input */}
              <form onSubmit={handleVerifyByQR} className="space-y-4">
                <div>
                  <Label htmlFor="qrHash">QR Hash</Label>
                  <Input
                    id="qrHash"
                    value={qrHash}
                    onChange={(e) => setQrHash(e.target.value)}
                    placeholder="Enter QR hash"
                    disabled={verifying}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={verifying}
                >
                  {verifying ? "Verifying..." : "Verify by QR Hash"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Verification Result */}
        {verificationResult && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {verificationResult.status === 'Real' ? (
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                ) : (
                  <ShieldX className="h-5 w-5 text-red-500" />
                )}
                Verification Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Product ID</Label>
                  <p className="text-lg font-semibold">{verificationResult.productId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Product Name</Label>
                  <p className="text-lg font-semibold">{verificationResult.productName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge 
                    variant={verificationResult.status === 'Real' ? 'default' : 'destructive'}
                    className="text-lg px-3 py-1"
                  >
                    {verificationResult.status === 'Real' ? (
                      <CheckCircle className="h-4 w-4 mr-1" />
                    ) : (
                      <ShieldX className="h-4 w-4 mr-1" />
                    )}
                    {verificationResult.status}
                  </Badge>
                </div>
              </div>
              <div className="mt-4">
                <Label className="text-sm font-medium text-muted-foreground">Verified At</Label>
                <p className="text-sm">{verificationResult.verifiedAt}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Scans History */}
        {scanHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Scans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scanHistory.map((scan, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {scan.status === 'Real' ? (
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                      ) : (
                        <ShieldX className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium">{scan.productName}</p>
                        <p className="text-sm text-muted-foreground">{scan.productId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={scan.status === 'Real' ? 'default' : 'destructive'}>
                        {scan.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{scan.verifiedAt}</p>
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

