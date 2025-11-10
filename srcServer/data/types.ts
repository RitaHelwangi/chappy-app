export interface User {
    pk: string;        
    sk: string;         
    userId?: string;   
    name: string;      
    password: string;  
}

export interface Channel {
    pk: string;        
    sk: string;        
    name: string;      
    isLocked: boolean;
}

export interface Message {
    pk: string;        
    sk: string;        
    text: string;
    time: string;
    sender: string;
    receiver?: string; 
}


export interface LoginData {
    username: string;
    password: string;
}

export interface JwtPayload {
    userId: string;
    username: string;
}

export interface JwtResponse {
    success: boolean;
    token?: string;
    user?: {
        id: string;
        username: string;
    };
}

export interface MessagesResponse {
    success: boolean;
    messages?: {
        id: string;
        sender: string;
        text: string;
        time: string;
        channelId: string;
    }[];
    channel?: {
        id: string;
        name: string;
        isPrivate: boolean;
    };
    error?: string;
}

export interface MessageResponse {
    success: boolean;
    message?: {
        id: string;
        sender: string;
        text: string;
        time: string;
        channelId: string;
    };
    error?: string;
}
