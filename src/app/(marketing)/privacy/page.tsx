'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  const [expandedSection, setExpandedSection] = React.useState<string | null>(
    null
  );

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const sections = [
    {
      id: 'introduction',
      title: '1. Introduction',
      content: `DigitalDukan ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, including any other media form, media channel, mobile website, or mobile application related or connected thereto (collectively, the "Site") and use our services (the "Services").

Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our Site or Services. By accessing or using DigitalDukan, you acknowledge that you have read, understood, and agree to be bound by all the provisions of this Privacy Policy.`
    },
    {
      id: 'information-we-collect',
      title: '2. Information We Collect',
      content: `We collect information in various ways, including:

A. Information You Provide Directly:
• Account Registration: When you create an account, we collect your name, email address, phone number, business name, and password.
• Payment Information: When you make a purchase, we collect payment details through secure payment processors. We do not directly store credit card information on our servers.
• Profile Information: Additional details you provide such as business address, industry type, and company size.
• Customer Communications: Messages, inquiries, and customer support requests you send to us.
• Feedback and Surveys: Responses to surveys, feedback forms, or questionnaires.

B. Information Collected Automatically:
• Device Information: Browser type, IP address, device type, and operating system.
• Usage Data: Pages accessed, time spent on pages, links clicked, and features used.
• Cookies and Similar Technologies: We use cookies, web beacons, and similar tracking technologies to enhance your experience and understand how you use our Site.
• Location Data: General geographic information based on IP address (not precise GPS location).
• Analytics Data: Information collected through analytics tools to understand user behavior and improve our Services.

C. Information from Third Parties:
• Social Media: If you link your social media accounts, we may collect information from those platforms.
• Business Partners: Information shared by partners or integrations you authorize.
• Payment Processors: Transaction information from payment service providers.`
    },
    {
      id: 'how-we-use',
      title: '3. How We Use Your Information',
      content: `We use the information we collect for various purposes:

Service Delivery:
• Providing and maintaining the Services
• Processing transactions and sending related information
• Creating and managing your account
• Delivering customer support and responding to inquiries
• Sending transactional emails (confirmations, receipts, updates)

Service Improvement:
• Analyzing user behavior and preferences
• Conducting research and analytics to improve our Services
• Developing new features and functionality
• Personalizing your experience

Marketing and Communications:
• Sending promotional emails and marketing communications (with your consent)
• Notifying you about changes to our policies or Services
• Informing you about new products, services, or special offers

Legal and Security:
• Complying with legal obligations and regulatory requirements
• Enforcing our Terms of Service and other agreements
• Preventing fraud and enhancing security
• Protecting the rights, property, and safety of our users and the public

Business Operations:
• Generating aggregated and de-identified statistics
• Conducting audits and assessments of our business`
    },
    {
      id: 'information-sharing',
      title: '4. How We Share Your Information',
      content: `We do not sell, trade, or rent your personal information to third parties. However, we may share your information in the following circumstances:

Service Providers:
We employ third-party companies and individuals to perform services on our behalf, including:
• Payment processors and financial institutions
• Cloud hosting providers
• Analytics services
• Customer support platforms
• Email delivery services

These service providers are bound by confidentiality agreements and permitted to use your information only as necessary to provide services to us.

Business Transfers:
If DigitalDukan is involved in a merger, acquisition, bankruptcy, or sale of assets, your information may be transferred as part of that transaction. We will provide notice before your information becomes subject to a different privacy policy.

Legal Requirements:
We may disclose your information when required by law or when we believe in good faith that such disclosure is necessary to:
• Comply with legal obligations
• Enforce our Terms of Service
• Protect against fraud or security threats
• Protect the rights, property, and safety of our users and the public

With Your Consent:
We may share your information with third parties when you explicitly consent to such sharing.

Aggregated Data:
We may share aggregated, anonymized information that cannot identify you personally with business partners, marketers, and other third parties.`
    },
    {
      id: 'cookies',
      title: '5. Cookies and Tracking Technologies',
      content: `A. What Are Cookies?
Cookies are small data files stored on your device that help us recognize you and remember your preferences. We use both session-based and persistent cookies.

B. Types of Cookies We Use:

Essential Cookies:
• Required for the Site to function properly
• Include authentication and security cookies
• Cannot be disabled

Functionality Cookies:
• Remember your preferences and settings
• Enable personalized features

Analytics Cookies:
• Collect data about how you use our Site
• Help us understand user behavior and improve Services

Marketing Cookies:
• Track your activity across our Site and third-party sites
• Enable targeted advertising and retargeting

C. Managing Cookies:
You can control cookies through your browser settings. Most browsers allow you to refuse cookies or alert you when cookies are being sent. Note that disabling cookies may affect the functionality of our Site.

D. Similar Technologies:
We may use web beacons, pixels, and similar technologies to track user activity and collect information about your interactions with our Site.`
    },
    {
      id: 'data-security',
      title: '6. Data Security',
      content: `We implement comprehensive security measures to protect your personal information:

Technical Safeguards:
• SSL/TLS encryption for data transmission
• Secure servers with firewalls and intrusion detection
• Regular security audits and penetration testing
• Encrypted storage of sensitive data

Administrative Safeguards:
• Limited access to personal information (need-to-know basis)
• Employee confidentiality agreements
• Regular staff training on data protection
• Background checks for employees with access to data

Physical Safeguards:
• Restricted access to facilities
• Security cameras and monitoring
• Secure document storage and destruction

While we strive to protect your information using reasonable security measures, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security of your data. You are responsible for maintaining the confidentiality of your password.`
    },
    {
      id: 'data-retention',
      title: '7. Data Retention',
      content: `We retain your personal information for as long as necessary to:
• Provide you with the Services
• Comply with legal and regulatory obligations
• Resolve disputes and enforce agreements
• Maintain business records

Retention Periods:
• Account Information: Retained while your account is active and for 5 years after account closure (unless required longer for legal/tax purposes)
• Transaction Records: Retained for 7 years for regulatory and tax purposes
• Customer Communications: Retained for 3 years or as required by law
• Analytics Data: Retained for 2 years
• Cookies: Typically expire based on their type (session cookies expire at the end of your session; persistent cookies have defined expiration dates)

You may request deletion of your data subject to legal and regulatory requirements. We will not delete data necessary for legal compliance or dispute resolution.`
    },
    {
      id: 'user-rights',
      title: '8. Your Privacy Rights and Choices',
      content: `Depending on your location, you may have the following rights:

Access and Portability:
• Right to access the personal information we hold about you
• Right to obtain a copy of your data in a portable format
• Right to request details about how your data is processed

Correction:
• Right to correct inaccurate or incomplete information

Deletion (Right to Be Forgotten):
• Right to request deletion of your personal information
• Exceptions apply for legal compliance and legitimate business needs

Opt-Out of Marketing:
• Right to unsubscribe from marketing communications
• Opt-out link included in all promotional emails
• You may manage preferences in your account settings

Withdraw Consent:
• Right to withdraw consent for data processing
• This does not affect processing carried out before withdrawal

Data Protection:
• Right to lodge a complaint with data protection authorities
• Right to object to certain types of data processing

How to Exercise Your Rights:
To exercise any of these rights, contact us at privacy@digitaldukan.com with your request and supporting documentation. We will respond within 30 days (or as required by law).`
    },
    {
      id: 'California-privacy',
      title: '9. California Privacy Rights (CCPA)',
      content: `If you are a California resident, the California Consumer Privacy Act (CCPA) provides you with additional rights:

Right to Know:
You have the right to request what personal information we collect, use, share, and sell.

Right to Delete:
You have the right to request deletion of personal information we have collected from you, subject to certain exceptions.

Right to Opt-Out:
You have the right to opt-out of the "sale" or "sharing" of your personal information. While we do not sell your data for money, sharing with service providers or marketing partners may constitute a "sale" under CCPA.

Right to Non-Discrimination:
We will not discriminate against you for exercising your CCPA rights with respect to pricing, quality of service, or other provisions of our Services.

Right to Limit Use:
You have the right to limit our use of sensitive personal information.

Submitting Requests:
To submit a CCPA request, contact us at privacy@digitaldukan.com. We will verify your identity and respond within 45 days. You may designate an authorized agent to make requests on your behalf.

Shine the Light:
California residents may also request a list of third parties with whom we have shared personal information for their direct marketing purposes.`
    },
    {
      id: 'GDPR',
      title: '10. Europe Data Protection (GDPR)',
      content: `If you are located in the European Union, European Economic Area, or Switzerland, the General Data Protection Regulation (GDPR) provides you with additional protections:

Legal Basis for Processing:
We process your personal data based on:
• Your consent
• Contract necessity (to provide Services)
• Legal obligations
• Legitimate interests (e.g., fraud prevention, security)

Data Subject Rights:
You have the right to:
• Request access to your personal data
• Request correction of inaccurate data
• Request erasure of your data
• Restrict processing of your data
• Request data portability
• Object to processing
• Withdraw consent at any time
• Lodge a complaint with your data protection authority

International Transfers:
If we transfer your data outside the EU/EEA, we use appropriate safeguards such as Standard Contractual Clauses or Binding Corporate Rules.

Data Protection Officer:
If required, we maintain a Data Protection Officer. Contact dpo@digitaldukan.com for GDPR inquiries.

Your Rights Contact:
For GDPR-related requests, contact privacy@digitaldukan.com. We will respond within 30 days.`
    },
    {
      id: 'children',
      title: "11. Children's Privacy",
      content: `DigitalDukan is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will delete such information and terminate the child's account.

If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately at privacy@digitaldukan.com.

For users under 18:
If you are between 13 and 18 years old, please be aware that certain aspects of our Services may not be appropriate for your age. We recommend parental supervision.`
    },
    {
      id: 'third-party-links',
      title: '12. Third-Party Links and Services',
      content: `Our Site may contain links to third-party websites, applications, and services that are not operated by DigitalDukan. This Privacy Policy applies only to information we collect through our Site and Services.

We are not responsible for the privacy practices of third-party websites or services. We encourage you to review the privacy policies of any third-party service before providing your personal information.

Third-Party Integrations:
If you authorize connections to third-party services (e.g., payment processors, social media platforms), those services will have access to your information according to their privacy policies.`
    },
    {
      id: 'updates-changes',
      title: '13. Updates to This Privacy Policy',
      content: `We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of material changes by:
• Posting the updated Privacy Policy on our Site
• Updating the "Last Updated" date at the top of this policy
• Sending you an email notification if the changes are significant

Your continued use of our Site and Services after such modifications constitutes your acceptance of the updated Privacy Policy. We encourage you to review this policy periodically to stay informed about how we protect your information.

Material changes will require your explicit consent before becoming effective.`
    },
    {
      id: 'contact-us',
      title: '14. Contact Us',
      content: `If you have questions about this Privacy Policy or our privacy practices, please contact us:

DigitalDukan Privacy Team
Email: privacy@digitaldukan.com
Support Email: support@digitaldukan.com
Website: www.digitaldukan.com

Mailing Address:
DigitalDukan
Legal Department
[Business Address]
[City, Country]

Data Protection Officer:
Email: dpo@digitaldukan.com (if applicable)

Response Time:
We will respond to your inquiry within 5 business days. If your request requires additional investigation, we will contact you with an estimated timeline.`
    }
  ];

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'>
      {/* Header */}
      <div className='border-b border-slate-200 dark:border-slate-800'>
        <div className='mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8'>
          <div className='mb-4 inline-block rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700 dark:bg-purple-950 dark:text-purple-300'>
            Legal
          </div>
          <h1 className='mb-4 text-4xl font-bold text-slate-900 dark:text-white'>
            Privacy Policy
          </h1>
          <p className='text-lg text-slate-600 dark:text-slate-300'>
            Last updated:{' '}
            {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className='mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8'>
        <div className='prose prose-slate dark:prose-invert max-w-none'>
          {/* Introduction */}
          <div className='mb-8 rounded-lg border border-slate-200 bg-purple-50 p-6 dark:border-slate-700 dark:bg-purple-950/20'>
            <h2 className='text-lg font-semibold text-slate-900 dark:text-white'>
              Your Privacy Matters
            </h2>
            <p className='mt-2 text-slate-700 dark:text-slate-300'>
              At DigitalDukan, we respect your privacy and are committed to
              protecting your personal data. This Privacy Policy explains how we
              collect, use, process, and safeguard your information. We comply
              with data protection regulations including GDPR, CCPA, and other
              applicable laws. Please read this policy carefully to understand
              our privacy practices.
            </p>
          </div>

          {/* Collapsible Sections */}
          <div className='space-y-3'>
            {sections.map((section) => (
              <div
                key={section.id}
                className='rounded-lg border border-slate-200 dark:border-slate-700'
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className='flex w-full items-center justify-between px-6 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50'
                >
                  <h2 className='font-semibold text-slate-900 dark:text-white'>
                    {section.title}
                  </h2>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-600 transition-transform dark:text-slate-400 ${
                      expandedSection === section.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {expandedSection === section.id && (
                  <div className='border-t border-slate-200 px-6 py-4 dark:border-slate-700'>
                    <div className='space-y-3 text-slate-700 dark:text-slate-300'>
                      {section.content.split('\n').map((paragraph, idx) => (
                        <p
                          key={idx}
                          className={paragraph.startsWith('•') ? 'ml-4' : ''}
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer Note */}
          <div className='mt-12 rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/50'>
            <h3 className='font-semibold text-slate-900 dark:text-white'>
              Questions About Our Privacy Practices?
            </h3>
            <p className='mt-2 text-slate-600 dark:text-slate-400'>
              If you have concerns about how we handle your personal information
              or want to exercise your privacy rights, please contact our
              Privacy Team at{' '}
              <a
                href='mailto:privacy@digitaldukan.com'
                className='font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300'
              >
                privacy@digitaldukan.com
              </a>
            </p>
          </div>

          {/* Related Links */}
          <div className='mt-8 flex flex-wrap gap-4'>
            <Link
              href='/terms'
              className='inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
            >
              Terms of Service
            </Link>
            <Link
              href='/'
              className='inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
