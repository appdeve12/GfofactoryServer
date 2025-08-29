const express=require("express");
const cors=require("cors");
const dotenv=require("dotenv");
const path=require("path");
const multer=require("multer")
dotenv.config()
const mongoose=require("mongoose");
mongoose.connect(process.env.MONGO_URL)
const app=express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const userRoutes = require("./routes/user.route");
const materialRoutes = require("./routes/materail.route");
const stockOutwardRoutes = require("./routes/stockoutward.route");
const stockRoutes = require("./routes/dashboard.route");
// ✅ Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// ✅ Optional: Restrict to image, video, and PDF types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpeg, .png, .mp4, and .pdf files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

// ✅ Upload endpoint (photo, video, or PDF)
app.post('/upload', upload.single('media'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded or invalid file type.');
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ fileUrl, filename: req.file.filename });
});

// Use routes
app.use("/api/users", userRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/stockoutward", stockOutwardRoutes);
app.use("/api/stock", stockRoutes);
const materialNAMERoutes = require("./routes/materialName.Route");
app.use("/api/materialsname", materialNAMERoutes);
const PORT=process.env.PORT;
app.listen(PORT,(()=>console.log(`server run on the following ${PORT}`)))

