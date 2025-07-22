import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, ScanLine, ShieldCheck, ShieldX, Camera, CheckCircle, Search, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { verifyProduct } from "@/lib/productService";

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
      const verificationData = {
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

  const processQRFile = async (file: File) => {
    if (!file) return;

    setUploadedFile(file);

    try {
      // 🩹 Extract QR hash from file name (drop .png)
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      console.log('📦 Extracted QR Hash from file name:', fileName);

      // Fill QR Hash (for testing) input
      setQrHash(fileName);

      toast({
        title: "QR Hash Ready",
        description: "Extracted from file name and filled in test field.",
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
    setQrHash("product_001_hash_abc123def456");
    toast({
      title: "QR Code Scanned",
      description: "QR hash filled. Click verify to check authenticity.",
    });
  };

  const handleScanSimulation = () => {
    setIsScanning(true);
    setTimeout(() => {
      simulateQRScan();
      setIsScanning(false);
    }, 2000);
  };

  return (
    // ... your existing UI JSX stays the same
  );
};

export default CustomerDashboard;
