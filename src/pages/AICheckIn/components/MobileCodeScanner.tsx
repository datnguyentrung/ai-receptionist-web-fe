import { Scanner, type IDetectedBarcode } from "@yudiel/react-qr-scanner";
import type { BarcodeFormat } from "barcode-detector";

type MobileCodeScannerProps = {
  onScan: (codes: IDetectedBarcode[]) => void;
  onError: (error: unknown) => void;
  paused: boolean;
  formats: BarcodeFormat[];
  constraints: MediaTrackConstraints;
  containerClassName: string;
};

export default function MobileCodeScanner({
  onScan,
  onError,
  paused,
  formats,
  constraints,
  containerClassName,
}: MobileCodeScannerProps) {
  return (
    <Scanner
      onScan={onScan}
      onError={onError}
      paused={paused}
      formats={formats}
      scanDelay={350}
      sound={false}
      constraints={constraints}
      components={{ finder: false, torch: true }}
      classNames={{
        container: containerClassName,
      }}
    />
  );
}
