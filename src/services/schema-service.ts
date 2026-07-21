import { Location } from '@/lib/types';

export class SchemaService {
  /**
   * Generates valid LocalBusiness JSON-LD schema.
   */
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
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '17:00',
      },
    };
  }

  /**
   * Generates FAQPage JSON-LD schema.
   */
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

  /**
   * Generates Service JSON-LD schema.
   */
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
}
