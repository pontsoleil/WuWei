import { Injectable } from '@angular/core';
import { GoogleBook } from './google-book';

@Injectable()
export class LibraryService {

  books: GoogleBook[] = [];
  onscreen = false;

  constructor() {
    this.load();
  }

  save() {
    localStorage.setItem('books', JSON.stringify(this.books));
  }

  load() {
    let savedBooks = localStorage.getItem('books');
    if (!savedBooks) {
      return;
    }
    this.books = [];
    savedBooks = JSON.parse(savedBooks);
    for (let i = 0; i < savedBooks.length; i++) {
      const savedBook = savedBooks[i];
        // parsedBook = JSON.parse(savedBook);
      this.books.push(new GoogleBook({
        id: savedBook['id'],
        title: savedBook['title'],
        subTitle: savedBook['subTitle'],
        authors: savedBook['authors'],
        publisher: savedBook['publisher'],
        publishDate: savedBook['publishDate'],
        description: savedBook['description'],
        categories: savedBook['categories'],
        thumbnail: savedBook['thumbnail'],
        smallThumbnail: savedBook['smallThumbnail']
      }));
    }
  }

  addBook(book: GoogleBook) {
    if (!this.hasBook(book)) {
      this.books.push(book);
      this.save();
    }
  }

  removeBook(book: GoogleBook) {
    const index = this.indexOf(book);
    this.books.splice(index, 1);
    this.save();
  }

  hasBook(book: GoogleBook): boolean {
    return this.indexOf(book) !== -1;
  }

  indexOf(book: GoogleBook): number {
    for (let i = 0; i < this.books.length; i++) {
      if (this.books[i].id === book.id) {
        return i;
      }
    }
    return -1;
  }

}
