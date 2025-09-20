migrate((app) => {
    // missing default options, system fields like id, email, etc. are initialized automatically
    // and will be merged with the provided configuration
    let collection = new Collection({
        type:     "auth",
        name:     "members",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "",
        updateRule: "@request.auth.id != '' && @request.auth.admin= true",
        deleteRule: "@request.auth.id != '' && @request.auth.admin = true",
        fields: [
            // {
            //     type:        "select",
            //     name:        "role",
            //     required:    true,
            //     presentable: true,
            //     maxSelect:   1,
            //     default: "member",
            //     values:      ["member", "moderator", "admin"],
            // },
            {
                type:        "bool",
                name:        "admin",
                required:    true,
                default:     false
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
