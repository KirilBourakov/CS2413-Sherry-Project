import { getCookie  } from './cookies';

export async function login(username, password){
    const credentials = `${username}:${password}`;
    const encodedCredentials = btoa(credentials);
    const response = await fetch(`/user/auth/login`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${encodedCredentials}`
        },
        method: 'POST',
    });
    const body = await response.json()
    updateToken(body.token, body.expiry)
    return {
        'status': response.status,
        'body': body
    }
}

export async function logout(){
    const response = await fetch(`/user/auth/logout/`, {
        headers: {
            'Authorization': `Token ${getToken().token}`
        },
        method: 'POST'
    });

    if (response.status === 204 || response.status === 401){
        clearUser()
        return  Promise.resolve(true)
    }
    return Promise.resolve(false)
}

export async function register(username, password){
    let response = await fetch(`user/auth/register`, { 
        headers: {
            'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
            username: username,
            password: password,
        })
    })
    return Promise.resolve(response.status)
}

export async function checkLoginAndRedirect(nav){
    const log = await isLoggedIn()
    if (!log) {
        return nav('/login')
    }
} 

export async function isLoggedIn(){
    const token = getToken()
    const tokenUndefined = (token.token === undefined || token.token === null)
    const tokenExpired = (token.token === undefined || token.token === null || new Date() > new Date(token.expiry))
    if (tokenExpired){
        clearUser()
    }
    if (tokenUndefined || tokenExpired){
        return Promise.resolve(false)
    }

    const response = await fetch(`/user/auth/check`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token.token}`,
        },
        method: 'GET',
    });

    if (response.status !== 200){
        updateToken(null, null)
        return Promise.resolve(false)
    }
    return Promise.resolve(true)
}

export function updateToken(token, expiry){
    localStorage.setItem('token', token)
    localStorage.setItem('expiry', expiry)
}

export function clearUser(){
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('expiry');
}

export function getToken(){
    return {
        'expiry': localStorage.getItem('expiry') ? localStorage.getItem('expiry') : null,
        'token': localStorage.getItem('token') ? localStorage.getItem('token') : null
    }
}