
import React from "react";
import { format } from "date-fns";
import { StarIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user: {
    name: string;
  };
}

interface ReviewsListProps {
  reviews: Review[];
}

export const ReviewsList = ({ reviews }: ReviewsListProps) => {
  if (reviews.length === 0) {
    return (
      <div className="py-4 text-center text-gray-500">
        No reviews yet. Be the first to leave a review!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center mb-1">
                  <div className="flex mr-2">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{review.user?.name || "Anonymous"}</span>
                </div>
                <p className="text-sm text-gray-500">
                  {format(new Date(review.created_at), "PPP")}
                </p>
              </div>
            </div>
            {review.comment && (
              <div className="mt-3">
                <p className="text-gray-700">{review.comment}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
