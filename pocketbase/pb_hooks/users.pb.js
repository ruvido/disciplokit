// Set default role for new users
onRecordCreate((e) => {
    // Set default role to "user" if not specified
    if (!e.record.get("role")) {
        e.record.set("role", "user")
    }
    e.next()
}, "users")

// Validate role values on update
onRecordUpdate((e) => {
    const role = e.record.get("role")
    if (role && !["admin", "moderator", "user"].includes(role)) {
        throw new BadRequestError("Invalid role value. Must be 'admin', 'moderator', or 'user'")
    }
    e.next()
}, "users")