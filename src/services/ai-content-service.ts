import { Location } from '@/lib/types';

export class AiContentService {
  /**
   * Generates location landing page copy injected with business context, city, landmarks, & ZIP code.
   */
  static generateLocationPageCopy(location: Location): string {
    return `# ${location.category} in ${location.city}, ${location.state} — ${location.name}

Welcome to **${location.name}**, your trusted local ${location.category.toLowerCase()} serving **${location.city}** (${location.zip}) and surrounding communities.

Located conveniently at **${location.address}**, our dedicated team is committed to providing top-tier service tailored to the unique needs of our local community.

### Why Choose ${location.name} in ${location.city}?
- **Local Expertise**: Proudly serving central ${location.city} residents and local businesses.
- **Full Service**: Specializing in ${location.category}${location.additionalCats ? `, ${location.additionalCats.join(', ')}` : ''}.
- **Convenient Hours**: Open ${location.gbpHours || 'Monday through Friday'}.

### Contact Our ${location.city} Location Today
Ready to schedule an appointment or request a consultation?
- **Phone**: ${location.phone}
- **Address**: ${location.address}, ${location.city}, ${location.state} ${location.zip}
- **Website**: ${location.website || 'https://downtowndentalaustin.com'}
`;
  }

  /**
   * Generates promotional Google Business Profile posts.
   */
  static generateGbpPost(location: Location, offerTopic: string): { headline: string; body: string; callToAction: string } {
    return {
      headline: `Special Update from ${location.name} in ${location.city}!`,
      body: `Looking for top-quality ${location.category.toLowerCase()} services in ${location.city}? At ${location.name}, we are offering special appointments this week for ${offerTopic || 'new and existing clients'}. Visit us at ${location.address} or call ${location.phone} today!`,
      callToAction: 'Book Appointment Now',
    };
  }

  /**
   * Generates local Q&A FAQ content for Schema or website insertion.
   */
  static generateLocalFaqs(location: Location): { question: string; answer: string }[] {
    return [
      {
        question: `Where is ${location.name} located in ${location.city}?`,
        answer: `${location.name} is located at ${location.address}, ${location.city}, ${location.state} ${location.zip}.`,
      },
      {
        question: `What primary services does ${location.name} offer?`,
        answer: `We specialize in ${location.category}${location.additionalCats ? ` as well as ${location.additionalCats.join(' and ')}` : ''}.`,
      },
      {
        question: `What are your business hours in ${location.city}?`,
        answer: `Our operating hours are ${location.gbpHours || 'Monday through Friday, 8:00 AM to 5:00 PM'}.`,
      },
    ];
  }
}
