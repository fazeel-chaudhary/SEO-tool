import { Location } from '@/lib/types';

export class SchemaService {
  static generateLocalBusinessSchema(location: Location): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: location.name,
      image: 'https://downtowndentalaustin.com/logo.png',
      '@id': location.website || 'https://downtowndentalaustin.com',
      url: location.website || 'https://downtowndentalaustin.com',
      telephone: location.phone,
      priceRange: '$$',
      address: {
        '@type': 'PostalAddress',
        streetAddress: location.address,
        addressLocality: location.city,
        addressRegion: location.state,
        postalCode: location.zip,
        addressCountry: 'US',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: location.lat || 30.2672,
        longitude: location.lng || -97.7431,
      },
    };
  }

  static generateRestaurantSchema(location: Location): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      name: location.name,
      image: 'https://downtowndentalaustin.com/restaurant-logo.png',
      telephone: location.phone,
      priceRange: '$$$',
      servesCuisine: 'Italian, Contemporary',
      menu: `${location.website || 'https://example.com'}/menu`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: location.address,
        addressLocality: location.city,
        addressRegion: location.state,
        postalCode: location.zip,
        addressCountry: 'US',
      },
    };
  }

  static generateMedicalBusinessSchema(location: Location): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'MedicalBusiness',
      name: location.name,
      telephone: location.phone,
      medicalSpecialty: 'Dentistry',
      address: {
        '@type': 'PostalAddress',
        streetAddress: location.address,
        addressLocality: location.city,
        addressRegion: location.state,
        postalCode: location.zip,
        addressCountry: 'US',
      },
    };
  }

  static generateAttorneySchema(location: Location): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'Attorney',
      name: location.name,
      telephone: location.phone,
      priceRange: '$$$$',
      address: {
        '@type': 'PostalAddress',
        streetAddress: location.address,
        addressLocality: location.city,
        addressRegion: location.state,
        postalCode: location.zip,
        addressCountry: 'US',
      },
    };
  }

  static generateOrganizationSchema(location: Location): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: location.name,
      url: location.website || 'https://downtowndentalaustin.com',
      logo: 'https://downtowndentalaustin.com/logo.png',
      sameAs: [
        'https://facebook.com/downtowndentalaustin',
        'https://twitter.com/downtowndentalaustin'
      ],
    };
  }

  static generateFaqSchema(faqs: { question: string; answer: string }[]): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };
  }

  static generateProductSchema(location: Location): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Professional Teeth Whitening Kit',
      image: 'https://downtowndentalaustin.com/whitening.png',
      description: 'Medical-grade dental whitening kit for at-home use.',
      brand: {
        '@type': 'Brand',
        name: location.name,
      },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'USD',
        price: '149.00',
        availability: 'https://schema.org/InStock',
      },
    };
  }

  static generateServiceSchema(location: Location): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      serviceType: location.category,
      provider: {
        '@type': 'LocalBusiness',
        name: location.name,
        telephone: location.phone,
      },
      areaServed: {
        '@type': 'City',
        name: location.city,
      },
    };
  }

  static generateReviewSchema(location: Location): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'Review',
      itemReviewed: {
        '@type': 'LocalBusiness',
        name: location.name,
        telephone: location.phone,
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5',
      },
      author: {
        '@type': 'Person',
        name: 'Sarah Connor',
      },
      reviewBody: `Outstanding customer support and professional treatment at ${location.name}! Highly recommended.`,
    };
  }

  static generateEventSchema(location: Location): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: `Free Dental Hygiene Seminar by ${location.name}`,
      startDate: '2026-10-15T18:00:00-05:00',
      endDate: '2026-10-15T20:00:00-05:00',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      location: {
        '@type': 'Place',
        name: location.name,
        address: {
          '@type': 'PostalAddress',
          streetAddress: location.address,
          addressLocality: location.city,
          addressRegion: location.state,
          postalCode: location.zip,
          addressCountry: 'US',
        },
      },
      description: 'Learn best practices for daily oral health and preventive hygiene from our dental experts.',
    };
  }

  static generateVideoSchema(location: Location): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: `Welcome to ${location.name} Austin`,
      description: `Take a virtual tour of our state-of-the-art dental clinic at ${location.address}.`,
      thumbnailUrl: 'https://downtowndentalaustin.com/video-thumb.png',
      uploadDate: '2026-01-10T08:00:00Z',
      contentUrl: 'https://downtowndentalaustin.com/welcome-tour.mp4',
    };
  }

  static generateBreadcrumbSchema(): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://downtowndentalaustin.com/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Austin Clinic',
          item: 'https://downtowndentalaustin.com/austin-location',
        },
      ],
    };
  }
}
