export function setCookie(name, value, age = 31536000) {
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; max-age=${age}; path=/`;
}

export function getCookie(name) {
    const cookie = document.cookie
        .split("; ")
        .find(row => row.startsWith(`${encodeURIComponent(name)}=`));

    return cookie
        ? decodeURIComponent(cookie.substring(cookie.indexOf("=") + 1))
        : undefined;
}