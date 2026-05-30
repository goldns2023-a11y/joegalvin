const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const controller = require("../controllers/productController");

// CREATE (with upload)
router.post("/", upload.single("media"), controller.createProduct);

// READ ALL
router.get("/", controller.getProducts);

// READ ONE
router.get("/:id", controller.getProduct);

// DELETE
router.delete("/:id", controller.deleteProduct);

// UPDATE
router.put("/:id", upload.single("media"), controller.updateProduct);

module.exports = router;
