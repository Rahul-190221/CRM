const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');

const signToken = (user) => {
    return jwt.sign(
        { userId: user._id.toString(), role: user.role, email: user.email },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
    );
};


exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
            role: role === 'employer' ? 'employer' : 'seeker'
        });

        await user.save();

        const token = signToken(user);
        res.status(201).json({
            token,
            userId: user._id,
            role: user.role,
            name: user.name,
            email: user.email
        });
    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = signToken(user);
        res.json({
            token,
            userId: user._id,
            role: user.role,
            name: user.name,
            email: user.email
        });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.googleAuth = async (req, res) => {
    try {
        const { name, email, role, uid, photoURL } = req.body;

        let user = await User.findOne({ email });

        if (user) {
            // User exists, login - Preserve existing role
            // Update metadata if available
            user.googleUid = uid || user.googleUid;
            user.photoURL = photoURL || user.photoURL;
            user.provider = "google";
            await user.save();

            const token = signToken(user);
            return res.json({
                token,
                userId: user._id,
                role: user.role,
                name: user.name,
                email: user.email
            });
        }

        // User does not exist, create new
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), salt);

        user = new User({
            name: name || "Google User",
            email,
            password: hashedPassword,
            role: role === 'employer' ? 'employer' : 'seeker',
            googleUid: uid || null,
            photoURL: photoURL || null,
            provider: "google"
        });

        await user.save();

        const token = signToken(user);
        res.status(201).json({
            token,
            userId: user._id,
            role: user.role,
            name: user.name,
            email: user.email
        });
    } catch (err) {
        console.error("Google Auth Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error("GetMe Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
        await user.save();

        const resetUrl = `${req.headers.origin || 'http://localhost:5173'}/reset-password?userId=${user._id}&token=${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: 'Password Reset Request - OnYourHelp',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #f59842; text-align: center;">OnYourHelp</h2>
                    <p>Dear ${user.name},</p>
                    <p>We received a request to reset your password. Click the button below to proceed:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #f59842; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                    </div>
                    <p>If the button above does not work, copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #42bcf5;">${resetUrl}</p>
                    <p>This link will expire in 1 hour.</p>
                    <p>Thank you,<br>The OnYourHelp Team</p>
                </div>
            `,
        };

        // Send email
        let emailSent = false;
        if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your-email@gmail.com') {
            try {
                const transporter = nodemailer.createTransport({
                    host: process.env.EMAIL_HOST,
                    port: process.env.EMAIL_PORT,
                    secure: false,
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS,
                    },
                });

                await transporter.sendMail(mailOptions);
                emailSent = true;
            } catch (mailError) {
                console.error("Mail Delivery Error:", mailError.message);
                // Fallback to console if SMTP fails
            }
        }

        if (emailSent) {
            res.json({ message: 'Password reset link sent successfully' });
        } else {
            // Development Fallback: Log to console if no SMTP or mail failed
            console.log("\n--- PASSWORD RESET LINK (Check logs if email fails) ---");
            console.log(`URL: ${resetUrl}`);
            console.log("-------------------------------------------------------\n");

            res.json({
                message: 'Reset link generated! (Check server console for link - SMTP not configured)',
                devLink: resetUrl
            });
        }
    } catch (err) {
        console.error("Forgot Password Error:", err);
        res.status(500).json({ message: 'Server error: Check backend configuration' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { userId, token, password } = req.body;

        const user = await User.findOne({
            _id: userId,
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.json({ message: 'Password reset successful. You can now login.' });
    } catch (err) {
        console.error("Reset Password Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.userId })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.markNotificationAsRead = async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ message: 'Notification marked as read' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
