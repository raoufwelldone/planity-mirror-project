
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SalonImageUpload } from "./SalonImageUpload";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SalonImage {
  id: string;
  image_url: string;
  is_primary: boolean;
}

interface SalonGalleryProps {
  salonId: string;
  editable?: boolean;
}

export const SalonGallery = ({ salonId, editable = false }: SalonGalleryProps) => {
  const { toast } = useToast();
  const [images, setImages] = useState<SalonImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('salon_images')
        .select('*')
        .eq('salon_id', salonId)
        .order('is_primary', { ascending: false });

      if (error) throw error;

      setImages(data || []);
    } catch (error: any) {
      console.error("Error fetching images:", error);
      toast({
        title: "Error",
        description: "Failed to load salon images",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (salonId) {
      fetchImages();
    }
  }, [salonId]);

  const handleImageUploaded = (imageUrl: string, isPrimary: boolean = false) => {
    setUploadDialogOpen(false);
    fetchImages(); // Refresh the gallery
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      setDeletingId(imageId);
      const imageToDelete = images.find((img) => img.id === imageId);
      
      if (!imageToDelete) return;

      // Delete from database first
      const { error: dbError } = await supabase
        .from('salon_images')
        .delete()
        .eq('id', imageId);

      if (dbError) throw dbError;
      
      // If this was successful, then remove from the storage
      // Extract the path from the URL
      const urlPath = new URL(imageToDelete.image_url).pathname;
      const filePath = urlPath.split('/').pop();
      
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from('salon_images')
          .remove([`${salonId}/${filePath}`]);
          
        if (storageError) console.error("Storage removal error:", storageError);
      }

      toast({
        title: "Image deleted",
        description: "The image has been removed from the gallery",
      });
      
      // Update local state
      setImages(images.filter(img => img.id !== imageId));
      
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete the image",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const setPrimaryImage = async (imageId: string) => {
    try {
      // First reset all images to non-primary
      await supabase
        .from('salon_images')
        .update({ is_primary: false })
        .eq('salon_id', salonId);
      
      // Then set the selected image as primary
      const { error } = await supabase
        .from('salon_images')
        .update({ is_primary: true })
        .eq('id', imageId);
        
      if (error) throw error;
      
      toast({
        title: "Primary image updated",
        description: "The gallery has been updated",
      });
      
      fetchImages(); // Refresh the gallery
      
    } catch (error: any) {
      console.error("Update error:", error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update the primary image",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (images.length === 0 && !editable) {
    return <p className="text-gray-500 text-center py-8">No images available</p>;
  }

  return (
    <div className="space-y-4">
      {editable && (
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Images</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Salon Image</DialogTitle>
            </DialogHeader>
            <SalonImageUpload 
              salonId={salonId}
              onImageUploaded={handleImageUploaded}
            />
          </DialogContent>
        </Dialog>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image) => (
          <div key={image.id} className="relative group border rounded-md overflow-hidden">
            <img 
              src={image.image_url} 
              alt="Salon" 
              className="w-full h-48 object-cover"
            />
            {editable && (
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setPrimaryImage(image.id)}
                  disabled={image.is_primary}
                >
                  {image.is_primary ? "Primary Image" : "Set as Primary"}
                </Button>
                <Button 
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteImage(image.id)}
                  disabled={deletingId === image.id}
                >
                  {deletingId === image.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
            {image.is_primary && (
              <div className="absolute top-0 left-0 bg-primary text-white text-xs px-2 py-1">
                Primary
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
