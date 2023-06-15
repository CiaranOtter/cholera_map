// import * as db from '$lib/server/database';

export async function load({}) {

    let res = await fetch('https://datadesk.dev/api/json.php?table=141')
    let data = await res.json();
    // console.log(data);
    return {
        data
    }

}