import PocketBase from 'pocketbase';

export const pb = new PocketBase('http://127.0.0.1:8090');

export async function login(email, password) {
    // Try both collection names
    const collectionNames = ['members', 'users'];
    
    for (const collectionName of collectionNames) {
        try {
            console.log(`Attempting login to ${collectionName} collection`);
            const authData = await pb.collection(collectionName).authWithPassword(email, password);
            console.log(`Login successful with ${collectionName}:`, authData.record);
            
            // Store the working collection name for signup
            window.WORKING_COLLECTION = collectionName;
            
            return { success: true, user: authData.record };
        } catch (error) {
            console.error(`Login error with ${collectionName}:`, error.message);
            
            // If it's the last collection to try, return the error
            if (collectionName === collectionNames[collectionNames.length - 1]) {
                return { success: false, error: `No working collection found. Tried: ${collectionNames.join(', ')}` };
            }
        }
    }
}

export async function signup(email, password, passwordConfirm) {
    // Use the collection name that worked for login
    const collectionName = window.WORKING_COLLECTION || 'members';
    
    try {
        console.log(`Attempting signup with ${collectionName}:`, { email, password: '***', passwordConfirm: '***' });
        
        // Create the user record with correct role value
        const userData = {
            email: email,
            password: password,
            passwordConfirm: passwordConfirm,
            role: 'member' // Use 'member' instead of 'user'
        };
        
        console.log('Using "member" role for signup');
        
        console.log('Signup data:', { ...userData, password: '***', passwordConfirm: '***' });
        
        const record = await pb.collection(collectionName).create(userData);
        console.log('User created:', record);
        
        // Log them in immediately
        const authData = await pb.collection(collectionName).authWithPassword(email, password);
        return { success: true, user: authData.record };
    } catch (error) {
        console.error('Signup error details:', error);
        console.error('Error response:', error.response);
        console.error('Error data:', error.data);
        
        // Log the detailed validation errors
        if (error.data && error.data.data) {
            console.error('Field validation errors:', error.data.data);
            Object.keys(error.data.data).forEach(field => {
                console.error(`❌ Field "${field}":`, error.data.data[field]);
            });
        }
        
        return { success: false, error: error.message };
    }
}

export function logout() {
    pb.authStore.clear();
}

export function isLoggedIn() {
    return pb.authStore.isValid;
}

export function getCurrentUser() {
    return pb.authStore.model;
}

export async function getCollections() {
    try {
        // This will help us see what collections exist
        const collections = await pb.send('/api/collections', {});
        console.log('Available collections:', collections);
        return collections;
    } catch (error) {
        console.error('Error getting collections:', error);
        return null;
    }
}