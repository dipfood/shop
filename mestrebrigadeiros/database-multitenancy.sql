-- Criação da tabela de empresas (companies)
CREATE TABLE public.companies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    subdomain text UNIQUE NOT NULL, -- Usado para o subdomínio (ex: "minhaempresa")
    email text NOT NULL,
    phone text,
    address text,
    status text DEFAULT 'active' NOT NULL, -- 'active', 'inactive', 'suspended'
    plan text DEFAULT 'basic' NOT NULL, -- 'basic', 'premium', 'enterprise'
    logo_url text,
    settings jsonb DEFAULT '{}'::jsonb, -- Para configurações específicas do tenant (cores, etc.)
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Criação da tabela de administradores de empresas (company_admins)
CREATE TABLE public.company_admins (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    email text UNIQUE NOT NULL,
    password_hash text NOT NULL,
    role text DEFAULT 'admin' NOT NULL, -- 'admin', 'viewer'
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Criação da tabela de categorias (categories)
CREATE TABLE public.categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    description text,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Criação da tabela de produtos (products)
CREATE TABLE public.products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
    name text NOT NULL,
    description text,
    price numeric(10, 2) NOT NULL,
    image_url text,
    has_addons boolean DEFAULT false NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Criação da tabela de acréscimos (addons)
CREATE TABLE public.addons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    price numeric(10, 2) NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Tabela de ligação entre produtos e acréscimos (product_addons)
-- Permite que um produto tenha múltiplos acréscimos e um acréscimo seja associado a múltiplos produtos
CREATE TABLE public.product_addons (
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    addon_id uuid REFERENCES public.addons(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (product_id, addon_id)
);

-- Criação da tabela de pedidos (orders)
CREATE TABLE public.orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    customer_name text NOT NULL,
    customer_phone text NOT NULL,
    customer_address text,
    items jsonb NOT NULL, -- Array de objetos JSON com detalhes do item, quantidade, acréscimos
    total_amount numeric(10, 2) NOT NULL,
    delivery_fee numeric(10, 2) DEFAULT 0.00 NOT NULL,
    payment_method text NOT NULL, -- 'pix', 'money', 'card'
    delivery_type text NOT NULL, -- 'delivery', 'pickup', 'table'
    status text DEFAULT 'pending' NOT NULL, -- 'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'
    change_for numeric(10, 2), -- Valor para troco, se pagamento for em dinheiro
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Criação da tabela de configurações (settings)
CREATE TABLE public.settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    key text NOT NULL,
    value text,
    UNIQUE (company_id, key), -- Garante que cada empresa tenha apenas uma entrada para cada chave de configuração
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Criação da tabela de dias de funcionamento (working_days)
CREATE TABLE public.working_days (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    day_of_week text NOT NULL, -- 'sunday', 'monday', etc.
    is_working boolean DEFAULT true NOT NULL,
    UNIQUE (company_id, day_of_week),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Funções e Triggers para `updated_at`
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_admins_updated_at
BEFORE UPDATE ON public.company_admins
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addons_updated_at
BEFORE UPDATE ON public.addons
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_working_days_updated_at
BEFORE UPDATE ON public.working_days
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies (Row Level Security)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_days ENABLE ROW LEVEL SECURITY;

-- Policy for public.companies (Super Admin can do anything, others can read active companies)
CREATE POLICY "Super Admin Full Access Companies" ON public.companies
FOR ALL USING (auth.uid() IN (SELECT id FROM public.company_admins WHERE role = 'super_admin')) WITH CHECK (auth.uid() IN (SELECT id FROM public.company_admins WHERE role = 'super_admin'));

CREATE POLICY "Allow read active companies" ON public.companies
FOR SELECT USING (status = 'active');

-- Policy for public.company_admins (Super Admin can do anything, company admin can manage their own)
CREATE POLICY "Super Admin Full Access Company Admins" ON public.company_admins
FOR ALL USING (auth.uid() IN (SELECT id FROM public.company_admins WHERE role = 'super_admin')) WITH CHECK (auth.uid() IN (SELECT id FROM public.company_admins WHERE role = 'super_admin'));

CREATE POLICY "Company Admin can manage their own admins" ON public.company_admins
FOR ALL USING (company_id IN (SELECT company_id FROM public.company_admins WHERE id = auth.uid() AND role = 'admin')) WITH CHECK (company_id IN (SELECT company_id FROM public.company_admins WHERE id = auth.uid() AND role = 'admin'));

-- Policies for tenant-specific tables (categories, products, addons, product_addons, orders, settings, working_days)
-- Only company admins can manage their own data. Public can read active data.

-- Categories
CREATE POLICY "Super Admin Full Access Categories" ON public.categories
FOR ALL USING (auth.uid() IN (SELECT id FROM public.company_admins WHERE role = 'super_admin')) WITH CHECK (auth.uid() IN (SELECT id FROM public.company_admins WHERE role = 'super_admin'));

CREATE POLICY "Company Admin can manage their own categories" ON public.categories
FOR ALL USING (company_id IN (SELECT company_id FROM public.company_admins WHERE id = auth.uid() AND role = 'admin')) WITH CHECK (company_id IN (SELECT company_id FROM public.company_admins WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Allow read active categories for public" ON public.categories
FOR SELECT USING (active = true);

-- Products
CREATE POLICY "Super Admin Full Access Products" ON public.products
FOR ALL USING (auth.uid() IN (SELECT id FROM public.company_admins WHERE role = 'super_admin')) WITH CHECK (auth.uid() IN (SELECT id FROM public.company_admins WHERE role = 'super_admin'));

CREATE POLICY "Company Admin can manage their own products" ON public.products
FOR ALL USING (company_id IN (SELECT company_id FROM public.company_admins WHERE id = auth.uid() AND role = 'admin')) WITH CHECK (company_id IN (SELECT company_id FROM public.company_admins WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Allow read active products for public" ON public.products
FOR SELECT USING (active = true);

-- Addons
CREATE POLICY "Super Admin Full Access Addons" ON public.addons
FOR ALL USING (auth.uid() IN (SELECT id FROM public.company_admins WHERE role = 'super_admin')) WITH CHECK (auth.uid() IN (SELECT id FROM public.company_admins WHERE role = 'super_admin'));

CREATE POLICY "Company Admin can manage their own addons" ON public.addons
FOR ALL USING (company_id IN (SELECT company_id FROM public.company_admins WHERE id = auth.uid() AND role = 'admin')) WITH CHECK (company_id IN (SELECT company_id FROM public.company_admins WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Allow read active addons for public" ON public.addons
FOR SELECT USING (active = true);

-- Product Addons (junction table)
CREATE POLICY "Super Admin Full Access Product Addons" ON public.product_addons
FOR ALL USING (product_id IN (SELECT id FROM public.products WHERE company_id IN (SELECT company_id FROM public.company_admins WHERE id = auth.uid() AND role = 'super_admin'))) WITH CHECK (product_id IN (SELECT id FROM public.products WHERE company_id IN (SELECT company_id FROM public.company_admins WHERE id = auth.uid() AND role = 'super_admin')));

CREATE POLICY "Company Admin can manage their product addons" ON public.product_addons
FOR ALL USING (product_id IN (SELECT id FROM public.products
