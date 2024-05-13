const { Router } = require("express");
const router = Router();
const { User, PasswordReset } = require("../db/index.js");
const { sendEmail } = require('../mail/mailer');

router.post('/forget', async (req, res) => {
    const { email } = req.body;
    
    try {
        const user = await User.findOne({ email });
        if(!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const resetCode = Math.floor(Math.random() * 9000000000 + 1000000000).toString();

        // Create a password reset document in the database collection
        const newPasswordReset = new PasswordReset({
            user: user._id,
            resetCode: resetCode,
            expiration: new Date(Date.now() + 3600000) // Expires in 1 hour
        });
        await newPasswordReset.save();

        // Send the email with the reset code
        const subject = "Your Password Reset Code";
        const textBody = `Your password reset code is: ${resetCode}`;
        await sendEmail(email, subject, textBody);

        res.json({ message: "A password reset code has been sent to your email." });
    } catch (error) {
        console.error('Error during password reset:', error);
        res.status(500).json({ message: 'Error during password reset process.', error: error.message });
    }
})

router.post('/resetPassword', async (req, res) => {
    const { email, resetCode, newPassword } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Find the reset code document for this user
        const passwordResetDoc = await PasswordReset.findOne({
            user: user._id,
            resetCode: resetCode,
            expiration: { $gt: Date.now() } // Check if the code hasn't expired
        });

        if (!passwordResetDoc) {
            return res.status(400).json({ message: "Invalid or expired reset code." });
        }

        // Reset code is valid, proceed to reset the password
        user.password = newPassword; // Here, you should hash the new password before saving
        await user.save();

        // The password has been updated, the reset code should be invalidated
        await PasswordReset.deleteOne({ _id: passwordResetDoc._id });

        res.json({ message: "Your password has been reset successfully." });
    } catch (error) {
        console.error('Error resetting the password:', error);
        res.status(500).json({ message: 'Error resetting the password', error: error.message });
    }
});

module.exports = router;