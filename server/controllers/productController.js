const cloudinary = require("cloudinary").v2;

const Product = require("../models/Product");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// CREATE
exports.createProduct = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        error: "File upload failed (S3 or multer issue)"
      });
    }

    const newProduct = new Product({
      name: req.body.name,
      price: req.body.price,
      category: req.body.category,
      sizes: req.body.sizes ? req.body.sizes.split(",") : [],
      fabric: req.body.fabric,
      delivery: req.body.delivery,
      description: req.body.description,

      mediaUrl: file.path,
      publicId: file.filename,
      mediaType: file.mimetype.startsWith("video") ? "video" : "image"
    });

    await newProduct.save();
    res.status(201).json(newProduct);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// GET ALL
exports.getProducts = async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
};

// GET ONE
exports.getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.json(product);
};

// DELETE
exports.deleteProduct = async (req, res) => {
  try {

    const product =
      await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    await cloudinary.uploader.destroy(
      product.publicId,
      {
        resource_type:
          product.mediaType === "video"
            ? "video"
            : "image"
      }
    );

    await Product.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message: "Deleted successfully"
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
};

// UPDATE
exports.updateProduct = async (req, res) => {
  try {

    const existing =
      await Product.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    let mediaUrl = existing.mediaUrl;
let mediaType = existing.mediaType;
let publicId = existing.publicId;
    // New media uploaded
    if (req.file) {

  await cloudinary.uploader.destroy(
    existing.publicId,
    {
      resource_type:
        existing.mediaType === "video"
          ? "video"
          : "image"
    }
  );

  mediaUrl = req.file.path;

  mediaType =
    req.file.mimetype.startsWith("video")
      ? "video"
      : "image";

  publicId = req.file.filename;
}

    const updated =
      await Product.findByIdAndUpdate(
        req.params.id,
        {
          name: req.body.name,
          price: req.body.price,
          category: req.body.category,
          sizes: req.body.sizes
  ? (
      Array.isArray(req.body.sizes)
        ? req.body.sizes
        : req.body.sizes.split(",")
    )
  : [],
          fabric: req.body.fabric,
          delivery: req.body.delivery,
          description: req.body.description,
          mediaUrl,
          mediaType,
          publicId
        },
        { new: true }
      );

    res.json(updated);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
};
