export interface User {
    userID:   number;
    username: string;
    type:     number;
    avatar:   string;
    email:    string;
    password: string;
}

export interface Photo {
    photoID:       number;
    userID:        number;
    photo_url:     string;
    name_playlist: string;
    sumscore :     number;
}

export interface Vote {
    voteID:    number;
    photoID:   number;
    date_time: Date;
    score:     null;
    checkvote: null;
}
export interface Rank {
    rankID:  number;
    photoID: number;
    ranking: number;
    score:   number;
    date:    number;
}