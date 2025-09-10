// Set default role for new members
onRecordCreate((e) => {
    // Set default role to "member" if not specified
    if (!e.record.get("role")) {
        e.record.set("role", "member")
    }
    e.next()
}, "members")

// Validate role values on update
onRecordUpdate((e) => {
    const role = e.record.get("role")
    if (role && !["admin", "moderator", "member"].includes(role)) {
        throw new BadRequestError("Invalid role value. Must be 'admin', 'moderator', or 'member'")
    }
    e.next()
}, "members")