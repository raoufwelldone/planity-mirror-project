
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarIcon } from "lucide-react";

interface ReviewFormProps {
  salonId: string;
  onReviewSubmitted?: () => void;
  existingReview?: {
    id: string;
    rating: number;
    comment: string;
  };
}

export const ReviewForm = ({ salonId, onReviewSubmitted, existingReview }: ReviewFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to submit a review",
        variant: "destructive",
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (existingReview) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update({
            rating,
            comment,
          })
          .eq('id', existingReview.id);

        if (error) throw error;
        
        toast({
          title: "Review updated",
          description: "Your review has been updated successfully",
        });
      } else {
        // Insert new review
        const { error } = await supabase
          .from('reviews')
          .insert({
            user_id: user.id,
            salon_id: salonId,
            rating,
            comment,
          });

        if (error) throw error;
        
        toast({
          title: "Review submitted",
          description: "Your review has been submitted successfully",
        });
      }
      
      // Reset form
      if (!existingReview) {
        setRating(0);
        setComment("");
      }
      
      // Callback to refresh reviews
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Your Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="focus:outline-none"
              onClick={() => setRating(star)}
            >
              <StarIcon
                className={`w-8 h-8 ${
                  star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-2">
          Your Review (Optional)
        </label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          rows={4}
        />
      </div>
      <Button type="submit" disabled={isSubmitting || rating === 0}>
        {isSubmitting
          ? "Submitting..."
          : existingReview
          ? "Update Review"
          : "Submit Review"}
      </Button>
    </form>
  );
};
