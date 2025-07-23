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

  if (await isWeb3Available()) {
    try {
      const blockchainSuccess = await addProductToBlockchain(productId, name);
      if (blockchainSuccess) {
        console.log('✅ Product added to blockchain successfully');
      }
    } catch {
      console.warn('⚠️ Blockchain failed, falling back to Supabase');
    }
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .insert([{ product_id: productId, name, qr_hash: qrHash, is_fake: false }])
      .select()
      .single();

    if (error) {
      console.error('❌ Error adding product (Supabase):', error);
      return null;
    }

    console.log('✅ Product added to Supabase');
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
    } catch {
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

    console.log('✅ Product marked as fake in Supabase');
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
      if (blockchainResult && typeof blockchainResult === 'object') {
        console.log('✅ Product verified via blockchain');
        return blockchainResult;
      }
    } catch {
      console.warn('⚠️ Blockchain verify failed, falling back to Supabase');
    }
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('name, is_fake')
      .eq('product_id', productId)
      .single();

    if (error) {
      console.error('❌ Error verifying product (Supabase):', error);
      return null;
    }

    console.log('✅ Product verified in Supabase');
    return data;

  } catch (err) {
    console.error('❌ Unexpected error in verifyProduct:', err);
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

    return { realCount, fakeCount, totalCount, recentProducts };

  } catch (err) {
    console.error('❌ Unexpected error in getAnalytics:', err);
    return { realCount: 0, fakeCount: 0, totalCount: 0, recentProducts: [] };
  }
}
