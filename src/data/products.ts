import { Product, Division } from '../types';

export const ACI_PRODUCTS: Product[] = [
  // ==========================================
  // 1. PHARMACEUTICALS & HEALTHCARE
  // ==========================================
  {
    id: 'ph-001',
    name: 'Glis-ACI (Gliclazide 80mg)',
    division: 'PHARMACEUTICALS & HEALTHCARE',
    business: 'ACI Limited (Pharma)',
    category: 'Anti-Diabetics',
    description: 'Oral hypoglycemic agent used to control blood glucose level in type 2 diabetes mellitus.',
    price: 320,
    unit: '100 Tablets (Box)',
    useCase: 'Long-term management of Type 2 Diabetes Mellitus under prescription.',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'ph-002',
    name: 'Atorva-ACI (Atorvastatin 10mg)',
    division: 'PHARMACEUTICALS & HEALTHCARE',
    business: 'ACI Limited (Pharma)',
    category: 'Cardiovascular Care',
    description: 'HMG-CoA reductase inhibitor (statin) used to lower LDL cholesterol and triglycerides.',
    price: 450,
    unit: '30 Tablets (Box)',
    useCase: 'Reduction of elevated total cholesterol, LDL-cholesterol, and cardiovascular risks.',
    image: 'https://images.unsplash.com/photo-1631549916768-4119b29ed2ec?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'ph-003',
    name: 'Amox-ACI (Amoxicillin 500mg)',
    division: 'PHARMACEUTICALS & HEALTHCARE',
    business: 'ACI HealthCare Limited',
    category: 'Antibiotics',
    description: 'Broad-spectrum penicillin antibiotic used to treat bacterial infections of the respiratory, urinary, and skin tract.',
    price: 280,
    unit: '100 Capsules (Box)',
    useCase: 'Treatment of ear, nose, throat, urinary tract, and respiratory infections.',
    image: 'https://images.unsplash.com/photo-1607619056574-7b8d304f2c38?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'ph-004',
    name: 'Epo-ACI (Biosimilar Erythropoietin 4000 IU)',
    division: 'PHARMACEUTICALS & HEALTHCARE',
    business: 'ACI Biotech Limited',
    category: 'Biosimilars',
    description: 'Recombinant human erythropoietin used to stimulate red blood cell production in anemia of chronic kidney disease.',
    price: 1800,
    unit: '1 Pre-filled Syringe',
    useCase: 'Treatment of symptomatic anemia associated with chronic renal failure.',
    image: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'ph-005',
    name: 'Fast-ACI (Paracetamol 500mg)',
    division: 'PHARMACEUTICALS & HEALTHCARE',
    business: 'ACI Herbal and Nutraceuticals Ltd',
    category: 'OTC Medicines',
    description: 'Fast-acting analgesic and antipyretic for relief of mild-to-moderate pain and reduction of fever.',
    price: 80,
    unit: '100 Tablets (Box)',
    useCase: 'Quick relief from headaches, body aches, toothaches, and high temperature.',
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'ph-006',
    name: 'Salu-ACI IV Fluid (Normal Saline 0.9%)',
    division: 'PHARMACEUTICALS & HEALTHCARE',
    business: 'ACI HealthCare Limited',
    category: 'Intravenous Fluids',
    description: 'Sterile isotonic sodium chloride solution for fluid replacement and electrolyte balance.',
    price: 85,
    unit: '500ml Bottle',
    useCase: 'Rehydration, fluid resuscitation, and vehicle for intravenous drug administration.',
    image: 'https://images.unsplash.com/photo-1516617442634-75371039cb3a?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'ph-007',
    name: 'Respi-ACI (Salbutamol Inhaler 100mcg)',
    division: 'PHARMACEUTICALS & HEALTHCARE',
    business: 'ACI Limited (Pharma)',
    category: 'Respiratory Care',
    description: 'Bronchodilator inhaler providing rapid relief from asthma attacks, bronchospasm, and COPD.',
    price: 210,
    unit: '200 Puffs (Inhaler)',
    useCase: 'Relief and prevention of asthma and chronic obstructive pulmonary disease symptoms.',
    image: 'https://images.unsplash.com/photo-1598207953092-2e400b6cc191?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'ph-008',
    name: 'Spasmo-ACI (Tiemonium Methylsulphate 50mg)',
    division: 'PHARMACEUTICALS & HEALTHCARE',
    business: 'ACI Limited (Pharma)',
    category: 'Gastrointestinal & Acid Relief',
    description: 'Specialized antispasmodic medicine formulated for rapid relief of visceral stomach pain, acute abdominal cramps, gastrointestinal spasms, and intestinal colic.',
    price: 150,
    unit: '30 Tablets (Box)',
    useCase: 'Fast relief of acute stomach pain, abdominal cramps, intestinal spasm, and gastrointestinal colic.',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'ph-009',
    name: 'Panto-ACI (Pantoprazole 20mg)',
    division: 'PHARMACEUTICALS & HEALTHCARE',
    business: 'ACI Limited (Pharma)',
    category: 'Gastrointestinal & Acid Relief',
    description: 'Proton Pump Inhibitor (PPI) providing long-lasting acid suppression and relief from stomach pain caused by hyperacidity, gastric/peptic ulcers, GERD, and heartburn.',
    price: 140,
    unit: '50 Tablets (Box)',
    useCase: 'Treatment and relief of gastric ulcers, severe acidity, burning stomach pain, and acid reflux.',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'ph-010',
    name: 'Antacid-ACI Plus Suspension',
    division: 'PHARMACEUTICALS & HEALTHCARE',
    business: 'ACI Limited (Pharma)',
    category: 'OTC Medicines',
    description: 'Fast-acting liquid suspension combining Magaldrate and Simethicone for instant neutralization of stomach acid, soothing stomach burning, and relieving trapped gas bloating.',
    price: 120,
    unit: '200ml Bottle',
    useCase: 'Rapid symptomatic relief of acute burning stomach pain, gas bloating, hyperacidity, and indigestion.',
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'ph-011',
    name: 'Omep-ACI (Omeprazole 20mg)',
    division: 'PHARMACEUTICALS & HEALTHCARE',
    business: 'ACI Limited (Pharma)',
    category: 'Gastrointestinal & Acid Relief',
    description: 'Effective proton pump inhibitor capsule offering 24-hour protection against stomach ulcers, severe gastric burning, and acid dyspepsia.',
    price: 95,
    unit: '100 Capsules (Box)',
    useCase: 'Symptomatic relief of acid-related stomach pain, dyspepsia, and gastric mucosal healing.',
    image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&q=80&w=400'
  },

  // ==========================================
  // 2. CONSUMER BRANDS & FOODS
  // ==========================================
  {
    id: 'cb-001',
    name: 'Savlon Antiseptic Liquid',
    division: 'CONSUMER BRANDS & FOODS',
    business: 'Neem Laboratories (Pvt.) Ltd.',
    category: 'Home & Personal Care',
    description: 'Chlorhexidine gluconate and Cetrimide formulation offering superior germ protection for wounds, bathing, and household hygiene.',
    price: 195,
    unit: '500ml Bottle',
    useCase: 'Disinfection of cuts, bites, grazes, skin cleansing, and surface hygiene.',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'cb-002',
    name: 'Savlon Antiseptic Cream',
    division: 'CONSUMER BRANDS & FOODS',
    business: 'Neem Laboratories (Pvt.) Ltd.',
    category: 'Home & Personal Care',
    description: 'Soothing antiseptic cream that fights germs and prevents infections in minor cuts, scrapes, and burns while promoting healing.',
    price: 65,
    unit: '30g Tube',
    useCase: 'First-aid application for minor skin injuries, small burns, and insect bites.',
    image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'cb-003',
    name: 'Savlon Active Soap',
    division: 'CONSUMER BRANDS & FOODS',
    business: 'Neem Laboratories (Pvt.) Ltd.',
    category: 'Home & Personal Care',
    description: 'Antibacterial bath soap with the goodness of Savlon protection to keep the entire family fresh and safe from bacteria.',
    price: 75,
    unit: '125g Bar',
    useCase: 'Daily bathing for complete germ protection, body freshness, and skin hygiene.',
    image: 'https://images.unsplash.com/photo-1607006342411-9a28b6341c2d?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'cb-004',
    name: 'Savlon Ocean Blue Handwash',
    division: 'CONSUMER BRANDS & FOODS',
    business: 'Neem Laboratories (Pvt.) Ltd.',
    category: 'Home & Personal Care',
    description: 'Liquid handwash with moisture-rich ingredients and iconic Savlon germ defense to leave hands soft and germ-free.',
    price: 110,
    unit: '250ml Dispenser',
    useCase: 'Frequent handwashing before meals and after outdoor contact to stop germ transmission.',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'cb-005',
    name: 'Savlon Hand Sanitizer',
    division: 'CONSUMER BRANDS & FOODS',
    business: 'Neem Laboratories (Pvt.) Ltd.',
    category: 'Home & Personal Care',
    description: 'Rinse-free instant hand sanitizer containing 70% Isopropyl Alcohol with moisturizing emollients.',
    price: 120,
    unit: '100ml Bottle',
    useCase: 'Instant hand sanitization on-the-go without water or soap.',
    image: 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'cb-006',
    name: 'ACI Aerosol (Super)',
    division: 'CONSUMER BRANDS & FOODS',
    business: 'Neem Laboratories (Pvt.) Ltd.',
    category: 'Home & Personal Care',
    description: 'Highly effective instant mosquito and crawling insect killer with a pleasant, non-suffocating fragrance.',
    price: 340,
    unit: '475ml Can',
    useCase: 'Knocking down mosquitoes, flies, cockroaches, and ants in living areas.',
    image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'cb-007',
    name: 'Angelic Air Freshener (Fresh Jasmine)',
    division: 'CONSUMER BRANDS & FOODS',
    business: 'Neem Laboratories (Pvt.) Ltd.',
    category: 'Home & Personal Care',
    description: 'Premium aerosol air freshener that neutralizes odors instantly and fills rooms with a natural floral scent.',
    price: 240,
    unit: '300ml Spray',
    useCase: 'Eliminating bad odor in washrooms, drawing rooms, and offices, creating a welcoming ambient atmosphere.',
    image: 'https://images.unsplash.com/photo-1528740564065-f3966bfe84ca?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'cb-008',
    name: 'Colgate Strong Teeth Toothpaste',
    division: 'CONSUMER BRANDS & FOODS',
    business: 'Neem Laboratories (Pvt.) Ltd.',
    category: 'Home & Personal Care',
    description: 'ACI Colgate-Palmolive joint-venture toothpaste with amino-hydroxy and calcium formula that makes teeth twice as strong.',
    price: 145,
    unit: '150g Tube',
    useCase: 'Daily oral hygiene, cavity protection, and fresh breath.',
    image: 'https://images.unsplash.com/photo-1559599141-3815480a826b?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'cb-101',
    name: 'ACI Pure Atta (Fortified Wheat Flour)',
    division: 'CONSUMER BRANDS & FOODS',
    business: 'ACI Pure Flour Limited',
    category: 'Foods & Commodities',
    description: 'Fortified, finely ground whole wheat flour processed using European technology to preserve maximum fiber and nutrients.',
    price: 125,
    unit: '2kg Pack',
    useCase: 'Baking soft, healthy, fiber-rich traditional flatbreads (Rotis, Chapatis, and Parathas).',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'cb-102',
    name: 'ACI Pure Miniket Rice',
    division: 'CONSUMER BRANDS & FOODS',
    business: 'ACI Foods Limited',
    category: 'Foods & Commodities',
    description: 'Premium quality slender grain rice, thoroughly cleaned and sorted in automated mills to ensure stones and husk-free rice.',
    price: 375,
    unit: '5kg Bag',
    useCase: 'Daily cooking of fluffy, long-grain white rice for family lunches and dinners.',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'cb-103',
    name: 'ACI Pure Edible Soyabean Oil',
    division: 'CONSUMER BRANDS & FOODS',
    business: 'ACI Edible Oils Limited',
    category: 'Foods & Commodities',
    description: 'Fortified, double-refined, healthy soyabean oil rich in Omega-3 and Vitamin A for balanced nutrition.',
    price: 810,
    unit: '5 Litre Can',
    useCase: 'General domestic cooking, deep frying, and baking food items safely.',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'cb-104',
    name: 'ACI Pure Iodized Salt',
    division: 'CONSUMER BRANDS & FOODS',
    business: 'ACI Salt Limited',
    category: 'Foods & Commodities',
    description: 'Pure, vacuum-evaporated, perfectly iodized salt that prevents iodine deficiency disorders and guarantees standard saltiness.',
    price: 42,
    unit: '1kg Packet',
    useCase: 'Universal culinary seasoning and critical nutritional mineral supplement.',
    image: 'https://images.unsplash.com/photo-1610450949065-02194f47ef2d?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'cb-105',
    name: 'ACI Pure Turmeric Powder',
    division: 'CONSUMER BRANDS & FOODS',
    business: 'ACI Foods Limited',
    category: 'Foods & Commodities',
    description: 'Premium, rich yellow, hygienically ground turmeric spices made from picked natural Bangladeshi roots.',
    price: 130,
    unit: '200g Pack',
    useCase: 'Traditional curry preparation, rendering flavor, yellow coloring, and medicinal antiseptic benefits.',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'cb-106',
    name: 'ACI Pure Chili Powder',
    division: 'CONSUMER BRANDS & FOODS',
    business: 'ACI Foods Limited',
    category: 'Foods & Commodities',
    description: 'Finely pulverized high-grade dried red chilies delivering the right level of heat and rich red color to dishes.',
    price: 160,
    unit: '200g Pack',
    useCase: 'Adding hot spiciness and beautiful red texture to fish, meat, and vegetable curries.',
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'cb-107',
    name: 'ACI Fun Chanachur (Spicy)',
    division: 'CONSUMER BRANDS & FOODS',
    business: 'ACI Foods Limited',
    category: 'Foods & Commodities',
    description: 'Crispy, extremely savory snack blend of chickpea noodles, peanuts, lentils, and rich hot spices.',
    price: 65,
    unit: '150g Packet',
    useCase: 'Quick ready-to-eat evening snack enjoyed with hot tea or family gossip.',
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'cb-108',
    name: 'Sunquick Orange Squash',
    division: 'CONSUMER BRANDS & FOODS',
    business: 'ACI Foods Limited',
    category: 'Foods & Commodities',
    description: 'Premium concentrated fruit beverage syrup made with real fruit juices, rich in Vitamin C, no artificial colorings.',
    price: 450,
    unit: '840ml Bottle',
    useCase: 'Refreshing fruit juice concentrate, makes up to 40 glasses when mixed with water.',
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'cb-201',
    name: 'ACI Premio Kitchenware Set (3-Piece)',
    division: 'CONSUMER BRANDS & FOODS',
    business: 'Premiaflex Plastics Limited',
    category: 'Plastics & Electronics',
    description: 'Heavy-duty food-grade BPA-free plastic air-tight containers designed for keeping grains, spices, and groceries safe and dry.',
    price: 320,
    unit: '1 Set (3 Containers)',
    useCase: 'Organized pantry storage and keeping food items fresh for long periods.',
    image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'cb-202',
    name: 'ACI Premio LED Bulb 9W',
    division: 'CONSUMER BRANDS & FOODS',
    business: 'Neem Laboratories (Pvt.) Ltd.',
    category: 'Plastics & Electronics',
    description: 'Energy-saving cool daylight LED bulb with high luminous efficacy and long service life of up to 25,000 hours.',
    price: 155,
    unit: '1 Unit',
    useCase: 'Bright, energy-efficient illumination for bedrooms, kitchens, and offices.',
    image: 'https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'cb-203',
    name: 'ACI Premio Smart Switch (Wi-Fi)',
    division: 'CONSUMER BRANDS & FOODS',
    business: 'Neem Laboratories (Pvt.) Ltd.',
    category: 'Plastics & Electronics',
    description: 'Smart touch light switch compatible with Google Assistant and Amazon Alexa, controllable via mobile app.',
    price: 1450,
    unit: '1 Unit',
    useCase: 'Smart home automation, scheduling lights, and remote control of electronic appliances.',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=400'
  },

  // ==========================================
  // 3. AGRIBUSINESS
  // ==========================================
  {
    id: 'ag-006',
    name: 'Sonalika Tractor DI-50 (50 HP)',
    division: 'AGRIBUSINESS',
    business: 'ACI Motors Limited',
    category: 'Agricultural Machinery',
    description: 'Heavy-duty 50 horsepower multi-purpose tractor. Highly fuel-efficient with excellent dry/wet soil traction.',
    price: 1250000,
    unit: '1 Unit',
    useCase: 'Mechanized land preparation, deep plowing, and heavy rural transportation.',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'ag-007',
    name: 'Yanmar Combine Harvester (AW70V)',
    division: 'AGRIBUSINESS',
    business: 'ACI Motors Limited',
    category: 'Agricultural Machinery',
    description: 'Japanese-engineered heavy-duty combine harvester that cuts, threshes, and cleans paddy simultaneously with minimal grain loss.',
    price: 2850000,
    unit: '1 Unit',
    useCase: 'Automating large-scale rice harvesting, reducing manual labor costs by 90%.',
    image: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'ag-008',
    name: 'ACI Broiler Starter Feed',
    division: 'AGRIBUSINESS',
    business: 'ACI Agribusinesses',
    category: 'Livestock & Feed',
    description: 'High-protein, enzymatically balanced premium crumble feed formulated for fast growth and high feed conversion in young broiler chicks.',
    price: 2450,
    unit: '50kg Bag',
    useCase: 'Initial feeding of meat-producing broiler chicks from Day 1 to Day 15.',
    image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'ag-009',
    name: 'Yamaha FZS V3 (150cc Motorcycle)',
    division: 'AGRIBUSINESS',
    business: 'ACI Motors Limited',
    category: 'Automobiles & Spares',
    description: 'Premium street motorcycle distributed exclusively by ACI Motors in Bangladesh, equipped with single-channel ABS and fuel injection (FI).',
    price: 258000,
    unit: '1 Unit',
    useCase: 'Fuel-efficient, safe, and highly reliable transportation for executives, officers, and daily commuters.',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=400'
  },

  // ==========================================
  // 4. RETAIL & LOGISTICS
  // ==========================================
  {
    id: 'sh-001',
    name: 'Shwapno Fresh Potato (Aloo)',
    division: 'RETAIL & LOGISTICS',
    business: 'ACI Logistics Limited (Shwapno)',
    category: 'Fresh Produce',
    description: 'Directly sourced from farmers of Bogra and Munshiganj, thoroughly cleaned, sorted, and stored in hygienic conditions.',
    price: 48,
    unit: '1kg Pack',
    useCase: 'Daily cooking of mashed potatoes (aloo bhorta), curries, and vegetable fries.',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'sh-002',
    name: 'Shwapno Red Onions (Peyaj)',
    division: 'RETAIL & LOGISTICS',
    business: 'ACI Logistics Limited (Shwapno)',
    category: 'Fresh Produce',
    description: 'Handpicked fresh local and imported red onions, completely dry, medium-sized, and free from decay.',
    price: 85,
    unit: '1kg Pack',
    useCase: 'Base ingredient for cooking and salads.',
    image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'sh-003',
    name: 'Shwapno Organic Bananas (Sagor Kola)',
    division: 'RETAIL & LOGISTICS',
    business: 'ACI Logistics Limited (Shwapno)',
    category: 'Fresh Produce',
    description: 'Naturally ripened, chemical-free sagor bananas packed with natural potassium, minerals, and vitamins.',
    price: 60,
    unit: '1 Dozen (12 Units)',
    useCase: 'Nutritious, high-energy breakfast fruit and baby snack.',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'sh-004',
    name: 'Shwapno Premium Chinigura Rice',
    division: 'RETAIL & LOGISTICS',
    business: 'ACI Logistics Limited (Shwapno)',
    category: 'Groceries',
    description: 'Extremely aromatic, small, slender-grained premium Chinigura rice, double-polished and aged for supreme fluffiness.',
    price: 185,
    unit: '1kg Pack',
    useCase: 'Preparing festive foods like Biryani, Pulao, and Payesh.',
    image: 'https://images.unsplash.com/photo-1536304997881-a372c179924b?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'sh-005',
    name: 'Shwapno Pure Cow Ghee',
    division: 'RETAIL & LOGISTICS',
    business: 'ACI Logistics Limited (Shwapno)',
    category: 'Groceries',
    description: 'Hygienically clarified butter made from premium local cow milk, offering a traditional buttery aroma and rich flavor.',
    price: 520,
    unit: '400g Glass Jar',
    useCase: 'Flavor enhancer for Pulao, Khichuri, sweets, and parathas.',
    image: 'https://images.unsplash.com/photo-1631709497146-a239ef57355a?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'sh-006',
    name: 'Shwapno Lifestyle Polo Shirt',
    division: 'RETAIL & LOGISTICS',
    business: 'ACI Shwapno e-Commerce Limited',
    category: 'Clothing & Lifestyle',
    description: '100% combed cotton smart-casual polo shirt, highly breathable and styled for optimal Bangladeshi tropical summer weather.',
    price: 550,
    unit: '1 Piece',
    useCase: 'Smart casual dress for daily office, casual events, or semi-formal gatherings.',
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=400'
  },

  // ==========================================
  // 5. CROP CARES
  // ==========================================
  {
    id: 'ag-001',
    name: 'ACI Pure Hybrid Rice Seed (Alonkar)',
    division: 'CROP CARES',
    business: 'ACI Seed Limited',
    category: 'Hybrid Seeds',
    description: 'High-yielding hybrid rice seeds specifically developed for high resistance to lodging and bacterial leaf blight, providing 20-30% higher yields.',
    price: 480,
    unit: '2kg Pack',
    useCase: 'Sowing during Boro/Aman season for massive rice harvests in Bangladeshi soils.',
    image: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'ag-002',
    name: 'ACI Hybrid Maize Seed (Don)',
    division: 'CROP CARES',
    business: 'ACI Seed Limited',
    category: 'Hybrid Seeds',
    description: 'Superior quality hybrid maize seeds with high germination rate, deep orange grain color, and exceptional drought tolerance.',
    price: 750,
    unit: '2kg Bag',
    useCase: 'High-production maize farming for animal feeds and human consumption.',
    image: 'https://images.unsplash.com/photo-1551754625-70c90487aa15?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'ag-003',
    name: 'ACI Chlorpyrifos 20EC (Insecticide)',
    division: 'CROP CARES',
    business: 'ACI Formulations PLC',
    category: 'Crop Protection',
    description: 'Broad-spectrum contact organophosphate insecticide used to control soil-borne pests, termites, and foliar crop insects.',
    price: 520,
    unit: '500ml Bottle',
    useCase: 'Eliminating stem borers, leaf rollers, and termites in rice and vegetable fields.',
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'ag-004',
    name: 'ACI Carbendazim 50WP (Fungicide)',
    division: 'CROP CARES',
    business: 'ACI Formulations PLC',
    category: 'Crop Protection',
    description: 'Systemic fungicide that controls a wide range of fungal diseases like blast, sheath blight, and leaf spot in rice and fruits.',
    price: 190,
    unit: '100g Pack',
    useCase: 'Preventing and curing fungal blast infections in paddy crops.',
    image: 'https://images.unsplash.com/photo-1607619056574-7b8d304f2c38?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'ag-005',
    name: 'ACI Maize-Mix (Balanced Fertilizer)',
    division: 'CROP CARES',
    business: 'ACI Formulations PLC',
    category: 'Crop Protection',
    description: 'Specially formulated micronutrient-rich balanced fertilizer designed specifically to accelerate healthy cob growth in maize.',
    price: 340,
    unit: '10kg Bag',
    useCase: 'Soil application during maize growth phases to supply essential micro-elements.',
    image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=400'
  },

  // ==========================================
  // 6. TECHNOLOGY, COMMUNICATION & SERVICES
  // ==========================================
  {
    id: 'tech-001',
    name: 'INFOLYTX Agri-Vision AI Platform',
    division: 'TECHNOLOGY, COMMUNICATION & SERVICES',
    business: 'INFOLYTX Bangladesh Limited',
    category: 'Enterprise Tech',
    description: 'Advanced computer vision model for automated plant disease diagnosis and high-precision yield estimation via satellite and drone imagery analyses.',
    price: 65000,
    unit: 'Annual Enterprise License',
    useCase: 'Predictive harvesting, remote crop health tracking, and commercial farm output optimization.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'tech-002',
    name: 'Creative Comm Multi-Channel Brand Activation',
    division: 'TECHNOLOGY, COMMUNICATION & SERVICES',
    business: 'Creative Communication Limited',
    category: 'Marketing Services',
    description: 'End-to-end strategic marketing activation, immersive experiential store designs, and integrated public relations campaigns for FMCG brand launches.',
    price: 120000,
    unit: 'Custom Campaign Package',
    useCase: 'Building nationwide consumer engagement, physical footprint launching, and premium media exposure.',
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'tech-003',
    name: 'ACI Avionics Medical Emergency Heli-Charter',
    division: 'TECHNOLOGY, COMMUNICATION & SERVICES',
    business: 'ACI Avionics and Airlines Services Limited',
    category: 'Aviation Services',
    description: 'Rapid-response corporate air charter and helicopter emergency medical evacuation (MEDEVAC) services operating across all 64 districts.',
    price: 280000,
    unit: 'Single Evacuation Flight',
    useCase: 'Urgent pharmaceutical deliveries, high-priority executive transit, and critical healthcare transport.',
    image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'tech-004',
    name: 'Stochastic Logic Risk Analytics Suite',
    division: 'TECHNOLOGY, COMMUNICATION & SERVICES',
    business: 'Stochastic Logic Limited',
    category: 'Analytical Services',
    description: 'Full-cycle financial risk profiling, supply-chain simulation models, and custom algorithmic consulting powered by stochastic frameworks.',
    price: 85000,
    unit: 'Project Assessment Package',
    useCase: 'Optimizing distribution portfolio risks, transaction anomaly analysis, and verifying transport resilience.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400'
  }
];

export const DIVISION_BUSINESSES: Record<Division, string[]> = {
  'PHARMACEUTICALS & HEALTHCARE': [
    'ACI Limited (Pharma)',
    'ACI HealthCare Limited',
    'ACI Biotech Limited',
    'ACI Herbal and Nutraceuticals Ltd'
  ],
  'AGRIBUSINESS': [
    'ACI Agribusinesses',
    'ACI Agrolink Limited',
    'ACI Marine and Riverine Technologies Limited',
    'ACI Motors Limited',
    'Premiaflex Plastics Limited'
  ],
  'CONSUMER BRANDS & FOODS': [
    'ACI Foods Limited',
    'ACI Pure Flour Limited',
    'ACI Salt Limited',
    'ACI Edible Oils Limited',
    'Neem Laboratories (Pvt.) Ltd.'
  ],
  'RETAIL & LOGISTICS': [
    'ACI Logistics Limited (Shwapno)',
    'ACI Shwapno e-Commerce Limited'
  ],
  'CROP CARES': [
    'ACI Formulations PLC',
    'ACI Seed Limited'
  ],
  'TECHNOLOGY, COMMUNICATION & SERVICES': [
    'INFOLYTX Bangladesh Limited',
    'Creative Communication Limited',
    'ACI Avionics and Airlines Services Limited',
    'Stochastic Logic Limited'
  ]
};

export const DIVISION_CATEGORIES: Record<string, string[]> = {
  'PHARMACEUTICALS & HEALTHCARE': ['Anti-Diabetics', 'Cardiovascular Care', 'Antibiotics', 'Biosimilars', 'OTC Medicines', 'Intravenous Fluids', 'Respiratory Care', 'Gastrointestinal & Acid Relief'],
  'AGRIBUSINESS': ['Agricultural Machinery', 'Livestock & Feed', 'Automobiles & Spares'],
  'CONSUMER BRANDS & FOODS': ['Home & Personal Care', 'Foods & Commodities', 'Plastics & Electronics'],
  'RETAIL & LOGISTICS': ['Fresh Produce', 'Groceries', 'Clothing & Lifestyle'],
  'CROP CARES': ['Hybrid Seeds', 'Crop Protection'],
  'TECHNOLOGY, COMMUNICATION & SERVICES': ['Enterprise Tech', 'Marketing Services', 'Aviation Services', 'Analytical Services']
};

export function searchProducts(query: string): Product[] {
  const normQuery = query.toLowerCase().trim();
  if (!normQuery) return [];
  
  return ACI_PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(normQuery) ||
    p.category.toLowerCase().includes(normQuery) ||
    p.description.toLowerCase().includes(normQuery) ||
    p.division.toLowerCase().includes(normQuery) ||
    p.useCase.toLowerCase().includes(normQuery) ||
    (p.business && p.business.toLowerCase().includes(normQuery))
  );
}

export function getProductsByDivision(division: string): Product[] {
  return ACI_PRODUCTS.filter(p => p.division === division);
}
