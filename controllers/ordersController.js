const mongoose = require("mongoose");
const Order = require("../models/Order");
const { sendOrderConfirmedEmail, sendOrderRejectedEmail } = require("../lib/sendOrderEmail");

const normalizeCurrency = (raw) => (raw === "USD" ? "USD" : "DA");

const generateOrderNumber = async () => {
  const rand = Math.random().toString(16).slice(2, 8).toUpperCase();
  return `ORD-${Date.now()}-${rand}`;
};

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const createOrder = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      wilaya,
      municipality,
      deliveryType,
      addressLine,
      items,
    } = req.body || {};

    if (!firstName || !lastName || !phone || !wilaya || !municipality) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const phoneDigits = String(phone).replace(/\D/g, "");
    if (phoneDigits.length < 9 || phoneDigits.length > 15) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    const dt = deliveryType === "home" ? "home" : "office";
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart items are required" });
    }

    if (dt === "home" && (!addressLine || String(addressLine).trim().length < 5)) {
      return res.status(400).json({ message: "Full address is required for home delivery" });
    }

    const cleanedItems = items
      .map((it) => {
        const currency = normalizeCurrency(it.currency);
        return {
          productId: it.productId,
          title: it.title,
          image: it.image,
          quantity: Math.max(1, Math.floor(Number(it.quantity) || 1)),
          unitPrice: Math.max(0, toNumber(it.unitPrice)),
          currency,
          size: it.size ?? null,
          color: it.color ?? null,
        };
      })
      .filter((it) => it.title && it.quantity > 0);

    if (cleanedItems.length === 0) {
      return res.status(400).json({ message: "Invalid cart items" });
    }

    const totalByCurrency = { DA: 0, USD: 0 };
    let totalQuantity = 0;
    cleanedItems.forEach((line) => {
      const lineTotal = toNumber(line.unitPrice) * toNumber(line.quantity);
      totalByCurrency[line.currency] += lineTotal;
      totalQuantity += line.quantity;
    });

    const orderNumber = await generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      status: "pending",
      customer: {
        firstName: String(firstName).trim(),
        lastName: String(lastName).trim(),
        phone: phoneDigits,
        email: email ? String(email).trim().toLowerCase() : "",
      },
      shipping: {
        wilaya: String(wilaya).trim(),
        municipality: String(municipality).trim(),
        deliveryType: dt,
        addressLine: dt === "home" ? String(addressLine).trim() : "",
      },
      items: cleanedItems,
      totals: {
        totalByCurrency,
        totalQuantity,
      },
    });

    return res.status(201).json({
      ok: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
    });
  } catch (err) {
    console.error("createOrder error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getOrders = async (req, res) => {
  try {
    const { status } = req.query || {};
    const query = status ? { status } : {};

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .lean();

    const normalized = orders.map((o) => {
      const totalsObj = o.totals?.totalByCurrency
        ? Object.fromEntries(Object.entries(o.totals.totalByCurrency))
        : { DA: 0, USD: 0 };

      return {
        id: o._id.toString(),
        orderNumber: o.orderNumber,
        status: o.status,
        createdAt: o.createdAt,
        customer: {
          fullName: `${o.customer.firstName} ${o.customer.lastName}`.trim(),
          phone: o.customer.phone,
          email: o.customer.email || "",
        },
        shipping: {
          wilaya: o.shipping.wilaya,
          municipality: o.shipping.municipality,
          deliveryType: o.shipping.deliveryType,
          addressLine: o.shipping.addressLine || "",
        },
        items: o.items || [],
        itemsCount: o.items?.reduce((s, it) => s + (it.quantity || 0), 0) || 0,
        totalQuantity: o.totals?.totalQuantity || 0,
        totals: {
          totalByCurrency: {
            DA: totalsObj.DA || 0,
            USD: totalsObj.USD || 0,
          },
        },
      };
    });

    return res.json({ ok: true, orders: normalized });
  } catch (err) {
    console.error("getOrders error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const confirmOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = "confirmed";
    order.confirmedAt = new Date();
    await order.save();

    // Send confirmation email
    await sendOrderConfirmedEmail(order.customer, order.orderNumber);

    return res.json({
      ok: true,
      orderId: order._id.toString(),
      status: order.status,
      confirmedAt: order.confirmedAt,
    });
  } catch (err) {
    console.error("confirmOrder error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const rejectOrder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(String(id))) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status === "cancelled") {
      return res.status(400).json({ message: "Order is already cancelled" });
    }

    order.status = "cancelled";
    await order.save();

    // Email must not block rejection if SMTP misconfigured
    try {
      await sendOrderRejectedEmail(order.customer, order.orderNumber);
    } catch (mailErr) {
      console.error("rejectOrder email:", mailErr);
    }

    return res.json({
      ok: true,
      orderId: order._id.toString(),
      status: order.status,
    });
  } catch (err) {
    console.error("rejectOrder error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getOrderStats = async (req, res) => {
  try {
    const [totalCount, pendingCount, confirmedCount, cancelledCount] = await Promise.all([
      Order.countDocuments({}),
      Order.countDocuments({ status: "pending" }),
      Order.countDocuments({ status: "confirmed" }),
      Order.countDocuments({ status: "cancelled" }),
    ]);

    const confirmedOrders = await Order.find({ status: "confirmed" }).lean();

    const revenueByCurrency = { DA: 0, USD: 0 };
    const ordersByDate = {};

    confirmedOrders.forEach((o) => {
      const totalsObj = o.totals?.totalByCurrency || {};
      revenueByCurrency.DA += toNumber(totalsObj.DA);
      revenueByCurrency.USD += toNumber(totalsObj.USD);
      
      const dateStr = o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      if (!ordersByDate[dateStr]) {
        ordersByDate[dateStr] = { orders: 0, revenueDA: 0, revenueUSD: 0 };
      }
      ordersByDate[dateStr].orders += 1;
      ordersByDate[dateStr].revenueDA += toNumber(totalsObj.DA);
      ordersByDate[dateStr].revenueUSD += toNumber(totalsObj.USD);
    });

    const dailyData = Object.keys(ordersByDate)
      .sort((a, b) => new Date(a) - new Date(b))
      .slice(-30) // Last 30 days
      .map(date => ({
        date,
        orders: ordersByDate[date].orders,
        revenueDA: ordersByDate[date].revenueDA,
        revenueUSD: ordersByDate[date].revenueUSD
      }));

    return res.json({
      ok: true,
      stats: {
        totalCount,
        pendingCount,
        confirmedCount,
        cancelledCount,
        revenueByCurrency,
        dailyData,
      },
    });
  } catch (err) {
    console.error("getOrderStats error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.json({ ok: true, message: "Order deleted successfully" });
  } catch (err) {
    console.error("deleteOrder error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createOrder,
  getOrders,
  confirmOrder,
  rejectOrder,
  getOrderStats,
  deleteOrder,
};
