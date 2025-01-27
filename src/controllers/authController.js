const bcrypt = require('bcrypt');
const User = require('../models/user'); // Ensure the correct path to your User model
const { Op } = require('sequelize'); // Import Op for Sequelize operators

// Sign up logic
exports.signup = async (req, res) => {
    const { username, email, password, age } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const profilePic = req.file ? '/uploads/' + req.file.filename : null;

    try {
        
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return res.render('signup', { error:'Email already registered. Please use a different email.' });
        }

        const existingUsername = await User.findOne({ where: { username } });
        if (existingUsername) {
            return res.render('signup', { error: 'Username is already taken. Please try a new one.' });
        }

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            age,
            profilePic
        });
      
   
   req.session.userId = user.id;  
   res.redirect(`/profile/${user.id}`);  

    } catch (err) {
        console.error(err);
        res.status(500).send('Error occurred during signup');
    }
};

// Login logic
exports.login = async (req, res) => {
    const { loginIdentifier, password } = req.body;
    const user = await User.findOne({
        where: {
            [Op.or]: [
                { username: loginIdentifier },
                { email: loginIdentifier }
            ]
        }
    });

    if (!user) {
        return res.render('login', { error: 'Username or email not registered.',  success: null, username: loginIdentifier});
    }

    const isMatch = await bcrypt.compare(password, user.password);
   
    if (!isMatch) {
        return res.render('login', { error: 'Wrong password. Please try again.', success: null,username: loginIdentifier});
    }
    
    req.session.userId = user.id;
   // console.log('User ID in session after login:', req.session.userId);  
    res.redirect(`/profile/${user.id}`);
};

// Logout logic
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
};