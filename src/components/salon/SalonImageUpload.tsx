
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ImageIcon, Loader2, X } from "lucide-react";

interface SalonImageUploadProps {
  salonId: string;
  onImageUploaded: (url: string, isPrimary?: boolean) => void;
}

export const SalonImageUpload = ({ salonId, onImageUploaded }: SalonImageUploadProps) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPrimary, setIsPrimary] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setFile(null);
      setPreview(null);
      return;
    }

    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // Create preview
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    // Cleanup the object URL when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  };

  const handleUpload = async () => {
    if (!file || !salonId) return;

    setIsUploading(true);
    try {
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${salonId}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('salon_images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('salon_images')
        .getPublicUrl(filePath);

      if (!urlData.publicUrl) throw new Error("Failed to get public URL");

      // Store image reference in database
      const { error: dbError } = await supabase
        .from('salon_images')
        .insert({
          salon_id: salonId,
          image_url: urlData.publicUrl,
          is_primary: isPrimary
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });

      // Call the callback with the public URL
      onImageUploaded(urlData.publicUrl, isPrimary);

      // Reset states
      setFile(null);
      setPreview(null);
      setIsPrimary(false);

    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred while uploading the image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelection = () => {
    setFile(null);
    setPreview(null);
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
        {preview ? (
          <div className="relative">
            <img 
              src={preview} 
              alt="Preview" 
              className="mx-auto max-h-64 rounded-md"
            />
            <button
              type="button"
              onClick={clearSelection}
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center cursor-pointer p-4">
            <ImageIcon className="h-10 w-10 text-gray-400" />
            <span className="mt-2 text-gray-500">Click to select an image</span>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              className="hidden" 
            />
          </label>
        )}
      </div>

      {file && (
        <div className="space-y-4">
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="isPrimary" 
              checked={isPrimary} 
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="isPrimary">Set as primary image (displayed first)</label>
          </div>
          
          <Button 
            onClick={handleUpload} 
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload Image'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
