migrate((app) => {
    const collection = app.findCollectionByNameOrId("members")
    
    // Update list rule to allow admins to see all members, others only their own
    collection.listRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    
    // Update view rule to allow admins to view any member, others only their own  
    collection.viewRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    
    // Update update rule to allow admins to update any member, others only their own
    collection.updateRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    
    // Update delete rule to allow admins to delete any member, others only their own
    collection.deleteRule = "id = @request.auth.id || @request.auth.role = 'admin'"

    app.save(collection)
})