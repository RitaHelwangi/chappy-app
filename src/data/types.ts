export interface Channel {
    id: string      
    name: string      
    isLocked: boolean
}

export interface User {
    id: string        
    name: string      
}

export interface Message {
    id: string        
    sender: string    
    text: string      
    time: string      
    channelId?: string 
    receiver?: string  
}

export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
}