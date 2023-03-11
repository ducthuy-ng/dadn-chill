export class PageOutOfRange implements Error {
  name: 'PageOutOfRange';
  message: string;

  constructor(pageNum: number) {
    this.message = `Page number out of range: ${pageNum}`;
  }
}
