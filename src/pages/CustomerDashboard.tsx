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
        status: result.is_fake ? 'Fake' as const : 'Real' as const,
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
    const cleanHash = qrHash.trim().replace(/\\.png$/i, ''); // remove trailing .png
    console.log('🔎 Sanitized QR Hash:', cleanHash);

    const result = await verifyProductByQR(cleanHash);

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
  setVerifying(true);

  try {
    const rawQR = await decodeQRFromFile(file);
    if (rawQR) {
      const cleanHash = rawQR.trim().replace(/\.png$/i, ''); // sanitize
      console.log('📦 Decoded & Sanitized QR:', cleanHash);

      // Try full QR hash verification first
      let result = await verifyProductByQR(cleanHash);

      if (!result) {
        console.warn("⚠️ Full QR hash lookup failed. Trying fallback with numeric product ID…");

        // Extract numeric product ID (from something like product_9099_)
        const partialMatch = cleanHash.match(/product_(\d+)_/);
        if (partialMatch && partialMatch[1]) {
          const partialProductId = partialMatch[1];
          console.log("🔎 Fallback partial product ID extracted:", partialProductId);
          result = await verifyProduct(partialProductId);
        }
      }

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
          title: "QR Code Verified",
          description: `Product ${result.name} is ${verificationData.status}`,
        });
      } else {
        toast({
          title: "Invalid QR Code",
          description: "No product found with this QR code.",
          variant: "destructive",
        });
        setVerificationResult(null);
      }
    } else {
      toast({
        title: "Error",
        description: "Could not decode QR code from image.",
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error('❌ Error processing QR file:', error);
    toast({
      title: "Error",
      description: "Failed to process the uploaded image.",
      variant: "destructive",
    });
  }

  setVerifying(false);
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
        description: "Processing your QR code image...",
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
      description: "QR code detected. Click verify to check authenticity.",
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
    // ... UI unchanged
    // Your existing UI JSX stays the same
  );
};

export default CustomerDashboard;
