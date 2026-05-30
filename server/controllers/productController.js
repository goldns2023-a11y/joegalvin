const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});
const Product = require("../models/Product");

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

      mediaUrl: file.location,
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

    // Extract S3 key
    const urlParts =
      product.mediaUrl.split(".amazonaws.com/");

    const key = urlParts[1];

    await s3.deleteObject({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key
    }).promise();

    await Product.findByIdAndDelete(req.params.id);

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

    // New media uploaded
    if (req.file) {

      // delete old S3 media
      const oldKey =
        existing.mediaUrl.split(".amazonaws.com/")[1];

      await s3.deleteObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: oldKey
      }).promise();

      mediaUrl = req.file.location;

      mediaType =
        req.file.mimetype.startsWith("video")
          ? "video"
          : "image";
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
          mediaType
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
