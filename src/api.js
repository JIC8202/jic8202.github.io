const API_URL = "https://nines.mooo.com/";

export async function getData() {
    return fetch(API_URL + "data")
        .then(res => res.json());
}

export async function deleteLink(source, target) {
    return fetch(API_URL + "link/" + source + "/" + target,
        {method: 'DELETE'})
        .then(res => res.json());
}
