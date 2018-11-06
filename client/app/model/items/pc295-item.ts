export class PC295Comment {
    public id: string;
    public document: string;                   // "document":"CD1",
    public no: string;                         // "no":"2",
    public mbNC: string;                       // "mbNC":"US",
    public clause_subclause: string;           // "clause_subclause":"All",
    public paragraph_figure_table: string;     // "paragraph_figure_table":"ge",
    public mapping_to_slide_actions: string[]; // "mapping_to_slide_actions":["covered as part of TC"],
    public type_of_comment: string;            // "type_of_comment":"ge",
    public comment: string[];                  // "comment":["All fields should have XBRL designation. "],
    public proposed_change: string[];          // "proposed_change":["Suggest adding a column have a corresponding XBRL designation."],
    public note: string[];                     // "note":["ERP & XBRL experts resolve gaps then part of TC"],
    public _version_: string;                  // "_version_":1603386288928456704,
    public score: string;                      // "score":1.0
    public treatment: string;
    public memo?: string;

    constructor(param: {
        id: string,
        document: string,                   // "document":"CD1",
        no: string,                         // "no":"2",
        mbNC: string,                       // "mbNC":"US",
        clause_subclause: string,           // "clause_subclause":"All",
        paragraph_figure_table: string,     // "paragraph_figure_table":"ge",
        mapping_to_slide_actions: string[], // "mapping_to_slide_actions":["covered as part of TC"],
        type_of_comment: string,            // "type_of_comment":"ge",
        comment: string[],                  // "comment":["All fields should have XBRL designation. "],
        proposed_change: string[],          // "proposed_change":["Suggest adding a column have a corresponding XBRL designation."],
        note: string[],                     // "note":["ERP & XBRL experts resolve gaps then part of TC"],
        _version_: string,                  // "_version_":1603386288928456704,
        score: string,                      // "score":1.0
        treatment: string,
        memo?: string
    }) {
        this.id = param.id;
        this.document = param.document;
        this.no = param.no;
        this.mbNC = param.mbNC;
        this.clause_subclause = param.clause_subclause;
        this.paragraph_figure_table = param.paragraph_figure_table;
        this.mapping_to_slide_actions = param.mapping_to_slide_actions;
        this.type_of_comment = param.type_of_comment;
        this.comment = param.comment;
        this.proposed_change = param.proposed_change;
        this.note = param.note;
        this._version_ = param._version_;
        this.score = param.score;
        this.treatment = param.treatment;
        this.memo = param.memo;
    }
}

export class PC295Cluster {
    public labels: string[]; // "labels":["Cross Reference"],
    public score: string;    // "score":50.63079755704032,
    public docs: string[];   // "docs":["91","116","126","149","269"]

    constructor(param: {
        labels: string[], // "labels":["Cross Reference"],
        score: string,    // "score":50.63079755704032,
        docs: string[]    // "docs":["91","116","126","149","269"]
    }) {
        this.labels = param.labels;
        this.score = param.score;
        this.docs = param.docs;
    }
}

export class PC295Item {
    public responseHeader: {
        status: number, // 0,
        QTime: number   // 862
    };
    public response: {
        numFound: number, // 334,
        start: number,    // 0,
        maxScore: number, // 1.0,
        docs: PC295Comment[]
    };
    public clusters: PC295Cluster[];

    constructor(param: {
        responseHeader: {
            status: number, // 0,
            QTime: number   // 862
        },
        response: {
            numFound: number, // 334,
            start: number,    // 0,
            maxScore: number, // 1.0,
            docs: PC295Comment[]
        },
        clusters: PC295Cluster[]
    }) {
        this.responseHeader = {
            status: param.responseHeader.status,
            QTime: param.responseHeader.QTime
        };
        this.response = {
            numFound: param.response.numFound,
            start: param.response.start,
            maxScore: param.response.maxScore,
            docs: param.response.docs
        };
        this.clusters = param.clusters;
    }
}
