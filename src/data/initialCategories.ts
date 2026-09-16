import { Category, Division } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  // 1. PHARMACEUTICALS & HEALTHCARE
  {
    id: 'cat-pharma-01',
    name: 'Anti-Diabetics',
    division: 'PHARMACEUTICALS & HEALTHCARE',
    description: 'Oral hypoglycemic tablets, GLP-1 analogues, insulin sensitizers, and diabetes monitoring solutions.',
    subcategories: [
      { id: 'sub-pharma-01-1', name: 'Sulfonylureas (Gliclazide/Glimepiride)', categoryId: 'cat-pharma-01', description: 'Pancreatic insulin secretagogues for Type 2 diabetes.' },
      { id: 'sub-pharma-01-2', name: 'Biguanides (Metformin Formulations)', categoryId: 'cat-pharma-01', description: 'First-line insulin sensitizers.' },
      { id: 'sub-pharma-01-3', name: 'DPP-4 Inhibitors & SGLT2', categoryId: 'cat-pharma-01', description: 'Modern renal and incretin-based glycaemic controllers.' }
    ]
  },
  {
    id: 'cat-pharma-02',
    name: 'Cardiovascular Care',
    division: 'PHARMACEUTICALS & HEALTHCARE',
    description: 'Statins, lipid-lowering compounds, antihypertensives, and beta-blockers.',
    subcategories: [
      { id: 'sub-pharma-02-1', name: 'Statins & Lipid Regulators', categoryId: 'cat-pharma-02', description: 'Atorvastatin, Rosuvastatin for LDL reduction.' },
      { id: 'sub-pharma-02-2', name: 'Antihypertensives (ARBs & CCBs)', categoryId: 'cat-pharma-02', description: 'Blood pressure control formulations.' },
      { id: 'sub-pharma-02-3', name: 'Antiplatelets & Anticoagulants', categoryId: 'cat-pharma-02', description: 'Clopidogrel and cardio-aspirin.' }
    ]
  },
  {
    id: 'cat-pharma-03',
    name: 'Antibiotics',
    division: 'PHARMACEUTICALS & HEALTHCARE',
    description: 'High-efficacy broad-spectrum bacterial infection treatments.',
    subcategories: [
      { id: 'sub-pharma-03-1', name: 'Broad-Spectrum Penicillins', categoryId: 'cat-pharma-03', description: 'Amoxicillin, Clavulanic acid compounds.' },
      { id: 'sub-pharma-03-2', name: 'Cephalosporins (Cefixime, Cefuroxime)', categoryId: 'cat-pharma-03', description: 'Second and third generation systemic antibiotics.' },
      { id: 'sub-pharma-03-3', name: 'Macrolides & Quinolones', categoryId: 'cat-pharma-03', description: 'Azithromycin and Ciprofloxacin regimens.' }
    ]
  },
  {
    id: 'cat-pharma-04',
    name: 'Biosimilars',
    division: 'PHARMACEUTICALS & HEALTHCARE',
    description: 'Advanced biotechnology and biological medicines produced under European-certified standards.',
    subcategories: [
      { id: 'sub-pharma-04-1', name: 'Erythropoietin (EPO)', categoryId: 'cat-pharma-04', description: 'Pre-filled syringes for chronic renal anemia.' },
      { id: 'sub-pharma-04-2', name: 'Colony Stimulating Factors (G-CSF)', categoryId: 'cat-pharma-04', description: 'Oncology supportive therapeutics.' }
    ]
  },
  {
    id: 'cat-pharma-05',
    name: 'OTC Medicines',
    division: 'PHARMACEUTICALS & HEALTHCARE',
    description: 'Everyday over-the-counter wellness, analgesics, antipyretics, and vitamin supplements.',
    subcategories: [
      { id: 'sub-pharma-05-1', name: 'Paracetamol & Antipyretics', categoryId: 'cat-pharma-05', description: 'Fast pain and fever relief (Fast-ACI).' },
      { id: 'sub-pharma-05-2', name: 'Antihistamines & Cough Syrups', categoryId: 'cat-pharma-05', description: 'Allergy and respiratory comfort.' },
      { id: 'sub-pharma-05-3', name: 'Nutraceuticals & Multivitamins', categoryId: 'cat-pharma-05', description: 'Daily essential mineral and vitamin tablets.' }
    ]
  },
  {
    id: 'cat-pharma-06',
    name: 'Intravenous Fluids',
    division: 'PHARMACEUTICALS & HEALTHCARE',
    description: 'Sterile closed-system IV solutions for fluid replacement and electrolyte stabilization.',
    subcategories: [
      { id: 'sub-pharma-06-1', name: 'Normal Saline (0.9% NaCl)', categoryId: 'cat-pharma-06', description: 'Sterile hydration and medication reconstitution.' },
      { id: 'sub-pharma-06-2', name: 'Dextrose & Saline Combos', categoryId: 'cat-pharma-06', description: 'Energetic rehydration and postoperative recovery.' }
    ]
  },
  {
    id: 'cat-pharma-07',
    name: 'Respiratory Care',
    division: 'PHARMACEUTICALS & HEALTHCARE',
    description: 'Metered dose inhalers, rotacaps, and dry powder inhalers for asthma and COPD.',
    subcategories: [
      { id: 'sub-pharma-07-1', name: 'Salbutamol / Bronchodilator Inhalers', categoryId: 'cat-pharma-07', description: 'Emergency and maintenance asthma relief.' },
      { id: 'sub-pharma-07-2', name: 'Inhaled Corticosteroids', categoryId: 'cat-pharma-07', description: 'Long-term airway anti-inflammatory management.' }
    ]
  },

  // 2. CONSUMER BRANDS & FOODS
  {
    id: 'cat-cb-01',
    name: 'Home & Personal Care',
    division: 'CONSUMER BRANDS & FOODS',
    description: 'Flagship hygiene brands including Savlon, ACI Aerosol, Angelic, and Colgate.',
    subcategories: [
      { id: 'sub-cb-01-1', name: 'Antiseptics & Wound Care', categoryId: 'cat-cb-01', description: 'Savlon Liquid, Savlon Antiseptic Cream, Hospital Concentrates.' },
      { id: 'sub-cb-01-2', name: 'Soaps & Hand Hygiene', categoryId: 'cat-cb-01', description: 'Savlon Active Bar Soaps, Handwash refills and pump bottles.' },
      { id: 'sub-cb-01-3', name: 'Insect & Mosquito Repellents', categoryId: 'cat-cb-01', description: 'ACI Aerosol Insect Spray, Mosquito coils, electrical vaporizers.' },
      { id: 'sub-cb-01-4', name: 'Oral Care & Hygiene', categoryId: 'cat-cb-01', description: 'Colgate Strong Teeth toothpaste, toothbrush combos.' }
    ]
  },
  {
    id: 'cat-cb-02',
    name: 'Foods & Commodities',
    division: 'CONSUMER BRANDS & FOODS',
    description: 'Purity guaranteed staple grocery items, flours, edible oils, spices, and snacks.',
    subcategories: [
      { id: 'sub-cb-02-1', name: 'Pure Flours & Grains', categoryId: 'cat-cb-02', description: 'ACI Pure Atta, Maida, Suji, Miniket and Chinigura rice.' },
      { id: 'sub-cb-02-2', name: 'Iodized Salt & Seasonings', categoryId: 'cat-cb-02', description: 'Vacuum evaporated 100% pure iodized table salt.' },
      { id: 'sub-cb-02-3', name: 'Edible Oils', categoryId: 'cat-cb-02', description: 'Fortified Soyabean Oil, Pure Mustard Oil.' },
      { id: 'sub-cb-02-4', name: 'Spices & Culinary Mixes', categoryId: 'cat-cb-02', description: 'Pure Turmeric, Chili, Coriander, Meat Curry Masalas.' },
      { id: 'sub-cb-02-5', name: 'Snacks & Beverages', categoryId: 'cat-cb-02', description: 'ACI Fun Chanachur, Sunquick Fruit concentrates, crackers.' }
    ]
  },
  {
    id: 'cat-cb-03',
    name: 'Plastics & Electronics',
    division: 'CONSUMER BRANDS & FOODS',
    description: 'ACI Premio homeware, LED lighting, switches, and energy-saving electricals.',
    subcategories: [
      { id: 'sub-cb-03-1', name: 'Premio Plastic Homeware', categoryId: 'cat-cb-03', description: 'Storage containers, kitchenware, ergonomic chairs.' },
      { id: 'sub-cb-03-2', name: 'Energy-Saving LED Lighting', categoryId: 'cat-cb-03', description: 'ACI LED bulbs, tube lights, industrial flood lights.' }
    ]
  },

  // 3. AGRIBUSINESS
  {
    id: 'cat-agri-01',
    name: 'Agricultural Machinery',
    division: 'AGRIBUSINESS',
    description: 'ACI Motors high-productivity tractors, harvesters, and mechanized farm implements.',
    subcategories: [
      { id: 'sub-agri-01-1', name: 'Sonalika & Yanmar Tractors', categoryId: 'cat-agri-01', description: '35HP - 90HP multi-utility farming tractors.' },
      { id: 'sub-agri-01-2', name: 'Combine Harvesters & Transplanters', categoryId: 'cat-agri-01', description: 'Track-type paddy harvesters and mechanical transplanters.' },
      { id: 'sub-agri-01-3', name: 'Irrigation & Power Tillers', categoryId: 'cat-agri-01', description: 'Centrifugal diesel water pumps and compact rotavators.' }
    ]
  },
  {
    id: 'cat-agri-02',
    name: 'Livestock & Feed',
    division: 'AGRIBUSINESS',
    description: 'Scientifically balanced poultry, dairy cattle, and aquaculture nutrition feeds.',
    subcategories: [
      { id: 'sub-agri-02-1', name: 'Poultry Nutrition Feeds', categoryId: 'cat-agri-02', description: 'Broiler starter, grower, and layer feed bags.' },
      { id: 'sub-agri-02-2', name: 'Aqua & Fish Feeds', categoryId: 'cat-agri-02', description: 'Floating fish pellets for pangas, tilapia, and carp.' },
      { id: 'sub-agri-02-3', name: 'Veterinary Medicines & Vaccines', categoryId: 'cat-agri-02', description: 'Livestock dewormers, antibiotics, and calcium boosters.' }
    ]
  },
  {
    id: 'cat-agri-03',
    name: 'Automobiles & Spares',
    division: 'AGRIBUSINESS',
    description: 'Yamaha motorcycles, authentic spare parts, and Yamalube performance lubricants.',
    subcategories: [
      { id: 'sub-agri-03-1', name: 'Yamaha Motorcycles', categoryId: 'cat-agri-03', description: 'Commuter and premium sports street bikes.' },
      { id: 'sub-agri-03-2', name: 'OEM Spare Parts & Lubricants', categoryId: 'cat-agri-03', description: 'Genuine brake pads, chain sprockets, and Yamalube engine oil.' }
    ]
  },

  // 4. CROP CARES
  {
    id: 'cat-crop-01',
    name: 'Hybrid Seeds',
    division: 'CROP CARES',
    description: 'ACI Seed high-yield hybrid rice, maize, and export-grade hybrid vegetable seeds.',
    subcategories: [
      { id: 'sub-crop-01-1', name: 'Hybrid Paddy & Rice Seeds', categoryId: 'cat-crop-01', description: 'Alonkar, Subarna, and climate-resilient hybrid seeds.' },
      { id: 'sub-crop-01-2', name: 'Hybrid Maize Seeds', categoryId: 'cat-crop-01', description: 'Don Maize, high starch yield seed varieties.' },
      { id: 'sub-crop-01-3', name: 'Vegetable & Fruit Seeds', categoryId: 'cat-crop-01', description: 'Hybrid tomato, chili, cabbage, and gourd seeds.' }
    ]
  },
  {
    id: 'cat-crop-02',
    name: 'Crop Protection',
    division: 'CROP CARES',
    description: 'ACI Formulations certified fungicides, insecticides, herbicides, and bio-nutrients.',
    subcategories: [
      { id: 'sub-crop-02-1', name: 'Fungicides & Disease Control', categoryId: 'cat-crop-02', description: 'ACI Carbendazim 50 WP, Mancozeb formulations.' },
      { id: 'sub-crop-02-2', name: 'Insecticides & Pest Control', categoryId: 'cat-crop-02', description: 'Chlorpyrifos 20 EC, Cartap, and Lambda-cyhalothrin.' },
      { id: 'sub-crop-02-3', name: 'Herbicides & Micronutrients', categoryId: 'cat-crop-02', description: 'Selective weed killers and ACI Maize-Mix micronutrients.' }
    ]
  },

  // 5. RETAIL & LOGISTICS
  {
    id: 'cat-retail-01',
    name: 'Fresh Produce',
    division: 'RETAIL & LOGISTICS',
    description: 'Shwapno farm-fresh fruits, vegetables, and chemical-free staple potatoes.',
    subcategories: [
      { id: 'sub-retail-01-1', name: 'Direct Farm Vegetables', categoryId: 'cat-retail-01', description: 'Diamond potatoes, fresh red onions, green chilies.' },
      { id: 'sub-retail-01-2', name: 'Seasonal Fresh Fruits', categoryId: 'cat-retail-01', description: 'Organic sagor bananas, apples, oranges.' }
    ]
  },
  {
    id: 'cat-retail-02',
    name: 'Groceries',
    division: 'RETAIL & LOGISTICS',
    description: 'Shwapno premium packaged grocery items, pure ghee, and gourmet teas.',
    subcategories: [
      { id: 'sub-retail-02-1', name: 'Dairy & Premium Ghee', categoryId: 'cat-retail-02', description: 'Shwapno pure cow ghee, pasteurized milk packs.' },
      { id: 'sub-retail-02-2', name: 'Pantry Essentials & Tea', categoryId: 'cat-retail-02', description: 'Specialty tea blends, lentils, mustard oil.' }
    ]
  },
  {
    id: 'cat-retail-03',
    name: 'Clothing & Lifestyle',
    division: 'RETAIL & LOGISTICS',
    description: 'Shwapno lifestyle apparels, home textiles, and bath towels.',
    subcategories: [
      { id: 'sub-retail-03-1', name: 'Home Linens & Towels', categoryId: 'cat-retail-03', description: '100% cotton bath towels, bedsheets.' }
    ]
  },

  // 6. TECHNOLOGY, COMMUNICATION & SERVICES
  {
    id: 'cat-tech-01',
    name: 'Enterprise Tech',
    division: 'TECHNOLOGY, COMMUNICATION & SERVICES',
    description: 'INFOLYTX and Stochastic Logic AI solutions, IoT monitoring, and enterprise automation.',
    subcategories: [
      { id: 'sub-tech-01-1', name: 'AI & Data Intelligence Systems', categoryId: 'cat-tech-01', description: 'Predictive inventory, computer vision QA.' },
      { id: 'sub-tech-01-2', name: 'Supply Chain & ERP Suites', categoryId: 'cat-tech-01', description: 'Custom ERP and dealer distribution networks.' }
    ]
  },
  {
    id: 'cat-tech-02',
    name: 'Marketing Services',
    division: 'TECHNOLOGY, COMMUNICATION & SERVICES',
    description: 'Creative Communication 360-degree brand positioning, media, and digital campaigns.',
    subcategories: [
      { id: 'sub-tech-02-1', name: 'Digital & Media Campaigns', categoryId: 'cat-tech-02', description: 'Creative production, television commercials, branding.' }
    ]
  },
  {
    id: 'cat-tech-03',
    name: 'Aviation Services',
    division: 'TECHNOLOGY, COMMUNICATION & SERVICES',
    description: 'ACI Avionics helicopter chartering, air ambulance, and aircraft maintenance.',
    subcategories: [
      { id: 'sub-tech-03-1', name: 'Emergency Air Ambulance & Charter', categoryId: 'cat-tech-03', description: 'Rapid patient transport and VIP executive charters.' }
    ]
  },
  {
    id: 'cat-tech-04',
    name: 'Analytical Services',
    division: 'TECHNOLOGY, COMMUNICATION & SERVICES',
    description: 'Advanced laboratory assay, water testing, residue screening, and chemical validation.',
    subcategories: [
      { id: 'sub-tech-04-1', name: 'Soil & Chemical Lab Testing', categoryId: 'cat-tech-04', description: 'Spectrometry, microbial safety, fertilizer assay.' }
    ]
  }
];

export const DIVISION_LIST: Division[] = [
  'PHARMACEUTICALS & HEALTHCARE',
  'AGRIBUSINESS',
  'CONSUMER BRANDS & FOODS',
  'RETAIL & LOGISTICS',
  'CROP CARES',
  'TECHNOLOGY, COMMUNICATION & SERVICES'
];

/**
 * Helper to generate subcategories automatically based on a category name and division
 */
export function generateDefaultSubcategoriesForCategory(categoryName: string, categoryId: string): { id: string; name: string; categoryId: string; description: string }[] {
  const norm = categoryName.toLowerCase();
  
  if (norm.includes('diabet') || norm.includes('sugar')) {
    return [
      { id: `${categoryId}-sub1`, name: 'Oral Hypoglycemic Agents', categoryId, description: 'Type 2 glycaemic control' },
      { id: `${categoryId}-sub2`, name: 'Insulin Sensitizers & Metformin', categoryId, description: 'Metabolic management' },
      { id: `${categoryId}-sub3`, name: 'Blood Glucose Testing & Strips', categoryId, description: 'Self monitoring devices' }
    ];
  }
  
  if (norm.includes('cardio') || norm.includes('heart') || norm.includes('blood pressure')) {
    return [
      { id: `${categoryId}-sub1`, name: 'Lipid Lowering & Statins', categoryId, description: 'Cholesterol management' },
      { id: `${categoryId}-sub2`, name: 'Antihypertensive Regimens', categoryId, description: 'Blood pressure control' },
      { id: `${categoryId}-sub3`, name: 'Antiplatelet & Cardio Protect', categoryId, description: 'Cardiovascular maintenance' }
    ];
  }

  if (norm.includes('antibiotic') || norm.includes('infect') || norm.includes('pharma')) {
    return [
      { id: `${categoryId}-sub1`, name: 'Penicillins & Beta-Lactam', categoryId, description: 'Systemic bactericidal drugs' },
      { id: `${categoryId}-sub2`, name: 'Cephalosporins & Macrolides', categoryId, description: 'Respiratory and dermal antibiotics' },
      { id: `${categoryId}-sub3`, name: 'Pediatric Antibiotic Suspensions', categoryId, description: 'Childhood infection treatment' }
    ];
  }

  if (norm.includes('food') || norm.includes('grain') || norm.includes('flour') || norm.includes('atta') || norm.includes('rice')) {
    return [
      { id: `${categoryId}-sub1`, name: 'Premium Atta, Maida & Suji', categoryId, description: 'Purity guaranteed milled grains' },
      { id: `${categoryId}-sub2`, name: 'Aromatic & Miniket Rice', categoryId, description: 'Selected fine dining rice' },
      { id: `${categoryId}-sub3`, name: 'Spices & Cooking Essentials', categoryId, description: 'Pure ground culinary spices' }
    ];
  }

  if (norm.includes('hygiene') || norm.includes('personal') || norm.includes('care') || norm.includes('soap') || norm.includes('clean')) {
    return [
      { id: `${categoryId}-sub1`, name: 'Antiseptic & Disinfectant Liquids', categoryId, description: 'Surface and skin germ protection' },
      { id: `${categoryId}-sub2`, name: 'Bar Soaps & Handwashes', categoryId, description: 'Everyday skin hydration and hygiene' },
      { id: `${categoryId}-sub3`, name: 'First Aid Creams & Lotions', categoryId, description: 'Minor burn and wound healing' }
    ];
  }

  if (norm.includes('seed') || norm.includes('crop') || norm.includes('plant')) {
    return [
      { id: `${categoryId}-sub1`, name: 'High-Yield Hybrid Paddy', categoryId, description: 'Boro & Aman seasonal hybrid seeds' },
      { id: `${categoryId}-sub2`, name: 'Hybrid Maize & Cash Crops', categoryId, description: 'High germination grain seeds' },
      { id: `${categoryId}-sub3`, name: 'Export Vegetable Varieties', categoryId, description: 'Gourd, chili, tomato hybrid seeds' }
    ];
  }

  if (norm.includes('feed') || norm.includes('poultry') || norm.includes('fish') || norm.includes('livestock')) {
    return [
      { id: `${categoryId}-sub1`, name: 'Broiler & Layer Feeds', categoryId, description: 'Optimal FCR poultry diets' },
      { id: `${categoryId}-sub2`, name: 'Floating Aqua Feeds', categoryId, description: 'Extruded high-protein fish pellets' },
      { id: `${categoryId}-sub3`, name: 'Livestock Health Supplements', categoryId, description: 'Dairy minerals and vitamins' }
    ];
  }

  if (norm.includes('machin') || norm.includes('tractor') || norm.includes('motor') || norm.includes('harvester')) {
    return [
      { id: `${categoryId}-sub1`, name: 'High-Torque Farming Tractors', categoryId, description: 'Multi-cylinder field tractors' },
      { id: `${categoryId}-sub2`, name: 'Combine Paddy Harvesters', categoryId, description: 'Mechanized cutting and threshing' },
      { id: `${categoryId}-sub3`, name: 'Genuine Replacement Spares', categoryId, description: 'OEM parts, belts, and filters' }
    ];
  }

  // Default fallback 3 subcategories
  return [
    { id: `${categoryId}-sub1`, name: `Standard ${categoryName} Line`, categoryId, description: `Core products under ${categoryName}` },
    { id: `${categoryId}-sub2`, name: `Premium ${categoryName} Collection`, categoryId, description: `Specialized tier for ${categoryName}` },
    { id: `${categoryId}-sub3`, name: `Commercial & Bulk Packaging`, categoryId, description: `Wholesale supplies and packs` }
  ];
}
