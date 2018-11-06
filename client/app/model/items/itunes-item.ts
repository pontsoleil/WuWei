export class ItunesItem {
    public track: string;
    public artist: string;
    public link: string;
    public thumbnail: string;
    public artistId: string;
    public value?: any;

    constructor(param: {
        track: string,
        artist: string,
        link: string,
        thumbnail: string,
        artistId: string,
        value?: any
    }) {
        this.track = param.track;
        this.artist = param.artist;
        this.link = param.link;
        this.thumbnail = param.thumbnail;
        this.artistId = param.artistId;
        this.value = param.value;
        if (param.value) {
            this.value = param.value;
        }
    }
}
