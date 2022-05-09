const axios = require('axios');
const cheerio = require('cheerio');
const Post = require('../../Models/Post');
const mongoose = require('mongoose');
const Source = require('../../Models/Source');

module.exports = (req, res, next) => {

    const category = req.params.category;
    let url = "";

    switch (category) {
        case 'commentsAndBriefs':
            url = "https://www.idsa.in/new";
            req.category = 'comments and briefs';
            break;

        default:
            url = "";
    }

    axios.get(url)
        .then(response => {
            const html = response.data;


        const $ = cheerio.load(html);
        const articles = [];

        const listItems= $('.view-content div');
        listItems.each((idx, el)=>{
            const title= $(el).find('div').find('h2').find('a').text();
            let urlInternal= $(el).find('div').find('h2').find('a').attr('href');
            
        if(urlInternal){
            articles.push({
                title,
                url: "www.idsa.in/"+urlInternal
            })
        }
            
            
        })
            
        
        Source.findOne({ name: 'idsa' })
                .then(sourceData => {
                    sourceData.currentState = articles;
                    return sourceData.save();
                })
                .then(result => {
                    next();
                })
                .catch(err => {
                    console.log(err);
                })
        })
        .catch(err => {
            console.log(err);
        })

}





