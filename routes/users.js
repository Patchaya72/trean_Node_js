var express = require("express");
var router = express.Router();
const verified = require('../middleware/jwt_decode');

var User = require("../models/users.model");
var bcrypt = require("bcrypt");
const { sendResponse } = require('../utils/responseHandler'); 
jwt = require('jsonwebtoken');

/* GET users listing. */
router.get("/", verified,async function (req, res, next) {
  try {
    let users = await User.find();

    // res.send(users);
    return sendResponse(res, 200, "Users retrieved successfully", users);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "Server Error");
  }
});

router.post("/register", async function (req, res, next) {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return sendResponse(res, 400, "User already exists");
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    return sendResponse(res, 201, "User registered successfully", user);  
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "Server Error");
  }
});

router.post("/login", async function (req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendResponse(res, 400, "Email and password are required");
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return sendResponse(res, 400, "Invalid Credentials");
    }
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendResponse(res, 400, "Invalid Credentials");
    }
    if (!user.staus_chk) {
      return sendResponse(
        res,
        401,
        "Please wait for your email to be verified before logging in."
      );
    }

    let privateKey = process.env.privateKey;  
    let token = jwt.sign({ userId: user._id,role:user.role }, privateKey, { expiresIn: '1h' });

    const userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        staus_chk: user.staus_chk,
        token: token
    };
    return sendResponse(res, 200, "Login successful", userData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

router.put("/users/:id/approve",verified, async function (req, res, next) {
  try {
    const userId = req.params.id;
    const userStatus = req.body.staus_chk;
    if(req.user.role !== 'admin'){
      return sendResponse(res, 403, "Access denied. Admins only.");
    }
    // Find user by ID
    let user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 400, "User not found");
    }

    // Update staus_chk to true
    user.staus_chk = userStatus;
    await user.save();
    return sendResponse(res, 200, "User email verified successfully");
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "Server Error");
  }
});

module.exports = router;
