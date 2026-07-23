const express = require("express");
const router = express.Router();
const Products = require("../models/products");
const { verifyToken } = require("../middlewares/auth");
const cloudinary = require("../config/cloudinary");
const multer = require("multer");
const { getRandomId } = require("../config/global");

const storage = multer.memoryStorage()
const upload = multer({ storage });

//Add Products 
router.post("/create", verifyToken, upload.fields([{ name: "image" }]), async (req, res) => {
    try {
        const formData = req.body
        const { name, price, stock, category, description } = formData
        const { uid } = req
        const id = getRandomId()

        let imageURL = "", imagePublicId = ""
        if (req.files["image"] && req.files["image"][0]) {
            await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "mystore/products/images/" },
                    (error, result) => {
                        if (error) { return reject(error) }
                        imageURL = result.secure_url, imagePublicId = result.public_id
                        resolve()
                    }
                )
                uploadStream.end(req.files["image"][0].buffer)
            })
        }

        const productData = { id, uid, name, price, stock, category, description, imageURL, imagePublicId }

        const product = new Products(productData)
        await product.save()

        res.status(201).json({ message: "A new Product has been successfully created", product })
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error", isError: true })
    }

});

router.get("/all", verifyToken, async (req, res) => {
    try {

        if (req.role !== "superAdmin") { return res.status(401).json({ message: "You are not authorized to access this resource", isError: true }) }
        const products = await Products.find()
        res.status(200).json({ message: "All Products fetched successfully", products })
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error", isError: true })
    }
});

router.get("/public-all", async (req, res) => {
    try {
        const products = await Products.find()
        res.status(200).json({ message: "All Products fetched successfully", products })
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error", isError: true })
    }
});

// superAdmin can get the single product
router.get("/get-single/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params
        if (req.role !== "superAdmin") { return res.status(401).json({ message: "You are not authorized to access this resource", isError: true }) }
        const product = await Products.findOne({ id })
        if (!product) { return res.status(404).json({ message: "Product not found", isError: true }) }
        res.status(200).json({ message: "Product found", product })
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error", isError: true })
    }
});


//superAdmin can update the product details with patch method
router.patch("/update/:id", verifyToken, upload.fields([{ name: "image" }]), async (req, res) => {
    try {
        const { id } = req.params

        if (req.role !== "superAdmin") { return res.status(401).json({ message: "You are not authorized to access this resource", isError: true }) }

        const { name, price, stock, category, description, imageURL } = req.body

        // price aur stock ko Number mein convert karo (FormData mein string aata hai)
        const productData = {
            name,
            price: Number(price),
            stock: Number(stock),
            category,
            description
        }

        // Agar imageURL string diya gaya to direct update karo
        if (imageURL && imageURL.trim().length > 0) {
            productData.imageURL = imageURL.trim()
        }

        // Agar naya image file upload kiya gaya to purana delete karo aur naya upload karo
        if (req.files && req.files["image"] && req.files["image"][0]) {
            const existingProduct = await Products.findOne({ id })
            if (existingProduct && existingProduct.imagePublicId) {
                await cloudinary.uploader.destroy(existingProduct.imagePublicId)
            }
            await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "mystore/products/images/" },
                    (error, result) => {
                        if (error) { return reject(error) }
                        productData.imageURL = result.secure_url
                        productData.imagePublicId = result.public_id
                        resolve()
                    }
                )
                uploadStream.end(req.files["image"][0].buffer)
            })
        }

        const updatedProduct = await Products.findOneAndUpdate({ id }, productData, { new: true })
        if (!updatedProduct) { return res.status(404).json({ message: "Product not found", isError: true }) }

        res.status(200).json({ message: "Product updated successfully", updatedProduct })
    }
    catch (error) {
        console.error("UPDATE PRODUCT ERROR:", error.message || error)
        res.status(500).json({ message: "Internal server error", isError: true })
    }
});

// superAdmin can delete the product

router.delete("/delete/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params
        if (req.role !== "superAdmin") { return res.status(401).json({ message: "You are not authorized to access this resource", isError: true }) }
        const product = await Products.findOne({ id })
        if (!product) { return res.status(404).json({ message: "Product not found", isError: true }) }
        await cloudinary.uploader.destroy(product.imagePublicId)
        await product.deleteOne()
        res.status(200).json({ message: "Product deleted successfully" })
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error", isError: true })
    }
});

module.exports = router;

