/// <reference path="../pb_data/types.d.ts" />

// Auto-join users to default group after telegram connection

routerAdd("POST", "/api/auto-join-default", (e) => {
    if (!e.auth) {
        return e.json(401, {"error": "Authentication required"});
    }

    const userId = e.auth.id;

    try {
        // Step 3: Get default group
        const allGroups = $app.findRecordsByFilter("groups", "");

        if (allGroups.length === 0) {
            return e.json(404, {"error": "No groups found"});
        }

        // Sort by created date and get first (oldest) group
        allGroups.sort((a, b) => new Date(a.get("created")) - new Date(b.get("created")));
        const defaultGroup = allGroups[0];
        const groupId = defaultGroup.id;
        const groupName = defaultGroup.get("name");

        // Check if already member
        const existingList = $app.findRecordsByFilter("group_members",
            `member_id = '${userId}' && group_id = '${groupId}'`);

        const existing = existingList.length > 0 ? existingList[0] : null;

        if (existing) {
            const currentStatus = existing.get("status");
            if (currentStatus === "active") {
                return e.json(200, {
                    "success": true,
                    "message": "Already member of default group",
                    "groupName": groupName,
                    "status": "active"
                });
            }
        }

        // Create new active membership for default group
        const groupMembersCollection = $app.findCollectionByNameOrId("group_members");
        const membership = new Record(groupMembersCollection);
        membership.set("member_id", userId);
        membership.set("group_id", groupId);
        membership.set("status", "active");
        membership.set("moderator", false);

        $app.save(membership);

        return e.json(200, {
            "success": true,
            "message": "Successfully joined default group",
            "groupName": groupName,
            "status": "joined"
        });

    } catch (error) {
        console.error(`❌ Error in auto-join-default:`, error);
        return e.json(500, {
            "error": "Failed to join default group",
            "details": error.message
        });
    }
});

// Helper endpoint to check if user is in default group
routerAdd("GET", "/api/check-default-group", (e) => {
    if (!e.auth) {
        return e.json(401, {"error": "Authentication required"});
    }

    const userId = e.auth.id;

    try {
        // Get default group
        const allGroups = $app.findRecordsByFilter("groups", "");

        if (allGroups.length === 0) {
            return e.json(200, {
                "inDefaultGroup": false,
                "reason": "no_default_group"
            });
        }

        // Sort by created date and get first (oldest) group
        allGroups.sort((a, b) => new Date(a.get("created")) - new Date(b.get("created")));
        const defaultGroup = allGroups[0];
        const groupId = defaultGroup.id;

        // Check if user has active membership
        const membershipList = $app.findRecordsByFilter("group_members",
            `member_id = '${userId}' && group_id = '${groupId}' && status = 'active'`);

        const membership = membershipList.length > 0 ? membershipList[0] : null;

        if (membership) {
            return e.json(200, {
                "inDefaultGroup": true,
                "groupName": defaultGroup.get("name"),
                "isModerator": membership.get("moderator")
            });
        } else {
            return e.json(200, {
                "inDefaultGroup": false,
                "groupName": defaultGroup.get("name"),
                "reason": "not_member"
            });
        }

    } catch (error) {
        console.error(`❌ Error in check-default-group:`, error);
        return e.json(500, {"error": "Failed to check default group membership"});
    }
});