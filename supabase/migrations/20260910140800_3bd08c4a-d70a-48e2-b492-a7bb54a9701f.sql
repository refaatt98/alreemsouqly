
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  compare_at_price numeric(10,2),
  category text NOT NULL DEFAULT 'creams',
  image_urls text[] NOT NULL DEFAULT '{}',
  stock_quantity integer NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  ingredients text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);

CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.customers TO anon;
GRANT INSERT ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create a customer record" ON public.customers FOR INSERT WITH CHECK (true);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  shipping_address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.orders TO anon;
GRANT INSERT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can place an order" ON public.orders FOR INSERT WITH CHECK (true);

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  rating integer NOT NULL DEFAULT 5,
  comment text NOT NULL DEFAULT '',
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.reviews TO anon;
GRANT SELECT, INSERT ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can submit a review" ON public.reviews FOR INSERT WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.products (name_ar, name_en, description, price, compare_at_price, category, image_urls, stock_quantity, is_featured, ingredients) VALUES
('كريم التوت المرطب', 'Berry Glow Cream', 'كريم غني بزبدة الشيا وماء الورد يمنح البشرة ترطيباً عميقاً ولمعاناً ناعماً.', 145.00, 180.00, 'creams', ARRAY['/products/cream.jpg'], 24, true, 'زبدة الشيا، ماء الورد، فيتامين E'),
('سيروم النقاء الوردي', 'Rose Purity Serum', 'سيروم خفيف بخلاصة ماء الورد وفيتامين C لتوحيد لون البشرة.', 195.00, NULL, 'serums', ARRAY['/products/serum.jpg'], 18, true, 'ماء الورد، فيتامين C، حمض الهيالورونيك'),
('ماسك التوت المضيء', 'Berry Radiance Mask', 'ماسك أسبوعي بخلاصة التوت الأحمر يعيد للبشرة إشراقها الطبيعي.', 120.00, 150.00, 'masks', ARRAY['/products/mask.jpg'], 30, true, 'خلاصة التوت، طين وردي، عسل'),
('زيت الأرغان الفاخر', 'Luxe Argan Oil', 'زيت أرغان نقي معصور على البارد لتغذية البشرة والشعر.', 165.00, NULL, 'oils', ARRAY['/products/oil.jpg'], 12, false, 'زيت الأرغان، فيتامين E'),
('غسول التوت اللطيف', 'Gentle Berry Cleanser', 'غسول رغوي لطيف ينظف دون أن يجرد البشرة من زيوتها.', 95.00, NULL, 'cleansers', ARRAY['/products/cleanser.jpg'], 40, false, 'ماء الورد، الألوفيرا، جلسرين نباتي'),
('مقشر السكر الوردي', 'Rose Sugar Scrub', 'مقشر ناعم بحبيبات السكر وزيت اللوز لبشرة حريرية.', 110.00, 135.00, 'masks', ARRAY['/products/scrub.jpg'], 22, false, 'سكر القصب، زيت اللوز، بتلات الورد'),
('كريم الليل المغذي', 'Nourishing Night Cream', 'كريم ليلي غني يجدد البشرة أثناء النوم.', 175.00, NULL, 'creams', ARRAY['/products/night.jpg'], 16, true, 'زبدة الكاكاو، سيراميد، بانثينول'),
('سيروم الترطيب المكثف', 'Deep Hydration Serum', 'تركيبة مركزة من حمض الهيالورونيك لترطيب يدوم.', 185.00, 210.00, 'serums', ARRAY['/products/hydra.jpg'], 20, false, 'حمض الهيالورونيك، ماء الورد، سكوالان');

INSERT INTO public.reviews (customer_name, rating, comment) VALUES
('نورة العتيبي', 5, 'أفضل كريم جربته! بشرتي صارت ناعمة ومشرقة من أول أسبوع.'),
('لمى الحربي', 5, 'السيروم رائع والرائحة هادئة جداً. التغليف فخم بشكل لا يوصف.'),
('سارة القحطاني', 5, 'منتجات طبيعية فعلاً وأحس بالفرق. صارت روتيني اليومي.'),
('دانة الشمري', 4, 'الماسك يعطي نضارة فورية، أنصح فيه بشدة.');
