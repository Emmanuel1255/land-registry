// src/data/mockProperties.js
export const mockProperties = [
    {
      id: 'prop1',
      title: 'Residential Plot in Murray Town',
      type: 'residential',
      size: 500,
      location: {
        address: '15 Wilkinson Road',
        area: 'Murray Town',
        city: 'Freetown',
        coordinates: '8.4897° N, 13.2347° W'
      },
      price: 250000,
      status: 'registered',
      registrationDate: '2024-01-15',
      owner: {
        name: 'John Doe',
        contact: '+232 76 123 456'
      },
      description: 'Prime residential plot with good road access',
    //   images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
      images: ['/Land/land2.jpg', '/Land/land3.jpg'],
      documents: ['deed.pdf', 'survey_plan.pdf'],
      verificationStatus: "Unverified"
      
    },
    {
      id: 'prop2',
      title: 'Commercial Property in Aberdeen',
      type: 'commercial',
      size: 1200,
      location: {
        address: '7 Beach Road',
        area: 'Aberdeen',
        city: 'Freetown',
        coordinates: '8.4775° N, 13.2875° W'
      },
      price: 750000,
      status: 'pending',
      registrationDate: '2024-02-20',
      owner: {
        name: 'Sarah Williams',
        contact: '+232 76 789 012'
      },
      description: 'Large commercial space near Aberdeen beach',
      images: ['/Land/land1.jpg', '/Land/land5.jpg'],
      documents: ['commercial_deed.pdf', 'business_permit.pdf'],
      verificationStatus: "Unverified"
    },
    {
      id: 'prop3',
      title: 'Agricultural Land in Waterloo',
      type: 'agricultural',
      size: 5000,
      location: {
        address: 'Waterloo Rural District',
        area: 'Waterloo',
        city: 'Freetown',
        coordinates: '8.3380° N, 13.0683° W'
      },
      price: 180000,
      status: 'registered',
      registrationDate: '2024-03-01',
      owner: {
        name: 'Michael Johnson',
        contact: '+232 76 345 678'
      },
      description: 'Fertile agricultural land with water access',
      images: ['/Land/land5.jpg', '/Land/land6.jpg'],
      documents: ['land_title.pdf'],
      verificationStatus: "verified"
    },
    // Add more properties as needed
  ];