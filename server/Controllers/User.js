const User = require('../Models/User');
const Post = require('../Models/Post');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');
const sendgridTransport = require('nodemailer-sendgrid-transport');
require('dotenv').config();

const transport = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: process.env.APIKEY
    }
}))


//Logic for signigup a user

exports.signupUser = (req, res, next) => {
    const { emailId, password, confirmPassword } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error(errors.array()[0].msg);
        error.statusCode = 422;
        throw error;
    }


    if (password !== confirmPassword) {
        const error = new Error('Passwords do not match');
        error.statusCode = 404;
        throw error;
    }

    User.findOne({ emailId: emailId })
        .then(user => {
            if (user) {
                const error = new Error('User with this email id already exists');
                error.statusCode = 404;
                throw error;
            }

            const userNew = new User({
                emailId: emailId,
                password: password,
                category: {
                    news: true,
                    president: true,
                    niti: true,
                    idsa: true,
                    pib: true,
                    prs: true
                },
                bookmark: [],
                resetToken: null,
                resetTokenExpiration: null
            })

            return userNew.save();

        })
        .then(result => {
            res.status(200).json({ message: 'user has been added' });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}


//Logic for loging in a user

exports.loginUser = (req, res, next) => {
    const { emailId, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error(errors.array()[0].msg);
        error.statusCode = 422;
        throw error;
    }

    User.findOne({ emailId: emailId })
        .then(user => {

            if (!user) {
                const error = new Error('User does not exist');
                error.statusCode = 422;
                throw error;
            }

            if (user.password !== password) {
                const error = new Error('Password does not match');
                error.statusCode = 422;
                throw error;
            }

            const token = jwt.sign({
                emailId: user.emailId,
                userId: user._id.toString()
            }, 'marvelnewssecret', { expiresIn: '2h' });

            res.status(200).json({ message: 'User verified', user: user, token: token });

        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}


//Logic to get category detail of a particular user

exports.getCategory = (req, res, next) => {

    User.findOne({ _id: req.userId })
        .then(user => {
            if (!user) {
                const error = new Error('No user found');
                error.statusCode = 422;
                throw error;
            }

            res.status(200).json({ message: 'Category data sent', category: user.category });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}


//Logic to update the category field of logged in user

exports.postCategory = (req, res, next) => {

    const updatedNews = req.body.News;
    const updatedPresident = req.body.President;
    const updatedNiti = req.body.Niti;
    const updatedIdsa = req.body.Idsa;
    const updatedPib = req.body.Pib;
    const updatedPrs = req.body.Prs;


    User.findOne({ _id: req.userId })
        .then(user => {
            if (!user) {
                const error = new Error('No user found');
                error.statusCode = 422;
                throw error;
            }

            user.category.news = updatedNews;
            user.category.president = updatedPresident;
            user.category.niti = updatedNiti;
            user.category.idsa = updatedIdsa;
            user.category.pib = updatedPib;
            user.category.prs = updatedPrs;


            user.markModified('category');
            return user.save();
        })
        .then(result => {
            res.status(200).json({ message: 'Category data refreshed', result: result });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

//Logic to add post details in the bookmark field of logged in user

exports.getBookmarks = (req, res, next) => {

    let userDetail = null;

    User.findOne({ _id: req.userId })
        .then(user => {
            userDetail = user;
            const postId = req.params.postId;
            if (!user) {
                const error = new Error('No user found');
                error.statusCode = 422;
                throw error;
            }

            return Post.findOne({ _id: postId })
                .populate('source')
        }
        )
        .then(post => {

            let postCategory = '';

            if (post.source.name === 'newsOnAir' && post.category === 'national') {
                postCategory = 'News on Air / National news';
            }
            else if (post.source.name === 'newsOnAir' && post.category === 'international') {
                postCategory = 'News on Air / International news';
            }
            else if (post.source.name === 'newsOnAir' && post.category === 'business') {
                postCategory = 'News on Air / Business news';
            }
            else if (post.source.name === 'newsOnAir' && post.category === 'sports') {
                postCategory = 'News on Air / Sports news';
            }
            else if (post.source.name === 'presidentOfIndia' && post.category === 'speeches') {
                postCategory = 'President of India / Speeches';
            }
            else if (post.source.name === 'presidentOfIndia' && post.category === 'pressReleases') {
                postCategory = 'President of India / Press releases';
            }
            else if (post.source.name === 'idsa' && post.category === 'comments and briefs') {
                postCategory = 'Institute for Defence Studies and Analysis / Comments and Briefs';
            }
            else if (post.source.name === 'prsIndia' && post.category === 'blogs') {
                postCategory = 'PRS India / Blogs';
            }
            else if (post.source.name === 'prsIndia' && post.category === 'articles') {
                postCategory = 'PRS India / Articles';
            }
            else if (post.source.name === 'nitiAayog' && post.category === 'niti blogs') {
                postCategory = 'Niti Aayog / Niti blogs';
            }
            else if (post.source.name === 'pressInformationBureau' && post.category === 'press releases') {
                postCategory = 'Press Information Bureau / Press releases';
            }
            else {
                postCategory = ' ';
            }


            const postId = post._id;
            const postDate = post.createdAt;
            const postURL = post.url;
            const postTitle = post.title;

            let oldBookmark = [...userDetail.bookmark];
            let updatedBookmark = oldBookmark.concat({
                id: postId,
                date: postDate,
                title: postTitle,
                url: postURL,
                category: postCategory
            })

            userDetail.bookmark = updatedBookmark;
            return userDetail.save();
        })
        .then(result => {
            res.status(200).json({ message: 'Result after adding bookmark', user: result });
        })

        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

//Logic to delete posts details from bookmark field of the logged in user

exports.getUnmarks = (req, res, next) => {
    const postId = req.params.postId;

    User.findOne({ _id: req.userId })
        .then(user => {
            let oldBookmark = [...user.bookmark];

            let updatedBookmark = oldBookmark.filter(el => el.id.toString() !== postId.toString());
            user.bookmark = [...updatedBookmark];
            return user.save();
        })
        .then(result => {
            res.status(200).json({ message: 'Post unmarked', user: result });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

//Logic to get the bookmark field data of the logged in user

exports.initBookmark = (req, res, next) => {
    User.findOne({ _id: req.userId })
        .then(user => {
            if (!user) {
                const error = new Error('No user found');
                error.statusCode = 422;
                throw error;
            }

            res.status(200).json({ message: 'init bookmark', data: user.bookmark });

        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

//Logic to generate reset token and emailing the password reset link

exports.postPasswordReset = (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Email id is not valid');
        error.statusCode = 422;
        throw error;
    }

    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            const error = new Error('Password reset error');
            error.statusCode = 422;
            throw error;
        }
        const token = buffer.toString('hex');
        User.findOne({ emailId: req.body.emailId })
            .then(user => {
                if (!user) {
                    const error = new Error('No user with that email id exists');
                    error.statusCode = 422;
                    throw error;
                }

                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();
            })
            .then(result => {
                return transport.sendMail({
                    to: req.body.emailId,
                    from: '"KneedUp" <hello@kneedup.com>',

                    subject: 'Reset password link',
                    text: 'You requested a password reset link. Here is the password reset link: http://localhost:3000/reset/${token}',
                    html: `<p><h3>You requested a password reset link</h3></p>
                           <p>Here is the password reset link: <a href="http://localhost:3000/reset/${token}">http://localhost:3000/reset/${token}</a></p>
                 `
                })
                    .catch(err => {
                        console.log(err);
                    })
            })
            .catch(err => {
                if (!err.statusCode) {
                    err.statusCode = 500;
                }
                next(err);
            })
    });
}

//Logic to reset the user password

exports.postConfirmPasswordReset = (req, res, next) => {
    const token = req.body.token;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error(errors.array()[0].msg);
        error.statusCode = 422;
        throw error;
    }



    if (req.body.password !== req.body.confirmPassword) {
        const error = new Error('Passwords do not match');
        error.statusCode = 404;
        throw error;
    }

    User.findOne({ emailId: req.body.emailId })
        .then(user => {
            if (!user) {
                const error = new Error('Email id does not exist');
                error.statusCode = 422;
                throw error;
            }

            return User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        })
        .then(user => {
            if (!user) {
                const error = new Error('Something is wrong with your link please generate the reset link again');
                error.statusCode = 422;
                throw error;
            }

            user.password = req.body.password,
                user.resetToken = null,
                user.resetTokenExpiration = null


            return user.save();

        })
        .then(result => {
            res.status(200).json({ message: 'Password reset successfully', user: result });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

//Logic to get the bookmark field data of the logged in user

exports.getUserBookmarks = (req, res, next) => {
    User.findOne({ _id: req.userId })
        .then(user => {
            if (!user) {
                const error = new Error('User do not exist');
                error.statusCode = 422;
                throw error;
            }

            res.status(200).json({ message: 'Bookmarks sent', bookmark: user.bookmark })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}




