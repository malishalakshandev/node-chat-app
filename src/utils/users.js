const users = [] // Object Array for already exist users

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
    // sanitization the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    // Check for existing users
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    // Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id) // findIndex - returns index of the item, findIndex function continue the loop until the provided condition is true. otherwise it will loop and returns -1

    if (index !== -1) {
        return users.splice(index, 1)[0] // [0] - used because 'users.splice(index, 1)' - this part returns an array within the removed object so by using '[0]' can access the 1st object inside the object array
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id) //find() - loopin till true the provided condition. if it is found this return the object, other wise return undefined
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room) // filterIndex - returns the condition matching arrays if condition is false, it returns an empty object
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
