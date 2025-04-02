// File: src/app/settings/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
// eslint-disable-next-line import/no-unresolved
import { api } from '@/../convex/_generated/api';
import { useAuth } from '@clerk/nextjs';

export default function ProfileSettings() {
  const { userId } = useAuth();

  const updateCompanyDetails = useMutation(
    api.companyDetails.updateCompanyDetails
  );
  const companyDetails = useQuery(api.companyDetails.getCompanyDetails, {
    userId: userId ?? ''
  });

  const [formData, setFormData] = useState({
    companyName: '',
    companyAddress: '',
    phone: [''],
    email: '',
    vatNumber: '',
    urls: [{ id: 1, value: '' }]
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Populate form with existing data when available
  useEffect(() => {
    if (companyDetails) {
      setFormData({
        companyName: companyDetails.companyName,
        companyAddress: companyDetails.companyAddress,
        phone: companyDetails.phone,
        email: companyDetails.email,
        vatNumber: companyDetails.vatNumber,
        urls: companyDetails.urls
      });
    }
  }, [companyDetails]);

  const handlePhoneChange = (index: any, value: any) => {
    const newPhone = [...formData.phone];
    newPhone[index] = value;
    setFormData({ ...formData, phone: newPhone });
  };

  const addPhoneField = () => {
    setFormData({ ...formData, phone: [...formData.phone, ''] });
  };

  const removePhoneField = (index: any) => {
    if (formData.phone.length > 1) {
      const newPhone = [...formData.phone];
      newPhone.splice(index, 1);
      setFormData({ ...formData, phone: newPhone });
    }
  };

  const handleUrlChange = (index: any, value: any) => {
    const newUrls = [...formData.urls];
    newUrls[index].value = value;
    setFormData({ ...formData, urls: newUrls });
  };

  const addUrlField = () => {
    const newUrls = [...formData.urls];
    newUrls.push({ id: newUrls.length + 1, value: '' });
    setFormData({ ...formData, urls: newUrls });
  };

  const removeUrlField = (index: any) => {
    if (formData.urls.length > 1) {
      const newUrls = [...formData.urls];
      newUrls.splice(index, 1);
      setFormData({ ...formData, urls: newUrls });
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');

    try {
      await updateCompanyDetails({
        ...formData
      });

      setSuccessMessage('Company details updated successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating company details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!companyDetails) {
    return <div className='p-6'>Company details not found...</div>;
  }

  return (
    <div className='mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-md'>
      <h1 className='mb-6 text-2xl font-bold'>Company Profile Settings</h1>

      {successMessage && (
        <div className='mb-4 rounded bg-green-100 p-4 text-green-700'>
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <div>
            <label className='mb-2 block'>Company Name</label>
            <input
              type='text'
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              className='w-full rounded border p-2'
              required
            />
          </div>

          <div>
            <label className='mb-2 block'>Email</label>
            <input
              type='email'
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className='w-full rounded border p-2'
              required
            />
          </div>

          <div className='md:col-span-2'>
            <label className='mb-2 block'>Company Address</label>
            <textarea
              value={formData.companyAddress}
              onChange={(e) =>
                setFormData({ ...formData, companyAddress: e.target.value })
              }
              className='w-full rounded border p-2'
              rows={3}
              required
            />
          </div>

          <div>
            <label className='mb-2 block'>VAT Number</label>
            <input
              type='text'
              value={formData.vatNumber}
              onChange={(e) =>
                setFormData({ ...formData, vatNumber: e.target.value })
              }
              className='w-full rounded border p-2'
              required
            />
          </div>

          <div className='md:col-span-2'>
            <label className='mb-2 block'>Phone Numbers</label>
            {formData.phone.map((phone, index) => (
              <div key={index} className='mb-2 flex'>
                <input
                  type='tel'
                  value={phone}
                  onChange={(e) => handlePhoneChange(index, e.target.value)}
                  className='mr-2 w-full rounded border p-2'
                  required={index === 0}
                />
                <button
                  type='button'
                  onClick={() => removePhoneField(index)}
                  className='mr-2 rounded bg-red-100 px-4 py-2 text-red-700'
                  disabled={formData.phone.length <= 1 && index === 0}
                >
                  -
                </button>
                {index === formData.phone.length - 1 && (
                  <button
                    type='button'
                    onClick={addPhoneField}
                    className='rounded bg-gray-200 px-4 py-2'
                  >
                    +
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className='md:col-span-2'>
            <label className='mb-2 block'>Website URLs</label>
            {formData.urls.map((url, index) => (
              <div key={url.id} className='mb-2 flex'>
                <input
                  type='url'
                  value={url.value}
                  onChange={(e) => handleUrlChange(index, e.target.value)}
                  className='mr-2 w-full rounded border p-2'
                  placeholder='https://example.com'
                />
                <button
                  type='button'
                  onClick={() => removeUrlField(index)}
                  className='mr-2 rounded bg-red-100 px-4 py-2 text-red-700'
                  disabled={formData.urls.length <= 1 && index === 0}
                >
                  -
                </button>
                {index === formData.urls.length - 1 && (
                  <button
                    type='button'
                    onClick={addUrlField}
                    className='rounded bg-gray-200 px-4 py-2'
                  >
                    +
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className='mt-6'>
          <button
            type='submit'
            className={`rounded px-6 py-2 text-white ${loading ? 'bg-gray-400' : 'bg-blue-600'}`}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
