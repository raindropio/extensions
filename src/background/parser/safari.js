export default (doc)=>{
	var CandidateElement, ReaderArticleFinder, linkParameters, referenceParameters;


/////
/*
 * Copyright (c) 2010 Apple Inc. All rights reserved.
 */
function hostnameMatchesHostKnownToContainEmbeddableMedia(e) {
    const t = /^(.+\.)?(youtube\.com|vimeo\.com|dailymotion\.com|soundcloud\.com|mixcloud\.com)\.?$/;
    return t.test(e)
}
function lazyLoadingAttributeToCloneForElement(e) {
    const t = /(data:image\/)?gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==/,
        n = {
            "data-lazy-src": 1,
            "data-original": 1,
            datasrc: 1,
            "data-src": 1,
            "original-src": 1,
            "rel:bf_image_src": 1,
            "deferred-src": 1,
            "data-mediaviewer-src": 1
        };
    for (var i = e.getAttribute("src"), r = /transparent|empty/i.test(i) || t.test(i), a = e.attributes, o = a.length, l = 0; o > l; ++l) {
        var s = a[l].nodeName;
        if (n[s.toLowerCase()])
            return s;
        if (r && /^data.*(src|source)$/i.test(s) && /\.(jpe?g|png|gif|bmp)$/i.test(a[s].value))
            return s
    }
    return null
}
function sanitizeElementByRemovingAttributes(e) {
    const t = /^on|^id$|^class$|^style$|^autofocus$/;
    for (var n = e.attributes, i = 0; i < n.length; ++i) {
        var r = n[i].nodeName;
        t.test(r) && (e.removeAttribute(r), i--)
    }
}
function characterNeedsScoreMultiplier(e) {
    if (!e || 0 === e.length)
        return !1;
    var t = e.charCodeAt(0);
    return t > 11904 && 12031 > t ? !0 : t > 12352 && 12543 > t ? !0 : t > 12736 && 19903 > t ? !0 : t > 19968 && 40959 > t ? !0 : t > 44032 && 55215 > t ? !0 : t > 63744 && 64255 > t ? !0 : t > 65072 && 65103 > t ? !0 : t > 131072 && 173791 > t ? !0 : t > 194560 && 195103 > t
}
function domDistance(e, t, n) {
    for (var i = [], r = e; r;)
        i.unshift(r), r = r.parentNode;
    var a = [];
    for (r = t; r;)
        a.unshift(r), r = r.parentNode;
    for (var o = Math.min(i.length, a.length), l = Math.abs(i.length - a.length), s = o; s >= 0 && i[s] !== a[s]; --s)
        if (l += 2, n && l >= n)
            return n;
    return l
}
function fontSizeFromComputedStyle(e, t) {
    var n = parseInt(e.fontSize);
    return isNaN(n) && (n = t ? t : BaseFontSize), n
}
function contentTextStyleForNode(e, t) {
    function n(e) {
        if (isNodeWhitespace(e))
            return null;
        var t = getComputedStyle(e.parentNode);
        return "none" !== t["float"] ? null : t
    }
    for (var i = "descendant::text()[not(parent::h1) and not(parent::h2) and not(parent::h3) and not(parent::h4) and not(parent::h5) and not(parent::h6)]", r = e.evaluate(i, t, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null), a = r.snapshotLength, o = 0; a > o; ++o) {
        for (var l = r.snapshotItem(o), s = !1, c = l.parentElement; c !== t; c = c.parentElement)
            if (NegativeRegEx.test(c.className)) {
                s = !0;
                break
            }
        if (!s) {
            var u = n(l);
            if (u)
                return u
        }
    }
    return null
}
function isNodeWhitespace(e) {
    return e && e.nodeType === Node.TEXT_NODE ? !/\S/.test(e.data) : !1
}
function removeWhitespace(e) {
    return e.replace(/\s+/g, "")
}
function isElementNode(e) {
    return !(!e || e.nodeType !== Node.ELEMENT_NODE)
}
function computedStyleIndicatesElementIsInvisibleDueToClipping(e) {
    if ("absolute" !== e.position)
        return !1;
    var t = e.clip.match(/^rect\((\d+px|auto), (\d+px|auto), (\d+px|auto), (\d+px|auto)\)$/);
    if (!t || 5 !== t.length)
        return !1;
    var n = t.map(function(e) {
            return parseInt(e)
        }),
        i = n[1];
    isNaN(i) && (i = 0);
    var r = n[2],
        a = n[3],
        o = n[4];
    return isNaN(o) && (o = 0), i >= a || r >= o
}
function isElementVisible(e) {
    var t = getComputedStyle(e);
    if ("visible" !== t.visibility || "none" === t.display)
        return !1;
    if (cachedElementBoundingRect(e).height)
        return !0;
    var n = document.createRange();
    return n.selectNode(e), !!n.getBoundingClientRect().height
}
function isElementPositionedOffScreen(e) {
    var t = cachedElementBoundingRect(e);
    return t.height && t.width ? t.bottom <= 0 || t.right <= 0 : !1
}
function elementDepth(e) {
    for (var t = 0; e; e = e.parentElement)
        t++;
    return t
}
function depthOfElementWithinElement(e, t) {
    for (var n = 0; e !== t; e = e.parentElement) {
        if (!e)
            return NaN;
        n++
    }
    return n
}
function nearestAncestorElementWithTagName(e, t, n) {
    var i = {};
    if (n)
        for (var r = 0; r < n.length; ++r)
            i[n[r]] = !0;
    if (i[e.tagName])
        return null;
    for (; e = e.parentElement;) {
        var a = e.tagName;
        if (i[a])
            break;
        if (a === t)
            return e
    }
    return null
}
function cachedElementBoundingRect(e) {
    if (e._cachedElementBoundingRect)
        return e._cachedElementBoundingRect;
    var t = e.getBoundingClientRect();
    return ReaderArticleFinderJS._elementsWithCachedBoundingRects.push(e), ReaderArticleFinderJS._cachedScrollX || ReaderArticleFinderJS._cachedScrollY ? (e._cachedElementBoundingRect = {
        top: t.top + ReaderArticleFinderJS._cachedScrollY,
        right: t.right + ReaderArticleFinderJS._cachedScrollX,
        bottom: t.bottom + ReaderArticleFinderJS._cachedScrollY,
        left: t.left + ReaderArticleFinderJS._cachedScrollX,
        width: t.width,
        height: t.height
    }, e._cachedElementBoundingRect) : (e._cachedElementBoundingRect = t, e._cachedElementBoundingRect)
}
function clearCachedElementBoundingRects() {
    for (var e = ReaderArticleFinderJS._elementsWithCachedBoundingRects, t = e.length, n = 0; t > n; ++n)
        e[n]._cachedElementBoundingRect = null;
    ReaderArticleFinderJS._elementsWithCachedBoundingRects = []
}
function titleFromHeaderElement(e) {
    var t = e.innerText;
    if (!/\S/.test(t))
        return e.textContent.trim();
    var n = getComputedStyle(e),
        i = n.textTransform;
    return "uppercase" === i || "lowercase" === i ? e.textContent.trim() : t.trim()
}
function levenshteinDistance(e, t) {
    for (var n = e.length, i = t.length, r = new Array(n + 1), a = 0; n + 1 > a; ++a)
        r[a] = new Array(i + 1), r[a][0] = a;
    for (var o = 0; i + 1 > o; ++o)
        r[0][o] = o;
    for (var o = 1; i + 1 > o; ++o)
        for (var a = 1; n + 1 > a; ++a)
            if (e[a - 1] === t[o - 1])
                r[a][o] = r[a - 1][o - 1];
            else {
                var l = r[a - 1][o] + 1,
                    s = r[a][o - 1] + 1,
                    c = r[a - 1][o - 1] + 1;
                r[a][o] = Math.min(l, s, c)
            }
    return r[n][i]
}
function stringSimilarity(e, t) {
    var n = Math.max(e.length, t.length);
    return n ? (n - levenshteinDistance(e, t)) / n : 0
}
function stringsAreNearlyIdentical(e, t) {
    return e === t ? !0 : stringSimilarity(e, t) > StringSimilarityToDeclareStringsNearlyIdentical
}
function elementIsCommentBlock(e) {
    if (/(^|\s)comment/.test(e.className))
        return !0;
    var t = e.getAttribute("id");
    return !(!t || 0 !== t.indexOf("comment"))
}
function elementLooksLikeEmbeddedTweet(e) {
    if ("IFRAME" !== e.tagName)
        return !1;
    if (!e.contentDocument)
        return !1;
    var t = e.contentDocument.documentElement,
        n = 0,
        i = t.querySelector("blockquote");
    return i && TweetURLRegex.test(i.getAttribute("cite")) && ++n, e.classList.contains("twitter-tweet") && ++n, t.querySelector("[data-iframe-title='Embedded Tweet']") && ++n, t.querySelector("[data-tweet-id]") && ++n, n > 2
}
function elementLooksLikePartOfACarousel(e) {
    const t = /carousel-|carousel_|-carousel|_carousel/,
        n = 3;
    for (var i = e, r = 0; n > r; ++r) {
        if (!i)
            return !1;
        if (t.test(i.className) || t.test(i.getAttribute("data-analytics")))
            return !0;
        i = i.parentElement
    }
}
function shouldPruneIframe(e, t) {
    return e.srcdoc ? !0 : hostnameMatchesHostKnownToContainEmbeddableMedia(anchorForURL(e.src, t).hostname) ? !1 : !elementLooksLikeEmbeddedTweet(e.originalElement)
}
function languageScoreMultiplierForTextNodes(e) {
    if (!e || !e.length)
        return 1;
    for (var t = Math.min(e.length, DefaultNumberOfTextNodesToCheckForLanguageMultiplier), n = 0, i = 0, r = 0; t > r; r++) {
        for (var a = e[r].nodeValue.trim(), o = Math.min(a.length, NumberOfCharactersPerTextNodeToEvaluateForLanguageMultiplier), l = 0; o > l; l++)
            characterNeedsScoreMultiplier(a[l]) && n++;
        i += o
    }
    return n >= i * MinimumRatioOfCharactersForLanguageMultiplier ? ScoreMultiplierForChineseJapaneseKorean : 1
}
function scoreMultiplierForElementTagNameAndAttributes(e) {
    for (var t = 1, n = e; n; n = n.parentElement) {
        var i = n.getAttribute("id");
        i && (ArticleRegEx.test(i) && (t += ArticleMatchBonus), CommentRegEx.test(i) && (t -= CommentMatchPenalty), CarouselRegEx.test(i) && (t -= CarouselMatchPenalty));
        var r = n.className;
        r && (ArticleRegEx.test(r) && (t += ArticleMatchBonus), CommentRegEx.test(r) && (t -= CommentMatchPenalty), CarouselRegEx.test(r) && (t -= CarouselMatchPenalty)), "ARTICLE" === n.tagName && (t += ArticleMatchBonus)
    }
    return 0 > t ? 0 : t
}
function elementAtPoint(e, t) {
    if ("undefined" != typeof ReaderArticleFinderJSController && ReaderArticleFinderJSController.nodeAtPoint) {
        var n = ReaderArticleFinderJSController.nodeAtPoint(e, t);
        return n && n.nodeType !== Node.ELEMENT_NODE && (n = n.parentElement), n
    }
    return document.elementFromPoint(e, t)
}
function userVisibleURLString(e) {
    return "undefined" != typeof ReaderArticleFinderJSController && ReaderArticleFinderJSController.userVisibleURLString ? ReaderArticleFinderJSController.userVisibleURLString(e) : e
}
function anchorRunsJavaScriptOnActivation(e) {
    var t = e.href;
    return "javascript:" === t.trim().substring(0, 11).toLowerCase()
}
function anchorForURL(e, t) {
    var n = t.createElement("a");
    return n.href = e, n
}
function anchorLinksToAttachment(e) {
    return /\battachment\b/i.test(e.getAttribute("rel"))
}
function anchorLinksToTagOrCategoryPage(e) {
    return /\bcategory|tag\b/i.test(e.getAttribute("rel"))
}
function anchorLooksLikeDownloadFlashLink(e) {
    return /^https?:\/\/(www\.|get\.)(adobe|macromedia)\.com\/(((products|[a-zA-Z]{1,2}|)\/flashplayer|flashplayer|go\/getflash(player)?)|(shockwave\/download\/download.cgi\?P1_Prod_Version=ShockwaveFlash)\/?$)/i.test(e.href)
}
function elementsHaveSameTagAndClassNames(e, t) {
    return e.tagName === t.tagName && e.className === t.className
}
function selectorForElement(e) {
    for (var t = e.tagName, n = e.classList, i = n.length, r = 0; i > r; r++)
        t += "." + n[r];
    return t
}
function elementFingerprintForDepth(e, t) {
    function n(e, t) {
        if (!e)
            return "";
        var o = [];
        o.push(selectorForElement(e));
        var l = e.children,
            s = l.length;
        if (s && t > 0) {
            o.push(i);
            for (var c = 0; s > c; ++c)
                o.push(n(l[c], t - 1)), c !== s - 1 && o.push(a);
            o.push(r)
        }
        return o.join("")
    }
    const i = " / ",
        r = " \\",
        a = " | ";
    return n(e, t)
}
function childrenOfParentElement(e) {
    var t = e.parentElement;
    return t ? t.children : []
}
function arrayOfKeysAndValuesOfObjectSortedByValueDescending(e) {
    var t = [];
    for (var n in e)
        e.hasOwnProperty(n) && t.push({
            key: n,
            value: e[n]
        });
    return t.sort(function(e, t) {
        return t.value - e.value
    }), t
}
function walkElementSubtree(e, t, n) {
    if (!(0 > t)) {
        for (var i = e.children, r = i.length, a = t - 1, o = 0; r > o; ++o)
            walkElementSubtree(i[o], a, n);
        n(e, t)
    }
}
function elementIndicatesItIsASchemaDotOrgArticleContainer(e) {
    var t = e.getAttribute("itemtype");
    return /^https?:\/\/schema\.org\/(News)?Article$/.test(t)
}
function cleanStyleAndClassList(e) {
    e.classList.length || e.removeAttribute("class"), e.getAttribute("style") || e.removeAttribute("style")
}
function getVisibleNonWhitespaceTextNodes(e, t, n, i, r) {
    function a(e) {
        var t = e.children[0];
        if (t)
            for (var n = t.children, i = n.length, r = 0; i > r; ++r)
                if ("none" !== getComputedStyle(n[r])["float"])
                    return !1;
        return !0
    }
    function o(e, i) {
        if (e.nodeType === Node.TEXT_NODE)
            return void (/\S/.test(e.nodeValue) && s.push(e));
        if (e.nodeType === Node.ELEMENT_NODE && isElementVisible(e) && !(n && ++l > n || r && r.has(e))) {
            var u = e.tagName;
            if ("IFRAME" !== u && "FORM" !== u) {
                if (c[u])
                    i--;
                else if ("UL" !== u && "OL" !== u || !a(e)) {
                    var m = e.parentElement;
                    if (m) {
                        var d = m.tagName;
                        "SECTION" !== d || e.previousElementSibling || e.nextElementSibling || i--
                    }
                } else
                    i--;
                var h = i + 1;
                if (t > h)
                    for (var g = e.childNodes, f = g.length, p = 0; f > p; ++p)
                        o(g[p], h)
            }
        }
    }
    var l = 0,
        s = [],
        c = {
            P: 1,
            STRONG: 1,
            B: 1,
            EM: 1,
            I: 1,
            SPAN: 1,
            SECTION: 1
        };
    return i && (c.CENTER = 1, c.FONT = 1), o(e, 0), s
}
function mapOfVisibleTextNodeComputedStyleReductionToNumberOfMatchingCharacters(e, t) {
    const n = 100;
    for (var i = {}, r = getVisibleNonWhitespaceTextNodes(e, n), a = r.length, o = 0; a > o; ++o) {
        var l = r[o],
            s = l.length,
            c = l.parentElement,
            u = getComputedStyle(c),
            m = t(u);
        i[m] ? i[m] += s : i[m] = s
    }
    return i
}
function keyOfMaximumValueInDictionary(e) {
    var t,
        n;
    for (var i in e) {
        var r = e[i];
        (!n || r > n) && (t = i, n = r)
    }
    return t
}
function elementIsProtected(e) {
    return e.classList.contains("protected") || e.querySelector(".protected")
}
function dominantFontFamilyAndSizeForElement(e) {
    var t = mapOfVisibleTextNodeComputedStyleReductionToNumberOfMatchingCharacters(e, function(e) {
        return e.fontFamily + "|" + e.fontSize
    });
    return keyOfMaximumValueInDictionary(t)
}
function dominantFontSizeInPointsFromFontFamilyAndSizeString(e) {
    return e ? parseInt(e.split("|")[1]) : null
}
function canvasElementHasNoUserVisibleContent(e) {
    if (!e.width || !e.height)
        return !0;
    for (var t = e.getContext("2d"), n = t.getImageData(0, 0, e.width, e.height).data, i = 0, r = n.length; r > i; i += 4) {
        var a = n[i + 3];
        if (a)
            return !1
    }
    return !0
}
function findArticleNodeSelectorsInWhitelistForHostname(e, t) {
    const n = [[AppleDotComAndSubdomainsRegex, "*[itemprop='articleBody']"], [/^(.+\.)?buzzfeed\.com\.?$/, "article #buzz_sub_buzz"], [/^(.+\.)?mashable\.com\.?$/, ".parsec-body .parsec-container"], [/^(.+\.)?cnet\.com\.?$/, "#rbContent.container"]];
    for (var i = n.length, r = 0; i > r; ++r) {
        var a = n[r],
            o = a[0];
        if (o.test(e.toLowerCase())) {
            var l = a[1],
                s = t(l);
            if (s)
                return
        }
    }
}
function functionToPreventPruningDueToInvisibilityInWhitelistForHostname(e) {
    const t = [[/^mobile\.nytimes\.com\.?$/, function(e, t) {
        var n = e;
        if (!t)
            return !1;
        for (; n && n !== t;) {
            if (n.classList.contains("hidden"))
                return !0;
            n = n.parentElement
        }
        return !1
    }]];
    for (var n = t.length, i = 0; n > i; ++i) {
        var r = t[i],
            a = r[0];
        if (a.test(e.toLowerCase()))
            return r[1]
    }
    return null
}
function elementIsAHeader(e) {
    return !!{
        H1: 1,
        H2: 1,
        H3: 1,
        H4: 1,
        H5: 1,
        H6: 1
    }[e.tagName]
}
function leafElementForElementAndDirection(e, t) {
    var n = e.ownerDocument,
        i = n.createTreeWalker(n.body, NodeFilter.SHOW_ELEMENT, {
            acceptNode: function(e) {
                return 0 === e.children.length ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
            }
        });
    return i.currentNode = e, i[t]()
}
function previousLeafElementForElement(e) {
    return leafElementForElementAndDirection(e, "previousNode")
}
function nextLeafElementForElement(e) {
    return leafElementForElementAndDirection(e, "nextNode")
}
function nextNonFloatingVisibleElementSibling(e) {
    for (var t = e; t = t.nextElementSibling;)
        if (isElementVisible(t) && "none" === getComputedStyle(t)["float"])
            return t;
    return null
}
function elementWithLargestAreaFromElements(e) {
    var t = e.length;
    if (!t)
        return null;
    for (var n, i = 0, r = 0; t > r; ++r) {
        var a = e[r],
            o = cachedElementBoundingRect(a),
            l = o.width * o.height;
        l > i && (n = a, i = l)
    }
    return n
}
function unwrappedArticleContentElement(e) {
    for (var t = e;;) {
        for (var n = t.childNodes, i = n.length, r = null, a = 0; i > a; ++a) {
            var o = n[a],
                l = o.nodeType,
                s = function() {
                    return l === Node.ELEMENT_NODE ? !0 : l === Node.TEXT_NODE ? !isNodeWhitespace(o) : !1
                }();
            if (s) {
                if (r)
                    return t;
                var c = o.tagName;
                if ("DIV" !== c && "ARTICLE" !== c && "SECTION" !== c)
                    return t;
                r = o
            }
        }
        if (!r)
            break;
        t = r
    }
    return t
}
function elementsMatchingClassesInClassList(e, t) {
    return elementsOfSameClassIgnoringClassNamesMatchingRegexp(e, t)
}
function elementsMatchingClassesInClassListIgnoringCommonLayoutClassNames(e, t) {
    const n = /clearfix/i;
    return elementsOfSameClassIgnoringClassNamesMatchingRegexp(e, t, n)
}
function elementsMatchingClassesInClassListIgnoringClassesWithNumericSuffix(e, t) {
    const n = /\d+$/;
    return elementsOfSameClassIgnoringClassNamesMatchingRegexp(e, t, n)
}
function elementsOfSameClassIgnoringClassNamesMatchingRegexp(e, t, n) {
    for (var i = "", r = e.length, a = 0; r > a; ++a) {
        var o = e[a];
        n && n.test(o) || (i += "." + o)
    }
    try {
        return t.querySelectorAll(i)
    } catch (l) {
        return []
    }
}
function childrenWithParallelStructure(e) {
    var t = e.children;
    if (!t)
        return [];
    var n = t.length;
    if (!n)
        return [];
    for (var i = {}, r = 0; n > r; ++r) {
        var a = t[r];
        if (!CandidateTagNamesToIgnore[a.tagName] && a.className)
            for (var o = a.classList, l = o.length, s = 0; l > s; ++s) {
                var c = o[s],
                    u = i[c];
                u ? u.push(a) : i[c] = [a]
            }
    }
    var m = Math.floor(n / 2);
    for (var c in i) {
        var u = i[c];
        if (u.length > m)
            return u
    }
    return []
}
const ReaderMinimumScore = 1600,
    ReaderMinimumAdvantage = 15,
    ArticleMinimumScoreDensity = 4.25,
    CandidateMinimumWidth = 280,
    CandidateMinimumHeight = 295,
    CandidateMinimumArea = 17e4,
    CandidateMaximumTop = 1300,
    CandidateMinimumWidthPortionForIndicatorElements = .5,
    CandidateMinumumListItemLineCount = 4,
    CandidateTagNamesToIgnore = {
        A: 1,
        EMBED: 1,
        FORM: 1,
        HTML: 1,
        IFRAME: 1,
        OBJECT: 1,
        OL: 1,
        OPTION: 1,
        SCRIPT: 1,
        STYLE: 1,
        svg: 1,
        UL: 1
    },
    PrependedArticleCandidateMinimumHeight = 50,
    AppendedArticleCandidateMinimumHeight = 200,
    AppendedArticleCandidateMaximumVerticalDistanceFromArticle = 150,
    StylisticClassNames = {
        justfy: 1,
        justify: 1,
        left: 1,
        right: 1,
        small: 1
    },
    CommentRegEx = /comment|meta|footer|footnote/,
    CommentMatchPenalty = .75,
    ArticleRegEx = /(?:(?:^|\s)(?:(post|hentry|entry)[-_]?(?:content|text|body)?|article[-_]?(?:content|text|body|page)?)(?:\s|$))/i,
    ArticleMatchBonus = .5,
    CarouselRegEx = /carousel/i,
    CarouselMatchPenalty = .75,
    SectionRegex = /section/i,
    DensityExcludedElementSelector = "#disqus_thread, #comments, .userComments",
    PositiveRegEx = /article|body|content|entry|hentry|page|pagination|post|text/i,
    NegativeRegEx = /advertisement|breadcrumb|combx|comment|contact|disqus|footer|link|meta|mod-conversations|promo|related|scroll|share|shoutbox|sidebar|social|sponsor|subscribe|tags|toolbox|widget|[-_]ad$|zoom-(in|out)/i,
    VeryPositiveClassNameRegEx = /instapaper_body/,
    VeryNegativeClassNameRegEx = /instapaper_ignore/,
    SharingRegex = /email|print|rss|digg|slashdot|delicious|reddit|share/i,
    VeryLiberalCommentRegex = /comment/i,
    AdvertisementHostRegex = /^adserver\.|doubleclick.net$/i,
    MinimumAverageDistanceBetweenHRElements = 400,
    MinimumAverageDistanceBetweenHeaderElements = 400,
    PortionOfCandidateHeightToIgnoreForHeaderCheck = .1,
    DefaultNumberOfTextNodesToCheckForLanguageMultiplier = 3,
    NumberOfCharactersPerTextNodeToEvaluateForLanguageMultiplier = 12,
    MinimumRatioOfCharactersForLanguageMultiplier = .5,
    ScoreMultiplierForChineseJapaneseKorean = 3,
    MinimumContentMediaHeight = 150,
    MinimumContentMediaWidthToArticleWidthRatio = .25,
    MaximumContentMediaAreaToArticleAreaRatio = .2,
    LinkContinueMatchRegEx = /continue/gi,
    LinkNextMatchRegEx = /next/gi,
    LinkPageMatchRegEx = /page/gi,
    LinkListItemBonus = 5,
    LinkPageMatchBonus = 10,
    LinkNextMatchBonus = 15,
    LinkContinueMatchBonus = 15,
    LinkNextOrdinalValueBase = 3,
    LinkMismatchValueBase = 2,
    LinkMatchWeight = 200,
    LinkMaxVerticalDistanceFromArticle = 200,
    LinkVerticalDistanceFromArticleWeight = 150,
    LinkCandidateXPathQuery = "descendant-or-self::*[(not(@id) or (@id!='disqus_thread' and @id!='comments')) and (not(@class) or @class!='userComments')]/a",
    LinkDateRegex = /\D(?:\d\d(?:\d\d)?[\-\/](?:10|11|12|0?[1-9])[\-\/](?:30|31|[12][0-9]|0?[1-9])|\d\d(?:\d\d)?\/(?:10|11|12|0[1-9])|(?:10|11|12|0?[1-9])\-(?:30|31|[12][0-9]|0?[1-9])\-\d\d(?:\d\d)?|(?:30|31|[12][0-9]|0?[1-9])\-(?:10|11|12|0?[1-9])\-\d\d(?:\d\d)?)\D/,
    LinkURLSearchParameterKeyMatchRegex = /(page|^p$|^pg$)/i,
    LinkURLPageSlashNumberMatchRegex = /\/.*page.*\/\d+/i,
    LinkURLSlashDigitEndMatchRegex = /\/\d+\/?$/,
    LinkURLArchiveSlashDigitEndMatchRegex = /archives?\/\d+\/?$/,
    LinkURLBadSearchParameterKeyMatchRegex = /author|comment|feed|id|nonce|related/i,
    LinkURLSemanticMatchBonus = 100,
    LinkMinimumURLSimilarityRatio = .75,
    HeaderMinimumDistanceFromArticleTop = 200,
    HeaderLevenshteinDistanceToLengthRatio = .75,
    MinimumRatioOfListItemsBeingRelatedToSharingToPruneEntireList = .5,
    FloatMinimumHeight = 130,
    ImageSizeTiny = 32,
    ToleranceForLeadingImageWidthToArticleWidthForFullWidthPresentation = 50,
    MaximumFloatWidth = 325,
    AnchorImageMinimumWidth = 100,
    AnchorImageMinimumHeight = 100,
    MinimumHeightForImagesAboveTheArticleTitle = 50,
    MainImageMinimumWidthAndHeight = 83,
    BaseFontSize = 16,
    BaseLineHeightRatio = 1.125,
    MaximumExactIntegralValue = 9007199254740992,
    TitleCandidateDepthScoreMultiplier = .1,
    TextNodeLengthPower = 1.25,
    LazyLoadRegex = /lazy/i,
    StringSimilarityToDeclareStringsNearlyIdentical = .97,
    FindArticleMode = {
        Element: !1,
        ExistenceOfElement: !0
    },
    AppleDotComAndSubdomainsRegex = /.*\.apple\.com\.?$/,
    SchemaDotOrgArticleContainerSelector = "*[itemtype='https://schema.org/Article'], *[itemtype='https://schema.org/NewsArticle'], *[itemtype='http://schema.org/Article'], *[itemtype='http://schema.org/NewsArticle']",
    CleaningType = {
        MainArticleContent: 0,
        MetadataContent: 1,
        LeadingFigure: 2
    },
    MaximumWidthOrHeightOfImageInMetadataSection = 20,
    TweetURLRegex = /^https?:\/\/(.+\.)?twitter\.com\/.*\/status\/(.*\/)*[0-9]+\/?$/i;
CandidateElement = function(e, t) {
    this.element = e, this.contentDocument = t, this.textNodes = this.usableTextNodesInElement(this.element), this.rawScore = this.calculateRawScore(), this.tagNameAndAttributesScoreMultiplier = this.calculateElementTagNameAndAttributesScoreMultiplier(), this.languageScoreMultiplier = 0, this.depthInDocument = 0
}, CandidateElement.extraArticleCandidateIfElementIsViable = function(e, t, n, i) {
    const r = "a, b, strong, i, em, u, span";
    var a = cachedElementBoundingRect(e),
        o = cachedElementBoundingRect(t.element);
    if ((i && a.height < PrependedArticleCandidateMinimumHeight || !i && a.height < AppendedArticleCandidateMinimumHeight) && e.childElementCount && e.querySelectorAll("*").length !== e.querySelectorAll(r).length)
        return null;
    if (i) {
        if (a.bottom > o.top)
            return null
    } else if (a.top < o.bottom)
        return null;
    if (!i) {
        var l = a.top - o.bottom;
        if (l > AppendedArticleCandidateMaximumVerticalDistanceFromArticle)
            return null
    }
    if (a.left > o.right || a.right < o.left)
        return null;
    if (elementLooksLikePartOfACarousel(e))
        return null;
    var s = new CandidateElement(e, n);
    return s.isPrepended = i, s
}, CandidateElement.candidateIfElementIsViable = function(e, t, n) {
    var i = cachedElementBoundingRect(e);
    return i.width < CandidateMinimumWidth || i.height < CandidateMinimumHeight ? null : i.width * i.height < CandidateMinimumArea ? null : !n && i.top > CandidateMaximumTop ? null : CandidateElement.candidateElementAdjustedHeight(e) < CandidateMinimumHeight ? null : new CandidateElement(e, t)
}, CandidateElement.candidateElementAdjustedHeight = function(e) {
    for (var t = cachedElementBoundingRect(e), n = t.height, i = e.getElementsByTagName("form"), r = i.length, a = 0; r > a; ++a) {
        var o = i[a],
            l = cachedElementBoundingRect(o);
        l.width > t.width * CandidateMinimumWidthPortionForIndicatorElements && (n -= l.height)
    }
    for (var s = e.querySelectorAll("ol, ul"), c = s.length, u = null, a = 0; c > a; ++a) {
        var m = s[a];
        if (!(u && u.compareDocumentPosition(m) & Node.DOCUMENT_POSITION_CONTAINED_BY)) {
            var d = m.getElementsByTagName("li"),
                h = d.length,
                g = cachedElementBoundingRect(m);
            if (h) {
                var f = g.height / h,
                    p = getComputedStyle(d[0]),
                    E = parseInt(p.lineHeight);
                if (isNaN(E)) {
                    var v = fontSizeFromComputedStyle(p);
                    E = v * BaseLineHeightRatio
                }
                g.width > t.width * CandidateMinimumWidthPortionForIndicatorElements && CandidateMinumumListItemLineCount > f / E && (n -= g.height, u = m)
            } else
                n -= g.height
        }
    }
    return n
}, CandidateElement.prototype = {
    calculateRawScore: function() {
        for (var e = 0, t = this.textNodes, n = t.length, i = 0; n > i; ++i)
            e += this.rawScoreForTextNode(t[i]);
        return e
    },
    calculateElementTagNameAndAttributesScoreMultiplier: function() {
        return scoreMultiplierForElementTagNameAndAttributes(this.element)
    },
    calculateLanguageScoreMultiplier: function() {
        0 === this.languageScoreMultiplier && (this.languageScoreMultiplier = languageScoreMultiplierForTextNodes(this.textNodes))
    },
    depth: function() {
        return this.depthInDocument || (this.depthInDocument = elementDepth(this.element)), this.depthInDocument
    },
    finalScore: function() {
        return this.calculateLanguageScoreMultiplier(), this.basicScore() * this.languageScoreMultiplier
    },
    basicScore: function() {
        return this.rawScore * this.tagNameAndAttributesScoreMultiplier
    },
    scoreDensity: function() {
        var e = 0,
            t = this.element.querySelector(DensityExcludedElementSelector);
        t && (e = t.clientWidth * t.clientHeight);
        for (var n = this.element.children || [], i = n.length, r = 0; i > r; ++r) {
            var a = n[r];
            elementIsCommentBlock(a) && (e += a.clientWidth * a.clientHeight)
        }
        for (var o = cachedElementBoundingRect(this.element).width * cachedElementBoundingRect(this.element).height, l = o * MaximumContentMediaAreaToArticleAreaRatio, s = cachedElementBoundingRect(this.element).width * MinimumContentMediaWidthToArticleWidthRatio, c = this.element.querySelectorAll("img, object, video"), u = c.length, r = 0; u > r; ++r) {
            var m = cachedElementBoundingRect(c[r]);
            if (m.width >= s && m.height > MinimumContentMediaHeight) {
                var d = m.width * m.height;
                l > d && (e += d)
            }
        }
        for (var h = this.basicScore(), g = o - e, f = this.textNodes.length, p = 0, E = 0, r = 0; f > r; ++r) {
            var v = this.textNodes[r].parentNode;
            v && (E += fontSizeFromComputedStyle(getComputedStyle(v)), p++)
        }
        var N = BaseFontSize;
        return p && (N = E /= p), this.calculateLanguageScoreMultiplier(), h / g * 1e3 * (N / BaseFontSize) * this.languageScoreMultiplier
    },
    usableTextNodesInElement: function(e) {
        var t = [];
        if (!e)
            return t;
        const n = {
            A: 1,
            DD: 1,
            DT: 1,
            NOSCRIPT: 1,
            OL: 1,
            OPTION: 1,
            PRE: 1,
            SCRIPT: 1,
            STYLE: 1,
            TD: 1,
            UL: 1,
            IFRAME: 1
        };
        var i = this.contentDocument,
            r = function(e) {
                const r = "text()|*/text()|*/a/text()|*/li/text()|*/li/p/text()|*/span/text()|*/em/text()|*/i/text()|*/strong/text()|*/b/text()|*/font/text()|blockquote/*/text()|div[count(./p)=count(./*)]/p/text()|div[count(*)=1]/div/p/text()|div[count(*)=1]/div/p/*/text()";
                for (var a = i.evaluate(r, e, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null), o = a.snapshotLength, l = 0; o > l; ++l) {
                    var s = a.snapshotItem(l);
                    n[s.parentNode.tagName] || s._countedTextNode || isNodeWhitespace(s) || (s._countedTextNode = !0, t.push(s))
                }
            };
        r(e);
        for (var a = childrenWithParallelStructure(e), o = a.length, l = 0; o > l; ++l) {
            var s = a[l];
            r(s)
        }
        for (var c = t.length, l = 0; c > l; ++l)
            delete t[l]._countedTextNode;
        return t
    },
    addTextNodesFromCandidateElement: function(e) {
        for (var t = this.textNodes.length, n = 0; t > n; ++n)
            this.textNodes[n].alreadyCounted = !0;
        for (var i = e.textNodes, r = i.length, n = 0; r > n; ++n)
            i[n].alreadyCounted || this.textNodes.push(i[n]);
        for (var t = this.textNodes.length, n = 0; t > n; ++n)
            this.textNodes[n].alreadyCounted = null;
        this.rawScore = this.calculateRawScore()
    },
    rawScoreForTextNode: function(e) {
        const t = 20;
        if (!e)
            return 0;
        var n = e.length;
        if (t > n)
            return 0;
        var i = e.parentNode;
        if (!isElementVisible(i))
            return 0;
        for (var r = 1; i && i !== this.element;)
            r -= .1, i = i.parentNode;
        return Math.pow(n * r, TextNodeLengthPower)
    },
    shouldDisqualifyDueToScoreDensity: function() {
        return this.scoreDensity() < ArticleMinimumScoreDensity
    },
    shouldDisqualifyDueToHorizontalRuleDensity: function() {
        for (var e = this.element.getElementsByTagName("hr"), t = e.length, n = 0, i = cachedElementBoundingRect(this.element), r = .7 * i.width, a = 0; t > a; ++a)
            e[a].clientWidth > r && n++;
        if (n) {
            var o = i.height / n;
            if (MinimumAverageDistanceBetweenHRElements > o)
                return !0
        }
        return !1
    },
    shouldDisqualifyDueToHeaderDensity: function() {
        var e = "(h1|h2|h3|h4|h5|h6|*/h1|*/h2|*/h3|*/h4|*/h5|*/h6)[a[@href]]",
            t = this.contentDocument.evaluate(e, this.element, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null),
            n = t.snapshotLength;
        if (n > 2) {
            for (var i = 0, r = cachedElementBoundingRect(this.element), a = r.height * PortionOfCandidateHeightToIgnoreForHeaderCheck, o = 0; n > o; ++o) {
                var l = t.snapshotItem(o),
                    s = cachedElementBoundingRect(l);
                s.top - r.top > a && r.bottom - s.bottom > a && i++
            }
            var c = r.height / i;
            if (MinimumAverageDistanceBetweenHeaderElements > c)
                return !0
        }
        return !1
    },
    shouldDisqualifyDueToSimilarElements: function(e) {
        function t(e, t) {
            if (!e || !t)
                return !1;
            var n = 1;
            return e.className ? e.className === t.className : elementFingerprintForDepth(e, n) === elementFingerprintForDepth(t, n)
        }
        const n = "h1, h2, h3, h4, h5, h6";
        var i = function(e) {
                const t = /related-posts/i;
                for (var n = e.parentElement; n && n !== this.contentDocument.body; n = n.parentElement)
                    if (t.test(n.className))
                        return !0;
                return !1
            }.bind(this),
            r = this.element;
        if ("LI" === r.tagName || "DD" === r.tagName)
            for (var a = r.parentNode, o = a.children.length, l = 0; o > l; ++l) {
                var s = a.children[l];
                if (s.tagName === r.tagName && s.className === r.className && s !== r)
                    return !0
            }
        var c = r.classList;
        if (c.length || (r = r.parentElement, r && (c = r.classList, c.length || (r = r.parentElement, r && (c = r.classList)))), c.length) {
            e || (e = []);
            for (var u = e.length, l = 0; u > l; ++l)
                e[l].element.candidateElement = e[l];
            for (var m = elementsMatchingClassesInClassListIgnoringCommonLayoutClassNames(c, this.contentDocument), d = !1, h = elementDepth(r), g = i(r), f = m.length, l = 0; f > l; ++l) {
                var s = m[l];
                if (s !== r && s.parentElement !== r && r.parentElement !== s && isElementVisible(s)) {
                    var p = s.candidateElement;
                    if ((p || (p = new CandidateElement(s, this.contentDocument))) && p.basicScore() * ReaderMinimumAdvantage > this.basicScore()) {
                        if ("SECTION" === s.tagName && "SECTION" === r.tagName)
                            return !1;
                        if (SectionRegex.test(s.className) && SectionRegex.test(r.className))
                            return !1;
                        if (i(s) && !g)
                            return !1;
                        if (!d && cachedElementBoundingRect(s).bottom < cachedElementBoundingRect(this.element).top) {
                            d = !0;
                            continue
                        }
                        if (t(r.previousElementSibling, s.previousElementSibling) || t(r.nextElementSibling, s.nextElementSibling)) {
                            var E = r.querySelector(n),
                                v = s.querySelector(n);
                            if (E && v && elementsHaveSameTagAndClassNames(E, v))
                                return !0;
                            if (E = r.previousElementSibling, v = s.previousElementSibling, E && v && elementIsAHeader(E) && elementIsAHeader(v) && elementsHaveSameTagAndClassNames(E, v))
                                return !0
                        }
                        if (elementDepth(s) === h)
                            for (; s.parentElement && r.parentElement && s.parentElement !== r.parentElement;)
                                s = s.parentElement, r = r.parentElement;
                        for (; r.childElementCount <= 1;) {
                            if (!r.childElementCount || !s.childElementCount)
                                return !1;
                            if (s.childElementCount > 1)
                                return !1;
                            if (r.firstElementChild.tagName !== s.firstElementChild.tagName)
                                return !1;
                            r = r.firstElementChild, s = s.firstElementChild
                        }
                        if (s.childElementCount <= 1)
                            return !1;
                        var v = s.firstElementChild,
                            N = s.lastElementChild,
                            E = r.firstElementChild,
                            C = r.lastElementChild;
                        if (v.tagName !== E.tagName)
                            return !1;
                        if (N.tagName !== C.tagName)
                            return !1;
                        var S = v.className,
                            A = N.className,
                            M = E.className,
                            R = N.className,
                            y = R === M ? 2 : 1;
                        if (S.length || M.length) {
                            if (!S.length || !M.length)
                                return !1;
                            if (S === M && elementsMatchingClassesInClassList(E.classList, r).length <= y)
                                return !0
                        }
                        if (A.length || R.length) {
                            if (!A.length || !R.length)
                                return !1;
                            if (A === R && elementsMatchingClassesInClassList(N.classList, r).length <= y)
                                return !0
                        }
                        var T = E.clientHeight,
                            x = C.clientHeight;
                        return T && v.clientHeight && x && N.clientHeight ? T === v.clientHeight || x === N.clientHeight : !1
                    }
                }
            }
            for (var l = 0; u > l; ++l)
                e[l].element.candidateElement = null
        }
        return !1
    },
    shouldDisqualifyForDeepLinking: function() {
        function e(e) {
            var t = e.pathname.substring(1).split("/");
            return t[t.length - 1] || t.pop(), t
        }
        const t = 5;
        for (var n = this.element, i = this.contentDocument.location, r = e(i), a = r.length, o = [], l = n.getElementsByTagName("a"), s = l.length, c = 0; s > c; c++) {
            var u = l[c];
            if (i.host === u.host && !(e(u).length <= a || 0 !== (u.host + u.pathname).indexOf(i.host + i.pathname) || anchorLinksToAttachment(u) || (o.push(u), o.length < t))) {
                var m = n.offsetTop + n.offsetHeight / t;
                return o[0].offsetTop < m
            }
        }
        return !1
    }
}, String.prototype.lastInteger = function() {
    const e = /[0-9]+/g;
    var t = this.match(e);
    return t ? parseInt(t[t.length - 1]) : NaN
};
ReaderArticleFinder = function(e) {
    this.contentDocument = e, this.didSearchForArticleNode = !1, this.article = null, this.didSearchForExtraArticleNode = !1, this.extraArticle = null, this.leadingImage = null, this._cachedScrollY = 0, this._cachedScrollX = 0, this._elementsWithCachedBoundingRects = [], this._cachedContentTextStyle = null, this.pageNumber = 1, this.prefixWithDateForNextPageURL = null, this.previouslyDiscoveredPageURLStrings = []
}, ReaderArticleFinder.prototype = {
    isReaderModeAvailable: function() {
        return this.findArticleBySearchingWhitelist() ? !0 : (this.cacheWindowScrollPosition(), this.findArticleFromMetadata(FindArticleMode.ExistenceOfElement) ? !0 : (this.article = this.findArticleByVisualExamination(), this.article && this.articleIsLTR(), !!this.article))
    },
    prepareToTransitionToReader: function() {
        this.adoptableArticle(!0), this.nextPageURL(), this.articleIsLTR()
    },
    nextPageURL: function() {
        if (!this._nextPageURL) {
            var e = this.nextPageURLString();
            "undefined" != typeof ReaderArticleFinderJSController && e && (e = ReaderArticleFinderJSController.substituteURLForNextPageURL(e)), this._nextPageURL = e
        }
        return this._nextPageURL
    },
    containerElementsForMultiPageContent: function() {
        const e = /(.*page[^0-9]*|.*article.*item[^0-9]*)(\d{1,2})(.*)/i,
            t = 3;
        for (var i, n = [], r = this.articleNode(), a = 0;;) {
            if (i = e.exec(r.getAttribute("id")))
                break;
            if (r = r.parentElement, !r || a++ === t)
                return []
        }
        for (var l = childrenOfParentElement(r), o = l.length, s = 0; o > s; ++s) {
            var c = l[s];
            if (c !== r) {
                var m = e.exec(c.getAttribute("id"));
                m && m[1] === i[1] && m[3] === i[3] && (isElementVisible(c) && !isElementPositionedOffScreen(c) || n.push(c))
            }
        }
        return n
    },
    adoptableMultiPageContentElements: function() {
        return this.containerElementsForMultiPageContent().map(function(e) {
            return this.cleanArticleNode(e, e.cloneNode(!0), CleaningType.MainArticleContent, !1)
        }, this)
    },
    classNameIsSignificantInRouteComputation: function(e) {
        return e ? !(e.toLowerCase() in StylisticClassNames) : !1
    },
    shouldIgnoreInRouteComputation: function(e) {
        return "SCRIPT" === e.tagName || "LINK" === e.tagName || "STYLE" === e.tagName ? !0 : "TR" !== e.tagName ? !1 : !e.offsetHeight
    },
    routeToArticleNode: function() {
        for (var e = [], t = this.articleNode(); t;) {
            var i = {};
            i.tagName = t.tagName;
            var n = t.getAttribute("id");
            n && (i.id = n), this.classNameIsSignificantInRouteComputation(t.className) && (i.className = t.className), i.index = 1;
            for (var r = t.previousElementSibling; r; r = r.previousElementSibling)
                this.shouldIgnoreInRouteComputation(r) || i.index++;
            e.unshift(i), t = t.parentElement
        }
        return e
    },
    adjustArticleNodeUpwardIfNecessary: function() {
        if (this.article) {
            var e;
            for (e = this.article.element; e; e = e.parentElement)
                if (VeryPositiveClassNameRegEx.test(e.className))
                    return void (this.article.element = e);
            if (e = this.article.element, "HEADER" === e.tagName && "ARTICLE" === e.parentElement.tagName)
                return void (this.article.element = e.parentElement);
            var t = e.previousElementSibling;
            if (t && "FIGURE" === t.tagName && "ARTICLE" === e.parentElement.tagName)
                return void (this.article.element = e.parentElement);
            var i = "SECTION" === e.tagName ? e : nearestAncestorElementWithTagName(e, "SECTION", ["ARTICLE"]);
            if (i) {
                var n = i.parentElement,
                    r = function() {
                        for (var e = n.children, t = e.length, r = 0; t > r; ++r) {
                            var a = e[r],
                                l = a.tagName;
                            if (a !== i && ("SECTION" === l || "HEADER" === l))
                                return !0
                        }
                        return !1
                    }();
                if (r && (/\barticleBody\b/.test(n.getAttribute("itemprop")) || "MAIN" === n.tagName || "main" === n.getAttribute("role") || "ARTICLE" === n.tagName || n === this.contentDocument.body))
                    return void (this.article.element = n)
            }
            const a = /intro/i,
                l = /body/i;
            if (e = this.article.element, a.test(e.className) && e.nextElementSibling && l.test(e.nextElementSibling.className) || l.test(e.className) && e.previousElementSibling && a.test(e.previousElementSibling.className))
                return void (this.article.element = e.parentElement);
            if ("ARTICLE" !== e.tagName) {
                var o = e.parentElement.closest("*[itemprop='articleBody']");
                if (o && o.parentElement.closest(SchemaDotOrgArticleContainerSelector))
                    return void (this.article.element = o)
            }
            var s = e.closest("article");
            if (s) {
                e = unwrappedArticleContentElement(e);
                var c = elementDepth(e);
                "P" !== e.tagName || e.className || (e = e.parentElement, c--);
                var m = elementsMatchingClassesInClassListIgnoringCommonLayoutClassNames(e.classList, this.contentDocument);
                1 === m.length && (m = elementsMatchingClassesInClassListIgnoringClassesWithNumericSuffix(e.classList, this.contentDocument));
                for (var h = m.length, d = 0; h > d; ++d) {
                    var u = m[d];
                    if (e !== u && c === elementDepth(u) && isElementVisible(u) && !u.querySelector("article") && dominantFontFamilyAndSizeForElement(e) === dominantFontFamilyAndSizeForElement(u))
                        return void (this.article.element = s)
                }
            }
            if (e = this.article.element, !e.getAttribute("id") && e.className) {
                var g = e.tagName,
                    f = e.className,
                    p = e.parentElement;
                if (p)
                    for (var E = p.children, d = 0, v = E.length; v > d; ++d) {
                        var N = E[d];
                        if (N !== e && N.tagName === g && N.className === f) {
                            var S = CandidateElement.candidateIfElementIsViable(N, this.contentDocument, !0);
                            if (S && !(S.finalScore() < ReaderMinimumScore))
                                return void (this.article.element = p)
                        }
                    }
            }
        }
    },
    findArticleBySearchingWhitelist: function() {
        var e,
            t = this.contentDocument;
        return findArticleNodeSelectorsInWhitelistForHostname(t.location.hostname, function(i) {
            var n = t.querySelectorAll(i);
            return 1 === n.length ? (e = new CandidateElement(n[0], t), !0) : void 0
        }), e
    },
    articleNode: function(e) {
        return this.didSearchForArticleNode || (this.article = this.findArticleBySearchingWhitelist(), this.article || (this.article = this.findArticleBySearchingAllElements()), this.article || (this.article = this.findArticleByVisualExamination()), this.article || (this.article = this.findArticleFromMetadata()), !this.article && e && (this.article = this.findArticleBySearchingAllElements(!0)), this.adjustArticleNodeUpwardIfNecessary(), this.article && (this.article.element = unwrappedArticleContentElement(this.article.element)), this.didSearchForArticleNode = !0, this.article && this.articleIsLTR()), this.article ? this.article.element : null
    },
    extraArticleNode: function() {
        return this.didSearchForArticleNode || this.articleNode(), this.didSearchForExtraArticleNode || (this.extraArticle = this.findExtraArticle(), this.didSearchForExtraArticleNode = !0), this.extraArticle ? this.extraArticle.element : null
    },
    cacheWindowScrollPosition: function() {
        this._cachedScrollY = window.scrollY, this._cachedScrollX = window.scrollX
    },
    contentTextStyle: function() {
        return this._cachedContentTextStyle ? this._cachedContentTextStyle : (this._cachedContentTextStyle = contentTextStyleForNode(this.contentDocument, this.articleNode()), this._cachedContentTextStyle || (this._cachedContentTextStyle = getComputedStyle(this.articleNode())), this._cachedContentTextStyle)
    },
    commaCountIsLessThan: function(e, t) {
        for (var i = 0, n = e.textContent, r = -1; t > i && (r = n.indexOf(",", r + 1)) >= 0;)
            i++;
        return t > i
    },
    calculateLinkDensityForPruningElement: function(e, t) {
        var i = removeWhitespace(e.textContent).length;
        if (!i)
            return 0;
        for (var n = this.article.element, r = function() {
                for (var t = e.originalElement; t && t !== n; t = t.parentElement)
                    if ("none" !== getComputedStyle(t)["float"])
                        return t;
                return null
            }(), a = e.getElementsByTagName("a"), l = 0, o = a.length, s = 0; o > s; ++s) {
            var c = a[s];
            !r && c.href && t && t === dominantFontFamilyAndSizeForElement(c.originalElement) || (l += removeWhitespace(c.textContent).length)
        }
        return l / i
    },
    shouldPruneElement: function(e, t, i) {
        const n = .33,
            r = .5,
            a = .2,
            l = 25,
            o = 4e4;
        var s = e.tagName;
        if (!e.parentElement)
            return !1;
        if (t.classList.contains("footnotes"))
            return !1;
        if ("FIGURE" === e.parentElement.tagName && e.querySelector("img"))
            return !1;
        if ("IFRAME" === s)
            return shouldPruneIframe(e, this.contentDocument);
        if ("OBJECT" !== s && "EMBED" !== s && "CANVAS" !== s) {
            for (var c = !1, m = e.childNodes.length, h = 0; m > h; ++h) {
                var d = e.childNodes[h],
                    u = d.nodeType;
                if (u === Node.ELEMENT_NODE || u === Node.TEXT_NODE && !isNodeWhitespace(d)) {
                    c = !0;
                    break
                }
            }
            if (!c) {
                if ("P" === s) {
                    var g = e.previousSibling,
                        f = e.nextSibling;
                    if (g && g.nodeType === Node.TEXT_NODE && !isNodeWhitespace(g) && f && f.nodeType === Node.TEXT_NODE && !isNodeWhitespace(f))
                        return !1
                }
                return !0
            }
            if ("P" === s)
                return !1
        }
        if ("CANVAS" === s) {
            if (window.innerWidth === t.width && window.innerHeight === t.height)
                return !0;
            const p = /progressive/i;
            return p.test(t.className) && "IMG" === t.nextElementSibling.tagName ? !0 : canvasElementHasNoUserVisibleContent(t) ? !0 : "CUFON" === e.parentNode.tagName
        }
        if (e.closest("figure") && e.querySelector("picture"))
            return !1;
        var E = 0;
        if (t) {
            if (VeryNegativeClassNameRegEx.test(t.className))
                return !0;
            var v = t.className,
                N = t.getAttribute("id");
            PositiveRegEx.test(v) && E++, PositiveRegEx.test(N) && E++, NegativeRegEx.test(v) && E--, NegativeRegEx.test(N) && E--
        }
        if (0 > E)
            return !0;
        if (elementIsProtected(e) || e.querySelector(".tweet-wrapper"))
            return !1;
        if ("UL" === s || "OL" === s) {
            if (t.querySelector("iframe") && t.querySelector("script"))
                return !0;
            var S = t.children,
                y = S.length;
            if (!y)
                return !0;
            for (var A = 0, T = 0, h = 0; y > h; ++h)
                SharingRegex.test(S[h].className) && A++, NegativeRegEx.test(S[h].className) && T++;
            return A / y >= MinimumRatioOfListItemsBeingRelatedToSharingToPruneEntireList ? !0 : T / y >= MinimumRatioOfListItemsBeingRelatedToSharingToPruneEntireList
        }
        if ("OBJECT" === s) {
            var b = e.querySelector("embed[src]"),
                C = b ? anchorForURL(b.src, this.contentDocument) : null;
            if (C && hostnameMatchesHostKnownToContainEmbeddableMedia(C.hostname))
                return !1;
            var D = e.getAttribute("data");
            return C = D ? anchorForURL(D, this.contentDocument) : null, !C || !hostnameMatchesHostKnownToContainEmbeddableMedia(C.hostname)
        }
        if (1 === e.childElementCount) {
            var x = e.firstElementChild;
            if ("A" === x.tagName)
                return !1;
            if ("SPAN" === x.tagName && "converted-anchor" === x.className && nearestAncestorElementWithTagName(x, "TABLE"))
                return !1
        }
        var I = e.getElementsByTagName("img"),
            R = I.length;
        if (R) {
            for (var L = 0, h = 0; R > h; ++h) {
                var M = I[h].originalElement;
                if (isElementVisible(M)) {
                    var F = cachedElementBoundingRect(M);
                    L += F.width / R * (F.height / R)
                }
            }
            if (L > o)
                return !1
        }
        if (!this.commaCountIsLessThan(e, 10))
            return !1;
        var B = e.getElementsByTagName("p").length,
            P = e.getElementsByTagName("br").length,
            _ = B + Math.floor(P / 2);
        if (R > _)
            return !0;
        if (e.getElementsByTagName("li").length > _ && dominantFontFamilyAndSizeForElement(t.querySelector("li")) !== i)
            return !0;
        if (e.getElementsByTagName("input").length / _ > n)
            return !0;
        if (e.textContent.length < l && 1 !== R)
            return !0;
        if (e.querySelector("embed"))
            return !0;
        var w = this.calculateLinkDensityForPruningElement(e, i);
        if (E >= 1 && w > r)
            return !0;
        if (1 > E && w > a)
            return !0;
        if ("TABLE" === s) {
            var O = removeWhitespace(e.innerText).length,
                q = removeWhitespace(t.innerText).length;
            if (.5 * q >= O)
                return !0
        }
        return !1
    },
    wordCountIsLessThan: function(e, t) {
        for (var i = 0, n = e.textContent, r = -1; (r = n.indexOf(" ", r + 1)) >= 0 && t > i;)
            i++;
        return t > i
    },
    leadingImageIsAppropriateWidth: function(e) {
        return this.article && e ? e.getBoundingClientRect().width >= this.article.element.getBoundingClientRect().width - ToleranceForLeadingImageWidthToArticleWidthForFullWidthPresentation : !1
    },
    newDivFromNode: function(e) {
        var t = this.contentDocument.createElement("div");
        return e && (t.innerHTML = e.innerHTML), t
    },
    headerElement: function() {
        if (!this.article)
            return null;
        var e = this.article.element.previousElementSibling;
        if (e && "HEADER" === e.tagName)
            return e;
        var t = this._articleTitleElement;
        if (!t)
            return null;
        var i = t.parentElement;
        if (i && "HEADER" === i.tagName && !this.article.element.contains(i))
            for (var n = i.querySelectorAll("img"), r = n.length, a = 0; r > a; ++a) {
                var l = n[a],
                    o = cachedElementBoundingRect(l);
                if (o.width >= MainImageMinimumWidthAndHeight && o.height >= MainImageMinimumWidthAndHeight)
                    return i
            }
        return null
    },
    adoptableLeadingImage: function() {
        const e = 5,
            t = /credit/,
            i = /caption/,
            n = /src|alt/;
        if (!this.article || !this.leadingImage || !this.leadingImageIsAppropriateWidth(this.leadingImage))
            return null;
        var r = this.leadingImage.closest("figure");
        if (r)
            return this.cleanArticleNode(r, r.cloneNode(!0), CleaningType.LeadingFigure, !0);
        var a = this.leadingImage.parentNode,
            l = null,
            o = null,
            s = a.children.length;
        if ("DIV" === a.tagName && s > 1 && e > s)
            for (var c = a.cloneNode(!0).querySelectorAll("p, div"), m = c.length, h = 0; m > h; ++h) {
                var d = c[h];
                t.test(d.className) ? l = d.cloneNode(!0) : i.test(d.className) && (o = d.cloneNode(!0))
            }
        for (var u = this.leadingImage.cloneNode(!1), g = u.attributes, h = 0; h < g.length; ++h) {
            var f = g[h].nodeName;
            n.test(f) || (u.removeAttribute(f), h--)
        }
        var p = this.contentDocument.createElement("div");
        if (p.className = "leading-image", p.appendChild(u), l) {
            var E = this.newDivFromNode(l);
            E.className = "credit", p.appendChild(E)
        }
        if (o) {
            var v = this.newDivFromNode(o);
            v.className = "caption", p.appendChild(v)
        }
        return p
    },
    articleBoundingRect: function() {
        return this._articleBoundingRect ? this._articleBoundingRect : (this._articleBoundingRect = cachedElementBoundingRect(this.article.element), this._articleBoundingRect)
    },
    adoptableArticle: function(e) {
        if (this._adoptableArticle)
            return this._adoptableArticle.cloneNode(!0);
        clearCachedElementBoundingRects(), this.cacheWindowScrollPosition();
        var t = this.articleNode(e);
        if (this._adoptableArticle = t ? t.cloneNode(!0) : null, !this._adoptableArticle)
            return this._adoptableArticle;
        if (this._adoptableArticle = this.cleanArticleNode(t, this._adoptableArticle, CleaningType.MainArticleContent, !1), "P" === this._adoptableArticle.tagName) {
            var i = document.createElement("div");
            i.appendChild(this._adoptableArticle), this._adoptableArticle = i
        }
        var n = this.extraArticleNode();
        if (n) {
            var r = this.cleanArticleNode(n, n.cloneNode(!0), CleaningType.MainArticleContent, !0);
            r && (this.extraArticle.isPrepended ? this._adoptableArticle.insertBefore(r, this._adoptableArticle.firstChild) : this._adoptableArticle.appendChild(r));
            var a = cachedElementBoundingRect(this.article.element),
                l = cachedElementBoundingRect(this.extraArticle.element),
                o = {
                    top: Math.min(a.top, l.top),
                    right: Math.max(a.right, l.right),
                    bottom: Math.max(a.bottom, l.bottom),
                    left: Math.min(a.left, l.left)
                };
            o.width = o.right - o.left, o.height = o.bottom - o.top, this._articleBoundingRect = o
        }
        this._articleTextContent = this._adoptableArticle.innerText;
        var s = this.headerElement();
        if (this.leadingImage && (!s || !s.contains(this.leadingImage))) {
            var c = this.adoptableLeadingImage();
            c && this._adoptableArticle.insertBefore(c, this._adoptableArticle.firstChild)
        }
        var m = !!s;
        if (m && n && (n === s && (m = !1), m)) {
            var h = n.compareDocumentPosition(s);
            (h & Node.DOCUMENT_POSITION_CONTAINS || h & Node.DOCUMENT_POSITION_CONTAINED_BY) && (m = !1)
        }
        if (m) {
            var d = this.cleanArticleNode(s, s.cloneNode(!0), CleaningType.MainArticleContent, !0);
            d && this._adoptableArticle.insertBefore(d, this._adoptableArticle.firstChild)
        }
        return this._adoptableArticle
    },
    elementPinToEdge: function(e) {
        const t = {
                AREA: 1,
                BR: 1,
                CANVAS: 1,
                EMBED: 1,
                FRAME: 1,
                HR: 1,
                IMG: 1,
                INPUT: 1
            },
            i = 120;
        if (window.scrollY < i)
            return null;
        var n = cachedElementBoundingRect(e),
            r = e.ownerDocument.elementFromPoint((n.left + n.right) / 2, 0);
        r && r.tagName in t && (r = r.parentElement);
        for (var a = r; a && a !== e;)
            a = a.parentNode;
        return a ? r : null
    },
    dominantContentSelectorAndDepth: function(e) {
        const t = 2;
        var i = {},
            n = {};
        walkElementSubtree(e, t, function(e, t) {
            if (isElementVisible(e)) {
                var r = selectorForElement(e) + " | " + t;
                n[r] ? n[r] += 1 : (n[r] = 1, i[r] = e)
            }
        });
        var r,
            a = arrayOfKeysAndValuesOfObjectSortedByValueDescending(n);
        switch (a.length) {
        case 0:
            break;
        case 1:
            r = a[0].key;
            break;
        default:
            var l = a[0];
            l.value > a[1].value && (r = l.key)
        }
        if (!r)
            return null;
        var o = i[r];
        return {
            selector: selectorForElement(o),
            depth: depthOfElementWithinElement(o, e)
        }
    },
    functionToPreventPruningElementDueToInvisibility: function() {
        var e = functionToPreventPruningDueToInvisibilityInWhitelistForHostname(this.contentDocument.location.hostname);
        return e || function() {
                return !1
            }
    },
    cleanArticleNode: function(e, t, i, n) {
        function r(e) {
            p += e, E && (E += e), v && (v += e), N && (N += e), S && (S += e)
        }
        function a() {
            1 === E && (E = 0), 1 === v && (v = 0), 1 === N && (N = 0), 1 === S && (S = 0)
        }
        function l() {
            const t = .8;
            var i = cachedElementBoundingRect(e);
            if (0 === i.width || 0 === i.height)
                return !0;
            var n,
                r = childrenWithParallelStructure(e),
                a = r.length;
            if (a) {
                n = [];
                for (var l = 0; a > l; ++l) {
                    var o = r[l];
                    if ("none" === getComputedStyle(o)["float"])
                        for (var s = o.children, c = s.length, m = 0; c > m; ++m)
                            n.push(s[m]);
                    else
                        n.push(o)
                }
            } else
                n = e.children;
            for (var h = n.length, d = 0, l = 0; h > l; ++l) {
                var u = n[l];
                "none" !== getComputedStyle(u)["float"] && (d += u.innerText.length)
            }
            var g = e.innerText.length,
                f = d / g;
            return f > t
        }
        function o(t) {
            const i = 50;
            if (cachedElementBoundingRect(t).height > i)
                return !1;
            const n = {
                UL: 1,
                LI: 1,
                NAV: 1
            };
            return n[t.tagName] ? !0 : t.parentElement === e && !t.nextElementSibling
        }
        function s(e, t) {
            const i = .9;
            return !(cachedElementBoundingRect(e).height > i * cachedElementBoundingRect(t).height)
        }
        function c(e, t) {
            const i = 1.2,
                n = 1.4;
            if (t && U) {
                var r = t > n * U || V.test(y.className) && t > i * U;
                r && !e.closest(".pullquote") && (e.classList.add("pullquote"), e.classList.contains("float") || (e.style.width = null, cleanStyleAndClassList(e)))
            }
        }
        function m(e, t) {
            for (var i = e[t]; i; i = i[t])
                if (!isNodeWhitespace(i) && i.nodeType !== Node.COMMENT_NODE)
                    return !1;
            return !0
        }
        const h = {
                FORM: 1,
                SCRIPT: 1,
                STYLE: 1,
                LINK: 1,
                BUTTON: 1
            },
            d = {
                DIV: 1,
                TABLE: 1,
                OBJECT: 1,
                UL: 1,
                CANVAS: 1,
                P: 1,
                IFRAME: 1,
                ASIDE: 1,
                SECTION: 1,
                FOOTER: 1,
                NAV: 1,
                OL: 1,
                MENU: 1,
                svg: 1
            },
            u = {
                I: 1,
                EM: 1
            },
            g = {
                B: 1,
                STRONG: 1,
                H1: 1,
                H2: 1,
                H3: 1,
                H4: 1,
                H5: 1,
                H6: 1
            };
        var f = [],
            p = 0,
            E = 0,
            v = 0,
            N = 0,
            S = 0,
            y = e,
            A = y.ownerDocument.defaultView,
            T = t,
            b = this.articleTitle(),
            C = this._articleTitleElement,
            D = (this.articleSubhead(), this._articleSubheadElement),
            x = C && cachedElementBoundingRect(C).top > cachedElementBoundingRect(e).bottom,
            I = this.elementPinToEdge(e),
            R = null,
            L = isElementVisible(e),
            M = new Set([C, D]),
            F = new Set;
        if (i === CleaningType.MainArticleContent) {
            this.updateArticleBylineAndDateElementsIfNecessary();
            var B = this.articleBylineElement();
            B && F.add(B);
            var P = this.articleDateElement();
            P && F.add(P)
        }
        var _ = this.dominantContentSelectorAndDepth(e),
            w = l(),
            O = new Set;
        this.previouslyDiscoveredPageURLStrings.forEach(function(e) {
            O.add(e)
        });
        var q = this.nextPageURL();
        q && O.add(q);
        var k = null;
        this._articleTitleElement && (k = cachedElementBoundingRect(this._articleTitleElement));
        var W = this.functionToPreventPruningElementDueToInvisibility(),
            H = dominantFontFamilyAndSizeForElement(e),
            U = dominantFontSizeInPointsFromFontFamilyAndSizeString(H);
        const V = /pull(ed)?quote/i;
        for (var z = [], G = []; y;) {
            var Y = null,
                X = T.tagName,
                K = !1;
            if (T.originalElement = y, y === I && (R = T), X in h && (Y = T), !Y && y !== e && M.has(y) ? Y = T : !Y && y !== e && F.has(y) ? (T.parentElementBeforePruning = T.parentElement, Y = T, z.push(T)) : elementIsAHeader(T) && previousLeafElementForElement(y) === C && T.classList.add("protected"), !Y && ("H1" === X || "H2" === X)) {
                var j = y.offsetTop - e.offsetTop;
                if (j < HeaderMinimumDistanceFromArticleTop) {
                    var J = titleFromHeaderElement(y),
                        Q = J.length * HeaderLevenshteinDistanceToLengthRatio;
                    levenshteinDistance(b, J) <= Q && (Y = T)
                }
            }
            if (Y || this.isMediaWikiPage() && /editsection/.test(y.className) && (Y = T), "VIDEO" === X)
                if (T.getAttribute("src")) {
                    T.classList.add("protected");
                    var $ = cachedElementBoundingRect(y);
                    T.setAttribute("width", $.width), T.setAttribute("height", $.height), T.setAttribute("controls", !0), T.removeAttribute("autoplay"), T.removeAttribute("preload"), T.removeAttribute("style")
                } else
                    Y = T;
            var Z;
            if (Y || (Z = getComputedStyle(y)), !Y && "DIV" === X && LazyLoadRegex.test(y.className) && !y.innerText) {
                var ee = lazyLoadingAttributeToCloneForElement(T);
                if (ee) {
                    var te = this.contentDocument.createElement("img");
                    te.setAttribute("src", T.getAttribute(ee)), T.parentNode.replaceChild(te, T), T = te, T.originalElement = y, X = T.tagName, Y = T, T.classList.add("protected")
                }
            }
            if (!Y && "DIV" === X && T.parentNode) {
                var ie = y.querySelectorAll("a, blockquote, dl, div, img, ol, p, pre, table, ul"),
                    ne = E || "none" !== Z["float"];
                if (!ne && !ie.length) {
                    for (var re = T.parentNode, ae = this.contentDocument.createElement("p"); T.firstChild;) {
                        var le = T.firstChild;
                        ae.appendChild(le)
                    }
                    re.replaceChild(ae, T), R === T && (R = ae), T = ae, T.originalElement = y, X = T.tagName
                }
            }
            if (!Y && T.parentNode && X in d && f.push(T), Y || (isElementPositionedOffScreen(y) ? Y = T : y === e || E || "none" === Z["float"] || w || !(cachedElementBoundingRect(y).height >= FloatMinimumHeight || y.childElementCount > 1) || (E = 1)), !Y) {
                if (sanitizeElementByRemovingAttributes(T), i === CleaningType.MetadataContent && ("|" === T.innerText ? (T.innerText = "", T.classList.add("delimeter")) : "FIGURE" === X && (Y = T)), "both" === Z.clear && T.classList.add("clear"), "UL" === X || "OL" === X || "MENU" === X) {
                    if (k && cachedElementBoundingRect(y).top < k.top)
                        Y = T;
                    else if ("none" === Z["list-style-type"] && "none" === Z["background-image"]) {
                        for (var oe = y.children, se = oe.length, ce = !0, me = 0; se > me; ++me) {
                            var he = getComputedStyle(oe[me]);
                            if ("none" !== he["list-style-type"] || 0 !== parseInt(he["-webkit-padding-start"])) {
                                ce = !1;
                                break
                            }
                        }
                        ce && T.classList.add("list-style-type-none")
                    }
                    if (y.querySelector("code")) {
                        const de = /monospace|menlo|courier/i;
                        var ue = dominantFontFamilyAndSizeForElement(y);
                        de.test(ue) && (T.classList.add("code-block"), T.classList.add("protected"))
                    }
                }
                if (N || "normal" === Z.fontStyle || (X in u || (T.style.fontStyle = Z.fontStyle), N = 1), !S && "normal" !== Z.fontWeight) {
                    if (!(X in g)) {
                        var ge = parseInt(Z.fontWeight),
                            fe = null;
                        isNaN(ge) ? fe = Z.fontWeight : 400 >= ge || ge >= 500 && (fe = "bold"), fe && (T.style.fontWeight = fe)
                    }
                    S = 1
                }
                if (E && "SECTION" !== X && s(y, e) || "ASIDE" === X) {
                    var ue = dominantFontFamilyAndSizeForElement(y),
                        pe = dominantFontSizeInPointsFromFontFamilyAndSizeString(ue),
                        Ee = ue && ue === H;
                    if (1 === E && (cachedElementBoundingRect(y).width <= MaximumFloatWidth ? T.setAttribute("class", "auxiliary float " + Z["float"]) : Ee || T.classList.add("auxiliary")), T.closest(".auxiliary")) {
                        var ve = y.style.getPropertyValue("width");
                        if ("table" === Z.display && /%/.test(ve) && parseInt(ve) < 2)
                            T.style.width = Z.width;
                        else if (ve)
                            T.style.width = ve;
                        else {
                            var Ne = A.getMatchedCSSRules(y, "", !0);
                            if (Ne)
                                for (var Se = Ne.length, me = Se - 1; me >= 0; --me) {
                                    ve = Ne[me].style.getPropertyValue("width");
                                    var ye = parseInt(ve);
                                    if (ve && (isNaN(ye) || ye > 0)) {
                                        T.style.width = ve;
                                        break
                                    }
                                }
                        }
                        1 !== E || ve || (T.style.width = cachedElementBoundingRect(y).width + "px")
                    }
                    c(T, pe)
                }
                if ("TABLE" === X)
                    v || (v = 1);
                else if ("IMG" === X) {
                    var ee = lazyLoadingAttributeToCloneForElement(T);
                    ee && (T.setAttribute("src", T.getAttribute(ee)), T.classList.add("protected"), K = !0), T.removeAttribute("border"), T.removeAttribute("hspace"), T.removeAttribute("vspace");
                    var Ae = T.getAttribute("align");
                    if (T.removeAttribute("align"), "left" !== Ae && "right" !== Ae || (T.classList.add("float"), T.classList.add(Ae)), !E && !K) {
                        var Te = cachedElementBoundingRect(y),
                            be = Te.width,
                            Ce = Te.height;
                        1 === be && 1 === Ce ? Y = T : k && Ce < MinimumHeightForImagesAboveTheArticleTitle && Te.bottom < k.top ? Y = T : be < ImageSizeTiny && Ce < ImageSizeTiny && T.setAttribute("class", "reader-image-tiny")
                    }
                    if (i === CleaningType.MetadataContent) {
                        var Te = cachedElementBoundingRect(y);
                        (Te.width > MaximumWidthOrHeightOfImageInMetadataSection || Te.height > MaximumWidthOrHeightOfImageInMetadataSection) && (Y = T)
                    }
                } else if ("FONT" === X)
                    T.removeAttribute("size"), T.removeAttribute("face"), T.removeAttribute("color");
                else if ("A" === X && T.parentNode) {
                    var De = T.getAttribute("href");
                    if ("author" === y.getAttribute("itemprop"))
                        T.classList.add("protected");
                    else if (De && De.length && ("#" === De[0] || anchorRunsJavaScriptOnActivation(T))) {
                        if (!v && !T.childElementCount && 1 === T.parentElement.childElementCount && "LI" !== T.parentElement.tagName) {
                            var xe = this.contentDocument.evaluate("text()", T.parentElement, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                            xe.snapshotLength || (Y = T)
                        }
                        if (!Y) {
                            var ae = this.contentDocument.createElement("span");
                            if (1 === T.childElementCount && "IMG" === T.firstElementChild.tagName) {
                                var Ie = T.firstElementChild;
                                Ie.width > AnchorImageMinimumWidth && Ie.height > AnchorImageMinimumHeight && ae.setAttribute("class", "converted-image-anchor")
                            }
                            for (ae.className || ae.setAttribute("class", "converted-anchor"); T.firstChild;)
                                ae.appendChild(T.firstChild);
                            T.parentNode.replaceChild(ae, T), T = ae, R === T && (R = ae)
                        }
                    } else if (AdvertisementHostRegex.test(T.host) && !T.innerText)
                        Y = T;
                    else if (C && !x && C.compareDocumentPosition(y) & document.DOCUMENT_POSITION_PRECEDING && cachedElementBoundingRect(y).top < cachedElementBoundingRect(C).top)
                        G.push(T);
                    else {
                        var Re = y.children;
                        1 === Re.length && "IMG" === Re[0].tagName && !y.innerText && anchorLooksLikeDownloadFlashLink(y) && (Y = T)
                    }
                } else if ("BLOCKQUOTE" === X || "Q" === X || "DIV" === X && V.test(y.className)) {
                    var ue = dominantFontFamilyAndSizeForElement(y),
                        pe = dominantFontSizeInPointsFromFontFamilyAndSizeString(ue);
                    c(T, pe)
                }
            }
            if (Z && L && !K) {
                var Le = "none" === Z.display || "visible" !== Z.visibility || computedStyleIndicatesElementIsInvisibleDueToClipping(Z);
                if (Le) {
                    var Me = _ ? p === _.depth && selectorForElement(y) === _.selector : !1;
                    Me || W(y, e) || (Y = T)
                }
            }
            if (!Y && elementIsCommentBlock(y) && (Y = T), !Y && k && cachedElementBoundingRect(y).top < k.top && VeryLiberalCommentRegex.test(y.className) && T.parentElement && (Y = T), !Y && "A" === X && O.has(y.href)) {
                for (var Fe, Be, Pe = y, _e = T; (Pe = Pe.parentElement) && (_e = _e.parentElement);) {
                    const we = 10;
                    if (cachedElementBoundingRect(Pe).top - cachedElementBoundingRect(y).top > we)
                        break;
                    if (Pe === e)
                        break;
                    o(Pe) && (Fe = Pe, Be = _e)
                }
                Fe && (Y = Be, y = Fe, T = Be, T.originalElement = y, X = T.tagName), Pe = null, _e = null, Fe = null, Be = null
            }
            var Oe = Y ? null : y.firstElementChild;
            if (Oe)
                y = Oe, T = T.firstElementChild, r(1);
            else {
                for (var qe; y !== e && !(qe = y.nextElementSibling);)
                    y = y.parentElement, T = T.parentElement, r(-1);
                if (y === e) {
                    if (Y && !elementIsProtected(Y))
                        if (Y.parentElement)
                            Y.remove();
                        else if (n)
                            return null;
                    break
                }
                y = qe, T = T.nextElementSibling, a()
            }
            if (Y && !elementIsProtected(Y))
                if (Y.parentElement)
                    Y.remove();
                else if (n)
                    return null
        }
        for (var ke = t.querySelectorAll("iframe"), We = ke.length, me = 0; We > me; ++me) {
            var He = ke[me];
            if (elementLooksLikeEmbeddedTweet(He.originalElement)) {
                var Ue = this.adoptableSimpleTweetFromTwitterIframe(He);
                Ue && He.parentElement.replaceChild(Ue, He)
            }
            He.classList.add("protected"), He.setAttribute("sandbox", "allow-scripts allow-same-origin")
        }
        for (var me = f.length - 1; me >= 0; --me) {
            var Ve = f[me];
            Ve.parentNode && this.shouldPruneElement(Ve, Ve.originalElement, H) && (R === Ve && ((R = Ve.nextElementSibling) || (R = Ve.parentElement)), Ve.remove())
        }
        for (var ze = G.length, me = 0; ze > me; ++me)
            G[me].remove();
        for (var Ge = t.querySelectorAll(".float"), me = 0; me < Ge.length; ++me) {
            var Ye = !1,
                Xe = Ge[me];
            if (!Ye) {
                var Ke = Xe.querySelectorAll("a, span.converted-image-anchor"),
                    je = Xe.querySelectorAll("span.converted-anchor");
                Ye = Xe.parentNode && je.length > Ke.length
            }
            if (!Ye) {
                var Je = Xe.querySelectorAll("embed, object").length,
                    Qe = Xe.originalElement.querySelectorAll("embed, object").length;
                !Je && Qe && (Ye = !0)
            }
            if (!Ye) {
                for (var $e = Xe.originalElement.getElementsByTagName("img"), Ze = $e.length, et = 0, tt = 0; Ze > tt && (L && isElementVisible($e[tt]) && et++, !(et > 1)); ++tt)
                    ;
                if (1 === et) {
                    var it = Xe.getElementsByTagName("img").length;
                    it || (Ye = !0)
                }
            }
            if (!Ye) {
                const nt = "img, video, embed, iframe, object, svg";
                /\S/.test(Xe.innerText) || Xe.matches(nt) || Xe.querySelector(nt) || (Ye = !0)
            }
            Ye && (R === Xe && ((R = Xe.nextElementSibling) || (R = Xe.parentElement)), elementIsProtected(Xe) || Xe.remove())
        }
        for (var rt = t.querySelectorAll("br"), at = rt.length, me = at - 1; me >= 0; --me) {
            var lt = rt[me];
            lt.originalElement && "block" === getComputedStyle(lt.originalElement.parentElement).display && (m(lt, "nextSibling") || m(lt, "previousSibling")) && lt.remove()
        }
        if (n && !removeWhitespace(t.innerText).length && i !== CleaningType.LeadingFigure)
            return null;
        if (R) {
            var ot = document.createElement("div"),
                st = R.originalElement.getBoundingClientRect(),
                ct = st.height > 0 ? 100 * st.top / st.height : 0;
            ot.style.position = "relative", ot.style.top = Math.round(-ct) + "%", ot.setAttribute("id", "safari-reader-element-marker"), R.insertBefore(ot, R.firstChild)
        }
        for (var mt = {}, Ke = t.querySelectorAll("a"), ht = Ke.length, me = 0; ht > me; ++me) {
            var dt = Ke[me],
                ut = dt.style.fontWeight;
            mt[ut] || (mt[ut] = []), mt[ut].push(dt)
        }
        for (var ut in mt) {
            var gt = mt[ut],
                ft = gt.length;
            if (ft === ht)
                for (var me = 0; ft > me; ++me) {
                    var dt = gt[me];
                    dt.style.fontWeight = null, "" === dt.getAttribute("style") && (dt.style = null)
                }
        }
        for (var pt = t.querySelectorAll(".protected"), Et = pt.length, me = 0; Et > me; ++me) {
            var Ve = pt[me];
            Ve.classList.remove("protected"), Ve.classList.length || Ve.removeAttribute("class")
        }
        for (var vt = t.querySelectorAll("p.auxiliary"), Nt = vt.length, me = 0; Nt > me; ++me) {
            for (var St = vt[me], yt = [St], At = St.nextElementSibling; At && "P" === At.tagName && At.classList.contains("auxiliary");)
                yt.push(At), At = At.nextElementSibling;
            var Tt = yt.length;
            if (Tt > 1) {
                for (var tt = 0; Tt > tt; ++tt) {
                    var bt = yt[tt];
                    bt.classList.remove("auxiliary"), bt.style.width = null, cleanStyleAndClassList(bt)
                }
                me += Tt - 1
            }
        }
        for (var Ct = z.length, me = 0; Ct > me; ++me) {
            var Dt = z[me],
                xt = Dt.parentElementBeforePruning,
                It = null,
                Rt = null;
            if (xt)
                var It = depthOfElementWithinElement(xt, t),
                    Rt = selectorForElement(xt);
            var Lt = xt ? xt.closest("ul") : null;
            if (Lt)
                Lt.remove();
            else {
                const Mt = 40;
                xt && cachedElementBoundingRect(xt.originalElement).height < Mt && (!_ || _.selector !== Rt || _.depth !== It) ? xt.remove() : Dt.remove()
            }
        }
        return t
    },
    adoptableSimpleTweetFromTwitterIframe: function(e) {
        var t = e.originalElement.contentDocument.documentElement,
            i = t.querySelector("[data-tweet-id].expanded");
        if (!i)
            return null;
        var n = this.contentDocument.createElement("div");
        n.classList.add("tweet-wrapper");
        var r = this.contentDocument.createElement("blockquote");
        r.classList.add("simple-tweet"), n.appendChild(r);
        var a = i.getAttribute("data-tweet-id");
        n.setAttribute("data-reader-tweet-id", a);
        var l = i.querySelector(".dateline"),
            o = i.querySelector('[data-scribe="element:screen_name"]'),
            s = i.querySelector('[data-scribe="element:name"]'),
            c = i.querySelector(".e-entry-title");
        if (!(l && o && s && c))
            return n;
        var m = "&mdash; " + s.innerText + " (" + o.innerText + ")",
            h = this.contentDocument.createElement("p");
        h.innerHTML = c.innerHTML, r.appendChild(h), r.insertAdjacentHTML("beforeend", m);
        var d = this.contentDocument.createElement("span");
        d.innerHTML = l.innerHTML, r.appendChild(d);
        for (var u = r.querySelectorAll("img.twitter-emoji"), g = u.length, f = 0; g > f; ++f) {
            var p = u[f],
                E = p.getAttribute("alt");
            if (E && E.length > 0) {
                var v = this.contentDocument.createElement("span");
                v.innerText = E, p.parentNode.replaceChild(v, p)
            }
        }
        for (var N = r.getElementsByTagName("*"), S = N.length, f = 0; S > f; ++f)
            sanitizeElementByRemovingAttributes(N[f]);
        return n
    },
    leadingImageNode: function() {
        const e = 250,
            t = .5,
            i = .9,
            n = 3;
        if (!this.article || !this.article.element)
            return null;
        for (var r = this.article.element, a = 0; n > a && r.parentNode; ++a) {
            r = r.parentNode;
            var l = r.getElementsByTagName("img")[0];
            if (l && isElementVisible(l)) {
                var o = cachedElementBoundingRect(l),
                    s = o.width >= window.innerWidth * i;
                if (!s && o.height < e)
                    continue;
                if (o.width < this._articleWidth * t)
                    continue;
                var c = this.article.element.compareDocumentPosition(l);
                if (!(c & Node.DOCUMENT_POSITION_PRECEDING) || c & Node.DOCUMENT_POSITION_CONTAINED_BY)
                    continue;
                if (c = this.extraArticle ? this.extraArticle.element.compareDocumentPosition(l) : null, c && (!(c & Node.DOCUMENT_POSITION_PRECEDING) || c & Node.DOCUMENT_POSITION_CONTAINED_BY))
                    continue;
                return l
            }
        }
        return null
    },
    pageImageURLFromMetadata: function() {
        var e = this.contentDocument,
            t = e.querySelector("meta[property='og:image']");
        return t || (t = e.querySelector("meta[property='twitter:image']")), t || (t = e.querySelector("meta[property='twitter:image:src']")), t && t.content ? t.content : null
    },
    mainImageNode: function() {
        var e = this.leadingImageNode();
        if (e)
            return e;
        if (this.article && this.article.element)
            for (var t = this.article.element.querySelectorAll("img"), i = t.length, n = 0; i > n; ++n) {
                var r = t[n],
                    a = r._cachedElementBoundingRect;
                if (a || (a = r.getBoundingClientRect()), a.width >= MainImageMinimumWidthAndHeight && a.height >= MainImageMinimumWidthAndHeight)
                    return r
            }
        return null
    },
    articleTitle: function() {
        function e(e, t) {
            var i = e ? t.indexOf(e) : -1;
            return -1 !== i && (0 === i || i + e.length === t.length)
        }
        function t(e, t) {
            return e.host === t.host && e.pathname === t.pathname && e.hash === t.hash
        }
        if (this.articleNode()) {
            if (this._articleTitle)
                return this._articleTitle;
            const i = 500,
                n = 20,
                r = 8,
                a = 1.1,
                l = 1.25,
                o = /header|title|headline|instapaper_title/i,
                s = 1.5,
                c = 1.8,
                m = 1.5,
                h = .6,
                d = 3,
                u = 1.5,
                g = 9,
                f = 1.5,
                p = /byline|author/i;
            var E = function(e, t) {
                    var i = this.contentFromUniqueMetadataSelector(e, t);
                    if (i) {
                        var n = this.articleTitleAndSiteNameFromTitleString(i);
                        n && (i = n.articleTitle)
                    }
                    return i
                }.bind(this),
                v = function() {
                    for (var e = this.articleNode(); e; e = e.parentElement)
                        if (elementIndicatesItIsASchemaDotOrgArticleContainer(e))
                            return e;
                    return null
                }.bind(this)(),
                N = v ? this.contentFromUniqueMetadataSelector(v, "meta[itemprop=headline]") : "",
                S = v ? this.contentFromUniqueMetadataSelector(v, "meta[itemprop=alternativeHeadline]") : "",
                y = this.contentDocument,
                A = y.title,
                T = E(y, "head meta[property='og:title']"),
                b = this.contentFromUniqueMetadataSelector(y, "head meta[property='og:site_name']"),
                C = E(y, "head meta[name='twitter:title']"),
                D = E(y, "meta[name='sailthru.headline']"),
                x = cachedElementBoundingRect(this.articleNode());
            this.extraArticleNode() && this.extraArticle.isPrepended && (x = cachedElementBoundingRect(this.extraArticleNode()));
            var I = x.left + x.width / 2,
                R = x.top,
                L = R;
            if (this._articleWidth = x.width, this.leadingImage = this.leadingImageNode(), this.leadingImage) {
                var M = cachedElementBoundingRect(this.leadingImage);
                L = (M.top + R) / 2
            }
            var F = "h1, h2, h3, h4, h5, .headline, .article_title, .post-title, #hn-headline, .inside-head, .instapaper_title",
                B = this.article.element.tagName;
            "DL" !== B && "DD" !== B || (F += ", dt");
            var P = this.contentDocument.querySelectorAll(F);
            P = Array.prototype.slice.call(P, 0);
            const _ = 2;
            for (var w = y.location, O = this.article.element, q = 0; _ > q; ++q)
                O.parentElement && (O = O.parentElement);
            for (var k = O.getElementsByTagName("a"), q = 0, W = k.length; W > q; ++q) {
                var H = k[q];
                if (H.offsetTop > this.articleNode().offsetTop + n)
                    break;
                if (t(H, w) && "#" !== H.getAttribute("href")) {
                    P.push(H);
                    break
                }
            }
            for (var U, V = P.map(titleFromHeaderElement), z = P.length, G = 0, Y = [], X = [], K = [], j = [], J = [], Q = [], q = 0; z > q; ++q) {
                var $ = P[q],
                    Z = V[q],
                    ee = stringSimilarity(A, Z);
                if (T) {
                    var te = stringSimilarity(T, Z);
                    ee += te, te > StringSimilarityToDeclareStringsNearlyIdentical && X.push($)
                }
                if (C) {
                    var ie = stringSimilarity(C, Z);
                    ee += ie, ie > StringSimilarityToDeclareStringsNearlyIdentical && K.push($)
                }
                if (N) {
                    var ne = stringSimilarity(N, Z);
                    ee += ne, ne > StringSimilarityToDeclareStringsNearlyIdentical && j.push($)
                }
                if (S) {
                    var re = stringSimilarity(S, Z);
                    ee += re, re > StringSimilarityToDeclareStringsNearlyIdentical && J.push($)
                }
                if (D) {
                    var ae = stringSimilarity(D, Z);
                    ee += ae, ae > StringSimilarityToDeclareStringsNearlyIdentical && Q.push($)
                }
                ee === G ? Y.push($) : ee > G && (G = ee, Y = [$])
            }
            if (1 === X.length ? (U = X[0], U.headerText = titleFromHeaderElement(U)) : 1 === K.length ? (U = K[0], U.headerText = titleFromHeaderElement(U)) : 1 === j.length ? (U = j[0],
            U.headerText = titleFromHeaderElement(U)) : 1 === Q.length && (U = Q[0], U.headerText = titleFromHeaderElement(U)), !U)
                for (var q = 0; z > q; ++q) {
                    var $ = P[q];
                    if (isElementVisible($)) {
                        var le = cachedElementBoundingRect($),
                            oe = le.left + le.width / 2,
                            se = le.top + le.height / 2,
                            ce = oe - I,
                            me = se - L,
                            he = -1 !== X.indexOf($),
                            de = -1 !== K.indexOf($),
                            ue = $.classList.contains("instapaper_title"),
                            ge = /\bheadline\b/.test($.getAttribute("itemprop")),
                            fe = -1 !== j.indexOf($),
                            pe = -1 !== J.indexOf($),
                            Ee = -1 !== Q.indexOf($),
                            ve = he || de || ue || ge || fe || pe || Ee,
                            Ne = Math.sqrt(ce * ce + me * me),
                            Se = ve ? i : Math.max(i - Ne, 0),
                            Z = V[q],
                            ye = $.getAttribute("property");
                        if (ye) {
                            var Ae = /dc.title/i.exec(ye);
                            if (Ae && Ae[0]) {
                                var Te = this.contentDocument.querySelectorAll('*[property~="' + Ae[0] + '"]');
                                if (1 === Te.length) {
                                    U = $, U.headerText = Z;
                                    break
                                }
                            }
                        }
                        if (!p.test($.className)) {
                            if (!ve) {
                                if (Ne > i)
                                    continue;
                                if (oe < x.left || oe > x.right)
                                    continue
                            }
                            if (A && stringsAreNearlyIdentical(Z, A))
                                Se *= d;
                            else if (e(Z, A))
                                Se *= u;
                            else if (Z.length < r)
                                continue;
                            if (Z !== b || !T) {
                                var be = !1,
                                    Ce = nearestAncestorElementWithTagName($, "A");
                                if (Ce || (Ce = $.querySelector("a")), Ce) {
                                    if ("author" === Ce.getAttribute("rel"))
                                        continue;
                                    var De = Ce.host === w.host,
                                        xe = Ce.pathname === w.pathname;
                                    if (De && xe)
                                        Se *= m;
                                    else {
                                        if (De && nearestAncestorElementWithTagName($, "LI"))
                                            continue;
                                        Se *= h, be = !0
                                    }
                                }
                                var Ie = fontSizeFromComputedStyle(getComputedStyle($));
                                be || (Se *= Ie / BaseFontSize), Se *= 1 + TitleCandidateDepthScoreMultiplier * elementDepth($);
                                var Re = parseInt(this.contentTextStyle().fontSize);
                                parseInt(Ie) > Re * a && (Se *= l), (o.test($.className) || o.test($.getAttribute("id"))) && (Se *= s);
                                var Le = $.parentElement;
                                Le && (o.test(Le.className) || o.test(Le.getAttribute("id"))) && (Se *= s), -1 !== Y.indexOf($) && (Se *= c), (!U || Se > U.headerScore) && (U = $, U.headerScore = Se, U.headerText = Z)
                            }
                        }
                    }
                }
            if (U && domDistance(U, this.articleNode(), 10) > g && parseInt(getComputedStyle(U).fontSize) < f * Re && (U = null), U) {
                this._articleTitleElement = U;
                var Me = U.headerText.trim();
                T && e(T, Me) ? this._articleTitle = T : A && e(A, Me) ? this._articleTitle = A : this._articleTitle = Me
            }
            return this._articleTitle || (T && e(T, A) ? this._articleTitle = T : this._articleTitle = A), this._articleTitle
        }
    },
    contentFromUniqueMetadataSelector: function(e, t) {
        var i = e.querySelectorAll(t);
        if (1 !== i.length)
            return null;
        var n = i[0];
        return n && 2 === n.attributes.length ? n.content : null
    },
    articleSubhead: function() {
        function e(e) {
            return elementIsAHeader(e) ? parseInt(/H(\d)?/.exec(e.tagName)[1]) : NaN
        }
        const t = /author|kicker/i,
            i = /sub(head|title)|description|deck/i;
        if (this._articleSubhead)
            return this._articleSubhead;
        var n = this.articleNode();
        if (n) {
            var r = this._articleTitleElement;
            if (r) {
                var a,
                    l = e(r),
                    o = cachedElementBoundingRect(r),
                    s = this.contentDocument.querySelector("meta[property='og:description']");
                if (s)
                    a = s.content;
                else {
                    var c = this.contentDocument.querySelector("meta[name=description]");
                    c && (a = c.content)
                }
                for (var m = [nextNonFloatingVisibleElementSibling(r), nextLeafElementForElement(r)], h = m.length, d = 0; h > d; ++d) {
                    var u = m[d];
                    if (u && u !== n) {
                        var g = u.className;
                        if (!t.test(g)) {
                            var f = !1;
                            if (elementIsAHeader(u))
                                if (isNaN(l))
                                    f = !0;
                                else {
                                    var p = e(u);
                                    p - 1 === l && (f = !0)
                                }
                            if (!f && i.test(g) && (f = !0), !f && /\bdescription\b/.test(u.getAttribute("itemprop")) && (f = !0), !f && a && a === u.innerText && (f = !0), f || "summary" !== u.getAttribute("itemprop") || (f = !0), f) {
                                var E;
                                if ("META" === u.tagName) {
                                    var v = u.getAttribute("content");
                                    E = v ? v.trim() : "";
                                    var N = u.nextElementSibling;
                                    if (!N || titleFromHeaderElement(N) !== E)
                                        continue;
                                    u = N
                                } else {
                                    if (cachedElementBoundingRect(u).top < (o.bottom + o.top) / 2)
                                        continue;
                                    E = titleFromHeaderElement(u).trim()
                                }
                                if (E.length) {
                                    this._articleSubheadElement = u, this._articleSubhead = E;
                                    break
                                }
                            }
                        }
                    }
                }
                return this._articleSubhead
            }
        }
    },
    adoptableMetadataBlock: function() {
        this.updateArticleBylineAndDateElementsIfNecessary();
        var e = this.articleBylineElement(),
            t = this.articleDateElement();
        if (!e && !t)
            return null;
        if (e && t) {
            var i = e.compareDocumentPosition(t);
            i & Node.DOCUMENT_POSITION_CONTAINS && (e = null), i & Node.DOCUMENT_POSITION_CONTAINED_BY && (t = null), e === t && (t = null)
        }
        var n,
            r = this.contentDocument.createElement("div"),
            a = !1,
            l = !1;
        if (e) {
            var n = this.cleanArticleNode(e, e.cloneNode(!0), CleaningType.MetadataContent, !1);
            n.innerText.trim() && (a = !0, n.classList.add("byline"))
        }
        if (t) {
            var o = this.cleanArticleNode(t, t.cloneNode(!0), CleaningType.MetadataContent, !1);
            o.innerText.trim() && (l = !0, o.classList.add("date"))
        }
        if (a && r.appendChild(n), a && l) {
            var s = document.createElement("span");
            s.classList.add("delimeter"), r.appendChild(s)
        }
        return l && r.appendChild(o), r
    },
    articleBylineElement: function() {
        return this._articleBylineElement
    },
    findArticleBylineElement: function() {
        const e = ".byline, .article-byline, .entry-meta, [itemprop='author'], a[rel='author']";
        var t = this.article.element,
            i = t.querySelectorAll(e);
        if (1 === i.length)
            return i[0];
        var n = this._articleSubheadElement || this._articleTitleElement,
            r = n ? n.nextElementSibling : null;
        if (r) {
            var a = this.contentFromUniqueMetadataSelector(this.contentDocument, "head meta[name=author]");
            if (r.matches(e) || r.innerText === a || (r = r.querySelector(e)), r) {
                var l = r.querySelector("li");
                if (l) {
                    var o = r.querySelector(e);
                    o && (r = o)
                }
            }
            return r
        }
        var s = t.closest("article");
        if (s) {
            var r = s.querySelector(e);
            if (r)
                return r
        }
        return null
    },
    articleDateElement: function() {
        return this._articleDateElement
    },
    findArticleDateElement: function() {
        const e = "time, .dateline, .entry-date";
        var t,
            i = this.article.element,
            n = i.querySelectorAll(e);
        if (1 === n.length && (t = n[0]), i = i.closest("article")) {
            var n = i.querySelectorAll(e);
            if (1 === n.length)
                return n[0]
        }
        if (!t) {
            var r = this._articleSubheadElement || this._articleTitleElement,
                a = r ? r.nextElementSibling : null;
            a && (n = a.querySelectorAll(e), 1 === n.length && (a = n[0])), !a || a.matches(e) || a.querySelector(e) || (a = null), a && a.contains(i) && (a = null), t = a
        }
        return t
    },
    articleDateElementWithBylineElementHint: function(e) {
        var t = e.nextElementSibling;
        return t && /date/.test(t.className) ? t : null
    },
    updateArticleBylineAndDateElementsIfNecessary: function() {
        this._didArticleBylineAndDateElementDetection || (this.updateArticleBylineAndDateElements(), this._didArticleBylineAndDateElementDetection = !0)
    },
    updateArticleBylineAndDateElements: function() {
        var e = this.findArticleBylineElement(),
            t = this.findArticleDateElement();
        !t && e && (t = this.articleDateElementWithBylineElementHint(e)), this._articleDateElement = t, this._articleBylineElement = e
    },
    articleIsLTR: function() {
        if (!this._articleIsLTR) {
            var e = getComputedStyle(this.article.element);
            this._articleIsLTR = e ? "ltr" === e.direction : !0
        }
        return this._articleIsLTR
    },
    findSuggestedCandidate: function() {
        var e = this.suggestedRouteToArticle;
        if (!e || !e.length)
            return null;
        var t,
            i;
        for (i = e.length - 1; i >= 0 && (!e[i].id || !(t = this.contentDocument.getElementById(e[i].id))); --i)
            ;
        for (i++, t || (t = this.contentDocument); i < e.length;) {
            for (var n = e[i], r = t.nodeType === Node.DOCUMENT_NODE ? t.documentElement : t.firstElementChild, a = 1; r && a < n.index; r = r.nextElementSibling)
                this.shouldIgnoreInRouteComputation(r) || a++;
            if (!r)
                return null;
            if (r.tagName !== n.tagName)
                return null;
            if (n.className && r.className !== n.className)
                return null;
            t = r, i++
        }
        return isElementVisible(t) ? new CandidateElement(t, this.contentDocument) : null
    },
    findArticleBySearchingAllElements: function(e) {
        var t = this.findSuggestedCandidate(),
            i = this.findCandidateElements();
        if (!i || !i.length)
            return t;
        if (t && t.basicScore() >= ReaderMinimumScore)
            return t;
        for (var n = this.highestScoringCandidateFromCandidates(i), r = n.element; r !== this.contentDocument; r = r.parentNode)
            if ("BLOCKQUOTE" === r.tagName) {
                for (var a = r.parentNode, l = i.length, o = 0; l > o; ++o) {
                    var s = i[o];
                    if (s.element === a) {
                        n = s;
                        break
                    }
                }
                break
            }
        if (t && n.finalScore() < ReaderMinimumScore)
            return t;
        if (!e) {
            if (n.shouldDisqualifyDueToScoreDensity())
                return null;
            if (n.shouldDisqualifyDueToHorizontalRuleDensity())
                return null;
            if (n.shouldDisqualifyDueToHeaderDensity())
                return null;
            if (n.shouldDisqualifyDueToSimilarElements(i))
                return null
        }
        return n
    },
    findExtraArticle: function() {
        if (!this.article)
            return null;
        for (var e = 0, t = this.article.element; 3 > e && t; ++e, t = t.parentNode) {
            var i = this.findExtraArticleCandidateElements(t);
            if (i && i.length)
                for (var n, r = this.sortCandidateElementsInDescendingScoreOrder(i), a = 0; a < r.length && (n = r[a], n && n.basicScore()); a++)
                    if (!n.shouldDisqualifyDueToScoreDensity() && !n.shouldDisqualifyDueToHorizontalRuleDensity() && !(n.shouldDisqualifyDueToHeaderDensity() || cachedElementBoundingRect(n.element).height < PrependedArticleCandidateMinimumHeight && cachedElementBoundingRect(this.article.element).width !== cachedElementBoundingRect(n.element).width)) {
                        var l = contentTextStyleForNode(this.contentDocument, n.element);
                        if (l && l.fontFamily === this.contentTextStyle().fontFamily && l.fontSize === this.contentTextStyle().fontSize && n)
                            return n
                    }
        }
        return null
    },
    highestScoringCandidateFromCandidates: function(e) {
        for (var t = 0, i = null, n = e.length, r = 0; n > r; ++r) {
            var a = e[r],
                l = a.basicScore();
            l >= t && (t = l, i = a)
        }
        return i
    },
    sortCandidateElementsInDescendingScoreOrder: function(e) {
        function t(e, t) {
            return e.basicScore() !== t.basicScore() ? t.basicScore() - e.basicScore() : t.depth() - e.depth()
        }
        return e.sort(t)
    },
    findCandidateElements: function() {
        const e = 1e3;
        for (var t = Date.now() + e, i = this.contentDocument.getElementsByTagName("*"), n = i.length, r = [], a = 0; n > a; ++a) {
            var l = i[a];
            if (!CandidateTagNamesToIgnore[l.tagName]) {
                var o = CandidateElement.candidateIfElementIsViable(l, this.contentDocument);
                if (o && r.push(o), Date.now() > t) {
                    r = [];
                    break
                }
            }
        }
        for (var s = r.length, a = 0; s > a; ++a)
            r[a].element.candidateElement = r[a];
        for (var a = 0; s > a; ++a) {
            var c = r[a];
            if ("BLOCKQUOTE" === c.element.tagName) {
                var m = c.element.parentElement.candidateElement;
                m && m.addTextNodesFromCandidateElement(c)
            }
        }
        for (var a = 0; s > a; ++a)
            r[a].element.candidateElement = null;
        return r
    },
    findExtraArticleCandidateElements: function(e) {
        if (!this.article)
            return [];
        e || (e = this.article.element);
        for (var t = "preceding-sibling::*/descendant-or-self::*", i = this.contentDocument.evaluate(t, e, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null), n = i.snapshotLength, r = [], a = 0; n > a; ++a) {
            var l = i.snapshotItem(a);
            if (!CandidateTagNamesToIgnore[l.tagName]) {
                var o = CandidateElement.extraArticleCandidateIfElementIsViable(l, this.article, this.contentDocument, !0);
                o && r.push(o)
            }
        }
        t = "following-sibling::*/descendant-or-self::*", i = this.contentDocument.evaluate(t, e, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null), n = i.snapshotLength;
        for (var a = 0; n > a; ++a) {
            var l = i.snapshotItem(a);
            if (!CandidateTagNamesToIgnore[l.tagName]) {
                var o = CandidateElement.extraArticleCandidateIfElementIsViable(l, this.article, this.contentDocument, !1);
                o && r.push(o)
            }
        }
        return r
    },
    isGeneratedBy: function(e) {
        var t = this.contentDocument.head ? this.contentDocument.head.querySelector("meta[name=generator]") : null;
        if (!t)
            return !1;
        var i = t.content;
        return i ? e.test(i) : !1
    },
    isMediaWikiPage: function() {
        return this.isGeneratedBy(/^MediaWiki /)
    },
    isWordPressSite: function() {
        return this.isGeneratedBy(/^WordPress/)
    },
    nextPageURLString: function() {
        if (!this.article)
            return null;
        if (this.isMediaWikiPage())
            return null;
        var e,
            t = 0,
            i = this.article.element;
        i.parentNode && "inline" === getComputedStyle(i).display && (i = i.parentNode);
        for (var n = i, r = cachedElementBoundingRect(i).bottom + LinkMaxVerticalDistanceFromArticle; isElementNode(n) && cachedElementBoundingRect(n).bottom <= r;)
            n = n.parentNode;
        n === i || n !== this.contentDocument && !isElementNode(n) || (i = n);
        var a = this.contentDocument.evaluate(LinkCandidateXPathQuery, i, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null),
            l = a.snapshotLength;
        if (this.pageNumber <= 2 && !this.prefixWithDateForNextPageURL) {
            var o = this.contentDocument.location.pathname,
                s = o.match(LinkDateRegex);
            s && (s = s[0], this.prefixWithDateForNextPageURL = o.substring(0, o.indexOf(s) + s.length))
        }
        for (var c = 0; l > c; ++c) {
            var m = a.snapshotItem(c),
                h = this.scoreNextPageLinkCandidate(m);
            h > t && (e = m, t = h)
        }
        return e ? e.href : null
    },
    scoreNextPageLinkCandidate: function(e) {
        function t(e, t, i, n) {
            t.substring(0, e.length) === e && (t = t.substring(e.length), e = "");
            var r = t.lastInteger();
            if (isNaN(r))
                return !1;
            var a = e ? e.lastInteger() : NaN;
            return (isNaN(a) || a >= MaximumExactIntegralValue) && (a = n), r === a ? i.lastInteger() === a + 1 : r === a + 1
        }
        function i(e) {
            for (var t = {}, i = e.substring(1).split("&"), n = i.length, r = 0; n > r; ++r) {
                var a = i[r],
                    l = a.indexOf("=");
                -1 === l ? t[a] = null : t[a.substring(0, l)] = a.substring(l + 1)
            }
            return t
        }
        var n = this.contentDocument.location;
        if (e.host !== n.host)
            return 0;
        if (e.pathname === n.pathname && e.search === n.search)
            return 0;
        if (-1 !== e.toString().indexOf("#"))
            return 0;
        if (anchorLinksToAttachment(e) || anchorLinksToTagOrCategoryPage(e))
            return 0;
        if (!isElementVisible(e))
            return 0;
        var r = cachedElementBoundingRect(e),
            a = this.articleBoundingRect(),
            l = Math.max(0, Math.max(a.top - (r.top + r.height), r.top - (a.top + a.height)));
        if (r.top < a.top)
            return 0;
        if (l > LinkMaxVerticalDistanceFromArticle)
            return 0;
        var o = Math.max(0, Math.max(a.left - (r.left + r.width), r.left - (a.left + a.width)));
        if (o > 0)
            return 0;
        var s = n.pathname,
            c = e.pathname;
        if (this.prefixWithDateForNextPageURL) {
            if (-1 === e.pathname.indexOf(this.prefixWithDateForNextPageURL))
                return 0;
            s = s.substring(this.prefixWithDateForNextPageURL.length), c = c.substring(this.prefixWithDateForNextPageURL.length)
        }
        var m = c.substring(1).split("/");
        m[m.length - 1] || m.pop();
        var h = m.length,
            d = s.substring(1).split("/"),
            u = !1;
        d[d.length - 1] || (u = !0, d.pop());
        var g = d.length;
        if (g > h)
            return 0;
        for (var f = 0, p = 0, E = e.textContent, v = 0; h > v; ++v) {
            var N = m[v],
                S = g > v ? d[v] : "";
            if (S !== N) {
                if (g - 2 > v)
                    return 0;
                if (N.length >= S.length) {
                    for (var y = 0; N[N.length - 1 - y] === S[S.length - 1 - y];)
                        y++;
                    y && (N = N.substring(0, N.length - y), S = S.substring(0, S.length - y));
                    var A = N.indexOf(S);
                    -1 !== A && (N = N.substring(A))
                }
                t(S, N, E, this.pageNumber) ? p = Math.pow(LinkNextOrdinalValueBase, v - h + 1) : f++
            }
            if (f > 1)
                return 0
        }
        var T = !1;
        if (e.search) {
            linkParameters = i(e.search), referenceParameters = i(n.search);
            for (var b in linkParameters) {
                var C = linkParameters[b],
                    D = b in referenceParameters ? referenceParameters[b] : null;
                if (D !== C)
                    if (null === D && (D = ""), null === C && (C = ""), C.length < D.length)
                        f++;
                    else if (t(D, C, E, this.pageNumber)) {
                        if (LinkURLSearchParameterKeyMatchRegex.test(b)) {
                            if (s.toLowerCase() !== c.toLowerCase())
                                return 0;
                            if (this.isWordPressSite() && u)
                                return 0;
                            T = !0
                        }
                        if (LinkURLBadSearchParameterKeyMatchRegex.test(b)) {
                            f++;
                            continue
                        }
                        p = Math.max(p, 1 / LinkNextOrdinalValueBase)
                    } else
                        f++
            }
        }
        if (!p)
            return 0;
        if ((LinkURLPageSlashNumberMatchRegex.test(e.href) || LinkURLSlashDigitEndMatchRegex.test(e.href)) && (T = !0), !T && h === g && stringSimilarity(s, c) < LinkMinimumURLSimilarityRatio)
            return 0;
        if (LinkURLArchiveSlashDigitEndMatchRegex.test(e))
            return 0;
        var x = LinkMatchWeight * (Math.pow(LinkMismatchValueBase, -f) + p) + LinkVerticalDistanceFromArticleWeight * l / LinkMaxVerticalDistanceFromArticle;
        T && (x += LinkURLSemanticMatchBonus), "LI" === e.parentNode.tagName && (x += LinkListItemBonus);
        var E = e.innerText;
        return LinkNextMatchRegEx.test(E) && (x += LinkNextMatchBonus), LinkPageMatchRegEx.test(E) && (x += LinkPageMatchBonus), LinkContinueMatchRegEx.test(E) && (x += LinkContinueMatchBonus), x
    },
    elementContainsEnoughTextOfSameStyle: function(e, t, i) {
        const n = 110;
        for (var r = "BODY" === e.tagName, a = r ? 2 : 3, l = getVisibleNonWhitespaceTextNodes(e, a, n, r, t), o = i / scoreMultiplierForElementTagNameAndAttributes(e) / languageScoreMultiplierForTextNodes(l), s = {}, c = l.length, m = 0; c > m; ++m) {
            var h = l[m],
                d = h.length,
                u = h.parentElement,
                g = window.getComputedStyle(u),
                f = g.fontFamily + "|" + g.fontSize,
                p = Math.pow(d, TextNodeLengthPower);
            if (s[f]) {
                if ((s[f] += p) > o)
                    break
            } else
                s[f] = p
        }
        for (var f in s)
            if (s[f] > o)
                return !0;
        return !1
    },
    openGraphMetadataClaimsPageTypeIsArticle: function() {
        if (!this._openGraphMetadataClaimsPageTypeIsArticle) {
            var e = this.contentDocument.querySelector("head meta[property='og:type']");
            this._openGraphMetadataClaimsPageTypeIsArticle = e && "article" === e.content
        }
        return this._openGraphMetadataClaimsPageTypeIsArticle
    },
    pointsToUseForHitTesting: function() {
        const e = window.innerWidth,
            t = e / 4,
            i = e / 2,
            n = 128,
            r = 320;
        var a = [[i, 800], [i, 600], [t, 800], [i, 400], [i - n, 1100], [r, 700], [3 * t, 800], [e - r, 700]];
        return this.openGraphMetadataClaimsPageTypeIsArticle() && a.push([i - n, 1400]), a
    },
    findArticleByVisualExamination: function() {
        for (var e = new Set, t = this.pointsToUseForHitTesting(), i = t.length, n = AppleDotComAndSubdomainsRegex.test(this.contentDocument.location.hostname.toLowerCase()) ? 7200 : 1800, r = 0; i > r; r++)
            for (var a = t[r][0], l = t[r][1], o = elementAtPoint(a, l), s = o; s && !e.has(s); s = s.parentElement) {
                if (VeryPositiveClassNameRegEx.test(s.className))
                    return new CandidateElement(s, this.contentDocument);
                if (!CandidateTagNamesToIgnore[s.tagName]) {
                    var c = s.offsetWidth,
                        m = s.offsetHeight;
                    if (!c && !m) {
                        var h = cachedElementBoundingRect(s);
                        c = h.width, m = h.height
                    }
                    if (!(c < CandidateMinimumWidth || m < CandidateMinimumHeight || c * m < CandidateMinimumArea)) {
                        var d = this.elementContainsEnoughTextOfSameStyle(s, e, n);
                        if (e.add(s), d && !(CandidateElement.candidateElementAdjustedHeight(s) < CandidateMinimumHeight)) {
                            var u = new CandidateElement(s, this.contentDocument);
                            if (u.shouldDisqualifyDueToSimilarElements())
                                return null;
                            if (u.shouldDisqualifyDueToHorizontalRuleDensity())
                                return null;
                            if (u.shouldDisqualifyDueToHeaderDensity())
                                return null;
                            if (!u.shouldDisqualifyForDeepLinking())
                                return u
                        }
                    }
                }
            }
        return null
    },
    findArticleFromMetadata: function(e) {
        var t = document.querySelectorAll(SchemaDotOrgArticleContainerSelector);
        if (1 === t.length) {
            if (e === FindArticleMode.ExistenceOfElement)
                return !0;
            var i = t[0];
            if (i.matches("article, *[itemprop=articleBody]"))
                return new CandidateElement(i, this.contentDocument);
            var n = i.querySelectorAll("article, *[itemprop=articleBody]"),
                r = elementWithLargestAreaFromElements(n);
            return r ? new CandidateElement(r, this.contentDocument) : new CandidateElement(i, this.contentDocument)
        }
        if (this.openGraphMetadataClaimsPageTypeIsArticle()) {
            var a = this.contentDocument.querySelectorAll("main article"),
                l = elementWithLargestAreaFromElements(a);
            if (l)
                return e === FindArticleMode.ExistenceOfElement ? !0 : new CandidateElement(l, this.contentDocument);
            var o = this.contentDocument.querySelectorAll("article");
            if (1 === o.length)
                return e === FindArticleMode.ExistenceOfElement ? !0 : new CandidateElement(o[0], this.contentDocument)
        }
        return null
    },
    articleTextContent: function() {
        return this._articleTextContent
    },
    pageDescription: function() {
        for (var e = this.contentDocument.querySelectorAll("head meta[name]"), t = e.length, i = 0; t > i; ++i) {
            var n = e[i];
            if ("description" === n.getAttribute("name").toLowerCase()) {
                var r = n.getAttribute("content");
                if (r)
                    return r.trim()
            }
        }
        return null
    },
    articleTitleAndSiteNameFromTitleString: function(e) {
        const t = [" - ", " \u2013 ", " \u2014 ", ": ", " | ", " \xbb "],
            i = t.length,
            n = .6;
        for (var r, a, l = this.contentDocument.location.host, o = l.replace(/^(www|m)\./, ""), s = o.replace(/\.(com|info|net|org|edu)$/, "").toLowerCase(), c = 0; i > c; ++c) {
            var m = e.split(t[c]);
            if (2 === m.length) {
                var h = m[0].trim(),
                    d = m[1].trim(),
                    u = h.toLowerCase(),
                    g = d.toLowerCase(),
                    f = Math.max(stringSimilarity(u, o), stringSimilarity(u, s)),
                    p = Math.max(stringSimilarity(g, o), stringSimilarity(g, s)),
                    E = Math.max(f, p);
                (!a || E > a) && (a = E, r = f > p ? {
                    siteName: h,
                    articleTitle: d
                } : {
                    siteName: d,
                    articleTitle: h
                })
            }
        }
        return r && a >= n ? r : null
    },
    pageMetadata: function(e, t) {
        var i,
            n = this.pageDescription(),
            r = !1;
        this.adoptableArticle() ? (i = this.articleTitle(), n = n || this.articleTextContent(), r = !0) : (i = this.contentDocument.title, this.contentDocument.body && (n = n || this.contentDocument.body.innerText));
        var a = "",
            l = this.pageImageURLFromMetadata();
        if (l)
            a = l;
        else {
            var o = this.mainImageNode();
            o && (a = o.src)
        }
        i || (i = userVisibleURLString(this.contentDocument.location.href)), i = i.trim(), e && (i = i.substring(0, e));
        var s = this.contentFromUniqueMetadataSelector(this.contentDocument, "head meta[property='og:site_name']");
        if (!s) {
            var c = this.articleTitleAndSiteNameFromTitleString(this.contentDocument.title);
            c && c.articleTitle === i && (s = c.siteName)
        }
        return s || (s = ""), n = n ? n.trim() : "", t && (n = n.substring(0, t)), n = n.replace(/[\s]+/g, " "), {
            title: i,
            previewText: n,
            siteName: s,
            mainImageURL: a,
            isReaderAvailable: r
        }
    },
    readingListItemInformation: function() {
        const e = 220,
            t = 220;
        return this.pageMetadata(e, t)
    }
};
var ReaderArticleFinderJS = new ReaderArticleFinder(document);


//////

var originalElementLooksLikeEmbeddedTweet = elementLooksLikeEmbeddedTweet;
function elementLooksLikeEmbeddedTweet(e) {
    var result = false;
    try{
        result = originalElementLooksLikeEmbeddedTweet(e)
    }catch(e){}
    return result;
}

ReaderArticleFinderJS.isReaderModeAvailable();
ReaderArticleFinderJS.prepareToTransitionToReader();
return ReaderArticleFinderJS;
}