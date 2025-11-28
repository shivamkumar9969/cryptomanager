const Support = require('../models/support')

const saveSupport = async (req, res) => {
    try {
        const { contactForm } = req.body;
        const userId = req.user.id;

        if (!contactForm) {
            return res.status(400).json({
                success: false,
                message: "contactForm is required",
            });
        }
        const { name, email, message } = contactForm;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "Name, email and message are required",
            });
        }

        const support = new Support({
            user_id: userId,
            name,
            email,
            message,
        });
        await support.save();
        return res.status(200).json({
            success: true,
            message: "Message Saved",
        });
        
    } catch (err) {
        res.status(500).json({ message: 'Failed to save the support message', error: err.message })
    }

}

module.exports = { saveSupport }