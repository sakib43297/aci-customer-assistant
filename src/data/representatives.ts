export interface BusinessRepresentative {
  name: string;
  title: string;
  email: string;
  mobile: string;
  business: string;
  region: string;
}

export const BUSINESS_REPRESENTATIVES: Record<string, BusinessRepresentative> = {
  // PHARMACEUTICALS & HEALTHCARE
  'ACI Limited (Pharma)': {
    name: 'S. M. Ashraful Islam',
    title: 'Area Sales Manager (Pharma)',
    email: 'ashraful.islam@aci-bd.com',
    mobile: '+880 1711-234567',
    business: 'ACI Limited (Pharma)',
    region: 'Dhaka Division'
  },
  'ACI HealthCare Limited': {
    name: 'Dr. Fahim Rahman',
    title: 'Territory Sales Officer',
    email: 'fahim.rahman@aci-bd.com',
    mobile: '+880 1819-876543',
    business: 'ACI HealthCare Limited',
    region: 'Dhaka South'
  },
  'ACI Biotech Limited': {
    name: 'Nazmul Hassan',
    title: 'Biosimilar Product Lead',
    email: 'nazmul.hassan@aci-bd.com',
    mobile: '+880 1912-345678',
    business: 'ACI Biotech Limited',
    region: 'National Headquarters'
  },
  'ACI Herbal and Nutraceuticals Ltd': {
    name: 'Tasnim Ahmed',
    title: 'Brand Manager (OTC & Herbs)',
    email: 'tasnim.ahmed@aci-bd.com',
    mobile: '+880 1511-223344',
    business: 'ACI Herbal and Nutraceuticals Ltd',
    region: 'Dhaka Central'
  },

  // AGRIBUSINESS
  'ACI Agribusinesses': {
    name: 'Mamunur Rashid',
    title: 'Senior Agribusiness Executive',
    email: 'mamunur.rashid@aci-bd.com',
    mobile: '+880 1712-233445',
    business: 'ACI Agribusinesses',
    region: 'Rajshahi Region'
  },
  'ACI Agrolink Limited': {
    name: 'Rafiqul Islam',
    title: 'Supply Chain Coordinator',
    email: 'rafiqul.islam@aci-bd.com',
    mobile: '+880 1815-566778',
    business: 'ACI Agrolink Limited',
    region: 'Chittagong Port Zone'
  },
  'ACI Marine and Riverine Technologies Limited': {
    name: 'Engr. Tareq Jamil',
    title: 'Marine Services Lead',
    email: 'tareq.jamil@aci-bd.com',
    mobile: '+880 1611-223344',
    business: 'ACI Marine and Riverine Technologies Limited',
    region: 'Khulna/Sunderbans Zone'
  },
  'ACI Motors Limited': {
    name: 'Subrata Ranjan Das',
    title: 'Sales & Delivery Director',
    email: 'subrata.das@aci-bd.com',
    mobile: '+880 1711-998877',
    business: 'ACI Motors Limited',
    region: 'All Bangladesh'
  },
  'Premiaflex Plastics Limited': {
    name: 'Mahbubul Alam',
    title: 'Enterprise Accounts Manager',
    email: 'mahbubul.alam@premiaflex.com',
    mobile: '+880 1714-455667',
    business: 'Premiaflex Plastics Limited',
    region: 'Gazipur Industrial Zone'
  },

  // CONSUMER BRANDS & FOODS
  'ACI Foods Limited': {
    name: 'Kamruzzaman Kamal',
    title: 'Marketing & Distribution Director',
    email: 'kamruzzaman.kamal@aci-bd.com',
    mobile: '+880 1713-011223',
    business: 'ACI Foods Limited',
    region: 'National'
  },
  'ACI Pure Flour Limited': {
    name: 'Moinuddin Jamil',
    title: 'Senior Logistics Coordinator',
    email: 'moinuddin.jamil@aci-bd.com',
    mobile: '+880 1715-566889',
    business: 'ACI Pure Flour Limited',
    region: 'Narayanganj Plant'
  },
  'ACI Salt Limited': {
    name: 'Zaman Chowdhury',
    title: 'Head of National Trade Sales',
    email: 'zaman.chowdhury@aci-bd.com',
    mobile: '+880 1713-445566',
    business: 'ACI Salt Limited',
    region: 'National'
  },
  'ACI Edible Oils Limited': {
    name: 'Sazzadul Karim',
    title: 'Operations & Supply Manager',
    email: 'sazzadul.karim@aci-bd.com',
    mobile: '+880 1817-788990',
    business: 'ACI Edible Oils Limited',
    region: 'Dhaka West'
  },
  'Neem Laboratories (Pvt.) Ltd.': {
    name: 'Yasir Arafat',
    title: 'National Brand Manager',
    email: 'yasir.arafat@aci-bd.com',
    mobile: '+880 1915-544332',
    business: 'Neem Laboratories (Pvt.) Ltd.',
    region: 'Dhaka Central'
  },

  // RETAIL & LOGISTICS
  'ACI Logistics Limited (Shwapno)': {
    name: 'Sabbir Hasan Nasir',
    title: 'Executive Distribution Director',
    email: 'sabbir.nasir@shwapno.com',
    mobile: '+880 1711-559988',
    business: 'ACI Logistics Limited (Shwapno)',
    region: 'Dhaka Metro Retail'
  },
  'ACI Shwapno e-Commerce Limited': {
    name: 'Mahadi Faisal',
    title: 'Head of e-Commerce Logistics',
    email: 'mahadi.faisal@shwapno.com',
    mobile: '+880 1713-009988',
    business: 'ACI Shwapno e-Commerce Limited',
    region: 'Dhaka & Online Delivery'
  },

  // CROP CARES
  'ACI Formulations PLC': {
    name: 'Abdus Sabur',
    title: 'Technical & Delivery Manager',
    email: 'abdus.sabur@aci-bd.com',
    mobile: '+880 1711-442211',
    business: 'ACI Formulations PLC',
    region: 'Mymensingh Plant Zone'
  },
  'ACI Seed Limited': {
    name: 'Sudhir Chandra Nath',
    title: 'Business Director & Seeds Lead',
    email: 'sudhir.nath@aci-bd.com',
    mobile: '+880 1713-334455',
    business: 'ACI Seed Limited',
    region: 'All Bangladesh Agronomy'
  },

  // TECHNOLOGY, COMMUNICATION & SERVICES
  'INFOLYTX Bangladesh Limited': {
    name: 'Rubel Ahmed',
    title: 'Enterprise Technical Lead',
    email: 'rubel.ahmed@infolytx.com',
    mobile: '+880 1711-225566',
    business: 'INFOLYTX Bangladesh Limited',
    region: 'Software Delivery Division'
  },
  'Creative Communication Limited': {
    name: 'Syed Gousul Alam Shaon',
    title: 'Managing Director & Media Lead',
    email: 'shaon@creativecomm.com',
    mobile: '+880 1711-553311',
    business: 'Creative Communication Limited',
    region: 'Creative Services HQ'
  },
  'ACI Avionics and Airlines Services Limited': {
    name: 'Capt. Tasnim Hasan',
    title: 'Head of Cargo Operations',
    email: 'tasnim.hasan@aci-bd.com',
    mobile: '+880 1711-993322',
    business: 'ACI Avionics and Airlines Services Limited',
    region: 'Hazrat Shahjalal Int Airport'
  },
  'Stochastic Logic Limited': {
    name: 'Dr. Arifur Rahman',
    title: 'Risk Modeling & Delivery Lead',
    email: 'arifur.rahman@stochasticlogic.com',
    mobile: '+880 1711-664422',
    business: 'Stochastic Logic Limited',
    region: 'Analytical Systems Division'
  }
};

export const DEFAULT_REPRESENTATIVE: BusinessRepresentative = {
  name: 'General ACI Delivery Team',
  title: 'Logistics Liaison Officer',
  email: 'delivery.hub@aci-bd.com',
  mobile: '+880 9606-6666',
  business: 'ACI General Delivery Hub',
  region: 'All Bangladesh'
};

export function getRepresentativeForBusiness(businessName?: string): BusinessRepresentative {
  if (!businessName) return DEFAULT_REPRESENTATIVE;
  return BUSINESS_REPRESENTATIVES[businessName] || DEFAULT_REPRESENTATIVE;
}
