migrate((app) => {
    // missing default options, system fields like id, email, etc. are initialized automatically
    // and will be merged with the provided configuration
    let collection = new Collection({
        type:     "auth",
        name:     "members",
        listRule: "id = @request.auth.id",
        viewRule: "id = @request.auth.id",
        createRule: "",  // Allow public registration
        updateRule: "id = @request.auth.id",
        deleteRule: "id = @request.auth.id",
        fields: [
            {
                type:        "select",
                name:        "role",
                required:    true,
                presentable: true,
                maxSelect:   1,
                default: "member",
                values:      ["member", "moderator", "admin"],
            }, 
        ],
    })

    app.save(collection)
})
