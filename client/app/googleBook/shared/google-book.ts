export class GoogleBook {
  public id: string;
  public title: string;
  public subTitle: string;
  public authors: string[];
  public publisher: string;
  public publishDate: string;
  public description: string;
  public categories: string[];
  public thumbnail: string;
  public smallThumbnail: string;

  constructor(param: {
    id: string,
    title: string,
    subTitle: string,
    authors: string[],
    publisher: string,
    publishDate: string,
    description: string,
    categories: string[],
    thumbnail: string,
    smallThumbnail: string
  }) {
    this.id = param.id;
    this.title = param.title;
    this.subTitle = param.subTitle;
    this.authors = param.authors;
    this.publisher = param.publisher;
    this.publishDate = param.publishDate;
    this.description = param.description;
    this.categories = param.categories;
    this.thumbnail = param.thumbnail;
    this.smallThumbnail = param.smallThumbnail;
  }
}
