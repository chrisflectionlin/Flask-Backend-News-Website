from flask import *
from newsapi import NewsApiClient
import re

application = Flask(__name__, static_folder='static')
newsapi = NewsApiClient(api_key="1553c49efada4f5fb479d61aaf7a8ddd")


@application.route('/')
def index():
    return application.send_static_file('index.html')


@application.route('/topheadlines', methods=['GET'])
def topheadlines():
    headlines = newsapi.get_top_headlines(country="us", language="en")
    return headlines


@application.route('/cnn', methods=['GET'])
def get_cnn_headlines():
    headlines = newsapi.get_top_headlines(sources='cnn', language='en')
    return headlines


@application.route('/foxnews', methods=['GET'])
def get_fox_headlines():
    headlines = newsapi.get_top_headlines(sources='fox-news', language='en')
    return headlines


@application.route('/wordcount', methods=['GET'])
def wordcount():
    word_count = {}
    stopwords = read_stopwords()
    headlines = jsonify(newsapi.get_top_headlines(page_size=100))
    headlines = headlines.json
    articles = headlines["articles"]
    for article in articles:
        title = article["title"]
        if title != "null":
            words = re.split(r'[;,:\s]\s*', title)
            for word in words:
                if word.lower() not in stopwords and word != "":
                    if word in word_count:
                        word_count[word] = word_count[word] + 1
                    else:
                        word_count[word] = 1

    word_count = sorted(word_count.items(), key=lambda x: x[1], reverse=True)
    sort_words = {}
    for x in range(0, 30):
        key = word_count[x][0]
        item = word_count[x][1]
        sort_words[key] = item

    return sort_words


@application.route("/allsources", methods=['GET'])
def get_all_sources():
    return newsapi.get_sources(language="en", country="us");


@application.route("/querysearchresults", methods=['POST'])
def searchresults():
    inputs = request.get_json()
    keyword = inputs["keyword"]
    startdate = inputs["startdate"]
    enddate = inputs["enddate"]
    sources = inputs["sources"]
    try:
        if sources != "all":
            articles = newsapi.get_everything(q=keyword, sources=sources, from_param=startdate, to=enddate,
                                              language="en", sort_by="publishedAt", page=1, page_size=20)
        else:
            articles = newsapi.get_everything(q=keyword, from_param=startdate, to=enddate,
                                              language="en", sort_by="publishedAt", page=1, page_size=20)
        return articles
    except Exception as e:
        return jsonify(e.exception)


def read_stopwords():
    f = open("stopwords_en.txt", "r")
    stopwords = f.read()
    word_list = stopwords.splitlines()
    f.close()
    return word_list


if __name__ == '__main__':
    application.run(debug=True)
