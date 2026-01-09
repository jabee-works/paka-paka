migrate((app) => {
    try {
        const collection = app.findCollectionByNameOrId("messages");
        const userIconField = collection.fields.getByName("user_icon");

        if (userIconField.type !== "text") {
            userIconField.type = "text";
            userIconField.options = {};
            app.save(collection);
            console.log("Successfully reverted messages.user_icon to text");
        }
    } catch (e) {
        console.log("Migration skip or error: " + e.message);
    }
}, (app) => {
})
