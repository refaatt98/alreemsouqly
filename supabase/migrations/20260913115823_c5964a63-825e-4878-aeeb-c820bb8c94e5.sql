-- BETA: open access for the public admin dashboard (no auth).

GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
GRANT ALL ON public.orders TO service_role;
GRANT ALL ON public.customers TO service_role;
GRANT ALL ON public.reviews TO service_role;

DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Anyone can create a customer record" ON public.customers;
DROP POLICY IF EXISTS "Anyone can place an order" ON public.orders;
DROP POLICY IF EXISTS "Anyone can submit a review" ON public.reviews;
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;

CREATE POLICY "beta_open_products" ON public.products FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "beta_open_orders" ON public.orders FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "beta_open_customers" ON public.customers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "beta_open_reviews" ON public.reviews FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Storage policies for the product-images bucket
DROP POLICY IF EXISTS "beta_product_images_read" ON storage.objects;
DROP POLICY IF EXISTS "beta_product_images_write" ON storage.objects;
DROP POLICY IF EXISTS "beta_product_images_update" ON storage.objects;
DROP POLICY IF EXISTS "beta_product_images_delete" ON storage.objects;

CREATE POLICY "beta_product_images_read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'product-images');
CREATE POLICY "beta_product_images_write" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "beta_product_images_update" ON storage.objects FOR UPDATE TO anon, authenticated USING (bucket_id = 'product-images') WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "beta_product_images_delete" ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id = 'product-images');