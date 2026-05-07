/*
  # Create Products and Orders Tables

  ## Overview
  This migration creates tables for managing products, shopping cart, and orders in the DyPay e-commerce system.

  ## New Tables

  ### 1. `products` Table
  Stores all products created by merchants
  - `id` (uuid, primary key) - Unique product identifier
  - `merchant_id` (uuid, foreign key) - Reference to merchant owner
  - `shop_id` (uuid, foreign key, nullable) - Reference to shop (optional)
  - `name` (text) - Product name
  - `description` (text) - Product description
  - `price` (numeric) - Product price
  - `compare_at_price` (numeric, nullable) - Original price for showing discounts
  - `currency` (text) - Currency code (XAF, USD, EUR)
  - `image_url` (text, nullable) - Main product image
  - `images` (jsonb, nullable) - Array of additional product images
  - `category` (text, nullable) - Product category
  - `stock_quantity` (integer) - Available quantity
  - `sku` (text, nullable) - Stock keeping unit
  - `is_active` (boolean) - Product visibility status
  - `metadata` (jsonb, nullable) - Additional product data
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `cart_items` Table
  Stores user shopping cart items
  - `id` (uuid, primary key) - Unique cart item identifier
  - `user_id` (uuid, nullable) - Reference to authenticated user (null for guest)
  - `session_id` (text) - Session identifier for guest users
  - `product_id` (uuid, foreign key) - Reference to product
  - `quantity` (integer) - Quantity in cart
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `orders` Table
  Stores customer orders
  - `id` (uuid, primary key) - Unique order identifier
  - `merchant_id` (uuid, foreign key) - Reference to merchant
  - `shop_id` (uuid, foreign key, nullable) - Reference to shop
  - `user_id` (uuid, nullable) - Reference to customer user
  - `order_number` (text, unique) - Human-readable order number
  - `customer_email` (text) - Customer email
  - `customer_name` (text) - Customer name
  - `customer_phone` (text) - Customer phone
  - `shipping_address` (jsonb) - Shipping address details
  - `items` (jsonb) - Array of ordered items
  - `subtotal` (numeric) - Order subtotal
  - `shipping_cost` (numeric) - Shipping cost
  - `tax` (numeric) - Tax amount
  - `total` (numeric) - Total order amount
  - `currency` (text) - Currency code
  - `status` (text) - Order status (pending, paid, processing, shipped, delivered, cancelled)
  - `payment_id` (uuid, foreign key, nullable) - Reference to payment
  - `payment_status` (text) - Payment status
  - `notes` (text, nullable) - Order notes
  - `created_at` (timestamptz) - Order creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - RLS enabled on all tables
  - Merchants can manage their own products and orders
  - Public read access to active products
  - Authenticated users can manage their cart
  - Guest users can manage cart with session_id

  ## Indexes
  - Products indexed by merchant_id, shop_id, is_active
  - Cart items indexed by user_id and session_id
  - Orders indexed by merchant_id, order_number, status
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  price numeric NOT NULL CHECK (price >= 0),
  compare_at_price numeric CHECK (compare_at_price >= 0),
  currency text NOT NULL DEFAULT 'XAF',
  image_url text,
  images jsonb DEFAULT '[]'::jsonb,
  category text,
  stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  sku text,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT cart_user_or_session CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  shop_id uuid REFERENCES shops(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number text UNIQUE NOT NULL,
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  shipping_address jsonb DEFAULT '{}'::jsonb,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  shipping_cost numeric NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
  tax numeric NOT NULL DEFAULT 0 CHECK (tax >= 0),
  total numeric NOT NULL CHECK (total >= 0),
  currency text NOT NULL DEFAULT 'XAF',
  status text NOT NULL DEFAULT 'pending',
  payment_id uuid REFERENCES payments(id) ON DELETE SET NULL,
  payment_status text DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_merchant_id ON products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_products_shop_id ON products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

CREATE INDEX IF NOT EXISTS idx_orders_merchant_id ON orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Create function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  new_number text;
BEGIN
  new_number := 'DP' || to_char(now(), 'YYYYMMDD') || LPAD(nextval('order_number_seq')::text, 6, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Create trigger to auto-generate order number
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products

-- Public can view active products
CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  TO public
  USING (is_active = true);

-- Merchants can view all their products
CREATE POLICY "Merchants can view own products"
  ON products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM merchants
      WHERE merchants.id = products.merchant_id
      AND merchants.auth_id = auth.uid()
    )
  );

-- Merchants can insert their own products
CREATE POLICY "Merchants can insert own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM merchants
      WHERE merchants.id = products.merchant_id
      AND merchants.auth_id = auth.uid()
    )
  );

-- Merchants can update their own products
CREATE POLICY "Merchants can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM merchants
      WHERE merchants.id = products.merchant_id
      AND merchants.auth_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM merchants
      WHERE merchants.id = products.merchant_id
      AND merchants.auth_id = auth.uid()
    )
  );

-- Merchants can delete their own products
CREATE POLICY "Merchants can delete own products"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM merchants
      WHERE merchants.id = products.merchant_id
      AND merchants.auth_id = auth.uid()
    )
  );

-- RLS Policies for cart_items

-- Authenticated users can view their cart
CREATE POLICY "Users can view own cart"
  ON cart_items FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Public can view cart by session_id
CREATE POLICY "Public can view cart by session"
  ON cart_items FOR SELECT
  TO public
  USING (session_id IS NOT NULL);

-- Authenticated users can insert to their cart
CREATE POLICY "Users can insert to own cart"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Public can insert to cart with session_id
CREATE POLICY "Public can insert to cart with session"
  ON cart_items FOR INSERT
  TO public
  WITH CHECK (session_id IS NOT NULL AND user_id IS NULL);

-- Authenticated users can update their cart
CREATE POLICY "Users can update own cart"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Public can update cart by session_id
CREATE POLICY "Public can update cart by session"
  ON cart_items FOR UPDATE
  TO public
  USING (session_id IS NOT NULL)
  WITH CHECK (session_id IS NOT NULL);

-- Authenticated users can delete from their cart
CREATE POLICY "Users can delete from own cart"
  ON cart_items FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Public can delete from cart by session_id
CREATE POLICY "Public can delete from cart by session"
  ON cart_items FOR DELETE
  TO public
  USING (session_id IS NOT NULL);

-- RLS Policies for orders

-- Merchants can view their orders
CREATE POLICY "Merchants can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM merchants
      WHERE merchants.id = orders.merchant_id
      AND merchants.auth_id = auth.uid()
    )
  );

-- Customers can view their orders
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Anyone can insert orders (for checkout)
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  TO public
  WITH CHECK (true);

-- Merchants can update their orders
CREATE POLICY "Merchants can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM merchants
      WHERE merchants.id = orders.merchant_id
      AND merchants.auth_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM merchants
      WHERE merchants.id = orders.merchant_id
      AND merchants.auth_id = auth.uid()
    )
  );
