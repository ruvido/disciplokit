migrate((app) => {
    // missing default options, system fields like id, email, etc. are initialized automatically
    // and will be merged with the provided configuration
    let collection = new Collection({
        type:     "auth",
        name:     "members",
        listRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
        viewRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
        createRule: "",
        updateRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
        deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
        // listRule: "id = @request.auth.id",
        // viewRule: "id = @request.auth.id",
        // createRule: "",  // Allow public registration
        // updateRule: "id = @request.auth.id",
        // deleteRule: "id = @request.auth.id",
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
            {
                "name": "created",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            }, 
            {
                "name": "updated",
                "onCreate": true,
                "onUpdate": true,
                "presentable": false,
                "system": false,
                "type": "autodate"
            }, 
        ],
    })

    app.save(collection)
})
