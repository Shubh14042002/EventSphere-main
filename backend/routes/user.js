const { Router } = require("express");
const router = Router();
const { User } = require("../db/index.js");
const { sendEmail } = require('../mail/mailer');

router.get("/getUsers", async(req, res) => {
    console.log("Getting users from the backend")

    const users = await User.find();
    
    res.status(200).json({
        "Users": users
    })
})

router.post("/addUser", async(req, res) => {
    console.log("Posting user to backend")

    const payLoad = req.body;
    console.log('Heres the user payload',payLoad)
    try {
        await User.create({
            username: payLoad.username,
            password: payLoad.password,
            email: payLoad.email,
            full_name: payLoad.full_name,
            role: payLoad.role
        })

        // Define the email subject and body
        const subject = "Welcome to EventSphere!";
        const textBody = `Hello ${payLoad.full_name},\n\nWelcome to our platform! Your account has been created successfully as a ${payLoad.role}. Your username is: ${payLoad.username}.\n\nBest regards,\nThe Team`;
        
        // Send the welcome email
        await sendEmail(payLoad.email, subject, textBody);
    
        res.status(200).json({
            msg: "User created and email sent"
        })
    } catch(error) {
        console.error("Error creating user", error);
        res.status(500).json({
            msg: "Failed to create user due to an internal error."
        });
    }
})

router.post('/login', async (req, res) => {
    console.log("validating user credentials")

    const payLoad = req.body;
    const user = await User.findOne({
        username: payLoad.username,
        password: payLoad.password
    })

    if(user) {
        res.status(200).json({
            "userFound": true,
            "id": user._id,
            "role": user.role
        })
    } else {
        res.status(200).json({
            "userFound": false
        })
    }
})

router.get('/getUser', async (req, res) => {
    const { userID } = req.query;

    try {
        const userData = await User.findById(userID);

        res.status(200).json({
            "user": userData
        })
    } catch (error) {
        console.error(error.message);
    }
})

module.exports = router;

