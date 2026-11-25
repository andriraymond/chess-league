import { Loader2 } from "lucide-react";

export default function PublicLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm">Memuat data...</p>
    </div>
  );
}
