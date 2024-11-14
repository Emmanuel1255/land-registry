// src/data/mockVerificationData.js
export const mockLSSurveys = [
    {
      lsNumber: 'LS1234/2024',
      surveyDate: '2024-01-15',
      district: 'Western Urban',
      area: 'Murray Town',
      size: '500 sq meters',
      surveyor: 'John Smith',
      status: 'valid',
      verificationStatus: 'unverified',
      verificationDetails: {
        verifiedOn: null,
        verifiedBy: null,
      }
    },
    {
      lsNumber: 'LS5678/2024',
      surveyDate: '2024-02-20',
      district: 'Western Urban',
      area: 'Aberdeen',
      size: '1200 sq meters',
      surveyor: 'Sarah Johnson',
      status: 'invalid',
      verificationStatus: 'unverified',
      verificationDetails: {
        verifiedOn: null,
        verifiedBy: null,
      }

    }
  ];
  
  export const mockOARGRecords = [
    {
      pageNumber: '123',
      volumeNumber: '45',
      registrationDate: '2024-01-20',
      propertyType: 'residential',
      status: 'active',
      previousOwners: ['James Wilson', 'Mary Brown']
    },
    {
      pageNumber: '234',
      volumeNumber: '46',
      registrationDate: '2024-02-25',
      propertyType: 'commercial',
      status: 'pending',
      previousOwners: ['Peter Clark']
    }
  ];
  
  export const mockLawyers = [
    {
      id: 'L001',
      name: 'Adv. Michael Brown',
      licenseNumber: 'SL12345',
      specialization: 'Property Law',
      status: 'active'
    },
    {
      id: 'L002',
      name: 'Adv. Sarah Williams',
      licenseNumber: 'SL67890',
      specialization: 'Real Estate Law',
      status: 'active'
    }
  ];