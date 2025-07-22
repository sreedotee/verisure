import { supabase } from "@/integrations/supabase/client";
import { 
  addProductToBlockchain, 
  checkProductOnBlockchain, 
  markProductAsFakeOnBlockchain,
  isWeb3Available 
} from "./blockchainService";

export interface Product {
  id: string;
  product_id: string;
  name: string;
  qr_hash: string;
  is_fake: boolean;
  created_at: string;
  updated_at: string;
}

// Add a new product
export async function addProduct(productId: string, name: string): Promise<Product | null> {
  const qrHash = `product_${productId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Try blockchain first, fallback to Supabase
  if (await isWeb3Available()) {
    try {
      const blockchainSuccess = await addProductToBlockchain(productId, name);
      if (blockchainSuccess) {
        console.log('✅ Product added to blockchain successfully');
      }
    } catch (error) {
      console.warn('⚠️ Blockchain failed, falling back to Supabase');
    }
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .insert([{ product_id, name, qr_hash: qrHash, is_fake: false }])
      .select()
      .single();

    if (error) {
      console.error('❌ Error adding product (Supabase):', error);
      return null;
    }

    console.log('✅ Product added to Supabase:', data);
    return data;

  } catch (err) {
    console.error('❌ Unexpected error in addProduct:', err);
    return null;
  }
}

// Fetch all products
export async function fetchProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching products:', error);
      return [];
    }

    console.log('✅ Products fetched:', data);
    return data || [];

  } catch (err) {
    console.error('❌ Unexpected error in fetchProducts:', err);
    return [];
  }
}

// Mark product as fake
export async function markAsFake(productId: string): Promise<Product | null> {
  if (await isWeb3Available()) {
    try {
      const blockchainSuccess = await markProductAsFakeOnBlockchain(productId);
      if (blockchainSuccess) {
        console.log('✅ Product marked as fake on blockchain');
      }
    } catch (error) {
      console.warn('⚠️ Blockchain markAsFake failed, using Supabase fallback');
    }
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .update({ is_fake: true })
      .eq('product_id', productId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error marking product as fake (Supabase):', error);
      return null;
    }

    console.log('✅ Product marked as fake in Supabase:', data);
    return data;

  } catch (err) {
    console.error('❌ Unexpected error in markAsFake:', err);
    return null;
  }
}

// Verify product by ID
export async function verifyProduct(productId: string): Promise<{ name: string; is_fake: boolean } | null> {
  if (await isWeb3Available()) {
    try {
      const blockchainResult = await checkProductOnBlockchain(productId);
      if (blockchainResult !== null) {
        console.log('✅ Product verified via blockchain');
        return blockchainResult;
      }
    } catch (error) {
      console.warn('⚠️ Blockchain verify failed, falling back to Supabase');
    }
  }

  try {
    const cleanId = productId.trim();
    const { data, error } = await supabase
      .from('products')
      .select('name, is_fake')
      .ilike('product_id', `%${cleanId}%`)
      .limit(1)
      .single();

    if (error) {
      console.error('❌ Error verifying product (Supabase):', error);
      return null;
    }

    console.log('✅ Product verified in Supabase:', data);
    return data;

  } catch (err) {
    console.error('❌ Unexpected error in verifyProduct:', err);
    return null;
  }
}

// Verify product by QR hash
export async function verifyProductByQR(qrHash: string): Promise<{ name: string; is_fake: boolean; product_id: string } | null> {
  try {
    const cleanHash = qrHash.trim().replace(/\\.png$/i, ''); // Strip trailing .png
    console.log('🔎 Sanitized QR Hash:', cleanHash);

    const { data, error } = await supabase
      .from('products')
      .select('name, is_fake, product_id')
      .ilike('qr_hash', `%${cleanHash}%`)
      .limit(1)
      .single();

    if (error) {
      console.error('❌ Error verifying product by QR (Supabase):', error);
      return null;
    }

    console.log('✅ Product found via QR:', data);
    return data;

  } catch (err) {
    console.error('❌ Unexpected error in verifyProductByQR:', err);
    return null;
  }
}

// Get analytics data
export async function getAnalytics() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('is_fake, created_at');

    if (error) {
      console.error('❌ Error fetching analytics:', error);
      return { realCount: 0, fakeCount: 0, totalCount: 0, recentProducts: [] };
    }

    const realCount = data?.filter(p => !p.is_fake).length || 0;
    const fakeCount = data?.filter(p => p.is_fake).length || 0;
    const totalCount = data?.length || 0;

    const recentProducts = data?.reduce((acc: any[], product) => {
      const date = new Date(product.created_at).toLocaleDateString();
      const existing = acc.find(item => item.date === date);

      if (existing) {
        existing.count += 1;
        product.is_fake ? existing.fake++ : existing.real++;
      } else {
        acc.push({
          date,
          count: 1,
          real: product.is_fake ? 0 : 1,
          fake: product.is_fake ? 1 : 0
        });
      }

      return acc;
    }, []) || [];

    console.log('📊 Analytics Data:', { realCount, fakeCount, totalCount, recentProducts });
    return { realCount, fakeCount, totalCount, recentProducts };

  } catch (err) {
    console.error('❌ Unexpected error in getAnalytics:', err);
    return { realCount: 0, fakeCount: 0, totalCount: 0, recentProducts: [] };
  }
}
