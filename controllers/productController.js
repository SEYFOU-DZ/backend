const Product = require("../models/Product");
const cloudinary = require("cloudinary").v2;

const ALLOWED_SIZES = new Set(["S", "M", "L", "XL", "XXL"]);

const normalizeSizes = (arr) => {
  if (!Array.isArray(arr)) return [];
  return [...new Set(arr.map((s) => String(s).toUpperCase()).filter((s) => ALLOWED_SIZES.has(s)))];
};

const normalizeCurrency = (raw) => (raw === "USD" ? "USD" : "DA");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (file) => {
  if (!file) return null;
  const b64 = Buffer.from(file.buffer).toString("base64");
  let dataURI = "data:" + file.mimetype + ";base64," + b64;
  const res = await cloudinary.uploader.upload(dataURI, {
    resource_type: "auto",
    folder: "ecommerce_products",
  });
  return res.secure_url;
};

const createProduct = async (req, res) => {
  try {
    const { title, description, price, colors, sizes, currency } = req.body;
    
    let parsedColors = [];
    if (colors) {
      if (typeof colors === "string") {
        try {
          parsedColors = JSON.parse(colors);
        } catch(e) {
          parsedColors = colors.split(",").map(c => c.trim());
        }
      } else if (Array.isArray(colors)) {
        parsedColors = colors;
      }
    }

    let parsedSizes = [];
    if (sizes !== undefined && sizes !== null && sizes !== "") {
      if (typeof sizes === "string") {
        try {
          parsedSizes = JSON.parse(sizes);
        } catch (e) {
          parsedSizes = sizes.split(",").map((s) => s.trim());
        }
      } else if (Array.isArray(sizes)) {
        parsedSizes = sizes;
      }
    }
    parsedSizes = normalizeSizes(parsedSizes);

    if (!req.files || !req.files.mainImage || req.files.mainImage.length === 0) {
      return res.status(400).json({ message: "Main image is required." });
    }

    const mainImageFile = req.files.mainImage[0];
    const subImageFiles = req.files.subImages || [];

    const mainImageUrl = await uploadToCloudinary(mainImageFile);
    
    const subImageUrls = await Promise.all(
      subImageFiles.map(async (file) => {
        return await uploadToCloudinary(file);
      })
    );

    const newProduct = new Product({
      title,
      description,
      price: Number(price),
      currency: normalizeCurrency(currency),
      colors: parsedColors,
      sizes: parsedSizes,
      mainImage: mainImageUrl,
      subImages: subImageUrls,
    });

    const savedProduct = await newProduct.save();
    return res.status(201).json(savedProduct);

  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({ message: "Server error creating product." });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({ message: "Server error fetching products." });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found." });
    return res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return res.status(500).json({ message: "Server error fetching product." });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, colors, sizes, currency } = req.body;

    let parsedColors = [];
    if (colors) {
      if (typeof colors === "string") {
        try {
          parsedColors = JSON.parse(colors);
        } catch(e) {
          parsedColors = colors.split(",").map(c => c.trim());
        }
      } else if (Array.isArray(colors)) {
        parsedColors = colors;
      }
    }

    let parsedSizes = null;
    if (sizes !== undefined && sizes !== null && sizes !== "") {
      let raw = [];
      if (typeof sizes === "string") {
        try {
          raw = JSON.parse(sizes);
        } catch (e) {
          raw = sizes.split(",").map((s) => s.trim());
        }
      } else if (Array.isArray(sizes)) {
        raw = sizes;
      }
      parsedSizes = normalizeSizes(raw);
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = Number(price);
    if (currency !== undefined && currency !== null && currency !== "") {
      product.currency = normalizeCurrency(currency);
    }
    if (colors !== undefined) product.colors = parsedColors;
    if (parsedSizes !== null) product.sizes = parsedSizes;

    if (req.files && req.files.mainImage && req.files.mainImage.length > 0) {
      const mainImageUrl = await uploadToCloudinary(req.files.mainImage[0]);
      product.mainImage = mainImageUrl;
    }

    let baseSubImages = product.subImages || [];
    if (req.body.existingSubImages !== undefined && req.body.existingSubImages !== "") {
      try {
        const parsedExisting = JSON.parse(req.body.existingSubImages);
        if (Array.isArray(parsedExisting)) {
          baseSubImages = parsedExisting;
        }
      } catch (e) {
        /* keep current */
      }
    }

    if (req.files && req.files.subImages && req.files.subImages.length > 0) {
      const subImageUrls = await Promise.all(
        req.files.subImages.map(async (file) => {
          return await uploadToCloudinary(file);
        })
      );
      baseSubImages = baseSubImages.concat(subImageUrls);
    }
    product.subImages = baseSubImages;

    const updatedProduct = await product.save();
    return res.status(200).json(updatedProduct);

  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({ message: "Server error updating product." });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ message: "Product not found." });
    return res.status(200).json({ message: "Product deleted successfully." });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({ message: "Server error deleting product." });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
