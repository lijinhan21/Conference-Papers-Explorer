export interface Author {
    name: string;
    id: string;
}

export interface Paper {
    title: string;
    authors: Author[];
    abstract: string;
    keywords: string[];
    venue: string;
    average_rating: number;
    forum: string;
    primary_area?: string;
}

export interface PaperComment {
    status: 'TODO' | 'Done' | null;
    rating: 1 | 2 | 3 | 4 | 5 | null;
    comments: string;
    timestamp: number;
}

export interface AuthorComment {
    comments: string;
    timestamp: number;
}

export interface UserData {
    favoritePapers: Record<string, PaperComment>;
    favoriteAuthors: string[];
    authorComments: Record<string, AuthorComment>;
}