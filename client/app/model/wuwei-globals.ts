import { Note, Page } from './wuwei/shared/note';

const href = window.location.href;
export const home = href.substr(0, href.indexOf('/', 10));

export const nls = {
  LANG: 'ja',
  label: [
    {value: 'ja', label: '日本語'},
    {value: 'en', label: 'English'},
    {value: 'kr', label: '한국어'},
    {value: 'cn', label: '中文'},
    {value: 'tw', label: '華語(台灣)'}
  ],
  creativeCommons: {
    cn: { name: '创作共用', url: 'http://creativecommons.net.cn/' },
    en: { name: 'Creative Commons', url: 'https://creativecommons.org/' },
    ja: { name: 'クリエイティブ・コモンズ', url: 'https://creativecommons.jp/' },
    kr: { name: '크리에이티브 커먼즈', url: 'http://cckorea.org/' },
    tw: { name: '創作共用', url: 'http://creativecommons.tw/' }
  },
  copyrights: {
    ja: [ // クリエイティブ・コモンズ https://creativecommons.jp/
      { value: 'CC0', label: 'いかなる権利も保有しない(CC0)' },
      { value: 'CC BY', label: '表示(CC BY)' },
      { value: 'CC BY-SA', label: '表示-継承(CC BY-SA)' },
      { value: 'CC BY-ND', label: '表示-改変禁止(CC BY-ND)' },
      { value: 'CC BY-NC', label: '表示-非営利(CC BY-NC)' },
      { value: 'CC BY-NC-SA', label: '表示-非営利-継承(CC BY-NC-SA)' },
      { value: 'CC BY-NC-ND', label: '表示-非営利-改変禁止(CC BY-NC-ND)' }
    ],
    en: [ // Creative Commons https://creativecommons.org/
      { value: 'CC0', label: 'No Rights Reserved(CC0)' },
      { value: 'CC BY', label: 'Attribution(CC BY)' },
      { value: 'CC BY-SA', label: 'Attribution-ShareAlike(CC BY-SA)' },
      { value: 'CC BY-ND', label: 'Attribution-No Derivative Works(CC BY-ND)' },
      { value: 'CC BY-NC', label: 'Attribution-Noncommercial(CC BY-NC)' },
      { value: 'CC BY-NC-SA', label: 'Attribution-Noncommercial-ShareAlike(CC BY-NC-SA)' },
      { value: 'CC BY-NC-ND', label: 'Attribution-Noncommercial-No Derivative Works(CC BY-NC-ND)' }
    ],
    kr: [ // 크리에이티브 커먼즈 http://cckorea.org/
      { value: 'CC0', label: '퍼블릭 도메인(CC0)' },
      { value: 'CC BY', label: '저작자 표시(CC BY)' },
      { value: 'CC BY-SA', label: '저작자 표시-동일조건 변경 허락(CC BY-SA)' },
      { value: 'CC BY-ND', label: '저작자 표시-변경 금지(CC BY-ND)' },
      { value: 'CC BY-NC', label: '저작자 표시-비영리(CC BY-NC)' },
      { value: 'CC BY-NC-SA', label: '저작자 표시-비영리-동일조건 변경 허락(CC BY-NC-SA)' },
      { value: 'CC BY-NC-ND', label: '저작자 표시-비영리-변경 금지(CC BY-NC-ND)' }
    ],
    cn: [ // 创作共用 http://creativecommons.net.cn/
      { value: 'CC0', label: '公眾領域貢獻宣告(CC0)' },
      { value: 'CC BY', label: '创作共用-署名(CC BY)' },
      { value: 'CC BY-SA', label: '创作共用-署名-相同方式分享(CC BY-SA)' },
      { value: 'CC BY-ND', label: '创作共用-署名-禁止改作(CC BY-ND)' },
      { value: 'CC BY-NC', label: '创作共用-署名-非商業性(CC BY-NC)' },
      { value: 'CC BY-NC-SA', label: '创作共用-署名-非商業性-相同方式分享(CC BY-NC-SA)' },
      { value: 'CC BY-NC-ND', label: '创作共用-署名-非商業性-禁止改作(CC BY-NC-ND)' }
    ],
    tw: [ // 創作共用 http://creativecommons.tw/
      { value: 'CC0', label: '公眾領域貢獻宣告(CC0)' },
      { value: 'CC BY', label: '姓名標示(CC BY)' },
      { value: 'CC BY-SA', label: '姓名標示-相同方式分享(CC BY-SA)' },
      { value: 'CC BY-ND', label: '姓名標示-禁止改作(CC BY-ND)' },
      { value: 'CC BY-NC', label: '姓名標示-非商業性(CC BY-NC)' },
      { value: 'CC BY-NC-SA', label: '姓名標示-非商業性-相同方式分享(CC BY-NC-SA)' },
      { value: 'CC BY-NC-ND', label: '姓名標示-非商業性-禁止改作(CC BY-NC-ND)' }
    ]
  }
};

export const module = {
  ngZone: null,
  drawService: null,
  forceComponent: null,
  messageService: null,
  d3Service: null,
  util: null,
  wuweiModel: null
};

export const current = {
  note_id: null, // Note's _id
  note_name: '', // Note's name
  currentPage: 1,
  page: {
    pp: 1,
    name: '',
    nodes: [],
    links: [],
    transform: {
      x: 0,
      y: 0,
      scale: 1
    },
    thumbnail: ''
  },
  pages: [],
  ownerId: null
};

export const notes = {};
export const note: Note = null;
export const pages: Page[] = [];
export const graph = {
  nodes: [],
  links: []
};
export const force = {
  simNodes: [],
  simLinks: []
};
export const resources = {};
export const annotations = {};
export const nodeIndexer = {};
export const linkIndexer = {};
export const resourceIndexer = {};
export const annotationIndexer = {};

export const groupSetting = {};
export const roleSetting = {};

export const miniature = {
  width: 200,
  height: 200,
  scale: 2,
  x1: null,
  y1: null,
  offsetH: null,
  offsetV: null,
  xTranslation: null,
  yTranslation: null,
};

export const status = {
  browser: 'unknown',
  isOnline: false,
  currentUser: null,
  loggedIn: false,
  svgId: 'graph', // force
  canvasId: 'draw', // simulation
  simulation: null,
  playing: true,
  dragging: false,
  modal: false,
  hoveredNode: null,
  startNode: null,
  menuTimer: null,
  Connecting: false,
  Selecting: false,
  Copying: false,
  Editing: false,
  Searching: false,
  PreSearch: false,
  editNode: null,
  infoNode: null,
  Chatmode: false,
  Extra: false,
  copyingNodes: [],
  selectedFilter: '',
  selectedSearch: '',
  selectedEdit: '',
  selectedInfo: ''
};

export const previous = {
  nodes: {},
  links: {},
  resources: {},
  annotations: {}
};

export const log = [];
export const redoLog = [];
export const MAX_LOG = 16;

export const MENU_RADIUS = 32;
export const DRG_CNTRL_OFFSET = 6;

export const shapes = [
  { value: 'RECTANGLE', label: 'RECTANGLE' },
  { value: 'CIRCLE', label: 'CIRCLE' },
  { value: 'ROUNDED', label: 'ROUNDED' },
  { value: 'ELLIPSE', label: 'ELLIPSE' },
  { value: 'THUMBNAIL', label: 'THUMBNAIL' }
];

export const fontSizes = [
  { value: '24pt', label: 'XL' },
  { value: '18pt', label: 'LL' },
  { value: '14pt', label: 'L' },
  { value: '12pt', label: 'M' },
  { value: '10pt', label: 'S' },
  { value: '8pt', label: 'SS' },
  { value: '6pt', label: 'XS' }
];

export const defaultSize = {
  width: 120,
  height: 32,
  radius: 20
};

export const MAX_EXPANDS = 8;

export const motivations = [
  { value: 'bookmarking', label: 'bookmarking' },
  { value: 'tagging', label: 'tagging' },
  { value: 'highlighting', label: 'highlighting' },
  { value: 'commenting', label: 'commenting' },
  { value: 'describing', label: 'describing' },
  { value: 'linking', label: 'linking' },
  { value: 'classifying', label: 'classifying' },
  { value: 'assessing', label: 'assessing' },
  { value: 'identifying', label: 'identifying' },
  { value: 'editing', label: 'editing' },
  { value: 'moderating', label: 'moderating' },
  { value: 'questioning', label: 'questioning' },
  { value: 'replying', label: 'replying' },
  { value: '', label: 'none' }
];

export const resourceTypes = [
  { value: 'TextualBody', label: 'TextualBody' },
  { value: 'Text', label: 'Text' },
  { value: 'Book', label: 'Book' },
  { value: 'Art', label: 'Art' },
  { value: 'Image', label: 'Image' },
  { value: 'Video', label: 'Video' },
  { value: 'Sound', label: 'Sound' },
  { value: 'Dataset', label: 'Dataset' },
  { value: 'other', label: 'other' }
];

export const Color = {
  transparent: 'rgba(255, 250, 240, 0.1)',
  canvasBackground: '#f9f8f7',
  shadowBackground: '#000000',
  svgBackground: '#fff',
  viewport: '#b55', // miniature canvas
  outerHovered: 'rgba(237, 229, 229, 0.5)',
  outerEditing: 'rgba(185, 85, 181, 0.5)',
  innerEditing: 'rgba(205, 105, 201, 0.8)',
  innerStart: 'rgba(229, 247, 244, 0.8)',
  outerSelected: 'rgba(229, 239, 247, 0.8)',
  innerSelected: '#d0a0e0',
  flockSelected: 'rgba(237, 249, 249, 0.5)',
  trunkSelected: 'rgba(237, 249, 249, 0.5)',
  outerFocused: 'rgba(237, 229, 229, 0.5)',
  innerFocused: '#87ceeb',
  controlHovered: 'rgba(200, 218, 208, 0.6)',
  selectingRect: 'rgba(229, 237, 229, 0.4)',
  defaultShadowColor: '#fff',
  // textIncomplete: '#c00',
  // textComplete: '#333',
  forceVector: '#080',
  forceEndpoint: '#fff',
  nodeFill: '#FFFEEE',
  nodeText: '#303030',
  nodeOutline: '#d7d8d9',
  contentFill: '#EEEFFF',
  contentOutline: '#d7d8d9',
  // flock: 'rgba(255, 250, 240, 0.2)',
  // flockOutline: '#7a7b7c',
  // flockMember: '#3af',
  // anchor: '#333',
  link:  '#c0c0c0',
  linkText: '#303030',
  // identifierOutline: '#544',
  // identifierSelectedFill: '#766',
  // identifierUnselectedFill: '#fff',
  nameCopying: '#ff69b4',
  edgeCopying: '#FA58F4',
  nodeCopying: '#fff0f5'
};

export const actionColor = {
  info: { background: '#18C7D4', color: '#37B1BA' },
  success: { background: '#40c6c6', color: '#00ff00' },
  warning: { background: '#FE9733', color: '#FEA933' },
  error: { background: '#F571BE', color: '#ff0000' }
};

export const UPLOAD_ALLOWED = {
  pdf: {
    extension: [ 'pdf' ],
    max: 25165824
  },
  text: {
    extension: [ 'txt', 'xml', 'xsd' ],
    max: 25165824
  },
  image: {
    extension: [ 'jpg', 'jpeg', 'png', 'gif' ],
    max: 25165824
  },
  video: {
    extension: [ 'mp4' ], // 'm4p', 'm4v', 'mov',
    max: 25165824
  },
  audio: {
    extension: [ 'mp3' ],
    max: 25165824
  },
  // cf. https://support.office.com/en-us/article/View-Office-documents-online-1CC2EA26-0F7B-41F7-8E0E-6461A104544E
  word: {
    extension: [ 'docx'/*, 'docm', 'dotm', 'dotx'*/ ],
    max: 10485760
  },
  excel: {
    extension: [ 'xlsx'/*, 'xlsb', 'xls', 'xlsm'*/ ],
    max: 5242880
  },
  powerpoint: {
    extension: [ 'pptx'/*, 'ppsx', 'ppt', 'pps', 'pptm', 'potm', 'ppam', 'potx', 'ppsm'*/ ],
    max: 10485760
  }
};
