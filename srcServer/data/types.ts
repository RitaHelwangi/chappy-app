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
}

export interface JwtResponse {
    success: boolean;
    token?: string;
    user?: {
        id: string;
        username: string;
    };
}
