import {TestBed, async, inject} from '@angular/core/testing';
import {LibraryService} from './library.service';
import {GoogleBook} from "./google-book";

function createBookFixture(book_id) {
  return new GoogleBook({
    book_id: book_id,
    title: "title",
    subTitle: "subTitle:",
    authors: ["authors"],
    publisher: "publisher",
    publishDate: "publishDate",
    description: "description",
    categories: ["categories"],
    thumbnail: "thumbnail",
    smallThumbnail: "smallThumbnail"
  });
}

describe('LibraryService', () => {
  let libraryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LibraryService]
    });
    libraryService = TestBed.get(LibraryService);
  });


  it('can add a book to the library', () => {
    const book = createBookFixture("book_1");
    libraryService.addBook(book);
    expect(book.id).toBe("book_1");
    expect(libraryService.books[0].id).toBe("book_1");
  });

  it('can remove a book to the library', () => {
    const book = createBookFixture("book_1");
    libraryService.addBook(book);
    libraryService.removeBook(book);
    expect(libraryService.books.length).toBe(0);
  });

  it('checks if a book is already in the library', () => {
    const book = createBookFixture("book_1");
    libraryService.addBook(book);
    expect(libraryService.hasBook(book)).toBe(true);
  });

  it('can save and load the books', () => {
    const book = createBookFixture("book_1");
    libraryService.addBook(book);
    libraryService.save();
    libraryService.books = [];
    libraryService.load();
    expect(libraryService.hasBook(book)).toBe(true);
  });
});
