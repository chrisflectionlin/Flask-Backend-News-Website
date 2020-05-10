window.onload = function() {
    onloadFunc();
    setDate();
    showmoreListener();
};

function onloadFunc(){
    loadJSON('/cnn',cnn_articles);
    loadJSON('/foxnews', fox_articles);
    loadJSON('/allsources',change_sources);
    loadJSON('/wordcount', words_for_wordcloud);
    loadJSON('/topheadlines',slideshow_callback);
}

function loadJSON(url, callback){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
            var jsonDoc = JSON.parse(this.responseText);
            callback(jsonDoc);
        }else{
            return false;
        }
    };
    xmlhttp.open("GET",url,true);
    xmlhttp.send();
}

function filter_articles(jsonDoc){
    var article_list = [];
    if(typeof jsonDoc !== "undefined") {
        var articles = jsonDoc['articles'];
        for (var article of articles) {
            if (article['author'] !== null &&
                article['title'] !== null &&
                article['description'] !== null &&
                article['url'] !== null &&
                article['urlToImage'] !== null &&
                article['publishedAt'] !== null &&
                article['source'] !== null &&
                article['source']['name'] !== null &&
                article['author'] !== "" &&
                article['title'] !== "" &&
                article['description'] !== "" &&
                article['url'] !== "" &&
                article['urlToImage'] !== "" &&
                article['publishedAt'] !== "" &&
                article['source'] !== "" &&
                article['source']['name'] !== "") {

                article_list.push(article);
            }
        }
    }
    return article_list;
}


function words_for_wordcloud(jsonDoc){
    var myWords = [];
    for (var key in jsonDoc){
        myWords.push({word: key, size: jsonDoc[key]})
    }
    // List of words
    // set the dimensions and margins of the graph
    var margin = {top: 0, right: 0, bottom: 0, left: 0},
        width = 250 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#my_dataviz").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Constructs a new cloud layout instance. It run an algorithm to find the position of words that suits your requirements
    // Wordcloud features that are different from one word to the other must be here
    var layout = d3.layout.cloud()
        .size([width, height])
        .words(myWords.map(function(d) { return {text: d.word, size:d.size}; }))
        .padding(5)        //space between words
        .rotate(function() { return ~~(Math.random() * 2) * 90; })
        .fontSize(function(d) { return d.size*2; })      // font size of words
        .on("end", draw);
    layout.start();

    // This function takes the output of 'layout' above and draw the words
    // Wordcloud features that are THE SAME from one word to the other can be here
    function draw(words) {
        svg
            .append("g")
            .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
            .selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", function(d) { return d.size + "px" ; })
            .style("fill", "black")
            .attr("text-anchor", "middle")
            .style("font-family", "Impact")
            .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) { return d.text; });
    }
}

function change_sources(jsonDoc) {
    var sources = jsonDoc['sources'];
    var select = document.getElementById("sources");

    select.innerHTML = "";
    var option = document.createElement("option");
    option.text = 'All';
    select.add(option);
    var current_category = document.getElementById("category").value;

    if (current_category.localeCompare('all') === 0) {
        for (var i = 0; i < 10; i++) {
            var source = sources[i];
            var name = source['name'];
            var id = source['id'];
            if (name !== "" && name !== null) {
                var option = document.createElement("option");
                option.text = name;
                select.add(option);
            }
        }
    } else {
        var count = 0;
        for (var source of sources) {
            var name = source['name'];
            var category = source["category"];
            if (count == 10) {
                break;
            }
            if ((name !== "" || name !== null) && current_category.localeCompare(category) === 0 && count < 10) {
                var option = document.createElement("option");
                option.text = name;
                select.add(option);
                count++;
            }
        }
    }
}

//function to display CNN's articles
function cnn_articles(jsonDoc){
    var article_list = filter_articles(jsonDoc).slice(0,4);
    for (let i=0;i<article_list.length;i++){
        var article = article_list[i];
        add_event("cnn-card"+i,article["url"]);
        document.getElementById("cnn-img" + i).src = article["urlToImage"];
        document.getElementById("cnn-title" + i).textContent = article["title"];
        document.getElementById("cnn-desc" + i).textContent = article["description"];
    }
}

//function to display Fox's articles
function fox_articles(jsonDoc){
    var article_list = filter_articles(jsonDoc).slice(0,4);
    for (let i=0;i<article_list.length;i++){
        var article = article_list[i];
        add_event("fox-card"+i,article["url"]);
        document.getElementById("fox-img" + i).src = article["urlToImage"];
        document.getElementById("fox-title" + i).textContent = article["title"];
        document.getElementById("fox-desc" + i).textContent = article["description"];
    }
}

function add_event(elem_id,url){
    var elem = document.getElementById(elem_id);
    elem.addEventListener("click", function(){
        window.open(url);
    });
}


function slideshow_callback(jsonDoc){
    slideshow(jsonDoc,0);
}
//function to display slideshow
function slideshow(jsonDoc,slideIndex){
    var articles = filter_articles(jsonDoc).slice(0,5);
    for(var i=0;i<articles.length;i++){
        var article = articles[i];
        document.getElementById("title" + i).textContent = article["title"];
        document.getElementById("desc" + i).textContent = article["description"];
        document.getElementById("img" + i).src = article["urlToImage"];
        document.getElementById("slideshow-anchor" + i).href = article["url"];
        document.getElementById("slideshow-anchor" + i).target="_blank";
    }

    var elements = document.getElementsByClassName("part-of-slideshow");
    for (var i=0;i<elements.length;i++){
        elements[i].style.display = "none";
    }
    slideIndex+=1;
    if(slideIndex > elements.length){
        slideIndex = 1;
    }
    elements[slideIndex-1].style.display = "block";
    setTimeout(function(){
        slideshow(jsonDoc,slideIndex);
    }, 4000);
}

function submitButtonClicked(jsonDoc){
    var sources = jsonDoc['sources'];
    var sources_map={};
    sources_map['All'] = 'all';
    for (var source of sources){
        var name = source['name'];
        var id = source['id'];
        sources_map[name] = id;
    }
    var valid = checkDate();
    if(valid){
        document.getElementById("newsquery").innerHTML = "";
        document.getElementById("showmore").innerText = "Show More";
        document.getElementById("showmore").style.display = "none";
        submitInfo(sources_map);
    }
}

function submitInfo(sources_map) {
    var keyword = document.getElementById("keyword").value;
    var startdate = document.getElementById("startdate").value;
    var enddate = document.getElementById("enddate").value;
    var category = document.getElementById("category").value;
    var name = document.getElementById("sources").value;
    var sources = sources_map[name];
    var entry = {
        keyword: keyword,
        startdate: startdate,
        enddate: enddate,
        category: category,
        sources: sources
    };
    if(entry['keyword']!=="" && entry["startdate"]!=="" && entry["enddate"]!=="") {
        fetch('/querysearchresults', {
            method: "POST",
            body: JSON.stringify(entry),
            cache: "no-cache",
            headers: new Headers({
                "content-type": "application/json"
            })
        }).then(function (response) {
            response.json().then(function (data) {
                if (data['status'] !== "ok") {
                    console.log("There is an error trying to search. Error message: " + data['message']);
                    alert(data['message']);
                } else {
                    addArticles(data);
                    addListener();
                }
            })
        });
    }
}
/*
var xmlhttp = new XMLHttpRequest();
console.log("Value for keyword is:" + keyword);
xmlhttp.open('GET', '/testendpoint?keyword=' + keyword, true);
xmlhttp.send();
console.log("SUCCESSFULLY SENT");*/

function shortenDescription(desc){
    desc = desc.split(" ");
    var count = desc.length;
    if(count>10){
        count=10;
    }
    var ans = "";
    for(var i=0;i<count;i++){
        ans = ans+desc[i] + " ";
    }
    ans = ans.slice(0,ans.length-1);
    if(count===10){
        ans = ans + "...";
    }
    return ans;
}

function addArticles(data){
    var articles = filter_articles(data);
    if(articles.length == 0){
        document.getElementById('newsquery').innerHTML = "<p style='text-align: center'>No results</p>";
        //alert("No Search Result");
    }
    var count = articles.length;
    if(count>15){
        count=15;
    }
    for(var i=0;i<count;i++){
        var article = articles[i];
        var title = article['title'];
        var desc = article['description'];
        var author = article['author'];
        var source = article['source']['name'];
        var date = article['publishedAt'].slice(0,10);
        var url = article['url'];
        var urltoImage = article['urlToImage'];
        var short_desc = shortenDescription(desc);
        //whole div to hold the news
        var box = document.createElement("div");
        box.setAttribute('class',"newsentry");
        box.setAttribute('id',"newsentry"+i);
        if(i>4){
            box.style.display = 'none';
            document.getElementById('showmore').style.display = "block";
        }

        //create the image of the news
        var image = document.createElement('img');
        image.src = urltoImage;
        image.setAttribute('class','newsimage');
        image.setAttribute('id','newsimage'+ i);
        //create the text box of the news to hold the info
        var newsentrytext = document.createElement("div");
        newsentrytext.setAttribute('class','newsentry-text');

        //create the title element
        var newsentrytitle = document.createElement("div");
        newsentrytitle.setAttribute('class','newsentry-title');
        newsentrytitle.innerHTML = title;

        //create the author element
        var newsentryauthor = document.createElement("div");
        newsentryauthor.setAttribute('class',"newsentry-author");
        newsentryauthor.setAttribute('id',"newsentry-author" + i);
        newsentryauthor.innerHTML = "<span style='font-weight: bold'>Author: </span>" + author;
        newsentryauthor.style.display = "none";

        //create the source element
        var newsentrysource = document.createElement("div");
        newsentrysource.setAttribute('class',"newsentry-source");
        newsentrysource.setAttribute('id',"newsentry-source"+i);
        newsentrysource.innerHTML = "<span style='font-weight: bold'>Source: </span>" + source;
        newsentrysource.style.display = "none";

        //create the date element
        var newsentrydate = document.createElement("div");
        newsentrydate.setAttribute('class',"newsentry-date");
        newsentrydate.setAttribute('id',"newsentry-date"+i);
        newsentrydate.innerHTML = "<span style='font-weight: bold'>Date: </span>"
            + date.slice(5,7) + "/" + date.slice(8,10) + "/" + date.slice(0,4);
        newsentrydate.style.display = "none";

        //create element for the clicked description
        var newsentrydesc_clicked = document.createElement("div");
        newsentrydesc_clicked.setAttribute('class',"newsentry-desc-clicked");
        newsentrydesc_clicked.setAttribute('id',"newsentry-desc-clicked"+i);
        newsentrydesc_clicked.innerHTML = desc;
        newsentrydesc_clicked.style.display = "none";

        //create element for the short description
        var newsentrydesc = document.createElement("div");
        newsentrydesc.setAttribute('class',"newsentry-desc");
        newsentrydesc.setAttribute('id',"newsentry-desc"+i);
        newsentrydesc.innerHTML = short_desc;


        //create element for the anchor
        var newsentryanchor = document.createElement("a");
        newsentryanchor.innerHTML = "<div class=\"newsentry-anchor\">See Original Post</div>";
        newsentryanchor.href = url;
        newsentryanchor.setAttribute('id','newsentry-anchor'+ i);
        newsentryanchor.target="_blank";
        newsentryanchor.style.display = "none";

        //create element for the X button
        var closebutton = document.createElement("div");
        closebutton.setAttribute('class',"close-button");
        closebutton.setAttribute('id',"close-button"+i);
        closebutton.innerHTML = "×";
        closebutton.style.display = "none";

        //add all the elements
        box.appendChild(image);
        newsentrytext.appendChild(newsentrytitle);
        newsentrytext.appendChild(newsentrydesc);
        newsentrytext.appendChild(newsentryauthor);
        newsentrytext.appendChild(newsentrysource);
        newsentrytext.appendChild(newsentrydate);
        newsentrytext.appendChild(newsentrydesc_clicked);
        newsentrytext.appendChild(newsentryanchor);
        box.appendChild(newsentrytext);
        box.appendChild(closebutton);
        //add the entire box to the page
        var newsdisplay = document.getElementById("newsquery");
        newsdisplay.appendChild(box);
    }
}

function addListener(){
    var news = document.getElementById("newsquery").children;
    var i;
    for(i=0;i<news.length;i++){
        addListener_helper(news[i],i);
    }
}

function addListener_helper(elem,i){
    elem.addEventListener('click',function (){
        var entry = document.getElementById('newsentry' + i);
        var author = document.getElementById("newsentry-author" + i);
        author.addEventListener("click",function(event){
            event.stopPropagation();
        });
        var source = document.getElementById("newsentry-source" + i);
        source.addEventListener("click",function(event){
            event.stopPropagation();
        });
        var date = document.getElementById("newsentry-date" + i);
        date.addEventListener("click",function(event){
            event.stopPropagation();
        });
        var desc_clicked = document.getElementById("newsentry-desc-clicked" + i);
        desc_clicked.addEventListener("click",function(event){
            event.stopPropagation();
        });
        var anchor = document.getElementById("newsentry-anchor" + i);
        anchor.addEventListener("click",function(event){
            event.stopPropagation();
        });
        var button = document.getElementById("close-button" + i);
        var desc = document.getElementById("newsentry-desc" + i);
        entry.setAttribute("height", "100px");
        entry.style.cursor = "default";
        if (entry.style.height === '190px') {
            entry.style.cursor = "pointer";
            entry.style.height = "100px";
        } else {
            entry.style.height = "190px";
        }
        if (author.style.display === "none") {
            author.style.display = "block";
        } else {
            author.style.display = "none";
        }
        if (source.style.display === "block") {
            source.style.display = "none";
        } else {
            source.style.display = "block";
        }
        if (date.style.display === "block") {
            date.style.display = "none";
        } else {
            date.style.display = "block";
        }
        if (desc_clicked.style.display === "inline-block") {
            desc_clicked.style.display = "none";
        } else {
            desc_clicked.style.display = "inline-block";
        }
        if (anchor.style.display === "block") {
            anchor.style.display = "none";
        } else {
            anchor.style.display = "block";
        }
        if (button.style.display === "inline-block") {
            button.style.display = "none";
        } else {
            button.style.display = "inline-block";
        }
        if (desc.style.display === "none") {
            desc.style.display = "block";
        } else {
            desc.style.display = "none";
        }
    });

}

function showmoreListener(){
    var showmore = document.getElementById("showmore");
    showmore.addEventListener("click",function(){
        if(showmore.innerText === "Show More") {
            var cards = document.getElementById("newsquery").children;
            for(var i=5;i<cards.length;i++){
                cards[i].style.display = "block"
            }
            showmore.innerText = "Show Less";
        }else{
            var cards = document.getElementById("newsquery").children;
            for(var i=5;i<cards.length;i++){
                cards[i].style.display = "none"
            }
            showmore.innerText = "Show More";
        }
    });
}

function clickedButton2(){
    document.getElementById("button2").className = "active";
    document.getElementById("button1").className = "not-active";
    document.getElementById("homepage").style.display = "none";
    document.getElementById("searchpage").style.display = "block";
}

function clickedButton1(){
    document.getElementById("button2").className = "not-active";
    document.getElementById("button1").className = "active";
    document.getElementById("homepage").style.display = "block";
    document.getElementById("searchpage").style.display = "none";
}

function setDate(){
    var today = new Date();
    var past = new Date();
    var temp = today.getDate() - 7;
    past.setDate(temp);
    var str_today = dateToString(today);
    var str_past = dateToString(past);
    var startdate = document.getElementById("startdate");
    startdate.value = str_past;
    var enddate = document.getElementById("enddate");
    enddate.value = str_today;
}

function dateToString(thedate){
    var year = thedate.getFullYear();

    var month = thedate.getMonth()+1;
    month = month.toString();

    var da_te = thedate.getDate();
    da_te = da_te.toString();

    if (month.length == 1){
        month = "0" + month;
    }
    if (da_te.length == 1){
        da_te = "0" + da_te;
    }
    return year + "-" + month + "-" + da_te;
}

function checkDate(){
    var to = document.getElementById("enddate").value;
    var from = document.getElementById("startdate").value;
    to = new Date(to);
    from = new Date(from);
    if(to<from){
        alert("Incorrect time");
        return false;
    }
    return true;
}


function clearForm(){
    document.getElementById("keyword").value = "";
    setDate();
    document.getElementById("category").value = "all";
    loadJSON('/allsources',change_sources);
    document.getElementById("sources").value = "all";
    document.getElementById("newsquery").innerHTML = "";
    document.getElementById("showmore").style.display = "none";
    document.getElementById("showmore").innerText = "Show More";
}
