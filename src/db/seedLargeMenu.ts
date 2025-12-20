import { getDBConnection } from './database';
import { Category, Dish } from './types';

export const seedLargeMenuData = async () => {
  const db = await getDBConnection();

  // Check if data already exists
  const existingCategories = await db.getAllAsync<Category>(
    'SELECT * FROM categories LIMIT 1',
  );

  if (existingCategories.length > 5) {
    console.log('Database already seeded with large dataset');
    return;
  }

  console.log('Seeding large menu dataset...');

  const categories = [
    { name: 'Starters & Appetizers', display_order: 1 },
    { name: 'Soups & Salads', display_order: 2 },
    { name: 'Main Course - North Indian', display_order: 3 },
    { name: 'Main Course - South Indian', display_order: 4 },
    { name: 'Main Course - Chinese', display_order: 5 },
    { name: 'Main Course - Continental', display_order: 6 },
    { name: 'Breads & Rice', display_order: 7 },
    { name: 'Tandoor Specials', display_order: 8 },
    { name: 'Seafood Delights', display_order: 9 },
    { name: 'Biryani & Pulao', display_order: 10 },
    { name: 'Desserts', display_order: 11 },
    { name: 'Beverages', display_order: 12 },
    { name: 'Fast Food', display_order: 13 },
    { name: 'Regional Specialties', display_order: 14 },
  ];

  const dishTemplates = {
    'Starters & Appetizers': [
      {
        name: 'Paneer Tikka',
        type: 'VEG',
        price: 180,
        desc: 'Grilled cottage cheese marinated in spices',
      },
      {
        name: 'Chicken 65',
        type: 'NON_VEG',
        price: 220,
        desc: 'Spicy fried chicken with curry leaves',
      },
      {
        name: 'Veg Spring Rolls',
        type: 'VEG',
        price: 140,
        desc: 'Crispy rolls with mixed vegetables',
      },
      {
        name: 'Fish Finger',
        type: 'NON_VEG',
        price: 240,
        desc: 'Batter fried fish strips',
      },
      {
        name: 'Mushroom Pepper Fry',
        type: 'VEG',
        price: 160,
        desc: 'Sautéed mushrooms with black pepper',
      },
      {
        name: 'Prawn Fry',
        type: 'NON_VEG',
        price: 280,
        desc: 'Crispy fried prawns with spices',
      },
      {
        name: 'Gobi Manchurian',
        type: 'VEG',
        price: 150,
        desc: 'Indo-Chinese cauliflower appetizer',
      },
      {
        name: 'Chicken Lollipop',
        type: 'NON_VEG',
        price: 230,
        desc: 'Spicy chicken wings appetizer',
      },
      {
        name: 'Crispy Corn',
        type: 'VEG',
        price: 130,
        desc: 'Sweet corn kernels fried till crispy',
      },
      {
        name: 'Mutton Seekh Kebab',
        type: 'NON_VEG',
        price: 260,
        desc: 'Minced mutton grilled on skewers',
      },
      {
        name: 'Hara Bhara Kabab',
        type: 'VEG',
        price: 140,
        desc: 'Spinach and peas patties',
      },
      {
        name: 'Egg Pakoda',
        type: 'EGG',
        price: 120,
        desc: 'Boiled eggs coated in spicy batter',
      },
    ],
    'Soups & Salads': [
      {
        name: 'Tomato Soup',
        type: 'VEG',
        price: 90,
        desc: 'Creamy tomato soup with herbs',
      },
      {
        name: 'Hot & Sour Chicken Soup',
        type: 'NON_VEG',
        price: 110,
        desc: 'Tangy and spicy chicken soup',
      },
      {
        name: 'Sweet Corn Soup',
        type: 'VEG',
        price: 85,
        desc: 'Sweet corn kernels in clear soup',
      },
      {
        name: 'Caesar Salad',
        type: 'VEG',
        price: 140,
        desc: 'Romaine lettuce with Caesar dressing',
      },
      {
        name: 'Greek Salad',
        type: 'VEG',
        price: 150,
        desc: 'Fresh vegetables with feta cheese',
      },
      {
        name: 'Chicken Clear Soup',
        type: 'NON_VEG',
        price: 100,
        desc: 'Light chicken broth',
      },
      {
        name: 'Mushroom Soup',
        type: 'VEG',
        price: 95,
        desc: 'Creamy mushroom soup',
      },
      {
        name: 'Manchow Soup',
        type: 'VEG',
        price: 90,
        desc: 'Spicy Indo-Chinese soup',
      },
      {
        name: 'Garden Fresh Salad',
        type: 'VEG',
        price: 80,
        desc: 'Mixed green salad',
      },
      {
        name: 'Russian  Salad',
        type: 'VEG',
        price: 100,
        desc: 'Vegetables in mayonnaise dressing',
      },
      {
        name: 'Lemon Coriander Soup',
        type: 'VEG',
        price: 85,
        desc: 'Tangy lemon and coriander soup',
      },
      {
        name: 'Seafood Soup',
        type: 'NON_VEG',
        price: 150,
        desc: 'Mixed seafood in clear broth',
      },
    ],
    'Main Course - North Indian': [
      {
        name: 'Paneer Butter Masala',
        type: 'VEG',
        price: 200,
        desc: 'Cottage cheese in rich tomato gravy',
      },
      {
        name: 'Dal Makhani',
        type: 'VEG',
        price: 160,
        desc: 'Black lentils in creamy gravy',
      },
      {
        name: 'Butter Chicken',
        type: 'NON_VEG',
        price: 250,
        desc: 'Chicken in buttery tomato sauce',
      },
      {
        name: 'Kadai Paneer',
        type: 'VEG',
        price: 190,
        desc: 'Cottage cheese with bell peppers',
      },
      {
        name: 'Mutton Rogan Josh',
        type: 'NON_VEG',
        price: 280,
        desc: 'Kashmiri mutton curry',
      },
      {
        name: 'Palak Paneer',
        type: 'VEG',
        price: 180,
        desc: 'Cottage cheese in spinach gravy',
      },
      {
        name: 'Chicken Tikka Masala',
        type: 'NON_VEG',
        price: 240,
        desc: 'Grilled chicken in spicy gravy',
      },
      {
        name: 'Chole Bhature',
        type: 'VEG',
        price: 150,
        desc: 'Chickpea curry with fried bread',
      },
      {
        name: 'Aloo Gobi',
        type: 'VEG',
        price: 140,
        desc: 'Potato and cauliflower curry',
      },
      {
        name: 'Chicken Korma',
        type: 'NON_VEG',
        price: 230,
        desc: 'Chicken in mild creamy sauce',
      },
      {
        name: 'Malai Kofta',
        type: 'VEG',
        price: 180,
        desc: 'Vegetable dumplings in creamy gravy',
      },
      {
        name: 'Egg Curry',
        type: 'EGG',
        price: 140,
        desc: 'Boiled eggs in spiced gravy',
      },
    ],
    'Main Course - South Indian': [
      {
        name: 'Masala Dosa',
        type: 'VEG',
        price: 80,
        desc: 'Crispy rice crepe with potato filling',
      },
      {
        name: 'Idli Sambar',
        type: 'VEG',
        price: 60,
        desc: 'Steamed rice cakes with lentil soup',
      },
      {
        name: 'Medu Vada',
        type: 'VEG',
        price: 70,
        desc: 'Fried lentil donuts',
      },
      {
        name: 'Uttapam',
        type: 'VEG',
        price: 90,
        desc: 'Thick rice pancake with toppings',
      },
      {
        name: 'Rava Dosa',
        type: 'VEG',
        price: 85,
        desc: 'Crispy semolina crepe',
      },
      {
        name: 'Pongal',
        type: 'VEG',
        price: 75,
        desc: 'Rice and lentil porridge',
      },
      {
        name: 'Bisi Bele Bath',
        type: 'VEG',
        price: 100,
        desc: 'Spicy rice and lentil dish',
      },
      {
        name: 'Curd Rice',
        type: 'VEG',
        price: 80,
        desc: 'Rice mixed with yogurt',
      },
      {
        name: 'Lemon Rice',
        type: 'VEG',
        price: 85,
        desc: 'Tangy lemon flavored rice',
      },
      {
        name: 'Coconut Rice',
        type: 'VEG',
        price: 90,
        desc: 'Rice with fresh coconut',
      },
      {
        name: 'Tamarind Rice',
        type: 'VEG',
        price: 85,
        desc: 'Tangy tamarind flavored rice',
      },
      {
        name: 'Tomato Rice',
        type: 'VEG',
        price: 80,
        desc: 'Rice cooked with tomatoes',
      },
    ],
    'Main Course - Chinese': [
      {
        name: 'Veg Hakka Noodles',
        type: 'VEG',
        price: 140,
        desc: 'Stir-fried noodles with vegetables',
      },
      {
        name: 'Chicken Schezwan Noodles',
        type: 'NON_VEG',
        price: 180,
        desc: 'Spicy chicken noodles',
      },
      {
        name: 'Veg Fried Rice',
        type: 'VEG',
        price: 130,
        desc: 'Wok-tossed rice with vegetables',
      },
      {
        name: 'Chicken Fried Rice',
        type: 'NON_VEG',
        price: 170,
        desc: 'Fried rice with chicken',
      },
      {
        name: 'Chilli Chicken',
        type: 'NON_VEG',
        price: 220,
        desc: 'Spicy chicken in chilli sauce',
      },
      {
        name: 'Veg Manchurian',
        type: 'VEG',
        price: 150,
        desc: 'Vegetable balls in Manchurian sauce',
      },
      {
        name: 'Kung Pao Chicken',
        type: 'NON_VEG',
        price: 230,
        desc: 'Spicy stir-fried chicken with peanuts',
      },
      {
        name: 'Sweet & Sour Veg',
        type: 'VEG',
        price: 160,
        desc: 'Vegetables in sweet and sour sauce',
      },
      {
        name: 'Dragon Chicken',
        type: 'NON_VEG',
        price: 240,
        desc: 'Fiery chicken in dragon sauce',
      },
      {
        name: 'Paneer Chilli',
        type: 'VEG',
        price: 180,
        desc: 'Cottage cheese in chilli sauce',
      },
      {
        name: 'Singapore Noodles',
        type: 'VEG',
        price: 150,
        desc: 'Curry flavored rice noodles',
      },
      {
        name: 'Egg Fried Rice',
        type: 'EGG',
        price: 140,
        desc: 'Fried rice with scrambled eggs',
      },
    ],
    'Main Course - Continental': [
      {
        name: 'Grilled Chicken Steak',
        type: 'NON_VEG',
        price: 320,
        desc: 'Juicy grilled chicken with sides',
      },
      {
        name: 'Veg Lasagna',
        type: 'VEG',
        price: 240,
        desc: 'Layered pasta with vegetables',
      },
      {
        name: 'Chicken Alfredo Pasta',
        type: 'NON_VEG',
        price: 260,
        desc: 'Creamy fettuccine with chicken',
      },
      {
        name: 'Margherita Pizza',
        type: 'VEG',
        price: 220,
        desc: 'Classic tomato and cheese pizza',
      },
      {
        name: 'Fish & Chips',
        type: 'NON_VEG',
        price: 280,
        desc: 'Battered fish with french fries',
      },
      {
        name: 'Mac & Cheese',
        type: 'VEG',
        price: 180,
        desc: 'Macaroni in cheese sauce',
      },
      {
        name: 'Beef Burger',
        type: 'NON_VEG',
        price: 240,
        desc: 'Grilled beef patty burger',
      },
      {
        name: 'Veg Burger',
        type: 'VEG',
        price: 160,
        desc: 'Vegetable patty burger',
      },
      {
        name: 'Penne Arrabiata',
        type: 'VEG',
        price: 200,
        desc: 'Spicy tomato pasta',
      },
      {
        name: 'Chicken Caesar Wrap',
        type: 'NON_VEG',
        price: 200,
        desc: 'Grilled chicken wrap',
      },
      {
        name: 'Grilled Fish Fillet',
        type: 'NON_VEG',
        price: 300,
        desc: 'Herb grilled fish with sides',
      },
      {
        name: 'Mushroom Risotto',
        type: 'VEG',
        price: 220,
        desc: 'Creamy Italian rice with mushrooms',
      },
    ],
    'Breads & Rice': [
      {
        name: 'Butter Naan',
        type: 'VEG',
        price: 40,
        desc: 'Soft leavened bread with butter',
      },
      {
        name: 'Garlic Naan',
        type: 'VEG',
        price: 50,
        desc: 'Naan topped with garlic',
      },
      {
        name: 'Tandoori Roti',
        type: 'VEG',
        price: 25,
        desc: 'Whole wheat flatbread',
      },
      {
        name: 'Laccha Paratha',
        type: 'VEG',
        price: 45,
        desc: 'Layered wheat bread',
      },
      {
        name: 'Cheese Naan',
        type: 'VEG',
        price: 70,
        desc: 'Naan stuffed with cheese',
      },
      {
        name: 'Plain Rice',
        type: 'VEG',
        price: 80,
        desc: 'Steamed basmati rice',
      },
      {
        name: 'Jeera Rice',
        type: 'VEG',
        price: 100,
        desc: 'Cumin flavored rice',
      },
      {
        name: 'Kashmiri Pulao',
        type: 'VEG',
        price: 150,
        desc: 'Sweet rice with dry fruits',
      },
      {
        name: 'Missi Roti',
        type: 'VEG',
        price: 35,
        desc: 'Spiced gram flour bread',
      },
      {
        name: 'Butter Roti',
        type: 'VEG',
        price: 30,
        desc: 'Whole wheat bread with butter',
      },
      { name: 'Kulcha', type: 'VEG', price: 45, desc: 'Leavened soft bread' },
      {
        name: 'Rumali Roti',
        type: 'VEG',
        price: 30,
        desc: 'Thin soft flatbread',
      },
    ],
    'Tandoor Specials': [
      {
        name: 'Tandoori Chicken',
        type: 'NON_VEG',
        price: 280,
        desc: 'Marinated chicken grilled in tandoor',
      },
      {
        name: 'Chicken Tikka',
        type: 'NON_VEG',
        price: 240,
        desc: 'Boneless chicken pieces grilled',
      },
      {
        name: 'Paneer Tikka',
        type: 'VEG',
        price: 200,
        desc: 'Cottage cheese cubes grilled',
      },
      {
        name: 'Fish Tikka',
        type: 'NON_VEG',
        price: 280,
        desc: 'Spiced fish grilled in tandoor',
      },
      {
        name: 'Chicken Malai Tikka',
        type: 'NON_VEG',
        price: 260,
        desc: 'Creamy marinated chicken',
      },
      {
        name: 'Tandoori Prawns',
        type: 'NON_VEG',
        price: 320,
        desc: 'Grilled prawns with spices',
      },
      {
        name: 'Hariyali Tikka',
        type: 'NON_VEG',
        price: 250,
        desc: 'Green herb marinated chicken',
      },
      {
        name: 'Afghani Chicken',
        type: 'NON_VEG',
        price: 270,
        desc: 'Mild creamy grilled chicken',
      },
      {
        name: 'Seekh Kebab',
        type: 'NON_VEG',
        price: 240,
        desc: 'Minced meat on skewers',
      },
      {
        name: 'Tandoori Mushroom',
        type: 'VEG',
        price: 180,
        desc: 'Grilled stuffed mushrooms',
      },
      {
        name: 'Achari Tikka',
        type: 'NON_VEG',
        price: 250,
        desc: 'Pickle flavored grilled chicken',
      },
      {
        name: 'Soya Tikka',
        type: 'VEG',
        price: 160,
        desc: 'Grilled soya chunks',
      },
    ],
    'Seafood Delights': [
      {
        name: 'Fish Curry',
        type: 'NON_VEG',
        price: 260,
        desc: 'Fresh fish in spicy gravy',
      },
      {
        name: 'Prawn Masala',
        type: 'NON_VEG',
        price: 300,
        desc: 'Prawns in rich masala',
      },
      {
        name: 'Fish Fry',
        type: 'NON_VEG',
        price: 240,
        desc: 'Crispy fried fish',
      },
      {
        name: 'Crab Masala',
        type: 'NON_VEG',
        price: 350,
        desc: 'Crab meat in spicy gravy',
      },
      {
        name: 'Prawn Biryani',
        type: 'NON_VEG',
        price: 320,
        desc: 'Fragrant rice with prawns',
      },
      {
        name: 'Fish Tikka Masala',
        type: 'NON_VEG',
        price: 280,
        desc: 'Grilled fish in gravy',
      },
      {
        name: 'Squid Fry',
        type: 'NON_VEG',
        price: 280,
        desc: 'Crispy fried squid rings',
      },
      {
        name: 'Prawn Pepper Fry',
        type: 'NON_VEG',
        price: 310,
        desc: 'Prawns sautéed with pepper',
      },
      {
        name: 'Fish Moilee',
        type: 'NON_VEG',
        price: 270,
        desc: 'Fish in coconut curry',
      },
      {
        name: 'Butter Garlic Prawns',
        type: 'NON_VEG',
        price: 320,
        desc: 'Prawns in butter garlic sauce',
      },
      {
        name: 'Goan Fish Curry',
        type: 'NON_VEG',
        price: 280,
        desc: 'Tangy coconut fish curry',
      },
      {
        name: 'Lobster Thermidor',
        type: 'NON_VEG',
        price: 650,
        desc: 'Premium lobster preparation',
      },
    ],
    'Biryani & Pulao': [
      {
        name: 'Chicken Biryani',
        type: 'NON_VEG',
        price: 220,
        desc: 'Fragrant rice with chicken',
      },
      {
        name: 'Mutton Biryani',
        type: 'NON_VEG',
        price: 260,
        desc: 'Aromatic rice with mutton',
      },
      {
        name: 'Veg Biryani',
        type: 'VEG',
        price: 160,
        desc: 'Mixed vegetables with rice',
      },
      {
        name: 'Hyderabadi Biryani',
        type: 'NON_VEG',
        price: 280,
        desc: 'Authentic Hyderabadi style',
      },
      {
        name: 'Egg Biryani',
        type: 'EGG',
        price: 140,
        desc: 'Rice with boiled eggs',
      },
      {
        name: 'Paneer Biryani',
        type: 'VEG',
        price: 180,
        desc: 'Cottage cheese biryani',
      },
      {
        name: 'Fish Biryani',
        type: 'NON_VEG',
        price: 240,
        desc: 'Fragrant rice with fish',
      },
      {
        name: 'Lucknowi Biryani',
        type: 'NON_VEG',
        price: 270,
        desc: 'Awadhi style biryani',
      },
      {
        name: 'Veg Pulao',
        type: 'VEG',
        price: 140,
        desc: 'Mildly spiced rice with vegetables',
      },
      {
        name: 'Chicken Pulao',
        type: 'NON_VEG',
        price: 200,
        desc: 'Simple chicken rice',
      },
      {
        name: 'Mushroom Pulao',
        type: 'VEG',
        price: 150,
        desc: 'Rice with mushrooms',
      },
      {
        name: 'Keema Biryani',
        type: 'NON_VEG',
        price: 250,
        desc: 'Minced meat biryani',
      },
    ],
    Desserts: [
      {
        name: 'Gulab Jamun',
        type: 'VEG',
        price: 60,
        desc: 'Sweet milk dumplings in syrup',
      },
      {
        name: 'Rasmalai',
        type: 'VEG',
        price: 80,
        desc: 'Cottage cheese in sweet milk',
      },
      {
        name: 'Ice Cream (Vanilla)',
        type: 'VEG',
        price: 70,
        desc: 'Classic vanilla ice cream',
      },
      {
        name: 'Chocolate Brownie',
        type: 'VEG',
        price: 90,
        desc: 'Rich chocolate brownie',
      },
      {
        name: 'Tiramisu',
        type: 'VEG',
        price: 120,
        desc: 'Italian coffee dessert',
      },
      { name: 'Kheer', type: 'VEG', price: 70, desc: 'Rice pudding with nuts' },
      { name: 'Gajar Halwa', type: 'VEG', price: 80, desc: 'Carrot pudding' },
      {
        name: 'Kulfi',
        type: 'VEG',
        price: 60,
        desc: 'Traditional Indian ice cream',
      },
      {
        name: 'Cheesecake',
        type: 'VEG',
        price: 130,
        desc: 'Creamy cheesecake slice',
      },
      {
        name: 'Apple Pie',
        type: 'VEG',
        price: 100,
        desc: 'Warm apple pie with a scoop',
      },
      { name: 'Moong Dal Halwa', type: 'VEG', price: 90, desc: 'Lentil sweet' },
      { name: 'Jalebi', type: 'VEG', price: 50, desc: 'Crispy sweet spirals' },
    ],
    Beverages: [
      {
        name: 'Fresh Lime Soda',
        type: 'VEG',
        price: 50,
        desc: 'Refreshing lime drink',
      },
      {
        name: 'Mango Lassi',
        type: 'VEG',
        price: 80,
        desc: 'Sweet yogurt mango drink',
      },
      {
        name: 'Masala Chai',
        type: 'VEG',
        price: 30,
        desc: 'Spiced Indian tea',
      },
      {
        name: 'Cold Coffee',
        type: 'VEG',
        price: 90,
        desc: 'Chilled coffee shake',
      },
      {
        name: 'Fresh Fruit Juice',
        type: 'VEG',
        price: 70,
        desc: 'Seasonal fruit juice',
      },
      { name: 'Coca Cola', type: 'VEG', price: 40, desc: 'Soft drink' },
      { name: 'Mineral Water', type: 'VEG', price: 20, desc: 'Bottled water' },
      {
        name: 'Buttermilk',
        type: 'VEG',
        price: 40,
        desc: 'Spiced yogurt drink',
      },
      {
        name: 'Virgin Mojito',
        type: 'VEG',
        price: 100,
        desc: 'Minty fresh mocktail',
      },
      { name: 'Iced Tea', type: 'VEG', price: 80, desc: 'Refreshing cold tea' },
      {
        name: 'Rose Milk',
        type: 'VEG',
        price: 60,
        desc: 'Sweet rose flavored milk',
      },
      { name: 'Espresso', type: 'VEG', price: 70, desc: 'Strong black coffee' },
    ],
    'Fast Food': [
      {
        name: 'Veg Burger',
        type: 'VEG',
        price: 100,
        desc: 'Vegetable patty burger',
      },
      {
        name: 'Chicken Burger',
        type: 'NON_VEG',
        price: 140,
        desc: 'Grilled chicken burger',
      },
      {
        name: 'French Fries',
        type: 'VEG',
        price: 80,
        desc: 'Crispy potato fries',
      },
      {
        name: 'Veg Pizza',
        type: 'VEG',
        price: 180,
        desc: 'Mixed vegetable pizza',
      },
      {
        name: 'Chicken Pizza',
        type: 'NON_VEG',
        price: 220,
        desc: 'Chicken topping pizza',
      },
      {
        name: 'Veg Sandwich',
        type: 'VEG',
        price: 80,
        desc: 'Grilled vegetable sandwich',
      },
      {
        name: 'Chicken Sandwich',
        type: 'NON_VEG',
        price: 120,
        desc: 'Grilled chicken sandwich',
      },
      {
        name: 'Veg Wrap',
        type: 'VEG',
        price: 100,
        desc: 'Vegetable tortilla wrap',
      },
      {
        name: 'Chicken Wrap',
        type: 'NON_VEG',
        price: 140,
        desc: 'Chicken tortilla wrap',
      },
      {
        name: 'Nachos',
        type: 'VEG',
        price: 120,
        desc: 'Tortilla chips with cheese dip',
      },
      {
        name: 'Potato Wedges',
        type: 'VEG',
        price: 90,
        desc: 'Seasoned potato wedges',
      },
      {
        name: 'Chicken Nuggets',
        type: 'NON_VEG',
        price: 150,
        desc: 'Crispy chicken pieces',
      },
    ],
    'Regional Specialties': [
      {
        name: 'Pav Bhaji',
        type: 'VEG',
        price: 120,
        desc: 'Mumbai street food special',
      },
      {
        name: 'Misal Pav',
        type: 'VEG',
        price: 100,
        desc: 'Spicy sprouts curry with bread',
      },
      {
        name: 'Vada Pav',
        type: 'VEG',
        price: 40,
        desc: 'Spiced potato fritter in bun',
      },
      {
        name: 'Dahi Puri',
        type: 'VEG',
        price: 80,
        desc: 'Crispy puris with yogurt',
      },
      {
        name: 'Pani Puri',
        type: 'VEG',
        price: 60,
        desc: 'Crispy hollow puris with water',
      },
      {
        name: 'Samosa Chaat',
        type: 'VEG',
        price: 90,
        desc: 'Crushed samosas with chutneys',
      },
      {
        name: 'Raj Kachori',
        type: 'VEG',
        price: 100,
        desc: 'Large stuffed kachori',
      },
      {
        name: 'Papdi Chaat',
        type: 'VEG',
        price: 80,
        desc: 'Crispy wafers with toppings',
      },
      {
        name: 'Aloo Tikki Chaat',
        type: 'VEG',
        price: 85,
        desc: 'Potato patties with chutneys',
      },
      { name: 'Dhokla', type: 'VEG', price: 70, desc: 'Steamed savory cake' },
      {
        name: 'Bhel Puri',
        type: 'VEG',
        price: 60,
        desc: 'Puffed rice mixture',
      },
      {
        name: 'Kand Poha',
        type: 'VEG',
        price: 90,
        desc: 'Flattened rice with peanuts',
      },
    ],
  };

  try {
    // Insert categories and dishes
    for (const category of categories) {
      const categoryResult = await db.runAsync(
        'INSERT INTO categories (name, display_order) VALUES (?, ?)',
        [category.name, category.display_order],
      );

      const categoryId = categoryResult.lastInsertRowId;
      const dishList =
        dishTemplates[category.name as keyof typeof dishTemplates] || [];

      for (let i = 0; i < dishList.length; i++) {
        const dish = dishList[i];
        await db.runAsync(
          `INSERT INTO dishes (name, category_id, price, dish_type, description, display_order, is_available) 
           VALUES (?, ?, ?, ?, ?, ?, 1)`,
          [dish.name, categoryId, dish.price, dish.type, dish.desc, i + 1],
        );
      }

      console.log(
        `✓ Seeded category: ${category.name} with ${dishList.length} dishes`,
      );
    }

    console.log('✅ Large menu dataset seeded successfully!');
    console.log(
      `Total: ${categories.length} categories, ~${
        categories.length * 12
      } dishes`,
    );
  } catch (error) {
    console.error('Error seeding large menu data:', error);
    throw error;
  }
};
