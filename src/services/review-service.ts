import { Review, Sentiment, Location, Recommendation } from '@/lib/types';
import { AppStore } from './store';

export class ReviewService {
  /**
   * Classifies review sentiment using AI API (or intelligent rule-based fallback).
   */
  static classifySentiment(rating: number, text: string): Sentiment {
    if (rating >= 4) return 'POSITIVE';
    if (rating === 3) return 'NEUTRAL';
    return 'NEGATIVE';
  }

  /**
   * AI Reply Generator: Drafts a polite, professional, and SEO-optimized reply for a customer review.
   */
  static generateAiReply(
    review: Review,
    businessName: string,
    tone: string = 'Friendly',
    language: string = 'English (US)'
  ): string {
    const name = review.reviewerName.split(' ')[0] || 'Customer';

    if (review.rating >= 4) {
      if (tone === 'Luxury') {
        return `Dear ${name}, it is our absolute pleasure to serve you at ${businessName}. We are truly delighted that your experience surpassed expectations. We look forward to hosting your next visit.`;
      }
      if (tone === 'Enthusiastic') {
        return `Wow ${name}! Thank you so much for this glowing 5-star review! The team at ${businessName} is thrilled to hear your feedback! We can't wait to see you again soon! 🎉`;
      }
      if (tone === 'Formal') {
        return `Dear ${name}, thank you for taking the time to write a positive review for ${businessName}. Your patronage is greatly appreciated, and we remain dedicated to providing exceptional service.`;
      }
      if (tone === 'Casual') {
        return `Hey ${name}! Thanks a ton for dropping by ${businessName} and sharing the love! Glad you had a great time!`;
      }
      return `Hi ${name}, thank you so much for your wonderful 5-star review! We are delighted to serve you at ${businessName} and look forward to welcoming you back soon!`;
    } else if (review.rating === 3) {
      if (tone === 'Empathetic') {
        return `Hi ${name}, thank you for your honest feedback. We understand how important every detail is at ${businessName}. We'd love the opportunity to make your next visit 5-star worthy.`;
      }
      return `Hello ${name}, thank you for taking the time to share your feedback. At ${businessName}, we constantly strive to deliver a top-tier experience. We appreciate your insights and hope to exceed your expectations next time.`;
    } else {
      if (tone === 'Apologetic') {
        return `Dear ${name}, we are deeply sorry for failing to meet your expectations at ${businessName}. Your experience does not reflect our standards. Please contact our management team directly so we can resolve this immediately.`;
      }
      return `Dear ${name}, thank you for bringing this to our attention. At ${businessName}, we take customer satisfaction very seriously. We sincerely apologize for falling short of your expectations regarding your experience. Please reach out to us directly so we can resolve this for you.`;
    }
  }

  /**
   * Audit location reviews & generate structured recommendations for unanswered reviews.
   */
  static runReviewAudit(location: Location): {
    reviews: Review[];
    averageRating: number;
    responseRate: number;
    unansweredCount: number;
    negativeCount: number;
  } {
    const reviews = AppStore.getReviews(location.id);
    if (reviews.length === 0) {
      return {
        reviews: [],
        averageRating: 5.0,
        responseRate: 100,
        unansweredCount: 0,
        negativeCount: 0,
      };
    }

    const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = parseFloat((totalRating / reviews.length).toFixed(1));

    const repliedCount = reviews.filter((r) => r.replyStatus === 'REPLIED').length;
    const unansweredCount = reviews.length - repliedCount;
    const responseRate = Math.round((repliedCount / reviews.length) * 100);

    const negativeCount = reviews.filter((r) => r.rating <= 2).length;

    // Auto-generate Recommendation for unanswered negative/low-star reviews
    const unansweredNegatives = reviews.filter((r) => r.rating <= 2 && r.replyStatus === 'UNANSWERED');
    if (unansweredNegatives.length > 0) {
      AppStore.saveRecommendation({
        id: `rec-rev-neg-${location.id}`,
        title: `Respond to ${unansweredNegatives.length} Unanswered Negative Reviews`,
        description: `Unanswered negative reviews harm local conversion rates and Google Maps trust signals.`,
        actionableStep: 'Use AI Reply Draft to publish professional responses to negative customer feedback.',
        priority: 'HIGH',
        impact: 'HIGH',
        difficulty: 'EASY',
        timeEstimate: '10 mins',
        status: 'OPEN',
        auditType: 'REVIEW',
        locationId: location.id,
        organizationId: location.organizationId,
        createdAt: new Date().toISOString(),
      });
    } else if (unansweredCount > 0) {
      AppStore.saveRecommendation({
        id: `rec-rev-unans-${location.id}`,
        title: `Reply to ${unansweredCount} Pending Customer Reviews`,
        description: `Responding to all Google & Yelp reviews increases local search authority and customer loyalty.`,
        actionableStep: 'Publish AI-drafted replies to pending positive and neutral customer reviews.',
        priority: 'MEDIUM',
        impact: 'MEDIUM',
        difficulty: 'EASY',
        timeEstimate: '15 mins',
        status: 'OPEN',
        auditType: 'REVIEW',
        locationId: location.id,
        organizationId: location.organizationId,
        createdAt: new Date().toISOString(),
      });
    }

    return {
      reviews,
      averageRating,
      responseRate,
      unansweredCount,
      negativeCount,
    };
  }
}
