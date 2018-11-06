import { Pipe, PipeTransform } from '@angular/core';
import * as globals from '../../model/wuwei-globals';
import { CN, EN, JA, KR, TW } from './map';

const notEmpty = (v) => {
  const ret = (v !== undefined && v !== null );
  return ret;
};

export function _transform(value: string, language: string): string {
  const nlsMap = {
    cn: CN,
    en: EN,
    ja: JA,
    kr: KR,
    tw: TW
  };
  let _text, text = value;
  if (notEmpty(nlsMap[globals.nls.LANG])) {
    _text = nlsMap[globals.nls.LANG][value];
    if (_text) {
      text = _text;
    }
  }
  return text;
}

/*
 * Translate the string
 * Takes an language argument that defaults to 'en'.
 * Usage:
 *   value | translate:exponent
 * Example:
 *   {{ 'Hello' | translate:'ja' }}
 *   'こんにちは'
*/
@Pipe({name: 'translate'})
export class TranslatePipe implements PipeTransform {
  transform(value: string, language: string): string {
    return _transform(value, language);
  }
}
