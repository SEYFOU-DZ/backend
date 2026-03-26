const express = require("express");
const router = express.Router();
const multer = require("multer");
const productController = require("../controllers/productController");
const verifyAdmin = require("../middleware/verifyAdmin");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.route("/")
  .get(productController.getProducts)
  .post(
    verifyAdmin,
    upload.fields([
      { name: "mainImage", maxCount: 1 },
      { name: "subImages", maxCount: 10 },
    ]),
    productController.createProduct
  );

router.route("/:id")
  .get(productController.getProductById)
  .put(
    verifyAdmin,
    upload.fields([
      { name: "mainImage", maxCount: 1 },
      { name: "subImages", maxCount: 10 },
    ]),
    productController.updateProduct
  )
  .delete(verifyAdmin, productController.deleteProduct);

module.exports = router;
