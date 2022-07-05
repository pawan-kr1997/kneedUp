const mongoose = require('mongoose');

const Post = require('../Models/Post');
const Source = require('../Models/Source');


module.exports = (req, res, next) => {

    let currentArticles = [];
    let oldArticles = [];
    let toBeAddedArticles = [];

    Source.findOne({ name: req.sourceName })
        .then(sourceData => {
            currentArticles = [...sourceData.data[req.category].currentState];
            oldArticles = [...sourceData.data[req.category].oldState];


            if (oldArticles.length === 0) {
                console.log("yes 1");
                oldArticles = [...currentArticles];
                toBeAddedArticles = [...currentArticles];
                toBeAddedArticles = toBeAddedArticles.reverse();

                sourceData.data[req.category].oldState = [...oldArticles];
                return sourceData.save();
            }
            else if (currentArticles[0].title === oldArticles[0].title) {
                console.log("yes 2");
                oldArticles = [...currentArticles];
                sourceData.data[req.category].oldState = [...oldArticles];
                return sourceData.save();
            }
            else {
                console.log("yes 3");
                let index = currentArticles.length;       //Changed this part
                for (let i = 0; i < currentArticles.length; i++) {
                    if (oldArticles[0].title === currentArticles[i].title) {
                        index = i;
                        break;
                    }
                }

                for (let i = 0; i < index; i++) {
                    toBeAddedArticles.push({
                        title: currentArticles[i].title,
                        url: currentArticles[i].url
                    })
                }

                toBeAddedArticles = toBeAddedArticles.reverse();
                oldArticles = [...currentArticles];
                sourceData.data[req.category].oldState = [...oldArticles];

                return sourceData.save();
            }

        })
        .then(result => {

            let mongoInsertArray=[];

            console.log("to be added array");
            for (let i = 0; i < toBeAddedArticles.length; i++) {
                console.log("[" + i + "]  " + toBeAddedArticles[i].title);
            }

            for (let i = 0; i < toBeAddedArticles.length; i++) {
                mongoInsertArray.push({
                    title: toBeAddedArticles[i].title,
                    url: toBeAddedArticles[i].url,
                    category: req.category,
                    bookmarked: false,
                    source: mongoose.Types.ObjectId(req.sourceId)
                })
            }

            if (toBeAddedArticles.length > 0) {
                Post.insertMany(mongoInsertArray)
                    .then(output => {
                        console.log("Post has been saved: ");
                        next();
                    })
                    .catch(err => {
                        console.log(err);
                    })
            }
            else {
                next();
            }

            
        })
        .catch(err => {
            console.log(err);
        })
}   