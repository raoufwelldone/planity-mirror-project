
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ReviewForm } from "./ReviewForm";
import { ReviewsList, Review } from "./ReviewsList";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SalonReviewsProps {
  salonId: string;
}

export const SalonReviews = ({ salonId }: SalonReviewsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userReview, setUserReview] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all reviews for the salon
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          id,
          rating,
          comment,
          created_at,
          user_id
        `)
        .eq("salon_id", salonId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get user profiles separately to avoid the relation error
      const userIds = data.map(review => review.user_id);
      
      // Only fetch profiles if there are reviews
      let userProfiles: Record<string, {name: string}> = {};
      
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", userIds);
          
        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
        } else if (profilesData) {
          // Create a map of user_id to formatted name
          userProfiles = profilesData.reduce((acc, profile) => {
            acc[profile.id] = {
              name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Anonymous'
            };
            return acc;
          }, {} as Record<string, {name: string}>);
        }
      }

      // Transform the data to match our Review type
      const formattedReviews = data.map((review) => ({
        ...review,
        user: userProfiles[review.user_id] || { name: "Anonymous" }
      }));

      setReviews(formattedReviews);

      // Check if the current user has already left a review
      if (user) {
        const userReviewData = data.find((review) => review.user_id === user.id);
        setUserReview(userReviewData || null);
      }
    } catch (error: any) {
      console.error("Error fetching reviews:", error);
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [salonId, user]);

  const handleReviewSubmitted = () => {
    fetchReviews();
    setShowForm(false);
  };

  const renderReviewSection = () => {
    if (!user) {
      return (
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          Please sign in to leave a review
        </div>
      );
    }

    if (userReview) {
      return (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm">You have already submitted a review for this salon.</p>
          </div>
          {showForm ? (
            <ReviewForm
              salonId={salonId}
              onReviewSubmitted={handleReviewSubmitted}
              existingReview={{
                id: userReview.id,
                rating: userReview.rating,
                comment: userReview.comment,
              }}
            />
          ) : (
            <Button onClick={() => setShowForm(true)}>Edit Your Review</Button>
          )}
        </div>
      );
    }

    return showForm ? (
      <ReviewForm salonId={salonId} onReviewSubmitted={handleReviewSubmitted} />
    ) : (
      <Button onClick={() => setShowForm(true)}>Write a Review</Button>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Customer Reviews</span>
          <div className="text-sm font-normal">
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderReviewSection()}
        
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">All Reviews</h3>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ReviewsList reviews={reviews} />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
