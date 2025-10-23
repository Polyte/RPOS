import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  ScanIcon, 
  CameraIcon, 
  XIcon, 
  ZapIcon, 
  AlertTriangleIcon,
  CheckCircleIcon,
  KeyboardIcon,
  MonitorIcon,
  RefreshCwIcon
} from "lucide-react";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

interface ScanResult {
  code: string;
  format: string;
  timestamp: number;
}

// Enhanced barcode detection simulation with visual feedback
const simulateBarcodeDetection = (videoElement: HTMLVideoElement, canvas: HTMLCanvasElement): Promise<ScanResult> => {
  return new Promise((resolve) => {
    // More realistic scanning behavior
    const scanAttempts = 3 + Math.floor(Math.random() * 4); // 3-6 attempts
    let attempts = 0;
    
    const attemptScan = () => {
      attempts++;
      
      // Draw scanning frame on canvas for visual feedback
      const ctx = canvas.getContext('2d');
      if (ctx && videoElement.videoWidth && videoElement.videoHeight) {
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        
        // Draw video frame
        ctx.drawImage(videoElement, 0, 0);
        
        // Add scanning overlay
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const rectWidth = 300;
        const rectHeight = 100;
        
        ctx.strokeRect(
          centerX - rectWidth / 2,
          centerY - rectHeight / 2,
          rectWidth,
          rectHeight
        );
      }
      
      if (attempts >= scanAttempts) {
        // Successful scan
        const mockBarcodes = [
          "7894561230123", "7894561230124", "7894561230125", 
          "7894561230126", "7894561230127", "7894561230128",
          "7894561230129", "7894561230130", "7894561230131", "7894561230132"
        ];
        
        const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
        
        // Flash green for success
        if (ctx) {
          ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        resolve({
          code: randomBarcode,
          format: "EAN-13",
          timestamp: Date.now()
        });
      } else {
        // Continue scanning
        setTimeout(attemptScan, 800 + Math.random() * 400); // 0.8-1.2s per attempt
      }
    };
    
    // Start first attempt after brief delay
    setTimeout(attemptScan, 500);
  });
};

export function BarcodeScanner({ 
  onScan, 
  onError, 
  className 
}: BarcodeScannerProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [scanningMode, setScanningMode] = useState<'camera' | 'manual'>('camera');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize camera when component mounts
  useEffect(() => {
    if (scanningMode === 'camera') {
      initializeCamera();
    } else {
      cleanup();
    }
    
    return cleanup;
  }, [scanningMode]);

  // Start barcode detection when camera is ready
  useEffect(() => {
    if (stream && videoRef.current && isScanning) {
      startBarcodeDetection();
    }
    
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [stream, isScanning]);

  const initializeCamera = async () => {
    try {
      setError(null);
      setIsScanning(true);
      
      // Request camera permission with enhanced constraints
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' }, // Prefer back camera, fallback to front
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
          frameRate: { ideal: 30, min: 15 }
        }
      });
      
      setStream(mediaStream);
      setHasPermission(true);
      
      // Set video source
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      
    } catch (err) {
      console.error('Camera initialization failed:', err);
      setHasPermission(false);
      setIsScanning(false);
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera permission denied. Please enable camera access and try again.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found. Please connect a camera or use manual input.');
        } else {
          setError('Camera access failed. Please try manual input instead.');
        }
      }
      
      onError?.(error || 'Camera initialization failed');
    }
  };

  const startBarcodeDetection = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsDetecting(true);
    
    // Enhanced detection with visual feedback
    const detectBarcode = async () => {
      try {
        if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
          const result = await simulateBarcodeDetection(videoRef.current, canvasRef.current);
          
          if (result.code) {
            handleScanSuccess(result);
            return; // Stop detection after successful scan
          }
        }
      } catch (err) {
        console.error('Barcode detection error:', err);
        setError('Detection failed. Please try again.');
      }
      
      // Continue detection if still scanning
      if (isDetecting) {
        detectionIntervalRef.current = setTimeout(detectBarcode, 2000);
      }
    };
    
    // Start detection after camera is ready
    setTimeout(detectBarcode, 1000);
  };

  const handleScanSuccess = (result: ScanResult) => {
    setIsDetecting(false);
    setScanHistory(prev => [result, ...prev.slice(0, 4)]); // Keep last 5 scans
    
    // Visual feedback
    if (videoRef.current) {
      videoRef.current.style.border = '4px solid #10b981';
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.style.border = '';
        }
      }, 500);
    }
    
    onScan(result.code);
  };

  const handleManualSubmit = () => {
    if (!manualInput.trim()) return;
    
    const result: ScanResult = {
      code: manualInput.trim(),
      format: 'Manual',
      timestamp: Date.now()
    };
    
    handleScanSuccess(result);
    setManualInput("");
    setShowManualInput(false);
  };

  const cleanup = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    setIsScanning(false);
    setIsDetecting(false);
    setError(null);
  };

  const handleClose = () => {
    cleanup();
    setScanHistory([]);
    setManualInput("");
    setShowManualInput(false);
    setScanningMode('camera');
  };

  const retryCamera = () => {
    cleanup();
    setTimeout(initializeCamera, 500);
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="flex gap-2">
        <Button
          variant={scanningMode === 'camera' ? 'default' : 'outline'}
          onClick={() => setScanningMode('camera')}
          className="flex-1"
          disabled={isScanning}
        >
          <CameraIcon className="w-4 h-4 mr-2" />
          Camera Scanner
        </Button>
        <Button
          variant={scanningMode === 'manual' ? 'default' : 'outline'}
          onClick={() => setScanningMode('manual')}
          className="flex-1"
        >
          <KeyboardIcon className="w-4 h-4 mr-2" />
          Manual Input
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Alert className="border-red-200 bg-red-50 animate-slide-down">
          <AlertTriangleIcon className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
            {scanningMode === 'camera' && (
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-3 h-6 px-2 text-red-600 border-red-300"
                onClick={retryCamera}
              >
                <RefreshCwIcon className="w-3 h-3 mr-1" />
                Retry
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Camera Scanner */}
      {scanningMode === 'camera' && (
        <div className="space-y-4">
          <Card className="relative overflow-hidden glass-card">
            <CardContent className="p-0">
              <div className="relative bg-black rounded-lg overflow-hidden">
                {/* Video Element */}
                <video
                  ref={videoRef}
                  className="w-full h-80 object-cover"
                  playsInline
                  muted
                  style={{ transform: 'scaleX(-1)' }} // Mirror for better UX
                />
                
                {/* Canvas for detection overlay */}
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 pointer-events-none opacity-80"
                  style={{ 
                    mixBlendMode: 'overlay',
                    display: isDetecting ? 'block' : 'none'
                  }}
                />
                
                {/* Scanning Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Corner Brackets */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-green-500 rounded-tl-lg"></div>
                  <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-green-500 rounded-tr-lg"></div>
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-green-500 rounded-bl-lg"></div>
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-green-500 rounded-br-lg"></div>
                  
                  {/* Center Target */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-32 border-2 border-green-500 border-dashed rounded-lg flex items-center justify-center bg-green-500/10">
                      <span className="text-green-500 font-medium">
                        {isDetecting ? 'Scanning...' : 'Position barcode here'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Scanning Animation */}
                  {isDetecting && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-64 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-shimmer"></div>
                    </div>
                  )}
                </div>
                
                {/* Status Indicators */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                  <Badge 
                    variant={isDetecting ? "default" : hasPermission ? "secondary" : "destructive"}
                    className="animate-pulse"
                  >
                    {isDetecting ? (
                      <>
                        <ZapIcon className="w-3 h-3 mr-1" />
                        Detecting...
                      </>
                    ) : hasPermission ? (
                      <>
                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                        Ready to Scan
                      </>
                    ) : (
                      <>
                        <AlertTriangleIcon className="w-3 h-3 mr-1" />
                        Camera Error
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Camera Controls */}
          <div className="flex gap-3">
            <Button
              onClick={retryCamera}
              disabled={isScanning}
              variant="outline"
              className="flex-1 hover-lift"
            >
              <RefreshCwIcon className="w-4 h-4 mr-2" />
              Restart Camera
            </Button>
            <Button
              onClick={() => setShowManualInput(true)}
              variant="outline"
              className="flex-1 hover-lift"
            >
              <KeyboardIcon className="w-4 h-4 mr-2" />
              Manual Entry
            </Button>
          </div>
        </div>
      )}

      {/* Manual Input */}
      {(scanningMode === 'manual' || showManualInput) && (
        <Card className="glass-card animate-slide-down">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg">
              <KeyboardIcon className="w-5 h-5 text-blue-600" />
              Manual Barcode Entry
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input
                placeholder="Enter barcode manually..."
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                className="flex-1 h-12 text-base border-2 focus:border-blue-500"
                autoFocus
              />
              <Button
                onClick={handleManualSubmit}
                disabled={!manualInput.trim()}
                className="gradient-primary h-12 px-6 hover-lift"
              >
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Add
              </Button>
            </div>
            
            {showManualInput && scanningMode === 'camera' && (
              <Button
                variant="outline"
                onClick={() => setShowManualInput(false)}
                className="w-full"
              >
                Back to Camera
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}