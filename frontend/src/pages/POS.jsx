import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllItems } from '../redux/slices/inventorySlice';
import { getAllCustomers } from '../redux/slices/customerSlice';
import { createInvoice, reset } from '../redux/slices/posSlice';
import Layout from '../components/Layout';

const POS = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.inventory);
  const { customers } = useSelector((state) => state.customers);
  const { isLoading, isSuccess, isError, message } = useSelector((state) => state.pos);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paidAmount, setPaidAmount] = useState('');
  const [showInvoiceSuccess, setShowInvoiceSuccess] = useState(false);

  useEffect(() => {
    dispatch(getAllItems());
    dispatch(getAllCustomers());
  }, [dispatch]);

  useEffect(() => {
    if (isSuccess && !isLoading) {
      setShowInvoiceSuccess(true);
      // Clear cart and reset form
      setCart([]);
      setSelectedCustomer(null);
      setDiscount(0);
      setPaidAmount('');
      setPaymentMethod('cash');
      setSearchTerm('');
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setShowInvoiceSuccess(false);
        dispatch(reset());
      }, 3000);
    }
  }, [isSuccess, isLoading, dispatch]);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addToCart = (item) => {
    const existingItem = cart.find((cartItem) => cartItem.item === item._id);
    
    if (existingItem) {
      // Check if we have enough stock
      if (existingItem.quantity >= item.stockQty) {
        alert(`Only ${item.stockQty} units available in stock!`);
        return;
      }
      
      setCart(
        cart.map((cartItem) =>
          cartItem.item === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1, total: (cartItem.quantity + 1) * cartItem.price }
            : cartItem
        )
      );
    } else {
      if (item.stockQty === 0) {
        alert('This item is out of stock!');
        return;
      }
      
      setCart([
        ...cart,
        {
          item: item._id,
          name: item.name,
          quantity: 1,
          price: item.sellingPrice,
          total: item.sellingPrice,
          availableStock: item.stockQty,
        },
      ]);
    }
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const cartItem = cart.find((item) => item.item === itemId);
    if (cartItem && newQuantity > cartItem.availableStock) {
      alert(`Only ${cartItem.availableStock} units available!`);
      return;
    }

    setCart(
      cart.map((cartItem) =>
        cartItem.item === itemId
          ? { ...cartItem, quantity: newQuantity, total: newQuantity * cartItem.price }
          : cartItem
      )
    );
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter((cartItem) => cartItem.item !== itemId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - discount;
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    const total = calculateTotal();
    const paid = parseFloat(paidAmount) || 0;

    if (paid < 0) {
      alert('Invalid payment amount!');
      return;
    }

    const invoiceData = {
      customerId: selectedCustomer?._id || null,
      items: cart.map(({ item, quantity, price, total }) => ({
        item,
        quantity,
        price,
        total,
      })),
      discount: parseFloat(discount) || 0,
      paidAmount: paid,
      paymentMethod,
    };

    dispatch(createInvoice(invoiceData));
  };

  const subtotal = calculateSubtotal();
  const total = calculateTotal();
  const paid = parseFloat(paidAmount) || 0;
  const balance = paid - total;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Point of Sale</h1>
            <p className="text-gray-600">Create new invoice and process payments</p>
          </div>
          <button
            onClick={() => navigate('/pos/invoices')}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>View Invoices</span>
          </button>
        </div>

        {/* Success Message */}
        {showInvoiceSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-600 font-medium">Invoice created successfully!</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {isError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Products */}
          <div className="lg:col-span-2 space-y-4">
            {/* Customer Selection */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer (Optional)
              </label>
              <select
                value={selectedCustomer?._id || ''}
                onChange={(e) => {
                  const customer = customers.find((c) => c._id === e.target.value);
                  setSelectedCustomer(customer || null);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Walk-in Customer</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Search */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search products by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {filteredItems.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => addToCart(item)}
                    disabled={item.stockQty === 0}
                    className={`p-4 border-2 rounded-lg text-left transition ${
                      item.stockQty === 0
                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                        : 'border-gray-200 hover:border-indigo-500 hover:shadow-md'
                    }`}
                  >
                    <div className="font-medium text-gray-900 mb-1 truncate">{item.name}</div>
                    <div className="text-lg font-bold text-indigo-600">₹{item.sellingPrice}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Stock: {item.stockQty} {item.unit}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Cart & Checkout */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Cart</h2>

              {/* Cart Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Cart is empty</p>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.item}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">{item.name}</div>
                        <div className="text-xs text-gray-500">₹{item.price} each</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.item, item.quantity - 1)}
                          className="w-7 h-7 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.item, item.quantity + 1)}
                          className="w-7 h-7 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.item)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="ml-3 font-bold text-gray-900 w-20 text-right">
                        ₹{item.total.toFixed(2)}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Discount */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount (₹)
                </label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-medium text-red-600">-₹{discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-indigo-600">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="due">Credit/Due</option>
                </select>
              </div>

              {/* Paid Amount */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount Paid (₹)
                </label>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              {/* Balance */}
              {paidAmount && (
                <div className={`mb-4 p-3 rounded-lg ${balance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">
                      {balance >= 0 ? 'Change to Return:' : 'Balance Due:'}
                    </span>
                    <span className={`text-xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{Math.abs(balance).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0 || isLoading}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isLoading ? 'Processing...' : 'Complete Sale'}
              </button>

              {/* Clear Cart */}
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="w-full mt-2 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Clear Cart
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default POS;