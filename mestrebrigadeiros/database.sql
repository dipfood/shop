-- Criar tabelas para o cardápio digital

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS categories (
id SERIAL PRIMARY KEY,
name VARCHAR(100) NOT NULL UNIQUE,
description TEXT,
active BOOLEAN DEFAULT true,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
id SERIAL PRIMARY KEY,
name VARCHAR(200) NOT NULL UNIQUE,
description TEXT,
price DECIMAL(10,2) NOT NULL,
image_url TEXT,
category_id INTEGER REFERENCES categories(id),
active BOOLEAN DEFAULT true,
has_addons BOOLEAN DEFAULT false,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de acréscimos (addons)
CREATE TABLE IF NOT EXISTS addons (
id SERIAL PRIMARY KEY,
name VARCHAR(100) NOT NULL UNIQUE,
price DECIMAL(10,2) NOT NULL,
active BOOLEAN DEFAULT true,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS settings (
id SERIAL PRIMARY KEY,
key VARCHAR(100) UNIQUE NOT NULL,
value TEXT NOT NULL,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
id SERIAL PRIMARY KEY,
customer_name VARCHAR(200) NOT NULL,
customer_phone VARCHAR(20) NOT NULL,
customer_address TEXT,
items JSONB NOT NULL, -- Esta coluna agora armazenará produtos e seus acréscimos selecionados
total_amount DECIMAL(10,2) NOT NULL,
delivery_fee DECIMAL(10,2) DEFAULT 0,
payment_method VARCHAR(50) NOT NULL,
delivery_type VARCHAR(20) NOT NULL, -- 'delivery' ou 'pickup' ou 'table'
status VARCHAR(20) DEFAULT 'pending',
change_for DECIMAL(10,2), -- Campo para o valor do troco
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Garante que a coluna exista na criação
);

-- Tabela de dias de funcionamento
CREATE TABLE IF NOT EXISTS working_days (
id SERIAL PRIMARY KEY,
day_of_week VARCHAR(10) UNIQUE NOT NULL, -- 'sunday', 'monday', etc.
is_working BOOLEAN DEFAULT true,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar função para atualizar 'updated_at' automaticamente
-- Usar CREATE OR REPLACE para garantir que a função esteja sempre atualizada
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para as tabelas que precisam de 'updated_at'
-- Usar DROP TRIGGER IF EXISTS e CREATE TRIGGER para garantir que os triggers sejam aplicados corretamente
-- e evitar problemas de "trigger already exists" ou "no field updated_at"

-- Trigger para categories
DROP TRIGGER IF EXISTS set_timestamp_categories ON categories;
CREATE TRIGGER set_timestamp_categories
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Trigger para products
DROP TRIGGER IF EXISTS set_timestamp_products ON products;
CREATE TRIGGER set_timestamp_products
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Trigger para addons
DROP TRIGGER IF EXISTS set_timestamp_addons ON addons;
CREATE TRIGGER set_timestamp_addons
BEFORE UPDATE ON addons
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Trigger para orders
DROP TRIGGER IF EXISTS set_timestamp_orders ON orders;
CREATE TRIGGER set_timestamp_orders
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Trigger para working_days
DROP TRIGGER IF EXISTS set_timestamp_working_days ON working_days;
CREATE TRIGGER set_timestamp_working_days
BEFORE UPDATE ON working_days
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Opcional: Definir updated_at para created_at para linhas existentes onde updated_at é NULL
-- Isso é útil se a coluna foi adicionada e você tem dados antigos sem um valor para updated_at
UPDATE orders SET updated_at = created_at WHERE updated_at IS NULL;


-- Inserir dias de funcionamento padrão (todos os dias como true)
INSERT INTO working_days (day_of_week, is_working) VALUES
('sunday', true),
('monday', true),
('tuesday', true),
('wednesday', true),
('thursday', true),
('friday', true),
('saturday', true)
ON CONFLICT (day_of_week) DO NOTHING;

-- Inserir configurações padrão
INSERT INTO settings (key, value) VALUES
('store_open', 'true'),
('opening_time', '08:00'),
('closing_time', '22:00'),
('delivery_fee', '5.00'),
('pix_key', 'seuemail@exemplo.com'),
('store_name', 'Meu Restaurante'),
('store_phone', '(11) 99999-9999'),
('store_address', 'Rua Exemplo, 123')
ON CONFLICT (key) DO NOTHING;

-- Adicionar configuração do WhatsApp
INSERT INTO settings (key, value) VALUES ('whatsapp_number', '5511999999999')
ON CONFLICT (key) DO NOTHING;

-- Atualizar o telefone da loja para incluir código do país (se necessário)
UPDATE settings SET value = '5511999999999' WHERE key = 'store_phone';

-- Inserir categorias de exemplo
INSERT INTO categories (name, description) VALUES
('Lanches', 'Hambúrgueres e sanduíches'),
('Bebidas', 'Refrigerantes, sucos e águas'),
('Sobremesas', 'Doces e sobremesas'),
('Pratos Principais', 'Pratos completos')
ON CONFLICT (name) DO NOTHING;

-- Inserir produtos de exemplo (com has_addons)
INSERT INTO products (name, description, price, category_id, has_addons) VALUES
('Hambúrguer Clássico', 'Pão, carne, queijo, alface e tomate', 15.90, (SELECT id FROM categories WHERE name = 'Lanches'), true),
('X-Bacon', 'Hambúrguer com bacon crocante', 18.90, (SELECT id FROM categories WHERE name = 'Lanches'), true),
('Coca-Cola 350ml', 'Refrigerante gelado', 4.50, (SELECT id FROM categories WHERE name = 'Bebidas'), false),
('Suco de Laranja', 'Suco natural de laranja', 6.00, (SELECT id FROM categories WHERE name = 'Bebidas'), false),
('Pudim', 'Pudim de leite caseiro', 8.00, (SELECT id FROM categories WHERE name = 'Sobremesas'), false),
('Prato Feito', 'Arroz, feijão, carne e salada', 22.90, (SELECT id FROM categories WHERE name = 'Pratos Principais'), true)
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description, price = EXCLUDED.price, category_id = EXCLUDED.category_id, has_addons = EXCLUDED.has_addons;

-- Inserir acréscimos de exemplo
INSERT INTO addons (name, price, active) VALUES
('Bacon Extra', 3.00, true),
('Queijo Extra', 2.50, true),
('Molho Especial', 1.50, true),
('Batata Frita Pequena', 7.00, true),
('Refrigerante Lata', 5.00, true)
ON CONFLICT (name) DO NOTHING;

-- Adicionar configurações de cor padrão
INSERT INTO settings (key, value) VALUES
('header_color_start', '#667eea'),
('header_color_end', '#764ba2'),
('background_color', '#f8f9fa')
ON CONFLICT (key) DO NOTHING;

-- NOVO: Adicionar configurações para tempo estimado de retirada e entrega
INSERT INTO settings (key, value) VALUES
('estimated_pickup_time', '15-20 minutos'),
('estimated_delivery_time', '30-45 minutos')
ON CONFLICT (key) DO NOTHING;

-- NOVO: Adicionar configurações para habilitar tipos de pedido
INSERT INTO settings (key, value) VALUES
('enable_delivery', 'true'),
('enable_pickup', 'true'),
('enable_table_order', 'false')
ON CONFLICT (key) DO NOTHING;
