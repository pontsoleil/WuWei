import {
  Component,
  OnInit,
  EventEmitter,
  Output
} from '@angular/core';
// import { Http } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';

import { GOOGLE_ENV } from 'assets/config/environment.google';

import { MessageService } from '../../services/message.service';

import { YoutubeSearchService } from './shared/search.service';
import { YoutubeItem } from '../../model/items/youtube-item';
// import { ErrorStateMatcher } from '@angular/material';

@Component({
  selector: 'search-youtube',
  templateUrl: './youtube.component.html',
  styleUrls: ['./youtube.component.scss']
})
export class SearchYoutubeComponent implements OnInit {

  @Output()
  youtubeEvent = new EventEmitter<any>();

  public loading: boolean = false;
  public results: Observable<YoutubeItem[]>;
  public searchField: FormControl;
  private apiRoot = 'https://www.googleapis.com/youtube/v3';
  private apiVideos = 'videos';
  private API_KEY = GOOGLE_ENV.API_KEY['YouTube'];

  constructor(
    private messageService: MessageService,
    private Youtube: YoutubeSearchService,
    private http: HttpClient
  ) {
  }

  ngOnInit() {
    this.searchField = new FormControl();
    this.results = this.searchField.valueChanges
        .debounceTime(500)
        .distinctUntilChanged()
        .do(_ => this.loading = true)
        .switchMap(term => this.Youtube.search(term))
        .do(_ => this.loading = false);
  }

  doSearch(term: string) {
    this.Youtube.search(term);
  }

  showDetail(video) {
    console.log(video);
    const
      id = video.id.videoId,
      apiURL = `${this.apiRoot}/${this.apiVideos}?id=${id}&part=snippet,contentDetails,topicDetails&key=${this.API_KEY}`;
    return this.http.get(apiURL)
      .subscribe(
        data => {
          const
            video = data['items'][0],
            json = JSON.stringify({
              command: 'openInfo',
              param: {
                node: {
                  label: video.snippet.title,
                  thumbnail: video.snippet.thumbnails.medium.url,
                  description: video.snippet.description
                },
                resource: {
                  id: 'https://www.youtube.com/embed/' + video.id,
                  thumbnail: video.snippet.thumbnails.medium.url,
                  smallThumbnail: video.snippet.thumbnails.default.url,
                  value: video.snippet.description,
                  creator: video.snippet.channelTitle
                }
              }
            });
          this.youtubeEvent.emit(json);
          // this.messageService.openSidebar(json);
        },
        error => {
          console.log(error);
        }
      );
  }

  videorecord(video) {
    const
      self = this,
      id = video.id.videoId,
      apiURL = `${this.apiRoot}/${this.apiVideos}?id=${id}&part=snippet,contentDetails,topicDetails&key=${this.API_KEY}`;
    return this.http.get(apiURL)
      .subscribe(
        data => {
          /*
            {
              "kind": "youtube#videoListResponse",
              "etag": "\"DuHzAJ-eQIiCIp7p4ldoVcVAOeY/h1IOE8-uznITEI6jJhCJNHlT7GE\"",
              "pageInfo": {
                "totalResults": 1,
                "resultsPerPage": 1
              },
              "items": [
                {
                  "kind": "youtube#video",
                  "etag": "\"DuHzAJ-eQIiCIp7p4ldoVcVAOeY/WBu16sJnH6LP43QM3s-V53aTu4A\"",
                  "id": "r262a6K-Pds",
                  "snippet": {
                    "publishedAt": "2018-02-20T11:00:02.000Z",
                    "channelId": "UC8ojUR5waSQVNsEaX06I5yA",
                    "title": "WHOLE LOTTA LOVE / BiS 新生アイドル研究会[OFFiCiAL ViDEO]",
                    "description": "[WHOLE LOTTA LOVE]アヤ COME BACK\nhttps://www.amazon.co.jp/%E3%80%90%E6%97%A9%E6%9C%9F%E8%B3%BC%E5%85%A5%E7%89%B9%E5%85%B8%E3%81%82%E3%82%8A%E3%80%91WHOLE-LOTTA-LOVE-DiPROMiSE-%E5%88%9D%E5%9B%9E%E9%99%90%E5%AE%9A%E7%9B%A4/dp/B079J7JS43/ref=ntt_mus_dp_dpt_1\n歌詞↓\n\n作詞：JxSxK×松隈ケンタ/作曲：松隈ケンタ\n歌唱：ペリ・ウブ、ゴ・ジーラ、キカ・フロント・フロンタール、ももらんど、パン・ルナリーフィ、アヤ・エイトプリンス\n\n\n日進月歩\n実験じゃなくて\n人生です\n四苦八苦毎日\n利権がどうの\n誰も止めないさ\nガンガン行って\nたまには引いて\nうまくやろう\n散々待って\nバカにしてっと\nバレていくよ\n\n見つかんない 胸いっぱい愛\n必要ない 等身大愛\nこればっか 本当 my 愛\n見つかんない 胸いっぱい愛\n\nどっかにあるはずさ\nイカれた クソみたいな愛\n\n行かなくちゃって歌いすぎて\nメロディ わっしょい うまそう！\nバカになりたい\nplease say 愛してる でかい声で\nペロリ わっしょい！ 喰らおう！\noh カミナリ落とそう\n\n七転八倒\n本当好きな\n人たちです\n計算ばっか\nしててもやっぱ\n足りないもんあんな\nガンガン見て\n選びまくって\n洗濯を\n風まかせって　\nいい言葉っす\n座右の銘に\n\n見つかんない 胸いっぱい愛\n必要ない 等身大愛\nこればっか 本当 my Ixxx\n見つかんない 胸いっぱい愛\n\nどっかにあるはずさ\nイカれた クソみたいな愛\n行かなくちゃって歌いすぎて\nメロディ わっしょい うまそう！\nバカになりたい\nplease say 愛してる でかい声で\nペロリ わっしょい！ 喰らおう！\noh カミナリ落とそう\n\n見つかんない 胸いっぱい愛\n必要ない 等身大愛\nこればっか 本当 my 愛\n見つかんない 胸いっぱい愛\n見つかんない 胸いっぱい愛\n必要ない 等身大愛\nこればっか 本当 my 愛\n見つかんない 胸いっぱい愛\n\nどっかに落ちてるの？\nイカれた 本当マジな愛\n\n行かなくちゃって歌いすぎて\nメロディ わっしょい うまそう！\nバカになりたい\nplease say 愛してる でかい声で\nペロリ わっしょい！ 喰らおう！\noh カミナリ落とそう\n\nplease say 愛してる でかい声で\nペロリ わっしょい！ 喰らおう！\noh カミナリ落とそう\n \n\n\n＜リリース情報＞   \n\n【商品情報】  \n\n■BiS 再メジャーデビューダブルA面シングル \n「WHOLE LOTTA LOVE / DiPROMiSE」 \n2018年3月7日リリース \n・初回生産限定盤：CRCP-10392/￥3,800＋tax \n・通常盤：CRCP-10393/￥1,000＋tax \n【収録内容】 \n-CD- \n1.WHOLE LOTTA LOVE \n2.DiPROMiSE \n3.WHOLE LOTTA LOVE instrumental \n4.DiPROMiSE instrumental \n\n-DVD-　※初回生産限定盤のみ \n2017.10.6.「IDOL is DEAD」＠赤坂BLITZライブ映像 \n\n\n日本クラウンofficialHP：　http://www.crownrecord.co.jp/artist/bis/whats.html   \n\n\nアーティストＨＰ： http://www.brandnewidolsociety.tokyo/",
                    "thumbnails": {
                      "default": {
                        "url": "https://i.ytimg.com/vi/r262a6K-Pds/default.jpg",
                        "width": 120,
                        "height": 90
                      },
                      "medium": {
                        "url": "https://i.ytimg.com/vi/r262a6K-Pds/mqdefault.jpg",
                        "width": 320,
                        "height": 180
                      },
                      "high": {
                        "url": "https://i.ytimg.com/vi/r262a6K-Pds/hqdefault.jpg",
                        "width": 480,
                        "height": 360
                      },
                      "standard": {
                        "url": "https://i.ytimg.com/vi/r262a6K-Pds/sddefault.jpg",
                        "width": 640,
                        "height": 480
                      },
                      "maxres": {
                        "url": "https://i.ytimg.com/vi/r262a6K-Pds/maxresdefault.jpg",
                        "width": 1280,
                        "height": 720
                      }
                    },
                    "channelTitle": "BiS 新生アイドル研究会 OFFiCiAL CHANNEL",
                    "tags": [
                      "BiS",
                      "BiSH",
                      "GANG PARADE",
                      "EMPiRE",
                      "超特急",
                      "DICE",
                      "Passcode",
                      "BAND-MAID",
                      "Perfume",
                      "WACK",
                      "水曜日のカンパネラ",
                      "POP",
                      "SAiNT SEX",
                      "アイナ",
                      "チッチ"
                    ],
                    "categoryId": "22",
                    "liveBroadcastContent": "none",
                    "localized": {
                      "title": "WHOLE LOTTA LOVE / BiS 新生アイドル研究会[OFFiCiAL ViDEO]",
                      "description": "[WHOLE LOTTA LOVE]アヤ COME BACK\nhttps://www.amazon.co.jp/%E3%80%90%E6%97%A9%E6%9C%9F%E8%B3%BC%E5%85%A5%E7%89%B9%E5%85%B8%E3%81%82%E3%82%8A%E3%80%91WHOLE-LOTTA-LOVE-DiPROMiSE-%E5%88%9D%E5%9B%9E%E9%99%90%E5%AE%9A%E7%9B%A4/dp/B079J7JS43/ref=ntt_mus_dp_dpt_1\n歌詞↓\n\n作詞：JxSxK×松隈ケンタ/作曲：松隈ケンタ\n歌唱：ペリ・ウブ、ゴ・ジーラ、キカ・フロント・フロンタール、ももらんど、パン・ルナリーフィ、アヤ・エイトプリンス\n\n\n日進月歩\n実験じゃなくて\n人生です\n四苦八苦毎日\n利権がどうの\n誰も止めないさ\nガンガン行って\nたまには引いて\nうまくやろう\n散々待って\nバカにしてっと\nバレていくよ\n\n見つかんない 胸いっぱい愛\n必要ない 等身大愛\nこればっか 本当 my 愛\n見つかんない 胸いっぱい愛\n\nどっかにあるはずさ\nイカれた クソみたいな愛\n\n行かなくちゃって歌いすぎて\nメロディ わっしょい うまそう！\nバカになりたい\nplease say 愛してる でかい声で\nペロリ わっしょい！ 喰らおう！\noh カミナリ落とそう\n\n七転八倒\n本当好きな\n人たちです\n計算ばっか\nしててもやっぱ\n足りないもんあんな\nガンガン見て\n選びまくって\n洗濯を\n風まかせって　\nいい言葉っす\n座右の銘に\n\n見つかんない 胸いっぱい愛\n必要ない 等身大愛\nこればっか 本当 my Ixxx\n見つかんない 胸いっぱい愛\n\nどっかにあるはずさ\nイカれた クソみたいな愛\n行かなくちゃって歌いすぎて\nメロディ わっしょい うまそう！\nバカになりたい\nplease say 愛してる でかい声で\nペロリ わっしょい！ 喰らおう！\noh カミナリ落とそう\n\n見つかんない 胸いっぱい愛\n必要ない 等身大愛\nこればっか 本当 my 愛\n見つかんない 胸いっぱい愛\n見つかんない 胸いっぱい愛\n必要ない 等身大愛\nこればっか 本当 my 愛\n見つかんない 胸いっぱい愛\n\nどっかに落ちてるの？\nイカれた 本当マジな愛\n\n行かなくちゃって歌いすぎて\nメロディ わっしょい うまそう！\nバカになりたい\nplease say 愛してる でかい声で\nペロリ わっしょい！ 喰らおう！\noh カミナリ落とそう\n\nplease say 愛してる でかい声で\nペロリ わっしょい！ 喰らおう！\noh カミナリ落とそう\n \n\n\n＜リリース情報＞   \n\n【商品情報】  \n\n■BiS 再メジャーデビューダブルA面シングル \n「WHOLE LOTTA LOVE / DiPROMiSE」 \n2018年3月7日リリース \n・初回生産限定盤：CRCP-10392/￥3,800＋tax \n・通常盤：CRCP-10393/￥1,000＋tax \n【収録内容】 \n-CD- \n1.WHOLE LOTTA LOVE \n2.DiPROMiSE \n3.WHOLE LOTTA LOVE instrumental \n4.DiPROMiSE instrumental \n\n-DVD-　※初回生産限定盤のみ \n2017.10.6.「IDOL is DEAD」＠赤坂BLITZライブ映像 \n\n\n日本クラウンofficialHP：　http://www.crownrecord.co.jp/artist/bis/whats.html   \n\n\nアーティストＨＰ： http://www.brandnewidolsociety.tokyo/"
                    }
                  },
                  "contentDetails": {
                    "duration": "PT3M58S",
                    "dimension": "2d",
                    "definition": "hd",
                    "caption": "false",
                    "licensedContent": true,
                    "projection": "rectangular"
                  },
                  "topicDetails": {
                    "relevantTopicIds": [
                      "/m/04rlf",
                      "/m/06by7",
                      "/m/04rlf",
                      "/m/06by7"
                    ],
                    "topicCategories": [
                      "https://en.wikipedia.org/wiki/Music",
                      "https://en.wikipedia.org/wiki/Rock_music"
                    ]
                  }
                }
              ]
            }
          */
          console.log(data);
          const
            video = data['items'][0],
            json = JSON.stringify({
              command: 'videorecord',
              param: {
                id: id,
                video: video
              }
            });
          self.youtubeEvent.emit(json);
        },
        error => {
          console.log(error);
        }
      );
  }
}
