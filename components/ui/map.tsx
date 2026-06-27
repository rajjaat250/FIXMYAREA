import { Map as VisMap, MapProps, APIProvider } from "@vis.gl/react-google-maps";
import { useAppContext } from "@/components/app-provider";

export function CustomMap(props: MapProps) {
  const { googleMapsApiKey } = useAppContext();

  if (!googleMapsApiKey) {
    return (
      <div className="w-full h-full min-h-[300px] bg-muted/50 flex flex-col items-center justify-center text-center p-4 rounded-md">
        <div className="text-muted-foreground mb-2 flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-3 opacity-50 h-8 w-8"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          <p className="font-medium">Map Unavailable</p>
          <p className="text-xs max-w-[250px] mt-1">Please add your Google Maps API Key in the Settings to enable interactive maps.</p>
        </div>
      </div>
    );
  }

  return (
    <VisMap {...props} />
  );
}
