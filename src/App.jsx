import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Search, Menu, X, Plus, Minus, Trash2, LogOut, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';

const EcommerceStore = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Initialize sample products
  useEffect(() => {
    const sampleProducts = [
      { id: 1, name: 'Wireless Headphones', price: 6799, category: 'Electronics', image: '🎧', stock: 15, description: 'High-quality wireless headphones with noise cancellation' },
      { id: 2, name: 'Smart Watch', price: 16999, category: 'Electronics', image: '⌚', stock: 8, description: 'Feature-rich smartwatch with fitness tracking' },
      { id: 3, name: 'Laptop Backpack', price: 4249, category: 'Accessories', image: '🎒', stock: 20, description: 'Durable laptop backpack with multiple compartments' },
      { id: 4, name: 'Coffee Maker', price: 7649, category: 'Home', image: '☕', stock: 12, description: 'Automatic coffee maker with programmable settings' },
      { id: 5, name: 'Running Shoes', price: 11049, category: 'Sports', image: '👟', stock: 25, description: 'Comfortable running shoes with excellent support' },
      { id: 6, name: 'Bluetooth Speaker', price: 5099, category: 'Electronics', image: '🔊', stock: 18, description: 'Portable bluetooth speaker with rich sound quality' },
      { id: 7, name: 'Yoga Mat', price: 2975, category: 'Sports', image: '🧘', stock: 30, description: 'Non-slip yoga mat with carrying strap' },
      { id: 8, name: 'Desk Lamp', price: 3399, category: 'Home', image: '💡', stock: 22, description: 'LED desk lamp with adjustable brightness' },
    ];
    setProducts(sampleProducts);

    // Check for logged in user
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Auth functions
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' });
  const [checkoutForm, setCheckoutForm] = useState({ fullName: '', email: '', phone: '', address: '' });

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setLoginForm({ email: '', password: '' });
      setCurrentPage('home');
      toast.success(`Welcome back, ${data.user.name}!`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRegister = async () => {
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setRegisterForm({ name: '', email: '', password: '' });
      setCurrentPage('home');
      toast.success(`Welcome, ${data.user.name}!`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCart([]);
    setOrders([]);
    setCurrentPage('home');
    toast.info('Logged out successfully');
  };

  // Cart functions
  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    toast.success(`Added ${product.name} to cart`);
  };

  const updateQuantity = (productId, change) => {
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
    toast.info('Item removed from cart');
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Order processing
  const handleCheckout = () => {
    if (!user) {
      setCurrentPage('login');
      toast.warning('Please login to checkout');
      return;
    }
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    const order = {
      id: orders.length + 1,
      items: [...cart],
      total: getCartTotal(),
      status: 'Processing',
      date: new Date().toLocaleDateString(),
      address: checkoutForm.address,
    };
    setOrders([...orders, order]);
    setCart([]);
    setCheckoutForm({ fullName: '', email: '', phone: '', address: '' });
    setCurrentPage('orderConfirmation');
    toast.success('Order placed successfully!');
  };

  // Filter products
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5
  };

  // Navigation
  const Navigation = () => (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <motion.h1
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-2xl font-bold cursor-pointer"
              onClick={() => setCurrentPage('home')}
            >
              🛍️ ShopHub
            </motion.h1>
            <div className="hidden md:flex space-x-6">
              <button onClick={() => setCurrentPage('home')} className="hover:text-blue-200 transition">Products</button>
              {user && <button onClick={() => setCurrentPage('orders')} className="hover:text-blue-200 transition">My Orders</button>}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative cursor-pointer"
              onClick={() => setCurrentPage('cart')}
            >
              <ShoppingCart size={24} />
              <AnimatePresence>
                {getCartCount() > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                  >
                    {getCartCount()}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="hidden md:inline">Hi, {user.name}</span>
                <button onClick={handleLogout} className="hover:text-blue-200 transition">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button onClick={() => setCurrentPage('login')} className="flex items-center space-x-1 hover:text-blue-200 transition">
                <User size={20} />
                <span className="hidden md:inline">Login</span>
              </button>
            )}
            <button className="md:hidden" onClick={() => setShowMobileMenu(!showMobileMenu)}>
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden pb-4 space-y-2 overflow-hidden"
            >
              <button onClick={() => { setCurrentPage('home'); setShowMobileMenu(false); }} className="block w-full text-left py-2">Products</button>
              {user && <button onClick={() => { setCurrentPage('orders'); setShowMobileMenu(false); }} className="block w-full text-left py-2">My Orders</button>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );

  // Home/Products Page
  const HomePage = () => (
    <motion.div
      initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}
      className="max-w-7xl mx-auto px-4 py-8"
    >
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:shadow-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredProducts.map(product => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              key={product.id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
            >
              <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-6xl transform transition-transform hover:scale-110 duration-300">
                {product.image}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-blue-600">{formatPrice(product.price)}</span>
                  <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                </div>
                <div className="mt-4 space-y-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setSelectedProduct(product); setCurrentPage('productDetail'); }}
                    className="w-full bg-gray-100 text-gray-800 py-2 rounded-lg hover:bg-gray-200 transition"
                  >
                    View Details
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addToCart(product)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition shadow-blue-500/30 hover:shadow-blue-500/50"
                  >
                    Add to Cart
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );

  // Product Detail Page
  const ProductDetailPage = () => (
    <motion.div
      initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      <button onClick={() => setCurrentPage('home')} className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-2">
        <span>←</span> Back to Products
      </button>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 h-96 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-9xl">
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {selectedProduct.image}
            </motion.div>
          </div>
          <div className="md:w-1/2 p-8">
            <h1 className="text-3xl font-bold mb-2">{selectedProduct.name}</h1>
            <p className="text-gray-500 mb-4">{selectedProduct.category}</p>
            <p className="text-4xl font-bold text-blue-600 mb-4">{formatPrice(selectedProduct.price)}</p>
            <p className="text-gray-700 mb-6">{selectedProduct.description}</p>
            <div className="mb-6">
              <span className="text-sm text-gray-600">Availability: </span>
              <span className={`font-semibold ${selectedProduct.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {selectedProduct.stock > 0 ? `${selectedProduct.stock} in stock` : 'Out of stock'}
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { addToCart(selectedProduct); setCurrentPage('cart'); }}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition text-lg font-semibold shadow-lg shadow-blue-500/30"
              disabled={selectedProduct.stock === 0}
            >
              Add to Cart
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Cart Page
  const CartPage = () => (
    <motion.div
      initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
      {cart.length === 0 ? (
        <div className="text-center py-12">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="inline-block"
          >
            <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
          </motion.div>
          <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
          <button onClick={() => setCurrentPage('home')} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {cart.map(item => (
              <motion.div
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                key={item.id}
                className="bg-white rounded-lg shadow-md p-4 flex items-center"
              >
                <div className="text-4xl mr-4">{item.image}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-gray-500">{formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-gray-100 rounded">
                    <Minus size={20} />
                  </button>
                  <span className="font-semibold w-8 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-gray-100 rounded">
                    <Plus size={20} />
                  </button>
                </div>
                <div className="ml-6 font-bold text-lg">{formatPrice(item.price * item.quantity)}</div>
                <button onClick={() => removeFromCart(item.id)} className="ml-4 text-red-500 hover:text-red-700">
                  <Trash2 size={20} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          <motion.div layout className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center text-xl font-bold mb-4">
              <span>Total:</span>
              <span className="text-blue-600">{formatPrice(getCartTotal())}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentPage('checkout')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition text-lg font-semibold shadow-lg shadow-blue-500/30"
            >
              Proceed to Checkout
            </motion.button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );

  // Checkout Page
  const CheckoutPage = () => (
    <motion.div
      initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}
      className="max-w-2xl mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={checkoutForm.fullName}
              onChange={(e) => setCheckoutForm({ ...checkoutForm, fullName: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow focus:shadow-md"
            />
            <input
              type="email"
              placeholder="Email"
              value={checkoutForm.email}
              onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow focus:shadow-md"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={checkoutForm.phone}
              onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow focus:shadow-md"
            />
            <textarea
              placeholder="Shipping Address"
              rows="3"
              value={checkoutForm.address}
              onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow focus:shadow-md"
            ></textarea>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          {cart.map(item => (
            <div key={item.id} className="flex justify-between py-2">
              <span>{item.name} x {item.quantity}</span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t mt-4 pt-4 flex justify-between text-xl font-bold">
            <span>Total:</span>
            <span className="text-blue-600">{formatPrice(getCartTotal())}</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCheckout}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition text-lg font-semibold shadow-lg shadow-blue-500/30"
        >
          Place Order
        </motion.button>
      </div>
    </motion.div>
  );

  // Order Confirmation
  const OrderConfirmationPage = () => (
    <motion.div
      initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}
      className="max-w-2xl mx-auto px-4 py-8 text-center"
    >
      <div className="bg-white rounded-lg shadow-lg p-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="text-green-500 mb-4"
        >
          <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </motion.div>
        <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
        <p className="text-gray-600 mb-6">Thank you for your purchase. Your order has been successfully placed.</p>
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600">Order Number</p>
          <p className="text-2xl font-bold text-blue-600">#{orders[orders.length - 1]?.id.toString().padStart(6, '0')}</p>
        </div>
        <div className="space-x-4">
          <button onClick={() => setCurrentPage('orders')} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            View Orders
          </button>
          <button onClick={() => setCurrentPage('home')} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300">
            Continue Shopping
          </button>
        </div>
      </div>
    </motion.div>
  );

  // Orders Page
  const OrdersPage = () => (
    <motion.div
      initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              key={order.id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order #{order.id.toString().padStart(6, '0')}</p>
                  <p className="text-sm text-gray-500">{order.date}</p>
                </div>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {order.status}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} x {item.quantity}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 flex justify-between font-bold">
                <span>Total:</span>
                <span className="text-blue-600">{formatPrice(order.total)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );

  // Login Page
  const LoginPage = () => (
    <motion.div
      initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}
      className="max-w-md mx-auto px-4 py-12"
    >
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={loginForm.email}
            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={loginForm.password}
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Login
          </motion.button>
        </div>
        <p className="text-center mt-4 text-gray-600">
          Don't have an account?
          <button onClick={() => setCurrentPage('register')} className="text-blue-600 hover:text-blue-700 ml-1">
            Register
          </button>
        </p>
      </div>
    </motion.div>
  );

  // Register Page
  const RegisterPage = () => (
    <motion.div
      initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}
      className="max-w-md mx-auto px-4 py-12"
    >
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Register</h1>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={registerForm.name}
            onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={registerForm.email}
            onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={registerForm.password}
            onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRegister}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Register
          </motion.button>
        </div>
        <p className="text-center mt-4 text-gray-600">
          Already have an account?
          <button onClick={() => setCurrentPage('login')} className="text-blue-600 hover:text-blue-700 ml-1">
            Login
          </button>
        </p>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" richColors />
      <Navigation />
      <AnimatePresence mode="wait">
        {currentPage === 'home' && <HomePage key="home" />}
        {currentPage === 'productDetail' && <ProductDetailPage key="productDetail" />}
        {currentPage === 'cart' && <CartPage key="cart" />}
        {currentPage === 'checkout' && <CheckoutPage key="checkout" />}
        {currentPage === 'orderConfirmation' && <OrderConfirmationPage key="orderConfirmation" />}
        {currentPage === 'orders' && <OrdersPage key="orders" />}
        {currentPage === 'login' && <LoginPage key="login" />}
        {currentPage === 'register' && <RegisterPage key="register" />}
      </AnimatePresence>
    </div>
  );
};

export default EcommerceStore;
