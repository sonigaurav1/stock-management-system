'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Building2,
  MapPin,
  Globe,
  FileText,
  Code,
  Plus,
  Trash2
} from 'lucide-react';
import { api } from '@/../convex/_generated/api';
import { useQuery, useMutation } from 'convex/react';
import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';

interface CompanyData {
  companyName: string;
  businessType: string;
  taxNumber: string;
  businessRegistration: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  description: string;
}

const CompanySettings = () => {
  const { toast } = useToast();
  const { userId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // STEP 2.1: Cost Code Mapping state
  const costCodeData = useQuery(api.settings.getCostCodeMapping);
  const updateCostCodeMapping = useMutation(api.settings.updateCostCodeMapping);
  const companyDetails = useQuery(
    api.companies.getCompany,
    userId ? { userId } : 'skip'
  );

  const [costCodeEnabled, setCostCodeEnabled] = useState(
    costCodeData?.costCodeEnabled || false
  );
  const [costCodeMapping, setCostCodeMapping] = useState<
    Array<{ digit: string; codes: string[] }>
  >(costCodeData?.costCodeMapping || []);

  // Sync when data loads
  useEffect(() => {
    if (costCodeData) {
      setCostCodeEnabled(costCodeData.costCodeEnabled || false);
      setCostCodeMapping(costCodeData.costCodeMapping || []);
    }
  }, [costCodeData]);

  const addCostCodeEntry = () => {
    setCostCodeMapping((prev) => [...prev, { digit: '', codes: [] }]);
  };

  const removeCostCodeEntry = (index: number) => {
    setCostCodeMapping((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCostCodeDigit = (index: number, digit: string) => {
    setCostCodeMapping((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, digit } : entry))
    );
  };

  const updateCostCodeCodes = (index: number, codesStr: string) => {
    const codes = codesStr
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
    setCostCodeMapping((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, codes } : entry))
    );
  };

  const handleSaveCostCodes = async () => {
    try {
      await updateCostCodeMapping({
        costCodeMapping,
        costCodeEnabled
      });
      toast({
        title: 'Success',
        description: 'Cost codes saved'
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save cost codes',
        variant: 'destructive'
      });
    }
  };

  const [data, setData] = useState<CompanyData>({
    companyName: companyDetails?.name || '',
    businessType: companyDetails?.businessType || '',
    taxNumber: companyDetails?.taxNumber || '',
    businessRegistration: companyDetails?.businessRegistration || '',
    address: companyDetails?.address || '',
    city: companyDetails?.city || '',
    state: companyDetails?.state || '',
    postalCode: companyDetails?.postalCode || '',
    country: companyDetails?.country || 'Nepal',
    phone: companyDetails?.phone[0] || '',
    email: companyDetails?.email || '',
    website: companyDetails?.website || '',
    description: companyDetails?.description || ''
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string, field: keyof CompanyData) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      // TODO: Call API to save organization data
      console.log('Saving organization:', data);
      toast({
        title: 'Success',
        description: 'Organization details updated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update organization details',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Company Information */}
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Building2 className='h-5 w-5' />
            <div>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Basic details about your organization
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <Label>Company Name *</Label>
              <Input
                name='companyName'
                value={data.companyName}
                onChange={handleChange}
                placeholder='Enter company name'
              />
            </div>
            <div>
              <Label>Business Type *</Label>
              <Select
                value={data.businessType}
                onValueChange={(value) =>
                  handleSelectChange(value, 'businessType')
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='retailer'>Retailer</SelectItem>
                  <SelectItem value='wholesaler'>Wholesaler</SelectItem>
                  <SelectItem value='distributor'>Distributor</SelectItem>
                  <SelectItem value='manufacturer'>Manufacturer</SelectItem>
                  <SelectItem value='service_provider'>
                    Service Provider
                  </SelectItem>
                  <SelectItem value='corporate'>Corporate</SelectItem>
                  <SelectItem value='nonprofit'>Non-Profit</SelectItem>
                  <SelectItem value='other'>Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                name='phone'
                value={data.phone}
                onChange={handleChange}
                placeholder='+977-1-XXXXXXX'
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                name='email'
                type='email'
                value={data.email}
                onChange={handleChange}
                placeholder='contact@company.com'
              />
            </div>
            <div className='md:col-span-2'>
              <Label>Website</Label>
              <Input
                name='website'
                value={data.website}
                onChange={handleChange}
                placeholder='https://www.company.com'
              />
            </div>
            <div className='md:col-span-2'>
              <Label>Description</Label>
              <Textarea
                name='description'
                value={data.description}
                onChange={handleChange}
                placeholder='Brief description of your business'
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax & Compliance Information */}
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <FileText className='h-5 w-5' />
            <div>
              <CardTitle>Tax & Compliance</CardTitle>
              <CardDescription>
                Tax registration and legal compliance details
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <Label>Tax Number *</Label>
              <Input
                name='taxNumber'
                value={data.taxNumber}
                onChange={handleChange}
                placeholder='XXXXXXXXXXXXXXXXX'
              />
              <p className='mt-1 text-xs text-muted-foreground'>
                Enter your VAT registration number
              </p>
            </div>
            <div className='md:col-span-2'>
              <Label>Business Registration Certificate</Label>
              <Input
                name='businessRegistration'
                value={data.businessRegistration}
                onChange={handleChange}
                placeholder='Registration number'
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <MapPin className='h-5 w-5' />
            <div>
              <CardTitle>Address</CardTitle>
              <CardDescription>
                Business headquarters and primary location
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='md:col-span-2'>
              <Label>Street Address *</Label>
              <Input
                name='address'
                value={data.address}
                onChange={handleChange}
                placeholder='Enter street address'
              />
            </div>
            <div>
              <Label>City *</Label>
              <Input
                name='city'
                value={data.city}
                onChange={handleChange}
                placeholder='City'
              />
            </div>
            <div>
              <Label>State/District *</Label>
              <Input
                name='state'
                value={data.state}
                onChange={handleChange}
                placeholder='State/District'
              />
            </div>
            <div>
              <Label>Postal Code</Label>
              <Input
                name='postalCode'
                value={data.postalCode}
                onChange={handleChange}
                placeholder='Postal code'
              />
            </div>
            <div>
              <Label>Country *</Label>
              <Select
                value={data.country}
                onValueChange={(value) => handleSelectChange(value, 'country')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='NP'>Nepal</SelectItem>
                  <SelectItem value='IN'>India</SelectItem>
                  <SelectItem value='BD'>Bangladesh</SelectItem>
                  <SelectItem value='PK'>Pakistan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* STEP 2.1: Cost Code Mapping Card */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Code className='h-5 w-5' />
            Cost Code Mapping
          </CardTitle>
          <CardDescription>
            Hide cost prices from employees. Enter letters like "HI" for "12".
            Each digit maps to one or more letter codes. Example: digit "0" =
            "A,AB" and "1" = "HI" means "AHIAHI" decodes to "0110".
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Toggle */}
          <div className='flex items-center justify-between rounded-lg border p-4'>
            <div className='space-y-0.5'>
              <Label>Enable Cost Codes</Label>
              <p className='text-sm text-muted-foreground'>
                Use letter codes instead of numbers in purchase price
              </p>
            </div>
            <Switch
              checked={costCodeEnabled}
              onCheckedChange={setCostCodeEnabled}
            />
          </div>

          {costCodeEnabled && (
            <>
              {/* Mapping entries */}
              <div className='space-y-3'>
                {costCodeMapping.length === 0 && (
                  <p className='text-sm text-muted-foreground'>
                    No codes set. Add your first mapping below.
                  </p>
                )}
                {costCodeMapping.map((entry, index) => (
                  <div
                    key={index}
                    className='flex items-center gap-3 rounded-lg border p-3'
                  >
                    <div className='w-20 shrink-0'>
                      <Label className='text-xs'>Digit</Label>
                      <Input
                        placeholder='0'
                        value={entry.digit}
                        onChange={(e) =>
                          updateCostCodeDigit(index, e.target.value)
                        }
                        className='mt-1 h-8'
                      />
                    </div>
                    <div className='flex-1'>
                      <Label className='text-xs'>Codes (comma-separated)</Label>
                      <Input
                        placeholder='A, AB'
                        value={entry.codes.join(', ')}
                        onChange={(e) =>
                          updateCostCodeCodes(index, e.target.value)
                        }
                        className='mt-1 h-8'
                      />
                    </div>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => removeCostCodeEntry(index)}
                      className='mt-5 h-8 text-red-500 hover:text-red-600'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Add button */}
              <Button
                variant='outline'
                size='sm'
                onClick={addCostCodeEntry}
                className='gap-1'
              >
                <Plus className='h-4 w-4' />
                Add Mapping
              </Button>

              {/* Save cost codes */}
              <div className='flex justify-end pt-2'>
                <Button
                  size='sm'
                  onClick={handleSaveCostCodes}
                  className='gap-1'
                >
                  Save Cost Codes
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className='flex justify-end gap-2'>
        <Button variant='outline'>Cancel</Button>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default CompanySettings;
