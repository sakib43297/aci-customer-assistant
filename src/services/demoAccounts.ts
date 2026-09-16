import { AppUser } from '../types';

export interface DemoAccount extends AppUser {
  description: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    uid: 'demo-admin-hq',
    email: 'admin@aci.com',
    displayName: 'ACI Corporate HQ Admin',
    role: 'admin',
    businessName: 'ACI Central Administration & Logistics',
    businessType: 'corporate',
    location: '245 Tejgaon Industrial Area, Dhaka-1208',
    phone: '01711-001122',
    description: 'Master Admin with full category, price control & order dispatch authority',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    uid: 'demo-admin-sakib',
    email: 'ulsakib9@gmail.com',
    displayName: 'Sakib (Executive Admin)',
    role: 'admin',
    businessName: 'ACI Executive Board & Operations',
    businessType: 'corporate',
    location: 'Tejgaon Industrial Area, Dhaka',
    phone: '01711-554433',
    description: 'Executive Administrator linked to system owner account',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    uid: 'demo-pharmacy-greenlife',
    email: 'greenlife.pharma@aci.com',
    displayName: 'GreenLife Pharma & Diagnostics',
    role: 'user',
    businessName: 'GreenLife Pharmacy Ltd',
    businessType: 'pharmacy',
    location: 'Gulshan-2 Circle, Dhaka',
    phone: '01711-998877',
    description: 'Licensed Retail Chemist procuring medicines, Savlon & sterile supplies',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    uid: 'demo-agro-bogura',
    email: 'bogura.krishi@aci.com',
    displayName: 'Bogura Krishi Khamar & Supplies',
    role: 'user',
    businessName: 'Bogura Krishi Khamar',
    businessType: 'farm',
    location: 'Sherpur Road, Bogura',
    phone: '01712-334455',
    description: 'Agro dealer purchasing hybrid seeds, crop protection & fertilizers',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    uid: 'demo-retail-shwapno',
    email: 'shwapno.corp@aci.com',
    displayName: 'Shwapno Procurement Desk',
    role: 'user',
    businessName: 'Shwapno Superstores Ltd',
    businessType: 'grocery',
    location: 'Banani Road 11, Dhaka',
    phone: '01713-778899',
    description: 'Superstore buyer ordering ACI Pure Atta, Spices, Salt & Commodities',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    uid: 'demo-general-ctg',
    email: 'ctg.supplies@aci.com',
    displayName: 'Chattogram Enterprise Traders',
    role: 'user',
    businessName: 'Chattogram Wholesale Distribution',
    businessType: 'general',
    location: 'Agrabad Commercial Area, Chattogram',
    phone: '01714-889900',
    description: 'Wholesale distributor supplying consumer & industrial goods',
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

// The backend seeds these accounts into this project's SQLite database at startup.
// Keep this helper as a compatibility shim for the existing UI controls.
export async function seedDemoAccountsToLocal(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const csrfResponse = await fetch('/api/auth/csrf', { credentials: 'include' });
    const csrf = await csrfResponse.json();
    const response = await fetch('/api/seed-demo-accounts', { method: 'POST', credentials: 'include', headers: { 'X-CSRF-Token': csrf.csrfToken } });
    const data = await response.json();
    return { success: Boolean(data.success), count: Number(data.count || DEMO_ACCOUNTS.length), error: data.error };
  } catch (error: any) {
    return { success: false, count: 0, error: error?.message || 'The application service is unavailable.' };
  }
}

export function findDemoAccount(emailOrRole: string): DemoAccount | undefined {
  const query = emailOrRole.toLowerCase().trim();
  return DEMO_ACCOUNTS.find(
    acc => acc.email.toLowerCase() === query || 
           acc.role.toLowerCase() === query || 
           acc.uid.toLowerCase() === query
  );
}
