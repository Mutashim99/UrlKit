export interface RegisterUserDTO{
    name : string,
    email : string,
    password : string
}

export interface LoginUserDTO{
    email : string,
    password : string
}

export interface ResendEmailDTO{
    email : string
}

export interface VerifyTokenDTO { 
    token : string
}