const axios = require('axios');
const cheerio = require('cheerio');
const Post = require('../../Models/Post');
const mongoose = require('mongoose');
const Source = require('../../Models/Source');


module.exports = (req, res, next) => {

    let currentArticles = [];
    let oldArticles = [];
    let toBeAddedArticles = [];

    Source.findOne({ name: "presidentOfIndia" })
        .then(sourceData => {
            currentArticles = [...sourceData.currentState];
            oldArticles = [...sourceData.oldState];


            if (oldArticles.length === 0) {
                console.log("yes 1");
                oldArticles = [...currentArticles];
                toBeAddedArticles = [...currentArticles];
                toBeAddedArticles = toBeAddedArticles.reverse();

                sourceData.oldState = [...oldArticles];
                return sourceData.save();
            }
            else if (currentArticles[0].title === oldArticles[0].title) {
                console.log("yes 2");
                oldArticles = [...currentArticles];
                sourceData.oldState = [...oldArticles];
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
                sourceData.oldState = [...oldArticles];

                return sourceData.save();
            }

        })
        .then(result => {

            console.log("to be added array");
            for (let i = 0; i < toBeAddedArticles.length; i++) {
                console.log("[" + i + "]  " + toBeAddedArticles[i].title);
            }

            if (toBeAddedArticles.length > 0) {
                const sleep = (time) => {
                    return new Promise((resolve) => setTimeout(resolve, time))
                }

                const doSomething = async () => {
                    for (let i = 0; i < toBeAddedArticles.length; i++) {
                        await sleep(1000)
                        const post = new Post({
                            title: toBeAddedArticles[i].title,
                            url: toBeAddedArticles[i].url,
                            category: req.category,
                            source: mongoose.Types.ObjectId('6279438bcc98f92155c2faaa')
                        })
                        post.save()
                            .then(result => {
                                console.log("Post has been saved: ");
                                next();
                            })
                            .catch(err => {
                                console.log(err);
                            })


                    }
                }

                doSomething();
            }

            else {
                next();
            }
        })
        .catch(err => {
            console.log(err);
        })
}   