-- server/migrations/002_update_product_images.sql
-- Assign high-resolution CDN images to products across all categories

-- Skincare products
UPDATE public.products 
SET 
    image = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    images = ARRAY[
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1608248597359-5484860b7646?auto=format&fit=crop&w=800&q=80'
    ]
WHERE category ILIKE '%skincare%' AND (name ILIKE '%moistur%' OR name ILIKE '%cream%');

UPDATE public.products 
SET 
    image = 'https://images.unsplash.com/photo-1556228852-80b6e5eeff06?auto=format&fit=crop&w=800&q=80',
    images = ARRAY[
        'https://images.unsplash.com/photo-1556228852-80b6e5eeff06?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1556228722-d0b503022e37?auto=format&fit=crop&w=800&q=80'
    ]
WHERE category ILIKE '%skincare%' AND (name ILIKE '%clean%' OR name ILIKE '%wash%');

UPDATE public.products 
SET 
    image = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    images = ARRAY[
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=800&q=80'
    ]
WHERE category ILIKE '%skincare%' AND (name ILIKE '%serum%' OR name ILIKE '%aging%');

UPDATE public.products 
SET 
    image = 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80',
    images = ARRAY[
        'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1556228724-4da94a73229b?auto=format&fit=crop&w=800&q=80'
    ]
WHERE category ILIKE '%skincare%' AND (name ILIKE '%sun%' OR name ILIKE '%spf%');

-- Makeup products
UPDATE public.products 
SET 
    image = 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80',
    images = ARRAY[
        'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?auto=format&fit=crop&w=800&q=80'
    ]
WHERE category ILIKE '%makeup%' AND (name ILIKE '%lip%' OR subcategory ILIKE '%lip%');

UPDATE public.products 
SET 
    image = 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?auto=format&fit=crop&w=800&q=80',
    images = ARRAY[
        'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80'
    ]
WHERE category ILIKE '%makeup%' AND (name ILIKE '%foundation%' OR subcategory ILIKE '%foundation%');

UPDATE public.products 
SET 
    image = 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
    images = ARRAY[
        'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583241800698-e8ab01830a07?auto=format&fit=crop&w=800&q=80'
    ]
WHERE category ILIKE '%makeup%' AND (name ILIKE '%palette%' OR name ILIKE '%shadow%');

UPDATE public.products 
SET 
    image = 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80',
    images = ARRAY[
        'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80'
    ]
WHERE category ILIKE '%makeup%' AND name ILIKE '%mascara%';

-- Fragrance products
UPDATE public.products 
SET 
    image = 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
    images = ARRAY[
        'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80'
    ]
WHERE category ILIKE '%fragrance%';

-- Hair products
UPDATE public.products 
SET 
    image = 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80',
    images = ARRAY[
        'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80'
    ]
WHERE category ILIKE '%hair%';

-- Any remaining products with placeholder paths or null images
UPDATE public.products 
SET 
    image = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80'
WHERE image IS NULL OR image LIKE '%placeholder%' OR image = '';
