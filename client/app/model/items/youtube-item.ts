export class YoutubeItem {
    public kind: string; // "youtube#searchResult",
    public etag: string; // "\"RmznBCICv9YtgWaaa_nWDIH1_GM/Vx8fYkhs8I5jFp1wTP4FYXMmn9M\"",
    public id: {
        kind: string, // "youtube#video",
        videoId: string // "OaXiTwgkDAw"
    };
    public snippet: {
        publishedAt: string, // "2018-03-23T10:00:02.000Z",
        channelId: string, // "UC1oPBUWifc0QOOY8DEKhLuQ",
        title: string, // "BiSH / PAiNT it BLACK[OFFICIAL VIDEO]",
        description: string, // "Major 3rd Single “PAiNT it BLACK” 2018.03.28 OUT!! http://amzn.to/2IJlL2A \"\"楽器を持たないパンクバンド\"\"BiSHのニューシングル テレビアニメ「ブラッククロ...",
        thumbnails: {
            default: {
                url: string, // "https://i.ytimg.com/vi/OaXiTwgkDAw/default.jpg",
                width: number, // 120,
                height: number // 90
            },
            medium: {
                url: string, // "https://i.ytimg.com/vi/OaXiTwgkDAw/mqdefault.jpg",
                    width: number, // 320,
                height: number // 180
            },
            high: {
                url: string, // "https://i.ytimg.com/vi/OaXiTwgkDAw/hqdefault.jpg",
                width: number, // 480,
                height: number // 360
            }
        },
        channelTitle: string, // "avex",
        liveBroadcastContent: string // "none"
    };
    public value?: any;

    constructor(param: {
        kind: string, // "youtube#searchResult",
        etag: string, // "\"RmznBCICv9YtgWaaa_nWDIH1_GM/Vx8fYkhs8I5jFp1wTP4FYXMmn9M\"",
        id: {
            kind: string, // "youtube#video",
            videoId: string // "OaXiTwgkDAw"
        },
        snippet: {
            publishedAt: string, // "2018-03-23T10:00:02.000Z",
            channelId: string, // "UC1oPBUWifc0QOOY8DEKhLuQ",
            title: string, // "BiSH / PAiNT it BLACK[OFFICIAL VIDEO]",
            description: string, // "Major 3rd Single “PAiNT it BLACK” 2018.03.28 OUT!! http://amzn.to/2IJlL2A \"\"楽器を持たないパンクバンド\"\"BiSHのニューシングル テレビアニメ「ブラッククロ...",
            thumbnails: {
                default: {
                    url: string, // "https://i.ytimg.com/vi/OaXiTwgkDAw/default.jpg",
                    width: number, // 120,
                    height: number // 90
                },
                medium: {
                    url: string, // "https://i.ytimg.com/vi/OaXiTwgkDAw/mqdefault.jpg",
                     width: number, // 320,
                    height: number // 180
                },
                high: {
                    url: string, // "https://i.ytimg.com/vi/OaXiTwgkDAw/hqdefault.jpg",
                    width: number, // 480,
                    height: number // 360
                }
            },
            channelTitle: string, // "avex",
            liveBroadcastContent: string // "none"
        },
        value?: any
    }) {
        this.kind = param.kind;
        this.etag = param.etag;
        this.id = {
            kind: param.id.kind,
            videoId: param.id.videoId
        };
        this.snippet = {
            publishedAt: param.snippet.publishedAt,
            channelId: param.snippet.channelId,
            title: param.snippet.title,
            description: param.snippet.description,
            thumbnails: {
                default: {
                    url: param.snippet.thumbnails.default.url,
                    width: param.snippet.thumbnails.default.width,
                    height: param.snippet.thumbnails.default.height
                },
                medium: {
                    url: param.snippet.thumbnails.medium.url,
                     width: param.snippet.thumbnails.medium.width,
                    height: param.snippet.thumbnails.medium.height
                },
                high: {
                    url: param.snippet.thumbnails.high.url,
                    width: param.snippet.thumbnails.high.width,
                    height: param.snippet.thumbnails.high.height
                }
            },
            channelTitle: param.snippet.channelTitle,
            liveBroadcastContent: param.snippet.liveBroadcastContent
        };
        if (param.value) {
            this.value = param.value;
        }
    }
}
