/// <reference path="../pb_data/types.d.ts" />

// API endpoints per group membership management

// JOIN GROUP - User requests to join
routerAdd("POST", "/api/join-group", (e) => {
    console.log(`🔍 JOIN-GROUP: Starting request for user ${e.auth?.id || 'NOT_AUTHENTICATED'}`);

    if (!e.auth) {
        console.log(`❌ JOIN-GROUP: Authentication required`);
        return e.json(401, {"error": "Authentication required"});
    }

    const data = new DynamicModel({
        groupId: ""
    });
    e.bindBody(data);

    const groupId = data.groupId;
    const userId = e.auth.id;

    console.log(`🔍 JOIN-GROUP: groupId=${groupId}, userId=${userId}`);

    if (!groupId) {
        console.log(`❌ JOIN-GROUP: Group ID required`);
        return e.json(400, {"error": "Group ID required"});
    }

    try {
        // Verify group exists
        console.log(`🔍 JOIN-GROUP: Looking for group with ID: ${groupId}`);
        const group = $app.findRecordById("groups", groupId);
        if (!group) {
            console.log(`❌ JOIN-GROUP: Group not found with ID: ${groupId}`);
            return e.json(404, {"error": "Group not found"});
        }
        console.log(`✅ JOIN-GROUP: Group found: ${group.get("name")}`);

        // Check if already member or pending
        console.log(`🔍 JOIN-GROUP: Checking existing membership for user ${userId} in group ${groupId}`);
        const existingList = $app.findRecordsByFilter("group_members",
            `member_id = '${userId}' && group_id = '${groupId}'`);
        const existing = existingList.length > 0 ? existingList[0] : null;

        if (existing) {
            const status = existing.get("status");
            console.log(`🔍 JOIN-GROUP: Found existing membership with status: ${status}`);
            if (status === "pending") {
                console.log(`❌ JOIN-GROUP: Join request already pending`);
                return e.json(400, {"error": "Join request already pending"});
            } else if (status === "active") {
                console.log(`❌ JOIN-GROUP: Already a member of this group`);
                return e.json(400, {"error": "Already a member of this group"});
            }
            console.log(`🔍 JOIN-GROUP: Previous membership status was '${status}', allowing rejoin`);
        } else {
            console.log(`🔍 JOIN-GROUP: No existing membership found`);
        }

        // Create pending membership
        console.log(`🔍 JOIN-GROUP: Creating new membership record`);
        const groupMembersCollection = $app.findCollectionByNameOrId("group_members");
        if (!groupMembersCollection) {
            console.error(`❌ JOIN-GROUP: group_members collection not found`);
            return e.json(500, {"error": "System error: group_members collection not found"});
        }

        const membership = new Record(groupMembersCollection);
        membership.set("member_id", userId);
        membership.set("group_id", groupId);
        membership.set("status", "pending");
        membership.set("moderator", false);

        console.log(`🔍 JOIN-GROUP: Saving membership record...`);
        $app.save(membership);

        console.log(`✅ JOIN-GROUP: User ${userId} requested to join group ${groupId}`);

        return e.json(200, {
            "success": true,
            "message": "Join request submitted for approval",
            "status": "pending"
        });
    } catch (error) {
        console.error(`❌ JOIN-GROUP: Error in join-group endpoint:`, error);
        console.error(`❌ JOIN-GROUP: Error details:`, {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        return e.json(500, {"error": "Failed to create join request", "details": error.message});
    }
});

// APPROVE MEMBER - Moderator approves pending membership
routerAdd("POST", "/api/approve-member", (e) => {
    if (!e.auth) {
        return e.json(401, {"error": "Authentication required"});
    }

    const data = new DynamicModel({
        membershipId: ""
    });
    e.bindBody(data);

    const membershipId = data.membershipId;

    if (!membershipId) {
        return e.json(400, {"error": "Membership ID required"});
    }

    try {
        const membership = $app.findRecordById("group_members", membershipId);
        if (!membership) {
            return e.json(404, {"error": "Membership record not found"});
        }

        // Check if user is authorized to approve (moderator of group or admin)
        const group = $app.findRecordById("groups", membership.get("group_id"));
        const isGroupModerator = group.get("moderator") === e.auth.id;
        const isAdmin = e.auth.get("admin") === true;

        if (!isGroupModerator && !isAdmin) {
            return e.json(403, {"error": "Not authorized to approve members for this group"});
        }

        // Check if membership is in pending status
        if (membership.get("status") !== "pending") {
            return e.json(400, {"error": "Membership is not in pending status"});
        }

        // Update status to active
        membership.set("status", "active");
        $app.save(membership);

        console.log(`✅ Membership ${membershipId} approved by ${e.auth.id}`);

        return e.json(200, {
            "success": true,
            "message": "Member approved successfully"
        });
    } catch (error) {
        console.error(`❌ Error approving membership:`, error);
        return e.json(500, {"error": "Failed to approve member"});
    }
});

// LEAVE GROUP - User leaves group
routerAdd("POST", "/api/leave-group", (e) => {
    console.log(`🔍 LEAVE-GROUP: Starting request for user ${e.auth?.id || 'NOT_AUTHENTICATED'}`);

    if (!e.auth) {
        console.log(`❌ LEAVE-GROUP: Authentication required`);
        return e.json(401, {"error": "Authentication required"});
    }

    const data = new DynamicModel({
        groupId: ""
    });
    e.bindBody(data);

    const groupId = data.groupId;
    const userId = e.auth.id;

    console.log(`🔍 LEAVE-GROUP: groupId=${groupId}, userId=${userId}`);

    if (!groupId) {
        console.log(`❌ LEAVE-GROUP: Group ID required`);
        return e.json(400, {"error": "Group ID required"});
    }

    try {
        // Find active membership
        console.log(`🔍 LEAVE-GROUP: Looking for active membership for user ${userId} in group ${groupId}`);
        const membershipList = $app.findRecordsByFilter("group_members",
            `member_id = '${userId}' && group_id = '${groupId}' && status = 'active'`);
        const membership = membershipList.length > 0 ? membershipList[0] : null;

        console.log(`🔍 LEAVE-GROUP: Found ${membershipList.length} matching memberships`);

        if (!membership) {
            console.log(`❌ LEAVE-GROUP: Active membership not found`);
            // Let's also check if any membership exists at all
            const anyMembershipList = $app.findRecordsByFilter("group_members",
                `member_id = '${userId}' && group_id = '${groupId}'`);
            console.log(`🔍 LEAVE-GROUP: Found ${anyMembershipList.length} memberships with any status`);
            if (anyMembershipList.length > 0) {
                const status = anyMembershipList[0].get("status");
                console.log(`🔍 LEAVE-GROUP: Existing membership has status: ${status}`);
                return e.json(400, {"error": `Cannot leave group. Current membership status: ${status}`});
            }
            return e.json(404, {"error": "Active membership not found"});
        }

        console.log(`✅ LEAVE-GROUP: Found active membership with ID: ${membership.id}`);

        // Check if user is moderator (moderators cannot leave)
        const isModerator = membership.get("moderator");
        console.log(`🔍 LEAVE-GROUP: User is moderator: ${isModerator}`);
        if (isModerator) {
            console.log(`❌ LEAVE-GROUP: Moderators cannot leave groups`);
            return e.json(400, {"error": "Moderators cannot leave groups. Transfer moderator role first."});
        }

        // Update status to left
        console.log(`🔍 LEAVE-GROUP: Updating membership status to 'left'`);
        membership.set("status", "left");
        $app.save(membership);

        console.log(`✅ LEAVE-GROUP: User ${userId} left group ${groupId}`);

        return e.json(200, {
            "success": true,
            "message": "Left group successfully"
        });
    } catch (error) {
        console.error(`❌ LEAVE-GROUP: Error in leave-group endpoint:`, error);
        console.error(`❌ LEAVE-GROUP: Error details:`, {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        return e.json(500, {"error": "Failed to leave group", "details": error.message});
    }
});

// GET MY GROUPS - User's active groups
routerAdd("GET", "/api/my-groups", (e) => {
    if (!e.auth) {
        return e.json(401, {"error": "Authentication required"});
    }

    const userId = e.auth.id;

    try {
        // Get user's active memberships
        const memberships = $app.findRecordsByFilter("group_members",
            `member_id = '${userId}' && status = 'active'`);

        const groups = [];
        for (const membership of memberships) {
            const group = $app.findRecordById("groups", membership.get("group_id"));
            if (group) {
                groups.push({
                    id: group.id,
                    name: group.get("name"),
                    data: group.get("data") || {},
                    isModerator: membership.get("moderator"),
                    joinedAt: membership.get("created")
                });
            }
        }

        console.log(`✅ Retrieved ${groups.length} groups for user ${userId}`);

        return e.json(200, {
            "success": true,
            "groups": groups
        });
    } catch (error) {
        console.error(`❌ Error retrieving user groups:`, error);
        return e.json(500, {"error": "Failed to retrieve groups"});
    }
});

// GET PENDING APPROVALS - For moderators/admins
routerAdd("GET", "/api/pending-approvals", (e) => {
    if (!e.auth) {
        return e.json(401, {"error": "Authentication required"});
    }

    try {
        let pendingMemberships = [];

        if (e.auth.get("admin") === true) {
            // Admin can see all pending memberships
            pendingMemberships = $app.findRecordsByFilter("group_members", `status = 'pending'`);
        } else {
            // Moderators can only see pending memberships for their groups
            const moderatedGroups = $app.findRecordsByFilter("groups", `moderator = '${e.auth.id}'`);

            for (const group of moderatedGroups) {
                const groupPending = $app.findRecordsByFilter("group_members",
                    `group_id = '${group.id}' && status = 'pending'`);
                pendingMemberships = pendingMemberships.concat(groupPending);
            }
        }

        // Format response with member and group details
        const approvals = [];
        for (const membership of pendingMemberships) {
            const member = $app.findRecordById("members", membership.get("member_id"));
            const group = $app.findRecordById("groups", membership.get("group_id"));

            if (member && group) {
                approvals.push({
                    membershipId: membership.id,
                    member: {
                        id: member.id,
                        name: member.get("name"),
                        email: member.get("email")
                    },
                    group: {
                        id: group.id,
                        name: group.get("name")
                    },
                    requestedAt: membership.get("created")
                });
            }
        }

        console.log(`✅ Retrieved ${approvals.length} pending approvals for user ${e.auth.id}`);

        return e.json(200, {
            "success": true,
            "approvals": approvals
        });
    } catch (error) {
        console.error(`❌ Error retrieving pending approvals:`, error);
        return e.json(500, {"error": "Failed to retrieve pending approvals"});
    }
});