// const API_URL = import.meta.env.VITE_API_URL;


export async function setName(new_name) {
    let response = await fetch("/api/set-name", {
        method: "POST",
        headers: {
            "Content-type": "application/json",
        },
        body: JSON.stringify({
            name :new_name,
        })
    })

    let result = await response.json();

    return result;
}



export async function load_find_lobby() {
    let response = await fetch("/api/load-join-lobby")
    let result = await response.json();
    return result;
}

