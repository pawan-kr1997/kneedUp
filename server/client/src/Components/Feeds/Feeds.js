import { useEffect, useState } from 'react';
import { Card, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from "react-router-dom";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import _ from "lodash";
import { BsBookmarks } from 'react-icons/bs';
import { BsFillBookmarksFill } from 'react-icons/bs';
import { MdShare } from 'react-icons/md';

import DateComp from '../Date/Date';

import './Feeds.css';
import 'react-toastify/dist/ReactToastify.css';


const Feeds = () => {
    let params = useParams();
    let paramsCategory = '';
    var headerText = " ";
    let navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookmarkData, setBookmarkData] = useState([{ id: '1', date: 'sasas' }]);
    let reversePosts = [...posts].reverse();
    let currentDate = '';
    let currentDateStatus = false;

    switch (params.category) {
        case 'newsOnAir_National':
            paramsCategory = 'national';
            headerText = 'News On Air / National news';
            break;
        case 'newsOnAir_International':
            paramsCategory = 'international';
            headerText = 'News On Air / International news';
            break;
        case 'newsOnAir_Business':
            paramsCategory = 'business';
            headerText = 'News On Air / Business news';
            break;
        case 'newsOnAir_Sports':
            paramsCategory = 'sports';
            headerText = 'News On Air / Sports news';
            break;
        case 'poi_Speeches':
            paramsCategory = 'speeches';
            headerText = 'President of India / Speeches';
            break;
        case 'poi_pressReleases':
            paramsCategory = 'pressReleases';
            headerText = 'President of India / Press releases';
            break;
        case 'nitiAayog_nitiBlogs':
            paramsCategory = 'nitiBlogs';
            headerText = 'Niti Aayog / Niti blogs';
            break;
        case 'idsa_commentsAndBriefs':
            paramsCategory = 'commentsAndBriefs';
            headerText = 'Institute of Defence Studies and Analysis / Comments and Briefs';
            break;
        case 'pib_pressReleases':
            paramsCategory = 'pressReleases';
            headerText = 'Press Information Bureau / Press releases';
            break;
        case 'prs_Blogs':
            paramsCategory = 'blogs';
            headerText = 'PRS India / Blogs';
            break;
        case 'prs_Articles':
            paramsCategory = 'articles';
            headerText = 'PRS India / Articles';
            break;
        default:
            paramsCategory = 'abc';
    }

    let url = "https://kneedup.herokuapp.com/newsOnAir/" + paramsCategory;

    if (params.category === 'newsOnAir_National' || params.category === 'newsOnAir_International' || params.category === 'newsOnAir_Sports' || params.category === 'newsOnAir_Business') {
        url = "https://kneedup.herokuapp.com/newsOnAir/" + paramsCategory;
    }
    else if (params.category === 'poi_Speeches' || params.category === 'poi_pressReleases') {
        url = "https://kneedup.herokuapp.com/presidentOfIndia/" + paramsCategory;
    }
    else if (params.category === 'nitiAayog_nitiBlogs') {
        url = "https://kneedup.herokuapp.com/nitiAayog/" + paramsCategory;
    }
    else if (params.category === 'idsa_commentsAndBriefs') {
        url = "https://kneedup.herokuapp.com/idsa/" + paramsCategory;
    }
    else if (params.category === 'pib_pressReleases') {
        url = "https://kneedup.herokuapp.com/pressInformationBureau/" + paramsCategory;
    }
    else if (params.category === 'prs_Blogs' || params.category === 'prs_Articles') {
        url = "https://kneedup.herokuapp.com/prsIndia/" + paramsCategory;
    }
    else {
        //navigate('/404pagenotfound');
    }

    //Logic to always start window from top when URL is changed
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [params.category])

    //Logic to fetch post data from database
    useEffect(() => {

        setLoading(true);

        axios.get(url)
            .then(response => {
                setPosts(response.data.posts);
                setLoading(false);
            })
            .catch(err => {
                console.log(err);
            })
    }, [params.category])


    //Logic to determine which posts are bookmarked for the logged in user
    useEffect(() => {
        if (localStorage.getItem('token')) {
            axios.get('https://kneedup.herokuapp.com/bookmark/init')
                .then(response => {

                    if (JSON.stringify(bookmarkData) !== JSON.stringify(response.data.data)) {

                        setBookmarkData(response.data.data);
                    }

                })
                .catch(err => {
                    console.log(err);
                })
        }
    })

    //Logic for sticky title animation
    var checkHeader = _.throttle(() => {

        let scrollPosition = Math.ceil(window.scrollY);
        console.log(scrollPosition);
        if (scrollPosition > 10) {
            document.querySelector('p').classList.add('HeaderTextHover');
        }
        else {
            document.querySelector('p').classList.remove('HeaderTextHover');
        }
    }, 300)


    useEffect(() => {
        window.addEventListener('scroll', checkHeader);
    }, [])


    //Logic to bookmark a post
    const bookmarkHandler = (postId) => {
        const token = localStorage.getItem('token');
        toast("Post added to bookmark");
        if (!token) {
            navigate('/login');
        }

        axios.get("https://kneedup.herokuapp.com/postBookmark/" + postId)
            .then(result => {
                setBookmarkData(result.data.user.bookmark);

            })
            .catch(err => {
                console.log(err);
            })
    }

    //Logic to remove a post from bookmark
    const unBookmarkHandler = (postId) => {
        toast("Post removed from bookmark");
        axios.get("https://kneedup.herokuapp.com/postUnmark/" + postId)
            .then(result => {
                setBookmarkData(result.data.user.bookmark);
            })
            .catch(err => {
                console.log(err);
            })
    }


    //Logic to set url of the post, manipulate date and show post's bookmarked status
    let cardArray = reversePosts.map(post => {
        let contentURL = '';
        if (params.category === "newsOnAir_National" ||
            params.category === "newsOnAir_International" ||
            params.category === "newsOnAir_Business" ||
            params.category === "newsOnAir_Sports" ||
            params.category === "idsa_commentsAndBriefs" ||
            params.category === "prs_Blogs" ||
            params.category === "prs_Articles") {
            contentURL = "https://" + post.url;
        }
        else {
            contentURL = post.url;
        }


        let myDate = new Date(post.createdAt);
        let postDate = myDate.getDate();
        let postMonth = myDate.getMonth();
        let postYear = myDate.getFullYear();



        let date = new Date(myDate.getFullYear(), myDate.getMonth(), myDate.getDate());
        let shortMonth = date.toLocaleString('en-us', { month: 'short' });
        let dateTimeInParts = " ";

        let tempDate = new Date();
        let currDate = tempDate.getDate();
        let currMonth = tempDate.getMonth();
        let currYear = tempDate.getFullYear();

        if (postDate === currDate && postMonth === currMonth && postYear === currYear) {
            dateTimeInParts = 'Today';
        }
        else if (postDate === +currDate - 1 && postMonth === currMonth && postYear === currYear) {
            dateTimeInParts = 'Yesterday';
        }
        else {
            dateTimeInParts = myDate.getDate() + " " + shortMonth + " " + myDate.getFullYear();
        }

        if (currentDate !== postDate + " " + postMonth + " " + postYear) {
            currentDateStatus = true;
            currentDate = postDate + " " + postMonth + " " + postYear;
        }
        else {
            currentDateStatus = false;
        }

        let bookmarkStatus = <BsBookmarks className='Icon'
            onClick={() => bookmarkHandler(post._id)} />;

        for (let i = 0; i < bookmarkData.length; i++) {

            if (bookmarkData[i].id.toString() === post._id.toString()) {
                bookmarkStatus = <BsFillBookmarksFill className='Icon'
                    style={{ color: '#1a73e8' }}
                    onClick={() => unBookmarkHandler(post._id)} />;
                break;
            }
        }




        return (
            <div>
                {currentDateStatus ? <DateComp>
                    {dateTimeInParts}
                </DateComp> : null}
                <Card key={post._id}>
                    <Card.Body>
                        <Card.Title><a href={contentURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className='Text'>
                            {post.title}
                        </a></Card.Title>
                        <div className='IconContainer'>
                            {bookmarkStatus}

                            <MdShare className='Icon' onClick={() => {
                                navigator.clipboard.writeText(contentURL)
                                toast("Post URL copied");
                            }} />
                        </div>
                    </Card.Body>
                </Card>
            </div>

        )
    })

    const finalArr = <div>
        <p><h1>{headerText}</h1></p>
        {cardArray}
    </div>

    let spinner = <Spinner animation="border" variant="primary" />

    return (
        <div className='FeedsContainer'>

            <div className='HeaderTextParent'>

                <p className='HeaderText'>
                    {headerText}
                </p>
            </div>

            {loading ? <div style={{ margin: 'auto' }}> <Spinner animation="border" variant="primary" /></div> : cardArray}
            <Card className='Last'>
                <Card.Body>
                    <Card.Title>
                        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
                    </Card.Title>
                </Card.Body>
            </Card>
            <ToastContainer
                position="bottom-center"
                autoClose={1000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover={false}
            />

        </div>
    )
}

export default Feeds;






