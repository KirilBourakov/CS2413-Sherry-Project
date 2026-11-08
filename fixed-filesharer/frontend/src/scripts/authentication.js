

export let token = null;
let refreshCall = null;

export async function login(username, password){
    const credentials = `${username}:${password}`;
    const encodedCredentials = btoa(credentials);
    const response = await fetch(`${import.meta.env.VITE_API_URL}/user/auth/login`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${encodedCredentials}`
        },
        method: 'POST',
    });
    const body = await response.json()
    token = body['access']
    return {
        'status': response.status,
        'body': body
    }
}

export async function logout(){
    const response = await fetch(`${import.meta.env.VITE_API_URL}/user/auth/logout/`, {
        headers: {
            'Authorization': `Token ${token}`
        },
        method: 'POST'
    });
    token = null;
    if (response.status === 200){
        return  Promise.resolve(true)
    }
    return Promise.resolve(false)
}

export async function register(username, password){
    let response = await fetch(`${import.meta.env.VITE_API_URL}/user/auth/register`, {
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

export async function authedJSONFetch(url, method, body=null){
    let args = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        method: method,
    }
    if (body !== null){
        args.body = JSON.stringify(body)
    }

    let result = await fetch(`${import.meta.env.VITE_API_URL}/${url}`, args)
    if (result.status === 403){
        await refreshToken()
        return await fetch(`${import.meta.env.VITE_API_URL}/${url}`, args)
    }
    return result
}

export async function checkLoginAndRedirect(nav){
    const log = await isLoggedIn()
    if (!log) {
        return nav('/login')
    }
}

async function refreshToken(){
    refreshCall ??= fetch(`${import.meta.env.VITE_API_URL}/user/auth/login/refresh`, {
        method: "POST",
        credentials: "include",
    })
    .then(async (response) => {
        if (response.status === 200){
            token = (await response.json())['access']
            return true
        }
        token = null;
        return false;
    })
    .finally(() => {
        refreshCall = null;
    });
    return refreshCall;
}

export async function isLoggedIn(){
    const response = await authedJSONFetch('user/auth/check', 'GET')
    if (response.status !== 200){
        return Promise.resolve(false)
    }
    return Promise.resolve(true)
}