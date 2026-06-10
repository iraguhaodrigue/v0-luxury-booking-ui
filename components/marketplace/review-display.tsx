'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import type { Review } from '@/lib/types/marketplace';

interface ReviewDisplayProps {
  reviews: Review[];
  averageRating?: number;
}

const getRatingColor = (rating: number) => {
  if (rating >= 4.5) return 'text-green-600';
  if (rating >= 3.5) return 'text-yellow-600';
  if (rating >= 2.5) return 'text-orange-600';
  return 'text-red-600';
};

const getRatingLabel = (rating: number) => {
  if (rating >= 4.5) return 'Excellent';
  if (rating >= 3.5) return 'Very Good';
  if (rating >= 2.5) return 'Good';
  if (rating >= 1.5) return 'Fair';
  return 'Poor';
};

export function ReviewDisplay({ reviews, averageRating }: ReviewDisplayProps) {
  if (!reviews || reviews.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <p>No reviews yet. Be the first to review!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {averageRating && (
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className={`text-4xl font-bold ${getRatingColor(averageRating)}`}>
                {averageRating.toFixed(1)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {getRatingLabel(averageRating)}
              </p>
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={
                      i < Math.round(averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Individual Reviews */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Guest Reviews</h3>

        {reviews.map((review) => (
          <Card key={review.id} className="p-6 space-y-3">
            {/* Header with rating */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {review.user?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">
                    {review.user?.full_name || 'Anonymous'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Rating Badge */}
              <Badge className={`${getRatingColor(review.rating)} bg-transparent`}>
                <div className="flex items-center gap-1">
                  <Star size={12} className="fill-current" />
                  <span>{review.rating}.0</span>
                </div>
              </Badge>
            </div>

            {/* Review Comment */}
            {review.comment && (
              <p className="text-sm text-foreground">{review.comment}</p>
            )}

            {/* Star Display */}
            <div className="flex items-center gap-1 pt-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }
                />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
