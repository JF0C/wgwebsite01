
function getCookieVal(key) {
    for (let kv of document.cookie.split(';')) {
        let pieces = kv.split('=');
        if (pieces[0].replace(' ', '') === key) return pieces[1].replace(' ', '');
    }
    return null;
}

function tryGetUserData() {
    const username = getCookieVal('username');
    const token = getCookieVal('token');
    if (username !== null && token !== null) {
        fetch('http://rich-wg.dx.am/php/userPermissions.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'username': username,
                'token': token
            })
        }).then(r => r.json())
        .then(data => {
            if (data.status !== 'success') {
                return;
            }
            user.id = data.id;
            user.permissions = data.permissions;
            user.name = data.name;
        })
    }
}