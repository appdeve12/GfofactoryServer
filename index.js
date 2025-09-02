const express=require("express");
const cors=require("cors");
const dotenv=require("dotenv");
const path=require("path");
const multer=require("multer")
dotenv.config()
const mongoose=require("mongoose");
mongoose.connect(process.env.MONGO_URL)
const app=express();
const fs = require('fs');
const cron = require("node-cron");
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
app.delete('/delete/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, 'uploads', filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ message: 'File not found' });
    }

    fs.unlink(filePath, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error deleting file', error: err });
      }

      res.json({ message: 'File deleted successfully', filename });
    });
  });
});
app.get("/test-email", async (req, res) => {
  try {
    await sendEmail({
      to: "deepakrathi@gfofire.com",
      subject: "Test Email from support@gfofire.com",
      text: "Hello Test, this is a test email from Node.js using Hostinger SMTP.",
    });

    res.status(200).send("✅ Test email sent to test");
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).send("❌ Failed to send email");
  }
});
// cron.schedule("35 10 * * *", async () => {
//   console.log("run")
//   try {
//     await sendEmail({
//       to: "anshikasinghal109@gmail.com",
//       subject: "Daily Scheduled Email",
//       text: "Hello Anshika, this is your scheduled daily email sent at 10:35 AM.",
//     });

//     console.log("✅ Daily email sent to anshikasinghal109@gmail.com");
//   } catch (error) {
//     console.error("❌ Error sending daily email:", error);
//   }
// });
// Use routes
app.use("/api/users", userRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/stockoutward", stockOutwardRoutes);
app.use("/api/stock", stockRoutes);
const materialNAMERoutes = require("./routes/materialName.Route");
const sendEmail = require("./utils/sendEmail");
app.use("/api/materialsname", materialNAMERoutes);
const PORT=process.env.PORT;
app.listen(PORT,(()=>console.log(`server run on the following ${PORT}`)))

