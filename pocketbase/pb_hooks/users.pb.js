// Set default role for new users
onRecordBeforeCreateRequest((e) => {
    if (e.collection.name === "users") {
        if (!e.record.get("role")) {
            e.record.set("role", "user")
        }
    }
}, "users")

// Validate role values
onRecordBeforeUpdateRequest((e) => {
    if (e.collection.name === "users") {
        const role = e.record.get("role")
        if (role && !["admin", "user"].includes(role)) {
            throw new BadRequestError("Invalid role value. Must be 'admin' or 'user'")
        }
    }
}, "users")