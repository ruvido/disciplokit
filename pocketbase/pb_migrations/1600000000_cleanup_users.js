migrate((app) => {
    try {
        const usersCollection = app.findCollectionByNameOrId("users")
        const records = app.findRecordsByFilter(
            "users",    // collection
            "",         // filter (empty = get all)
            "",         // sort
            1           // limit (we just need to know if any exist)
        )
        if (records.length === 0) {
            console.log("Users collection is empty, removing it...")
            app.delete(usersCollection)
            console.log("Default users collection deleted")
        } else {
            console.log(`Users collection has records, keeping it`)
        }

    } catch (e) {
        console.log("No users collection found or error checking:", e.message)
    }
})
    //
    //     // Check if users collection has any records
    //     const recordsCount = app.db().newQuery("SELECT COUNT(*) as count FROM users").one()
    //
    //     if (recordsCount.count === 0) {
    //         console.log("Users collection is empty, removing it...")
    //         app.delete(usersCollection)
    //         console.log("Default users collection deleted")
    //     } else {
    //         console.log(`Users collection has ${recordsCount.count} records, keeping it`)
    //     }
    //
    // } catch (e) {
    //     console.log("No users collection found or error checking:", e.message)
    // }
