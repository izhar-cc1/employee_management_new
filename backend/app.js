const express = require("express");
const app = express();
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
// const nodemailer = require('nodemailer');
// const { google } = require('googleapis');
// const jwt = require("jwt-simple");
const jwtt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const DBConnect = require(path.join(__dirname, "config", "DBConnection"));
const cookieParser = require("cookie-parser");
const excelToJson = require("convert-excel-to-json");
const fs = require("fs");
const multer = require("multer");
const EmployeeModel = require("./models/employees");
const SequenceModel = require("./models/seq");

app.use(cookieParser());

// Load environment variables
dotenv.config({ path: path.join(__dirname, "config", "config.env") });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  }),
);

DBConnect();
const getLatestSequence = require(
  path.join(__dirname, "middleware", "sequence"),
);
const requireRole = require(path.join(__dirname, "middleware", "requireRole"));

const addemp = require(path.join(__dirname, "routes", "addemp"));
const displayemp = require(path.join(__dirname, "routes", "displayemp"));
const editbyid = require(path.join(__dirname, "routes", "editbyid"));
const getbyid = require(path.join(__dirname, "routes", "getbyid"));
const deleteemp = require(path.join(__dirname, "routes", "deleteemp"));
const projects = require(path.join(__dirname, "routes", "projects"));
const leaves = require(path.join(__dirname, "routes", "leaves"));
const attendance = require(path.join(__dirname, "routes", "attendance"));
const me = require(path.join(__dirname, "routes", "me"));
const dashboard = require(path.join(__dirname, "routes", "dashboard"));

global.__basedir = __dirname;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });
// Route to handle Excel file upload and process it
app.post("/excel/upload", upload.single("uploadfile"), async (req, res) => {
  // Check if a file was uploaded
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  const sheetName = req.body.sheetName || "Sheet1"; // Default to 'Sheet1' if not provided
  const startRow = parseInt(req.body.rowStart) || 1; // Default to row 1

  try {
    // Convert the uploaded Excel file to JSON
    const result = excelToJson({
      sourceFile: req.file.path,
      sheets: [
        {
          name: sheetName, // Dynamic sheet name
          header: { rows: startRow - 1 }, // Skip the header row
          columnToKey: {
            // Map column indices to JSON keys
            A: "first_name",
            B: "last_name",
            C: "DoB",
            D: "email",
            E: "phone_number",
            F: "address",
            G: "aadhar_number",
            H: "highest_qualification",
            I: "university",
            J: "year_of_graduation",
            K: "percentage",
            L: "previous_employer",
            M: "years_of_experience",
            N: "previous_role",
            O: "current_role",
            P: "department",
            Q: "joining_date",
            R: "status",
            S: "bank_name",
            T: "account_number",
            U: "ifsc_code",
          },
        },
      ],
    });

    // Check if the sheet exists in the result
    if (!result[sheetName]) {
      return res.status(400).send(`Sheet "${sheetName}" not found`);
    }
    console.log(sheetName);
    let seq = await getLatestSequence();
    console.log(seq);

    // Extract the employee data from the result
    const employees = result[sheetName].map((row) => ({
      id: ++seq,
      first_name: row.first_name,
      last_name: row.last_name,
      DoB: new Date(row.DoB),
      email: row.email,
      phone_number: row.phone_number,
      address: row.address,
      aadhar_number: row.aadhar_number,
      highest_qualification: row.highest_qualification,
      university: row.university,
      year_of_graduation: row.year_of_graduation,
      percentage: row.percentage,
      previous_employer: row.previous_employer,
      years_of_experience: row.years_of_experience,
      previous_role: row.previous_role,
      current_role: row.current_role,
      department: row.department,
      joining_date: new Date(row.joining_date),
      status: row.status,
      bank_name: row.bank_name || "ABC Bank, OMR Branch, Chennai",
      account_number: row.account_number,
      ifsc_code: row.ifsc_code || "ABC2024260",
      projects: { projectId: [] },
    }));
    console.log(employees);

    // Save all employee records to the database in bulk
    await EmployeeModel.insertMany(employees);
    await SequenceModel.updateOne({ id: "id" }, { seq: seq });
    // Optionally, delete the uploaded file after processing
    fs.unlinkSync(req.file.path);

    res
      .status(200)
      .json({ message: "File uploaded and processed successfully" });
  } catch (error) {
    console.error("Error processing file:", error.message);
    res.status(500).send("Error processing file");
  }
});

// Store OTPs in memory (for demonstration purposes; use a database in production)
// let otpStore = {};

// app.post('/request-otp', async (req, res) => {
//   const { email } = req.body;
//   const otp = Math.floor(100000 + Math.random() * 900000); // Generate OTP

//   // Store OTP in memory with a timestamp
//   otpStore[email] = { otp: otp.toString(), timestamp: Date.now() };

//   try {
//     await sendMail(email, otp);
//     res.status(200).send('OTP sent');
//   } catch (error) {
//   console.error("REAL MAIL ERROR 👇");
//   console.error(error);
//   throw error;
// }
// });

// app.get('/oauth2callback', async (req, res) => {
//   const code = req.query.code;
//   if (code) {
//     console.log('Authorization code:', code);
//     res.send(`Got code: ${code}. Check server console and use it in playground.`);
//   } else {
//     res.send('No code');
//   }
// });

// app.post('/login', (req, res) => {
//   const { email, otp } = req.body;

//   if (!otpStore[email]) {
//     return res.status(400).send('OTP not requested or expired');
//   }

//   const { otp: storedOtp, timestamp } = otpStore[email];
//   const currentTime = Date.now();

//   // Validate OTP expiration (5 minutes validity)
//   if (currentTime - timestamp > 5 * 60 * 1000) {
//     delete otpStore[email]; // Clear expired OTP
//     return res.status(400).send('OTP expired');
//   }

//   if (storedOtp !== otp.toString()) {
//     return res.status(400).send('Invalid OTP');
//   }

//   delete otpStore[email]; // Clear OTP after successful validation

//   // Generate JWT token
//   const accessToken = jwt.encode({ email }, process.env.JWT_SECRET, 'HS256');
//   const token = jwtt.sign({email: email},
//     "jwt-access-token-secret-key", {expiresIn: '1h'})
//   console.log(token);
//   res.cookie('token', token, {
//     maxAge: 60 * 60 * 1000, // 1 hr
//     httpOnly: true,
//     secure: false,
//     sameSite: 'lax',
//     path:'/',
//   });

//   console.log(res.getHeaders());

//   return res.status(200).json({ token });
// });

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Email: ",email)

  try {
    const user = await EmployeeModel.findOne({ email });
    console.log("User: ",user)

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("isMatch: ", isMatch)

    if (!isMatch) {
      return res.status(401).json({ message: "Wrong password" });
    }

    const derivedRole =
      user.access_role ||
      (user.email === "admin@gmail.com"
        ? "Admin"
        : user.current_role === "Manager"
          ? "Manager"
          : "Employee");

    // create token
    const token = jwtt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.first_name,
        role: derivedRole,
        employeeId: user.id,
      },
      "jwt-secret-key",
      { expiresIn: "1d" },
    );

    console.log("Token: ",token)

    // cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login success",
      token,
      user: user.first_name,
      role: derivedRole,
      employeeId: user.id,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});

const verifyToken = (req, res, next) => {
  let token = req.cookies.token;

  if (!token && req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return res.status(401).send("No token");

  try {
    const decoded = jwtt.verify(token, "jwt-secret-key");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).send("Invalid token");
  }
};

app.use("/addEmployee/", verifyToken, addemp);
app.use("/", verifyToken, displayemp); // Public route
app.use("/getEmployee/", verifyToken, getbyid);
app.use("/editEmployee/", verifyToken, requireRole(["Admin"]), editbyid);
app.use("/deleteEmployee/", verifyToken, requireRole(["Admin"]), deleteemp);
app.use("/projects", verifyToken, projects);
app.use("/leaves", verifyToken, leaves);
app.use("/attendance", verifyToken, attendance);
app.use("/me", verifyToken, me);
app.use("/dashboard", verifyToken, dashboard);

// const oAuth2Client = new google.auth.OAuth2(
//   process.env.CLIENT_ID,
//   process.env.CLIENT_SECRET,
//   process.env.REDIRECT_URI,
// );

// oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

// async function sendMail(email, otp) {
//   try {
//     const accessToken = await oAuth2Client.getAccessToken();

//     if (!accessToken.token) {
//       throw new Error('Failed to generate access token');
//     }

//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         type: 'OAuth2',
//         user: process.env.GMAIL_USER,
//         clientId: process.env.CLIENT_ID,
//         clientSecret: process.env.CLIENT_SECRET,
//         refreshToken: process.env.REFRESH_TOKEN,
//         accessToken: accessToken.token,
//       },
//     });

//     const mailOptions = {
//       from: `Your App Name <${process.env.GMAIL_USER}>`,
//       to: email,
//       subject: 'Your OTP Code',
//       text: `Your OTP code is ${otp}`,
//     };

//     const result = await transporter.sendMail(mailOptions);
//     return result;
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw new Error('Error sending OTP');
//   }
// }

app.post("/logout", (req, res) => {
  res.clearCookie("token", { path: "/" });

  console.log(res.getHeaders());
  return res.status(200).send("Logged out successfully");
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
