'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
  const [expandedSection, setExpandedSection] = React.useState<string | null>(
    null
  );

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const sections = [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      content: `By accessing and using DigitalDukan (the "Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service. We reserve the right to make changes to these Terms of Service at any time and for any reason. We will alert you about any changes by updating the "Last Updated" date of these Terms of Service.`
    },
    {
      id: 'use-license',
      title: '2. Use License',
      content: `Permission is granted to temporarily download one copy of the materials (information or software) on DigitalDukan for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
      
• Modifying or copying the materials
• Using the materials for any commercial purpose or for any public display
• Attempting to decompile or reverse engineer any software contained on DigitalDukan
• Removing any copyright or other proprietary notations from the materials
• Transferring the materials to another person or "mirroring" the materials on any other server
• Transmitting the materials over a network
• Selling merchandise to unauthorized commercial use of any materials on DigitalDukan

This license shall automatically terminate if you violate any of these restrictions and may be terminated by DigitalDukan at any time, upon which your viewing rights will also terminate.`
    },
    {
      id: 'disclaimer',
      title: '3. Disclaimer',
      content: `The materials on DigitalDukan's website are provided on an 'as is' basis. DigitalDukan makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.

Further, DigitalDukan does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.`
    },
    {
      id: 'limitations',
      title: '4. Limitations of Liability',
      content: `In no event shall DigitalDukan or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on DigitalDukan's website, even if DigitalDukan or an authorized representative has been notified orally or in writing of the possibility of such damage.

Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.`
    },
    {
      id: 'accuracy',
      title: '5. Accuracy of Materials',
      content: `The materials appearing on DigitalDukan's website could contain technical, typographical, or photographic errors. DigitalDukan does not warrant that any of the materials on its website are accurate, complete, or current. DigitalDukan may make changes to the materials contained on its website at any time without notice.

DigitalDukan does not make any commitment to update the materials on DigitalDukan's website.`
    },
    {
      id: 'materials',
      title: '6. Materials and Content',
      content: `The materials on DigitalDukan's website are protected by copyright and trademark laws. You are prohibited from modifying, printing, publishing, transmitting, transferring or selling, reproducing, creating derivative works from, distributing, performing, displaying, or in any way exploiting any of the materials, in whole or in part.

You may download material from DigitalDukan's website for personal use only, provided that you also retain all copyright and other proprietary notices. You may not further use, modify, or distribute the material without the express written permission of DigitalDukan.`
    },
    {
      id: 'links',
      title: '7. Links',
      content: `DigitalDukan has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by DigitalDukan of the site. Use of any such linked website is at the user's own risk.

If you believe that a link on our website or any content on a linked website violates your intellectual property rights, please notify us immediately.`
    },
    {
      id: 'modifications',
      title: '8. Modifications',
      content: `DigitalDukan may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.

We may, in our sole discretion, modify or discontinue the Service (or any part thereof) or any feature or function of the Service, with or without notice to you. DigitalDukan shall have no liability for any such modification, suspension, or discontinuance.`
    },
    {
      id: 'governing-law',
      title: '9. Governing Law',
      content: `These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which DigitalDukan operates, and you irrevocably submit to the exclusive jurisdiction of the courts in such location.

If any provision of these terms is found to be invalid or unenforceable, the remaining provisions will continue in full force and effect.`
    },
    {
      id: 'termination',
      title: '10. Termination of Use',
      content: `DigitalDukan may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason or no reason, including if you breach the Terms.

Upon termination of your account:
• Your right to use the Service will immediately cease
• We are not liable for any loss or damage arising from such termination
• Sections that by their nature are intended to survive termination shall do so
• You remain liable for any outstanding fees or charges on your account`
    },
    {
      id: 'payment',
      title: '11. Payment Terms',
      content: `DigitalDukan offers various subscription plans with different pricing. All prices are displayed in the currency specified at the time of purchase. By providing a payment method, you authorize DigitalDukan to charge that method for the services selected.

Payment is required in advance for each billing period. Billing cycles are either monthly or annually, depending on the plan selected. If your payment fails, we will attempt to charge your account up to three times. If payment ultimately fails, we may suspend or terminate your account.

Refunds are issued according to our Refund Policy. No refunds will be issued for partial months or unused portions of a subscription period.`
    },
    {
      id: 'user-accounts',
      title: '12. User Accounts and Responsibilities',
      content: `When you create an account on DigitalDukan, you are responsible for maintaining the confidentiality of your password and account information. You agree to accept responsibility for all activities that occur under your account.

You agree to provide accurate and complete information during registration and to update such information as necessary. You are prohibited from using false or misleading information or impersonating any person or entity.

You agree not to use DigitalDukan for any unlawful purpose or in violation of applicable laws and regulations. You are solely responsible for all content you upload, store, or distribute through the Service.`
    },
    {
      id: 'data-security',
      title: '13. Data Security and Privacy',
      content: `DigitalDukan takes data security seriously and implements industry-standard security measures to protect your information. However, no security system is impenetrable. We cannot guarantee absolute security of your data.

You are responsible for maintaining appropriate backups of your data. DigitalDukan is not liable for data loss, corruption, or theft resulting from circumstances beyond our reasonable control.

Your use of DigitalDukan is also governed by our Privacy Policy. Please review it to understand our practices regarding data collection and usage.`
    },
    {
      id: 'intellectual-property',
      title: '14. Intellectual Property Rights',
      content: `DigitalDukan and its licensors own all intellectual property rights in the Service, including but not limited to copyrights, trademarks, patents, and trade secrets. You are granted only a limited, non-exclusive, non-transferable, revocable license to use the Service in accordance with these Terms.

You retain ownership of any content you create within the Service ("Your Content"). By uploading Your Content to DigitalDukan, you grant DigitalDukan a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute Your Content solely for the purpose of providing and improving the Service.

You represent and warrant that Your Content does not infringe on any third-party intellectual property rights.`
    },
    {
      id: 'limitation-trial',
      title: '15. Free Trial Terms',
      content: `DigitalDukan may offer free trial periods for new users. Any free trial period will be for the duration specified at sign-up. During the trial period, you have full access to the features of the Service.

At the end of your free trial period, your account will automatically be converted to a paid subscription unless you cancel before the trial ends. You will be charged according to the pricing plan you select if you do not cancel.

DigitalDukan reserves the right to modify or terminate free trial offers at any time with 30 days' notice.`
    },
    {
      id: 'limitation-warranties',
      title: '16. Limitation of Warranties',
      content: `EXCEPT AS EXPRESSLY STATED IN THESE TERMS, THE SERVICE IS PROVIDED "AS IS" AND DIGITALDUKAN DISCLAIMS ALL OTHER WARRANTIES, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING BUT NOT LIMITED TO ANY WARRANTY OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.

DIGITALDUKAN DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS. DIGITALDUKAN DOES NOT WARRANT THAT ANY DEFECTS IN THE SERVICE WILL BE CORRECTED.`
    },
    {
      id: 'contact',
      title: '17. Contact Information',
      content: `If you have any questions about these Terms of Service, or if you need to report a violation, please contact us at:

DigitalDukan Support
Email: support@digitaldukan.com
Website: www.digitaldukan.com

We will respond to your inquiry within 5 business days.`
    }
  ];

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'>
      {/* Header */}
      <div className='border-b border-slate-200 dark:border-slate-800'>
        <div className='mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8'>
          <div className='mb-4 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300'>
            Legal
          </div>
          <h1 className='mb-4 text-4xl font-bold text-slate-900 dark:text-white'>
            Terms of Service
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
          <div className='mb-8 rounded-lg border border-slate-200 bg-blue-50 p-6 dark:border-slate-700 dark:bg-blue-950/20'>
            <h2 className='text-lg font-semibold text-slate-900 dark:text-white'>
              Welcome to DigitalDukan
            </h2>
            <p className='mt-2 text-slate-700 dark:text-slate-300'>
              These Terms of Service ("Terms") govern your access and use of
              DigitalDukan's website, platform, and services (collectively, the
              "Service"). Please read these Terms carefully. By accessing or
              using DigitalDukan, you agree to be bound by these Terms. If you
              do not agree with any part of these Terms, you should not use the
              Service.
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
              Questions?
            </h3>
            <p className='mt-2 text-slate-600 dark:text-slate-400'>
              If you have any questions about these Terms of Service, please
              contact our support team at{' '}
              <a
                href='mailto:support@digitaldukan.com'
                className='font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
              >
                support@digitaldukan.com
              </a>
            </p>
          </div>

          {/* Related Links */}
          <div className='mt-8 flex flex-wrap gap-4'>
            <Link
              href='/privacy'
              className='inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
            >
              Privacy Policy
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
