const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// الاتصال بـ MongoDB
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB!'))
  .catch(err => console.error('Could not connect to MongoDB', err));

const waitlistSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  signup_date: { type: Date, default: Date.now }
});

// Vercel بيعمل ريستارت للسيرفر كتير، فالسطر ده بيمنع أي Error في الموديل
const Waitlist = mongoose.models.Waitlist || mongoose.model('Waitlist', waitlistSchema);

app.post('/waitlist', async (req, res) => {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    try {
        const newEntry = new Waitlist({ email });
        await newEntry.save();
        res.status(201).json({ message: 'Successfully joined the waitlist!' });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: 'This email is already on the waitlist!' });
        }
        res.status(500).json({ error: 'An error occurred while joining the waitlist.' });
    }
});

// إضافة مسار للفحص من قبل الـ Load Balancer
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

// ده السطر اللي بيخلي Vercel يشغل السيرفر
module.exports = app;
