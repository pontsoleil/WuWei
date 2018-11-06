import { Injectable } from '@angular/core';

@Injectable()
export class CkeditorConfigService {

  constructor() { }

  public getConfigCN(height: number, maxCharCount: number) {
    return {
      customConfig: '/assets/js/ckeditor/ckeditor-config.cn.js',
      height: height,
      wordcount: {
        showParagraphs: false,
        showWordCount: false,
        showCharCount: true,
        maxCharCount: maxCharCount
      }
    };
  }

  public getConfigEN(height: number, maxCharCount: number) {
    return {
      customConfig: '/assets/js/ckeditor/ckeditor-config.en.js',
      height: height,
      wordcount: {
        showParagraphs: false,
        showWordCount: false,
        showCharCount: true,
        maxCharCount: maxCharCount
      }
    };
  }

  public getConfigJA(height: number, maxCharCount: number) {
    return {
      customConfig: '/assets/js/ckeditor/ckeditor-config.ja.js',
      height: height,
      wordcount: {
        showParagraphs: false,
        showWordCount: false,
        showCharCount: true,
        maxCharCount: maxCharCount
      }
    };
  }

  public getConfigKR(height: number, maxCharCount: number) {
    return {
      customConfig: '/assets/js/ckeditor/ckeditor-config.kr.js',
      height: height,
      wordcount: {
        showParagraphs: false,
        showWordCount: false,
        showCharCount: true,
        maxCharCount: maxCharCount
      }
    };
  }

  public getConfigTW(height: number, maxCharCount: number) {
    return {
      customConfig: '/assets/js/ckeditor/ckeditor-config.tw.js',
      height: height,
      wordcount: {
        showParagraphs: false,
        showWordCount: false,
        showCharCount: true,
        maxCharCount: maxCharCount
      }
    };
  }

}
