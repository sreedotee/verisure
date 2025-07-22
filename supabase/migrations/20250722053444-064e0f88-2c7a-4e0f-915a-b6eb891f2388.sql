-- Create products table for VeriSure
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  qr_hash TEXT NOT NULL UNIQUE,
  is_fake BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (demo purposes)
CREATE POLICY "Products are viewable by everyone" 
ON public.products 
FOR SELECT 
USING (true);

CREATE POLICY "Products can be inserted by everyone" 
ON public.products 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Products can be updated by everyone" 
ON public.products 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.products (product_id, name, qr_hash, is_fake) VALUES 
  ('001', 'Nike AirMax', 'product_001_hash_abc123def456', false),
  ('002', 'Adidas Bag', 'product_002_hash_def456ghi789', true),
  ('003', 'Levi''s Tee', 'product_003_hash_ghi789jkl012', false);