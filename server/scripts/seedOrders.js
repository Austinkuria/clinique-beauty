import { supabase } from '../config/db.js';

async function seedOrders() {
  console.log('Seeding orders into Supabase...');

  // 1. Get users and products from DB
  const { data: users } = await supabase.from('users').select('id, name, email').limit(5);
  const { data: products } = await supabase.from('products').select('id, name, price').limit(10);

  if (!users || users.length === 0 || !products || products.length === 0) {
    console.error('No users or products available to create orders');
    process.exit(1);
  }

  const orderStatuses = ['completed', 'processing', 'shipped', 'pending', 'delivered'];
  const cities = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'];

  const ordersToInsert = [];

  for (let i = 0; i < 12; i++) {
    const user = users[i % users.length];
    const product1 = products[i % products.length];
    const product2 = products[(i + 3) % products.length];
    const qty1 = (i % 3) + 1;
    const qty2 = ((i + 1) % 2) + 1;
    const totalPrice = (Number(product1.price) * qty1) + (Number(product2.price) * qty2);

    const dateOffset = i * 2; // spaced over last 24 days
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - dateOffset);

    const orderRecord = {
      user_id: user.id,
      total_price: totalPrice,
      status: orderStatuses[i % orderStatuses.length],
      shipping_address: {
        fullName: user.name,
        email: user.email,
        phone: `+254 712 ${100000 + i}`,
        address: `${100 + i} Kimathi Street`,
        city: cities[i % cities.length],
        country: 'Kenya'
      },
      created_at: createdDate.toISOString(),
      updated_at: createdDate.toISOString()
    };

    const { data: insertedOrder, error: orderErr } = await supabase
      .from('orders')
      .insert(orderRecord)
      .select('id, total_price, status, created_at')
      .single();

    if (orderErr) {
      console.error(`Failed to insert order ${i + 1}:`, orderErr.message);
      continue;
    }

    console.log(`Inserted order ${i + 1} (ID: ${insertedOrder.id}, Amount: KSh ${insertedOrder.total_price})`);

    // Insert order items
    await supabase.from('order_items').insert([
      {
        order_id: insertedOrder.id,
        product_id: product1.id,
        quantity: qty1,
        price: Number(product1.price),
        created_at: createdDate.toISOString()
      },
      {
        order_id: insertedOrder.id,
        product_id: product2.id,
        quantity: qty2,
        price: Number(product2.price),
        created_at: createdDate.toISOString()
      }
    ]);
  }

  const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
  console.log(`Total orders in DB now: ${orderCount}`);
  process.exit(0);
}

seedOrders().catch(err => {
  console.error('Error seeding orders:', err);
  process.exit(1);
});
