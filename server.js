const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// الاتصال بقاعدة بيانات MongoDB
// السيرفر هياخد الرابط من إعدادات Render، ولو مش موجود هيستخدم الرابط اللي هتحطه هنا للتجربة
const MONGO_URI = process.env.MONGO_URI || "حط_الرابط_الطويل_بتاع_مونجو_هنا";

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB!'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// تصميم شكل البيانات اللي هتتحفظ (الإيميل وتاريخ التسجيل)
const waitlistSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  signup_date: { type: Date, default: Date.now }
});

const Waitlist = mongoose.model('Waitlist', waitlistSchema);

// استقبال الإيميلات من الموقع
app.post('/api/waitlist', async (req, res) => {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    try {
        const newEntry = new Waitlist({ email });
        await newEntry.save(); // حفظ الإيميل في MongoDB
        console.log(`New signup: ${email}`);
        res.status(201).json({ message: 'Successfully joined the waitlist!' });
    } catch (err) {
        // لو الإيميل متسجل قبل كده
        if (err.code === 11000) {
            return res.status(409).json({ error: 'This email is already on the waitlist!' });
        }
        res.status(500).json({ error: 'An error occurred while joining the waitlist.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});