const Order = require('../models/Order');

// @desc Create new order
// @route POST /api/v1/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, discountPrice, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items' });
    }

    const order = new Order({
      orderItems,
      user: req.user.id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      discountPrice: discountPrice || 0,
      totalPrice,
      isPaid: paymentMethod !== 'Cash on Delivery',
      paidAt: paymentMethod !== 'Cash on Delivery' ? Date.now() : null,
      status: 'Confirmed',
      trackingNumber: 'TRK-' + Math.floor(100000 + Math.random() * 900000) + '-EX'
    });

    const createdOrder = await order.save();
    res.status(201).json({ success: true, order: createdOrder });
  } catch (error) {
    next(error);
  }
};

// @desc Get logged in user orders
// @route GET /api/v1/orders/myorders
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

// @desc Get order by ID
// @route GET /api/v1/orders/:id
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc Get all orders (Admin)
// @route GET /api/v1/orders
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

// @desc Update order status (Admin)
// @route PUT /api/v1/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = status;
    if (status === 'Delivered') {
      order.deliveredAt = Date.now();
    }

    await order.save();
    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};
