-- ============================================================
-- AutoPro Parts - Full Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS / PROFILES
-- ============================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ADDRESSES
-- ============================================================
CREATE TABLE addresses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line TEXT NOT NULL,
  district TEXT,
  province TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_en TEXT,
  icon TEXT,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO categories (name, name_en, icon, slug, sort_order) VALUES
  ('ระบบเบรก', 'Brake System', '🔴', 'brake-system', 1),
  ('ระบบกรอง', 'Filter System', '🔵', 'filter-system', 2),
  ('ระบบไฟ', 'Electrical', '💡', 'electrical', 3),
  ('ระบบช่วงล่าง', 'Suspension', '⚙️', 'suspension', 4),
  ('ระบบน้ำมัน', 'Oil System', '🛢️', 'oil-system', 5),
  ('ระบบไอเสีย', 'Exhaust System', '💨', 'exhaust-system', 6);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  slug TEXT UNIQUE NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  category_id UUID REFERENCES categories(id),
  brand TEXT NOT NULL,
  description TEXT,
  description_en TEXT,
  price DECIMAL(10,2) NOT NULL,
  compare_price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  stock_qty INT NOT NULL DEFAULT 0,
  low_stock_threshold INT DEFAULT 20,
  weight_kg DECIMAL(8,3),
  images JSONB DEFAULT '[]',
  specifications JSONB DEFAULT '{}',
  compatible_cars JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  sold_count INT DEFAULT 0,
  view_count INT DEFAULT 0,
  rating_avg DECIMAL(3,2) DEFAULT 0,
  rating_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sample products
INSERT INTO products (name, slug, sku, brand, description, price, stock_qty, is_featured, sold_count, rating_avg, rating_count, category_id) 
SELECT 
  p.name, p.slug, p.sku, p.brand, p.description, p.price, p.stock_qty, p.is_featured, p.sold_count, p.rating_avg, p.rating_count, c.id
FROM (VALUES
  ('ผ้าเบรกหน้า Bosch QuietCast', 'brake-pad-bosch-quietcast', 'BRK-BC-001', 'Bosch', 'ผ้าเบรกเซรามิกคุณภาพสูง ลดเสียงดัง ทนทาน', 890.00, 45, true, 89, 4.8, 34, 'ระบบเบรก'),
  ('จานเบรกหน้า Brembo', 'brake-disc-brembo', 'BRK-DS-001', 'Brembo', 'จานเบรกระดับพรีเมียม ผลิตจากอิตาลี', 2400.00, 18, true, 34, 4.9, 19, 'ระบบเบรก'),
  ('กรองอากาศ Denso', 'air-filter-denso', 'FLT-AR-001', 'Denso', 'กรองอากาศประสิทธิภาพสูง กรองฝุ่น PM2.5', 320.00, 67, false, 112, 4.7, 56, 'ระบบกรอง'),
  ('กรองน้ำมันเครื่อง NGK', 'oil-filter-ngk', 'FLT-OL-001', 'NGK', 'กรองน้ำมันมาตรฐาน OEM เปลี่ยนทุก 5,000 กม.', 180.00, 124, false, 198, 4.5, 89, 'ระบบกรอง'),
  ('หัวเทียน NGK Iridium', 'spark-plug-ngk-iridium', 'ELC-SP-001', 'NGK', 'หัวเทียนอิริเดียม ประกายไฟแรง ประหยัดน้ำมัน', 680.00, 89, true, 145, 4.9, 72, 'ระบบไฟ'),
  ('แบตเตอรี่ Yuasa 60Ah', 'battery-yuasa-60ah', 'ELC-BT-001', 'Yuasa', 'แบตเตอรี่ MF ไม่ต้องเติมน้ำ รับประกัน 1 ปี', 2800.00, 12, false, 28, 4.8, 22, 'ระบบไฟ'),
  ('โช้คอัพหน้า Bilstein', 'shock-absorber-bilstein', 'SUS-SA-001', 'Bilstein', 'โช้คอัพระดับ OEM ผลิตในเยอรมนี', 3200.00, 8, false, 21, 4.9, 15, 'ระบบช่วงล่าง'),
  ('น้ำมันเครื่อง Mobil 1 5W-30', 'engine-oil-mobil1-5w30', 'OIL-EN-001', 'Mobil', 'น้ำมันเครื่องสังเคราะห์ 100% Full Synthetic', 850.00, 156, true, 234, 4.9, 124, 'ระบบน้ำมัน'),
  ('น้ำมันเกียร์ Castrol', 'gear-oil-castrol', 'OIL-GB-001', 'Castrol', 'น้ำมันเกียร์สังเคราะห์ เปลี่ยนทุก 40,000 กม.', 420.00, 78, false, 89, 4.6, 45, 'ระบบน้ำมัน'),
  ('ท่อไอเสีย Borla', 'exhaust-pipe-borla', 'EXH-PP-001', 'Borla', 'ท่อไอเสียสเตนเลส 304 เพิ่มกำลังเครื่อง', 5800.00, 4, false, 9, 4.7, 8, 'ระบบไอเสีย')
) AS p(name, slug, sku, brand, description, price, stock_qty, is_featured, sold_count, rating_avg, rating_count, cat_name)
JOIN categories c ON c.name = p.cat_name;

-- ============================================================
-- PRODUCT REVIEWS
-- ============================================================
CREATE TABLE product_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewer_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT TRUE,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CART
-- ============================================================
CREATE TABLE cart_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' 
    CHECK (payment_status IN ('unpaid','paid','refunded','failed')),
  payment_method TEXT CHECK (payment_method IN ('promptpay','card','cod','bank_transfer')),
  payment_ref TEXT,
  
  -- Shipping
  shipping_name TEXT NOT NULL,
  shipping_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_province TEXT NOT NULL,
  shipping_postal_code TEXT NOT NULL,
  shipping_fee DECIMAL(10,2) DEFAULT 0,
  tracking_number TEXT,
  
  -- Pricing
  subtotal DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  
  -- Points
  points_earned INT DEFAULT 0,
  points_used INT DEFAULT 0,
  
  -- Coupon
  coupon_code TEXT,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_sku TEXT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('order_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE order_seq START 1;
CREATE TRIGGER set_order_number BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- ============================================================
-- LOYALTY POINTS
-- ============================================================
CREATE TABLE loyalty_points (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_points INT DEFAULT 0,
  available_points INT DEFAULT 0,
  lifetime_points INT DEFAULT 0,
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze','silver','gold','platinum')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE points_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('earn','redeem','expire','bonus','refund')),
  points INT NOT NULL,
  description TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rewards_catalog (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  points_required INT NOT NULL,
  reward_type TEXT CHECK (reward_type IN ('discount','free_shipping','product','upgrade')),
  reward_value JSONB,
  stock_qty INT DEFAULT -1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO rewards_catalog (name, description, icon, points_required, reward_type, reward_value) VALUES
  ('ส่วนลด ฿50', 'คูปองส่วนลดใช้ได้กับทุกออเดอร์', '🎫', 500, 'discount', '{"amount": 50}'),
  ('ส่งฟรี 1 ครั้ง', 'ยกเว้นค่าจัดส่งสำหรับ 1 ออเดอร์', '🚚', 300, 'free_shipping', '{}'),
  ('ของขวัญ AutoPro Set', 'ชุดของขวัญอะไหล่รถยนต์', '🎁', 2000, 'product', '{}'),
  ('อัปเกรด Gold Member', 'เลื่อนระดับเป็น Gold ทันที', '⭐', 3000, 'upgrade', '{"tier": "gold"}');

-- ============================================================
-- COUPONS
-- ============================================================
CREATE TABLE coupons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('percent','fixed','free_shipping')),
  value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_discount DECIMAL(10,2),
  usage_limit INT,
  used_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO coupons (code, description, type, value, min_order_amount, usage_limit) VALUES
  ('WELCOME10', 'ส่วนลด 10% สำหรับสมาชิกใหม่', 'percent', 10, 500, 1000),
  ('SAVE100', 'ลด ฿100 เมื่อซื้อครบ ฿1,000', 'fixed', 100, 1000, 500),
  ('FREESHIP', 'ส่งฟรีไม่มีขั้นต่ำ', 'free_shipping', 0, 0, 200);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Addresses
CREATE POLICY "Users can manage own addresses" ON addresses FOR ALL USING (auth.uid() = user_id);

-- Cart
CREATE POLICY "Users can manage own cart" ON cart_items FOR ALL USING (auth.uid() = user_id);

-- Orders
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all orders" ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Order items
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
);

-- Loyalty
CREATE POLICY "Users can view own loyalty" ON loyalty_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own points history" ON points_transactions FOR SELECT USING (auth.uid() = user_id);

-- Notifications
CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- Public read for products/categories
CREATE POLICY "Products are public" ON products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Categories are public" ON categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Reviews are public" ON product_reviews FOR SELECT USING (is_approved = TRUE);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO loyalty_points (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update product rating after review
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products SET
    rating_avg = (SELECT AVG(rating) FROM product_reviews WHERE product_id = NEW.product_id AND is_approved = TRUE),
    rating_count = (SELECT COUNT(*) FROM product_reviews WHERE product_id = NEW.product_id AND is_approved = TRUE),
    updated_at = NOW()
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_review_insert
  AFTER INSERT OR UPDATE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Update loyalty tier based on lifetime points
CREATE OR REPLACE FUNCTION update_loyalty_tier()
RETURNS TRIGGER AS $$
BEGIN
  NEW.tier := CASE
    WHEN NEW.lifetime_points >= 10000 THEN 'platinum'
    WHEN NEW.lifetime_points >= 5000 THEN 'gold'
    WHEN NEW.lifetime_points >= 2000 THEN 'silver'
    ELSE 'bronze'
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_loyalty_update
  BEFORE UPDATE ON loyalty_points
  FOR EACH ROW EXECUTE FUNCTION update_loyalty_tier();

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_cart_user ON cart_items(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
